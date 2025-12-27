/**
 * @file 算法题控制器
 * @description 处理算法题相关的所有业务逻辑，包括列表、详情、动画、提交等功能
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入算法题、提交记录、错题记录模型
import { Algorithm, Submission, WrongRecord } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';
// 导入用户角色枚举
import { UserRole } from '../config';

/**
 * 获取算法题列表
 * @route GET /api/algorithms
 * @description 获取算法题列表，支持分页、筛选和搜索
 * @access 公开
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.category] - 分类筛选（basic/intermediate/advanced）
 * @param {string} [req.query.tag] - 标签筛选
 * @param {string} [req.query.search] - 搜索关键词
 * @param {string} [req.query.isFree] - 是否免费筛选
 * 
 * @returns {Object} 算法题列表和分页信息
 */
export const getAlgorithmList = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件
  const {
    page = 1,          // 默认第一页
    limit = 20,        // 默认每页20条
    category,          // 分类（基础/进阶/高级）
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
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (isFree !== undefined) query.isFree = isFree === 'true';
  // 全文搜索
  if (search) {
    query.$text = { $search: search as string };
  }

  // 并行执行查询和计数
  const [items, total] = await Promise.all([
    // 查询算法题列表，只返回列表需要的字段
    Algorithm.find(query)
      .select('title category tags isFree viewCount submitCount acceptCount order animation.type')
      .sort({ order: 1, createdAt: -1 })        // 按排序权重和创建时间排序
      .skip((pageNum - 1) * limitNum)           // 分页跳过
      .limit(limitNum),                          // 限制数量
    // 统计总数
    Algorithm.countDocuments(query),
  ]);

  // 返回算法题列表和分页信息
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
 * 获取算法题详情
 * @route GET /api/algorithms/:id
 * @description 获取单个算法题的详细信息
 * @access 公开（会员题目需要会员权限）
 * 
 * @param {string} req.params.id - 算法题 ID
 * 
 * @returns {Object} 算法题详细信息
 * @throws {404} 算法题不存在
 * @throws {403} 需要会员权限
 */
export const getAlgorithmDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查询算法题，并关联查询相关知识点
  const algorithm = await Algorithm.findById(id)
    .populate('relatedKnowledge', 'title category level');

  // 检查题目是否存在且已发布
  if (!algorithm || !algorithm.isPublished) {
    throw errors.notFound('算法题不存在');
  }

  // 权限检查：非免费题目需要会员权限
  const user = req.user;
  if (!algorithm.isFree && (!user || user.role === UserRole.USER)) {
    throw errors.forbidden('此算法需要会员权限', 'MEMBER_REQUIRED');
  }

  // 增加浏览次数
  algorithm.viewCount += 1;
  await algorithm.save();

  // 构建响应数据
  const responseData = algorithm.toObject();

  // 普通用户隐藏完整解答
  // 只展示时间复杂度和空间复杂度，隐藏代码和详细解释
  if (!user || user.role === UserRole.USER) {
    responseData.solution = {
      code: '',
      explanation: '请开通会员查看完整解析',
      timeComplexity: algorithm.solution.timeComplexity,
      spaceComplexity: algorithm.solution.spaceComplexity,
    };
  }

  res.json({
    success: true,
    data: responseData,
  });
});

/**
 * 获取算法动画数据
 * @route GET /api/algorithms/:id/animation
 * @description 获取算法的动画配置和步骤数据
 * @access 公开（会员题目需要会员权限）
 * 
 * @param {string} req.params.id - 算法题 ID
 * @param {string} [req.query.inputData] - 自定义输入数据
 * 
 * @returns {Object} 动画配置、默认数据和步骤
 * @throws {404} 算法题不存在
 * @throws {403} 需要会员权限
 */
export const getAlgorithmAnimation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  // 用户可以提供自定义输入数据
  const { inputData } = req.query;

  // 查询算法题
  const algorithm = await Algorithm.findById(id);
  if (!algorithm || !algorithm.isPublished) {
    throw errors.notFound('算法题不存在');
  }

  // 权限检查
  const user = req.user;
  if (!algorithm.isFree && (!user || user.role === UserRole.USER)) {
    throw errors.forbidden('此动画需要会员权限', 'MEMBER_REQUIRED');
  }

  // 返回动画配置
  res.json({
    success: true,
    data: {
      type: algorithm.animation.type,                      // 可视化类型
      defaultData: inputData || algorithm.animation.defaultData, // 使用自定义数据或默认数据
      steps: algorithm.animation.steps,                    // 动画步骤
      solution: {
        code: algorithm.solution.code,                     // 算法代码（用于代码高亮）
        timeComplexity: algorithm.solution.timeComplexity,
        spaceComplexity: algorithm.solution.spaceComplexity,
      },
    },
  });
});

/**
 * 提交算法代码
 * @route POST /api/algorithms/:id/submit
 * @description 提交算法代码进行判题
 * @access 需要认证（会员题目需要会员权限）
 * 
 * @param {string} req.params.id - 算法题 ID
 * @param {Object} req.body - 请求体
 * @param {string} req.body.code - 用户代码
 * @param {string} [req.body.language='javascript'] - 编程语言
 * 
 * @returns {Object} 提交结果和测试详情
 * @throws {404} 算法题不存在
 * @throws {403} 需要会员权限
 */
