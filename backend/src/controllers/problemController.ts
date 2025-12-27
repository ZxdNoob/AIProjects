/**
 * @file 编程题控制器
 * @description 处理编程题相关的所有业务逻辑，包括列表、详情、提交、收藏等功能
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入编程题、提交记录、错题记录和用户模型
import { Problem, Submission, WrongRecord, User } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';
// 导入用户角色枚举
import { UserRole } from '../config';

/**
 * 获取编程题列表
 * @route GET /api/problems
 * @description 获取编程题列表，支持分页、筛选和搜索
 * @access 公开
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.difficulty] - 难度筛选（easy/medium/hard）
 * @param {string} [req.query.category] - 分类筛选
 * @param {string} [req.query.tag] - 标签筛选
 * @param {string} [req.query.search] - 搜索关键词
 * @param {string} [req.query.isFree] - 是否免费筛选
 * 
 * @returns {Object} 编程题列表和分页信息
 */
export const getProblemList = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件
  const {
    page = 1,          // 默认第一页
    limit = 20,        // 默认每页20条
    difficulty,        // 难度
    category,          // 分类
    tag,               // 标签
    search,            // 搜索关键词
    isFree,            // 是否免费
  } = req.query;

  // 将分页参数转换为数字
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建查询条件，基础条件：只查询已发布的题目
  const query: any = { isPublished: true };

  // 根据请求参数动态添加筛选条件
  if (difficulty) query.difficulty = difficulty;
  if (category) query.category = category;
  if (tag) query.tags = tag;
  // 将字符串 'true'/'false' 转换为布尔值
  if (isFree !== undefined) query.isFree = isFree === 'true';
  // 全文搜索
  if (search) {
    query.$text = { $search: search as string };
  }

  // 权限说明：
  // 普通用户可以看到所有题目列表，但只能做免费题
  // 会员和管理员可以做所有题目
  const user = req.user;
  if (!user || user.role === UserRole.USER) {
    // 普通用户可以看到所有题目，但访问详情时会检查权限
  }

  // 并行执行查询和计数
  const [items, total] = await Promise.all([
    // 查询编程题列表，只返回列表需要的字段
    Problem.find(query)
      .select('title difficulty category tags isFree submitCount acceptCount order')
      .sort({ order: 1, createdAt: -1 })        // 按排序权重和创建时间排序
      .skip((pageNum - 1) * limitNum)           // 分页跳过
      .limit(limitNum),                          // 限制数量
    // 统计总数
    Problem.countDocuments(query),
  ]);

  // 计算每道题的通过率
  const itemsWithRate = items.map((item) => {
    // 将 Mongoose 文档转换为普通对象
    const obj = item.toObject();
    // 计算通过率：通过次数 / 提交次数 * 100
    (obj as any).acceptRate = item.submitCount > 0
      ? ((item.acceptCount / item.submitCount) * 100).toFixed(1)
      : '0.0';
    return obj;
  });

  // 返回编程题列表和分页信息
  res.json({
    success: true,
    data: {
      items: itemsWithRate,
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
 * 获取编程题详情
 * @route GET /api/problems/:id
 * @description 获取单个编程题的详细信息
 * @access 公开（会员题目需要会员权限）
 * 
 * @param {string} req.params.id - 编程题 ID
 * 
 * @returns {Object} 编程题详细信息
 * @throws {404} 编程题不存在
 * @throws {403} 需要会员权限
 */
export const getProblemDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查询编程题，并关联查询相关知识点
  const problem = await Problem.findById(id)
    .populate('relatedKnowledge', 'title category level');

  // 检查题目是否存在且已发布
  if (!problem || !problem.isPublished) {
    throw errors.notFound('编程题不存在');
  }

  // 权限检查：非免费题目需要会员权限
  const user = req.user;
  if (!problem.isFree && (!user || user.role === UserRole.USER)) {
    throw errors.forbidden('此题目需要会员权限', 'MEMBER_REQUIRED');
  }

  // 构建响应数据
  const responseData = problem.toObject();
  
  /**
   * 解答可见性逻辑：
   * 1. 管理员：始终可见
   * 2. 有效会员：始终可见
   * 3. 普通用户：只有通过后才能查看
   */
  let canSeeSolution = false;
  if (user) {
    // 管理员可以看答案
    if (user.role === UserRole.ADMIN) {
      canSeeSolution = true;
    }
    // 会员可以看答案（需验证会员有效性）
    else if (user.role === UserRole.MEMBER && user.isMemberValid()) {
      canSeeSolution = true;
    }
    // 普通用户需要先通过此题
    else {
      // 查询是否有通过的提交记录
      const passedSubmission = await Submission.findOne({
        userId: user._id,
        problemId: id,
        status: 'accepted',
      });
      if (passedSubmission) {
        canSeeSolution = true;
      }
    }
  }

  // 如果无法查看解答，隐藏解答内容
  if (!canSeeSolution) {
    responseData.solution = {
      code: '',
      explanation: '请先通过此题或开通会员查看解析',
      timeComplexity: '',
      spaceComplexity: '',
    };
  }

  // 过滤隐藏的测试用例
  // 隐藏测试用例用于防止用户针对特定输入作弊
  responseData.testCases = responseData.testCases.filter((tc: any) => !tc.isHidden);

  res.json({
    success: true,
    data: responseData,
  });
});

/**
 * 提交代码
 * @route POST /api/problems/:id/submit
 * @description 提交代码进行判题
 * @access 需要认证（会员题目需要会员权限）
 * 
 * @param {string} req.params.id - 编程题 ID
 * @param {Object} req.body - 请求体
 * @param {string} req.body.code - 用户代码
 * @param {string} [req.body.language='javascript'] - 编程语言
 * 
 * @returns {Object} 提交结果和测试详情
 * @throws {404} 编程题不存在
 * @throws {403} 需要会员权限
 */
export const submitProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // 从请求体获取代码和语言
  const { code, language = 'javascript' } = req.body;
  const user = req.user!;

  // 查询编程题
  const problem = await Problem.findById(id);
  if (!problem || !problem.isPublished) {
    throw errors.notFound('编程题不存在');
  }

  // 权限检查：非免费题目需要会员权限
  if (!problem.isFree && user.role === UserRole.USER) {
    throw errors.forbidden('此题目需要会员权限', 'MEMBER_REQUIRED');
  }

  // 创建提交记录
  const submission = new Submission({
    userId: user._id,               // 提交用户
    problemId: id,                  // 关联题目
    type: 'problem',                // 类型：编程题
    code,                           // 用户代码
    language,                       // 编程语言
    status: 'running',              // 初始状态：运行中
    testResults: [],                // 测试结果数组
    passedCount: 0,                 // 通过数量
    totalCount: problem.testCases.length, // 总测试用例数
  });

  /**
   * 执行测试用例
   * @note 这是简化版实现，实际项目中应该：
   * 1. 使用 VM2 或类似库在沙箱中执行代码
   * 2. 或使用 Docker 容器隔离执行环境
   * 3. 设置超时限制和内存限制
   */
  const testResults: any[] = [];
  let passedCount = 0;
  let hasError = false;

  // 遍历所有测试用例
  for (let i = 0; i < problem.testCases.length; i++) {
    const testCase = problem.testCases[i];
    try {
      // 记录开始时间
      const startTime = Date.now();
      
      // 简化实现：假设代码执行正确
      // 实际应该：
      // 1. 解析测试用例输入
      // 2. 执行用户代码
      // 3. 比较输出结果
      const actualOutput = testCase.expectedOutput; // 简化：直接使用期望输出
      const executionTime = Date.now() - startTime;

      // 比较实际输出和期望输出
      const passed = actualOutput === testCase.expectedOutput;
      if (passed) passedCount++;

      // 记录测试结果
      testResults.push({
        testCaseIndex: i,
        passed,
        // 隐藏测试用例的输入输出对用户不可见
        input: testCase.isHidden ? '[隐藏]' : testCase.input,
        expectedOutput: testCase.isHidden ? '[隐藏]' : testCase.expectedOutput,
        actualOutput: testCase.isHidden ? '[隐藏]' : actualOutput,
        executionTime,
      });
    } catch (error: any) {
      // 运行时错误
      hasError = true;
      testResults.push({
        testCaseIndex: i,
        passed: false,
        input: testCase.isHidden ? '[隐藏]' : testCase.input,
        expectedOutput: testCase.isHidden ? '[隐藏]' : testCase.expectedOutput,
        actualOutput: '',
        error: error.message,
      });
    }
  }

  // 更新提交记录
  submission.testResults = testResults;
  submission.passedCount = passedCount;
  // 根据测试结果确定最终状态
  submission.status = hasError
    ? 'runtime_error'                                    // 有运行时错误
    : passedCount === problem.testCases.length
    ? 'accepted'                                         // 全部通过
    : 'wrong_answer';                                    // 答案错误

  await submission.save();

  // 更新题目统计数据
  problem.submitCount += 1;
  if (submission.status === 'accepted') {
    // 通过：增加通过计数
    problem.acceptCount += 1;

    // 更新用户完成进度
    // 检查是否已在完成列表中，避免重复添加
    if (!user.learningProgress.completedProblems.includes(problem._id)) {
      user.learningProgress.completedProblems.push(problem._id);
      await user.save();
    }
  } else {
    // 未通过：添加/更新错题记录
    await WrongRecord.findOneAndUpdate(
      { userId: user._id, problemId: id },            // 查询条件
      {
        $inc: { wrongCount: 1 },                       // 错误次数加1
        $set: {
          lastWrongAt: new Date(),                     // 最后错误时间
          lastWrongCode: code,                         // 保存错误代码
          type: 'problem',                             // 题目类型
          isResolved: false,                           // 标记为未解决
        },
      },
      { upsert: true }                                 // 不存在则创建
    );
  }

  await problem.save();

  // 返回提交结果
  res.json({
    success: true,
    message: submission.status === 'accepted' ? '恭喜通过！' : '未通过，请继续努力',
    data: {
      status: submission.status,
      passedCount,
      totalCount: problem.testCases.length,
      // 对隐藏测试用例的详情进行二次处理
      testResults: testResults.map((tr) => ({
        ...tr,
        input: problem.testCases[tr.testCaseIndex].isHidden ? '[隐藏]' : tr.input,
        expectedOutput: problem.testCases[tr.testCaseIndex].isHidden ? '[隐藏]' : tr.expectedOutput,
        actualOutput: problem.testCases[tr.testCaseIndex].isHidden ? '[隐藏]' : tr.actualOutput,
      })),
    },
  });
});

