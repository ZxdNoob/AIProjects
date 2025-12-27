/**
 * @file 学习管理控制器
 * @description 处理用户学习进度、错题本、学习统计等相关业务逻辑
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入所有需要的数据模型
import { User, Knowledge, Problem, Algorithm, Submission, WrongRecord } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';

/**
 * 获取学习进度报告
 * @route GET /api/learning/progress
 * @description 获取当前用户的完整学习进度报告
 * @access 需要认证
 * 
 * @returns {Object} 学习进度概览、分类进度、学习计划和最近活动
 * @throws {404} 用户不存在
 */
export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  // 查询用户并关联查询已完成的学习内容
  const user = await User.findById(req.userId)
    .populate('learningProgress.completedKnowledge', 'title category level')
    .populate('learningProgress.completedProblems', 'title difficulty category')
    .populate('learningProgress.completedAlgorithms', 'title category');

  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 获取各类内容的总数
  const [totalKnowledge, totalProblems, totalAlgorithms] = await Promise.all([
    Knowledge.countDocuments({ isPublished: true }),
    Problem.countDocuments({ isPublished: true }),
    Algorithm.countDocuments({ isPublished: true }),
  ]);

  // 获取已完成的数量
  const completedKnowledge = user.learningProgress.completedKnowledge.length;
  const completedProblems = user.learningProgress.completedProblems.length;
  const completedAlgorithms = user.learningProgress.completedAlgorithms.length;

  // 使用聚合管道按分类统计知识点总数
  const knowledgeByCategory = await Knowledge.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  // 获取已完成知识点的 ID 列表
  const completedKnowledgeIds = user.learningProgress.completedKnowledge.map(
    (k: any) => k._id.toString()
  );

  // 计算每个分类的完成情况
  const categoryProgress = await Promise.all(
    knowledgeByCategory.map(async (cat) => {
      // 统计该分类中已完成的数量
      const completedInCategory = await Knowledge.countDocuments({
        category: cat._id,
        _id: { $in: completedKnowledgeIds },
      });
      return {
        category: cat._id,                                      // 分类名称
        total: cat.count,                                       // 该分类总数
        completed: completedInCategory,                         // 已完成数
        percentage: ((completedInCategory / cat.count) * 100).toFixed(1), // 完成百分比
      };
    })
  );

  // 返回学习进度报告
  res.json({
    success: true,
    data: {
      // 概览数据：知识点、编程题、算法题的完成情况
      overview: {
        knowledge: {
          completed: completedKnowledge,
          total: totalKnowledge,
          percentage: totalKnowledge > 0
            ? ((completedKnowledge / totalKnowledge) * 100).toFixed(1)
            : '0.0',
        },
        problems: {
          completed: completedProblems,
          total: totalProblems,
          percentage: totalProblems > 0
            ? ((completedProblems / totalProblems) * 100).toFixed(1)
            : '0.0',
        },
        algorithms: {
          completed: completedAlgorithms,
          total: totalAlgorithms,
          percentage: totalAlgorithms > 0
            ? ((completedAlgorithms / totalAlgorithms) * 100).toFixed(1)
            : '0.0',
        },
      },
      // 按分类的进度
      categoryProgress,
      // 用户的学习计划
      studyPlan: user.studyPlan,
      // 最近完成的内容（取最后5个）
      recentActivity: {
        completedKnowledge: user.learningProgress.completedKnowledge.slice(-5),
        completedProblems: user.learningProgress.completedProblems.slice(-5),
        completedAlgorithms: user.learningProgress.completedAlgorithms.slice(-5),
      },
    },
  });
});

/**
 * 获取错题本
 * @route GET /api/learning/wrong-records
 * @description 获取当前用户的错题记录列表
 * @access 需要认证
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.type] - 类型筛选（problem/algorithm）
 * @param {string} [req.query.isResolved] - 是否已解决筛选
 * 
 * @returns {Object} 错题列表和分页信息
 */