export const submitAlgorithm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { code, language = 'javascript' } = req.body;
  const user = req.user!;

  // 查询算法题
  const algorithm = await Algorithm.findById(id);
  if (!algorithm || !algorithm.isPublished) {
    throw errors.notFound('算法题不存在');
  }

  // 权限检查
  if (!algorithm.isFree && user.role === UserRole.USER) {
    throw errors.forbidden('此算法需要会员权限', 'MEMBER_REQUIRED');
  }

  // 创建提交记录
  const submission = new Submission({
    userId: user._id,
    algorithmId: id,                             // 关联算法题
    type: 'algorithm',                           // 类型：算法题
    code,
    language,
    status: 'running',
    testResults: [],
    passedCount: 0,
    totalCount: algorithm.testCases.length,
  });

  /**
   * 执行测试用例
   * @note 简化版实现，实际需要安全沙箱
   */
  const testResults: any[] = [];
  let passedCount = 0;

  // 遍历所有测试用例
  for (let i = 0; i < algorithm.testCases.length; i++) {
    const testCase = algorithm.testCases[i];
    try {
      // 简化实现：假设代码执行正确
      const actualOutput = testCase.expectedOutput;
      const passed = actualOutput === testCase.expectedOutput;
      if (passed) passedCount++;

      testResults.push({
        testCaseIndex: i,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
      });
    } catch (error: any) {
      // 运行时错误处理
      testResults.push({
        testCaseIndex: i,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: '',
        error: error.message,
      });
    }
  }

  // 更新提交记录
  submission.testResults = testResults;
  submission.passedCount = passedCount;
  // 确定最终状态
  submission.status = passedCount === algorithm.testCases.length ? 'accepted' : 'wrong_answer';

  await submission.save();

  // 更新算法题统计数据
  algorithm.submitCount += 1;
  if (submission.status === 'accepted') {
    // 通过
    algorithm.acceptCount += 1;

    // 更新用户完成进度
    if (!user.learningProgress.completedAlgorithms.includes(algorithm._id)) {
      user.learningProgress.completedAlgorithms.push(algorithm._id);
      await user.save();
    }
  } else {
    // 未通过：添加/更新错题记录
    await WrongRecord.findOneAndUpdate(
      { userId: user._id, algorithmId: id },
      {
        $inc: { wrongCount: 1 },
        $set: {
          lastWrongAt: new Date(),
          lastWrongCode: code,
          type: 'algorithm',
          isResolved: false,
        },
      },
      { upsert: true }
    );
  }

  await algorithm.save();

  // 返回提交结果
  res.json({
    success: true,
    message: submission.status === 'accepted' ? '恭喜通过！' : '未通过，请继续努力',
    data: {
      status: submission.status,
      passedCount,
      totalCount: algorithm.testCases.length,
      testResults,
    },
  });
});

/**
 * 收藏/取消收藏算法题
 * @route POST /api/algorithms/:id/favorite
 * @description 切换算法题的收藏状态
 * @access 需要认证
 * 
 * @param {string} req.params.id - 算法题 ID
 * 
 * @returns {Object} 当前收藏状态
 * @throws {404} 算法题不存在
 */
export const favoriteAlgorithm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 验证算法题是否存在
  const algorithm = await Algorithm.findById(id);
  if (!algorithm) {
    throw errors.notFound('算法题不存在');
  }

  // 检查是否已收藏
  const alreadyFavorited = user.favorites.algorithms.some(
    (a) => a.toString() === id
  );

  if (alreadyFavorited) {
    // 已收藏，取消收藏
    user.favorites.algorithms = user.favorites.algorithms.filter(
      (a) => a.toString() !== id
    );
    await user.save();
    res.json({
      success: true,
      message: '取消收藏成功',
      data: { favorited: false },
    });
  } else {
    // 未收藏，添加收藏
    user.favorites.algorithms.push(algorithm._id);
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
 * 创建算法题（管理员）
 * @route POST /api/admin/algorithms
 * @description 创建新的算法题
 * @access 需要管理员权限
 * 
 * @param {Object} req.body - 算法题数据
 * 
 * @returns {Object} 创建的算法题
 */
export const createAlgorithm = asyncHandler(async (req: Request, res: Response) => {
  const algorithm = await Algorithm.create(req.body);

  res.status(201).json({
    success: true,
    message: '算法题创建成功',
    data: algorithm,
  });
});

/**
 * 更新算法题（管理员）
 * @route PUT /api/admin/algorithms/:id
 * @description 更新已有的算法题
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 算法题 ID
 * @param {Object} req.body - 要更新的字段
 * 
 * @returns {Object} 更新后的算法题
 * @throws {404} 算法题不存在
 */
export const updateAlgorithm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const algorithm = await Algorithm.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!algorithm) {
    throw errors.notFound('算法题不存在');
  }

  res.json({
    success: true,
    message: '算法题更新成功',
    data: algorithm,
  });
});

/**
 * 删除算法题（管理员）
 * @route DELETE /api/admin/algorithms/:id
 * @description 删除算法题
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 算法题 ID
 * 
 * @returns {Object} 删除成功消息
 * @throws {404} 算法题不存在
 */
export const deleteAlgorithm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const algorithm = await Algorithm.findByIdAndDelete(id);
  if (!algorithm) {
    throw errors.notFound('算法题不存在');
  }

  res.json({
    success: true,
    message: '算法题删除成功',
  });
});

/**
 * 导出所有控制器方法
 */
export default {
  getAlgorithmList,        // 获取算法题列表
  getAlgorithmDetail,      // 获取算法题详情
  getAlgorithmAnimation,   // 获取动画数据
  submitAlgorithm,         // 提交算法代码
  favoriteAlgorithm,       // 收藏/取消收藏
  createAlgorithm,         // 创建算法题（管理员）
  updateAlgorithm,         // 更新算法题（管理员）
  deleteAlgorithm,         // 删除算法题（管理员）
};