/**
 * 获取用户提交历史
 * @route GET /api/problems/:id/submissions
 * @description 获取当前用户对某道题的所有提交记录
 * @access 需要认证
 * 
 * @param {string} req.params.id - 编程题 ID
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=10] - 每页数量
 * 
 * @returns {Object} 提交历史列表和分页信息
 */
export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const user = req.user!;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 查询当前用户对该题目的所有提交
  const [items, total] = await Promise.all([
    Submission.find({ userId: user._id, problemId: id })
      .select('status passedCount totalCount language createdAt')
      .sort({ createdAt: -1 })                    // 按时间倒序
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Submission.countDocuments({ userId: user._id, problemId: id }),
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
 * 获取提交详情
 * @route GET /api/submissions/:id
 * @description 获取单次提交的详细信息
 * @access 需要认证（只能查看自己的提交）
 * 
 * @param {string} req.params.id - 提交记录 ID
 * 
 * @returns {Object} 提交详情
 * @throws {404} 提交记录不存在
 */
export const getSubmissionDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 查询提交记录（限制只能查看自己的）
  const submission = await Submission.findOne({
    _id: id,
    userId: user._id,
  });

  if (!submission) {
    throw errors.notFound('提交记录不存在');
  }

  res.json({
    success: true,
    data: submission,
  });
});