export const getWrongRecords = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件
  const {
    page = 1,
    limit = 20,
    type,                         // 题目类型
    isResolved,                   // 是否已解决
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建查询条件
  const query: any = { userId: req.userId };
  if (type) query.type = type;
  if (isResolved !== undefined) query.isResolved = isResolved === 'true';

  // 查询错题记录
  const [items, total] = await Promise.all([
    WrongRecord.find(query)
      .populate('problemId', 'title difficulty category')    // 关联编程题信息
      .populate('algorithmId', 'title category')             // 关联算法题信息
      .sort({ lastWrongAt: -1 })                             // 按最后错误时间倒序
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    WrongRecord.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * 获取错题详情
 * @route GET /api/learning/wrong-records/:id
 * @description 获取单个错题记录的详细信息
 * @access 需要认证
 * 
 * @param {string} req.params.id - 错题记录 ID
 * 
 * @returns {Object} 错题详情
 * @throws {404} 错题记录不存在
 */
export const getWrongRecordDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查询错题记录（限制只能查看自己的）
  const record = await WrongRecord.findOne({
    _id: id,
    userId: req.userId,
  })
    .populate('problemId')          // 关联完整的编程题信息
    .populate('algorithmId');       // 关联完整的算法题信息

  if (!record) {
    throw errors.notFound('错题记录不存在');
  }

  res.json({
    success: true,
    data: record,
  });
});

/**
 * 标记错题为已解决
 * @route PUT /api/learning/wrong-records/:id/resolve
 * @description 将错题标记为已解决（已掌握）
 * @access 需要认证
 * 
 * @param {string} req.params.id - 错题记录 ID
 * 
 * @returns {Object} 更新后的错题记录
 * @throws {404} 错题记录不存在
 */
export const resolveWrongRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查找并更新错题记录
  const record = await WrongRecord.findOneAndUpdate(
    { _id: id, userId: req.userId },    // 查询条件：ID 和用户匹配
    {
      $set: {
        isResolved: true,               // 标记为已解决
        resolvedAt: new Date(),         // 记录解决时间
      },
    },
    { new: true }                        // 返回更新后的文档
  );

  if (!record) {
    throw errors.notFound('错题记录不存在');
  }

  res.json({
    success: true,
    message: '已标记为解决',
    data: record,
  });
});

/**
 * 记录错题复习
 * @route PUT /api/learning/wrong-records/:id/review
 * @description 记录用户对错题进行了复习
 * @access 需要认证
 * 
 * @param {string} req.params.id - 错题记录 ID
 * @param {Object} req.body - 请求体
 * @param {string} [req.body.notes] - 复习笔记
 * 
 * @returns {Object} 更新后的错题记录
 * @throws {404} 错题记录不存在
 */
export const reviewWrongRecord = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  // 查找并更新错题记录
  const record = await WrongRecord.findOneAndUpdate(
    { _id: id, userId: req.userId },
    {
      $inc: { reviewCount: 1 },          // 复习次数加 1
      $set: {
        lastReviewAt: new Date(),        // 记录最后复习时间
        ...(notes && { notes }),         // 如果提供了笔记则更新
      },
    },
    { new: true }
  );

  if (!record) {
    throw errors.notFound('错题记录不存在');
  }

  res.json({
    success: true,
    message: '复习记录已更新',
    data: record,
  });
});

/**
 * 获取学习统计
 * @route GET /api/learning/stats
 * @description 获取用户的学习统计数据
 * @access 需要认证
 * 
 * @returns {Object} 提交统计、错题统计、趋势数据和难度分布
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  // 获取各项统计数据
  const [
    totalSubmissions,          // 总提交次数
    acceptedSubmissions,       // 通过次数
    wrongRecordsCount,         // 错题总数
    resolvedWrongRecords,      // 已解决的错题数
  ] = await Promise.all([
    Submission.countDocuments({ userId }),
    Submission.countDocuments({ userId, status: 'accepted' }),
    WrongRecord.countDocuments({ userId }),
    WrongRecord.countDocuments({ userId, isResolved: true }),
  ]);

  // 获取最近7天的提交趋势
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 使用聚合管道按日期和状态分组统计
  const submissionTrend = await Submission.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // 获取按难度的完成情况
  const problemsByDifficulty = await Submission.aggregate([
    {
      // 筛选通过的编程题提交
      $match: {
        userId: userId,
        type: 'problem',
        status: 'accepted',
      },
    },
    {
      // 关联查询编程题详情
      $lookup: {
        from: 'problems',                 // 关联的集合
        localField: 'problemId',          // 本集合的关联字段
        foreignField: '_id',              // 目标集合的关联字段
        as: 'problem',                    // 结果存放字段
      },
    },
    { $unwind: '$problem' },              // 展开数组
    {
      // 按难度分组计数
      $group: {
        _id: '$problem.difficulty',
        count: { $sum: 1 },
      },
    },
  ]);

  // 返回统计数据
  res.json({
    success: true,
    data: {
      // 提交统计
      submissions: {
        total: totalSubmissions,
        accepted: acceptedSubmissions,
        acceptRate: totalSubmissions > 0
          ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)
          : '0.0',
      },
      // 错题统计
      wrongRecords: {
        total: wrongRecordsCount,
        resolved: resolvedWrongRecords,
        resolveRate: wrongRecordsCount > 0
          ? ((resolvedWrongRecords / wrongRecordsCount) * 100).toFixed(1)
          : '0.0',
      },
      // 提交趋势
      submissionTrend,
      // 按难度分布
      problemsByDifficulty,
    },
  });
});

/**
 * 生成学习计划
 * @route POST /api/learning/generate-plan
 * @description 根据目标日期和级别生成个性化学习计划
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.targetDate - 目标日期（ISO 格式）
 * @param {string} req.body.targetLevel - 目标级别（junior/mid/senior）
 * 
 * @returns {Object} 生成的学习计划和当前状态
 */
export const generateStudyPlan = asyncHandler(async (req: Request, res: Response) => {
  const { targetDate, targetLevel } = req.body;
  const user = req.user!;

  // 获取用户当前学习状态
  const [completedKnowledge, completedProblems, wrongRecords] = await Promise.all([
    // 已完成的知识点数
    Knowledge.countDocuments({
      _id: { $in: user.learningProgress.completedKnowledge },
    }),
    // 已完成的编程题数
    Problem.countDocuments({
      _id: { $in: user.learningProgress.completedProblems },
    }),
    // 未解决的错题数
    WrongRecord.countDocuments({ userId: user._id, isResolved: false }),
  ]);

  // 计算到目标日期的天数
  const target = new Date(targetDate);
  const today = new Date();
  const daysRemaining = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // 根据目标级别生成每日任务
  const dailyTasks: string[] = [];
  
  if (targetLevel === 'junior') {
    // 初级目标：基础为主
    dailyTasks.push('学习2个基础知识点');
    dailyTasks.push('完成1道基础编程题');
    dailyTasks.push('复习1道错题');
  } else if (targetLevel === 'mid') {
    // 中级目标：需要进阶内容
    dailyTasks.push('学习3个知识点（含1个进阶）');
    dailyTasks.push('完成2道编程题');
    dailyTasks.push('练习1道算法题');
    dailyTasks.push('复习2道错题');
  } else if (targetLevel === 'senior') {
    // 高级目标：全面深入
    dailyTasks.push('学习4个知识点（含2个原理层）');
    dailyTasks.push('完成3道编程题');
    dailyTasks.push('练习2道算法题（含动画分析）');
    dailyTasks.push('复习3道错题');
    dailyTasks.push('整理知识点笔记');
  }

  // 更新用户学习计划
  user.studyPlan = {
    targetDate: target,
    targetLevel,
    dailyTasks,
  };
  await user.save();

  // 返回生成的计划
  res.json({
    success: true,
    message: '学习计划已生成',
    data: {
      studyPlan: user.studyPlan,
      currentStatus: {
        completedKnowledge,
        completedProblems,
        unresolvedWrongRecords: wrongRecords,
      },
      daysRemaining,
    },
  });
});

/**
 * 获取每日任务完成情况
 * @route GET /api/learning/daily-tasks
 * @description 获取用户今日的任务完成情况
 * @access 需要认证
 * 
 * @returns {Object} 每日任务列表和今日完成进度
 */
export const getDailyTasks = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  // 检查是否有学习计划
  if (!user.studyPlan?.dailyTasks?.length) {
    res.json({
      success: true,
      data: {
        tasks: [],
        message: '尚未设置学习计划',
      },
    });
    return;
  }

  // 获取今日零点时间
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 获取今日的完成情况
  const [todayKnowledge, todayProblems, todayAlgorithms, todayReviews] = await Promise.all([
    // 今日通过的编程题（作为知识点学习的近似值）
    Submission.countDocuments({
      userId: user._id,
      type: 'problem',
      status: 'accepted',
      createdAt: { $gte: today },
    }),
    // 今日提交的编程题
    Submission.countDocuments({
      userId: user._id,
      type: 'problem',
      createdAt: { $gte: today },
    }),
    // 今日提交的算法题
    Submission.countDocuments({
      userId: user._id,
      type: 'algorithm',
      createdAt: { $gte: today },
    }),
    // 今日复习的错题
    WrongRecord.countDocuments({
      userId: user._id,
      lastReviewAt: { $gte: today },
    }),
  ]);

  // 返回任务和进度
  res.json({
    success: true,
    data: {
      tasks: user.studyPlan.dailyTasks,            // 每日任务列表
      todayProgress: {
        problemsSolved: todayProblems,              // 今日编程题提交数
        algorithmsSolved: todayAlgorithms,          // 今日算法题提交数
        wrongRecordsReviewed: todayReviews,         // 今日复习的错题数
      },
      targetDate: user.studyPlan.targetDate,
      targetLevel: user.studyPlan.targetLevel,
    },
  });
});

/**
 * 导出所有控制器方法
 */
export default {
  getProgress,            // 获取学习进度
  getWrongRecords,        // 获取错题本
  getWrongRecordDetail,   // 获取错题详情
  resolveWrongRecord,     // 标记错题已解决
  reviewWrongRecord,      // 记录错题复习
  getStats,               // 获取学习统计
  generateStudyPlan,      // 生成学习计划
  getDailyTasks,          // 获取每日任务
};