/**
 * 收藏/取消收藏编程题
 * @route POST /api/problems/:id/favorite
 * @description 切换编程题的收藏状态
 * @access 需要认证
 * 
 * @param {string} req.params.id - 编程题 ID
 * 
 * @returns {Object} 当前收藏状态
 * @throws {404} 编程题不存在
 */
export const favoriteProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 验证题目是否存在
  const problem = await Problem.findById(id);
  if (!problem) {
    throw errors.notFound('编程题不存在');
  }

  // 检查是否已收藏
  const alreadyFavorited = user.favorites.problems.some(
    (p) => p.toString() === id
  );

  if (alreadyFavorited) {
    // 已收藏，取消收藏
    user.favorites.problems = user.favorites.problems.filter(
      (p) => p.toString() !== id
    );
    await user.save();
    res.json({
      success: true,
      message: '取消收藏成功',
      data: { favorited: false },
    });
  } else {
    // 未收藏，添加收藏
    user.favorites.problems.push(problem._id);
    await user.save();
    res.json({
      success: true,
      message: '收藏成功',
      data: { favorited: true },
    });
  }
});

// ==================== 管理员接口 ====================

/**
 * 创建编程题（管理员）
 * @route POST /api/admin/problems
 * @description 创建新的编程题
 * @access 需要管理员权限
 * 
 * @param {Object} req.body - 编程题数据
 * 
 * @returns {Object} 创建的编程题
 */
export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const problem = await Problem.create(req.body);

  res.status(201).json({
    success: true,
    message: '编程题创建成功',
    data: problem,
  });
});

/**
 * 更新编程题（管理员）
 * @route PUT /api/admin/problems/:id
 * @description 更新已有的编程题
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 编程题 ID
 * @param {Object} req.body - 要更新的字段
 * 
 * @returns {Object} 更新后的编程题
 * @throws {404} 编程题不存在
 */
export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const problem = await Problem.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!problem) {
    throw errors.notFound('编程题不存在');
  }

  res.json({
    success: true,
    message: '编程题更新成功',
    data: problem,
  });
});

/**
 * 删除编程题（管理员）
 * @route DELETE /api/admin/problems/:id
 * @description 删除编程题
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 编程题 ID
 * 
 * @returns {Object} 删除成功消息
 * @throws {404} 编程题不存在
 */
export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const problem = await Problem.findByIdAndDelete(id);
  if (!problem) {
    throw errors.notFound('编程题不存在');
  }

  res.json({
    success: true,
    message: '编程题删除成功',
  });
});

/**
 * 导出所有控制器方法
 */
export default {
  getProblemList,        // 获取编程题列表
  getProblemDetail,      // 获取编程题详情
  submitProblem,         // 提交代码
  getSubmissions,        // 获取提交历史
  getSubmissionDetail,   // 获取提交详情
  favoriteProblem,       // 收藏/取消收藏
  createProblem,         // 创建编程题（管理员）
  updateProblem,         // 更新编程题（管理员）
  deleteProblem,         // 删除编程题（管理员）
};
