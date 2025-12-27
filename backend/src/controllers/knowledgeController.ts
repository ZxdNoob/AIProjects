/**
 * @file 知识点控制器
 * @description 处理知识点相关的所有业务逻辑，包括列表、详情、收藏、标记等功能
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入知识点和用户模型
import { Knowledge, User } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';
// 导入用户角色和知识点层级枚举
import { UserRole, KnowledgeLevel } from '../config';

/**
 * 获取知识点列表
 * @route GET /api/knowledge
 * @description 获取知识点列表，支持分页、筛选和搜索
 * @access 公开（但内容根据用户权限过滤）
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.category] - 分类筛选
 * @param {string} [req.query.level] - 难度筛选
 * @param {string} [req.query.tag] - 标签筛选
 * @param {string} [req.query.company] - 公司筛选
 * @param {string} [req.query.search] - 搜索关键词
 * 
 * @returns {Object} 知识点列表和分页信息
 */
export const getKnowledgeList = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件，设置默认值
  const {
    page = 1,         // 默认第一页
    limit = 20,       // 默认每页20条
    category,         // 分类
    level,            // 难度层级
    tag,              // 标签
    company,          // 来源公司
    search,           // 搜索关键词
  } = req.query;

  // 将分页参数转换为数字类型
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建 MongoDB 查询条件
  // 基础条件：只查询已发布的知识点
  const query: any = { isPublished: true };

  // 根据请求参数动态添加筛选条件
  if (category) query.category = category;
  if (level) query.level = level;
  if (tag) query.tags = tag;                    // 标签使用数组匹配
  // 公司名称使用正则模糊匹配（不区分大小写）
  if (company) query.company = { $regex: company, $options: 'i' };
  // 全文搜索
  if (search) {
    query.$text = { $search: search as string };
  }

  // 权限过滤：根据用户角色限制可查看的内容层级
  const user = req.user;
  if (!user || user.role === UserRole.USER) {
    // 未登录或普通用户只能查看基础和进阶内容
    query.level = { $in: [KnowledgeLevel.BASIC, KnowledgeLevel.INTERMEDIATE] };
  }
  // 会员和管理员可以查看全部内容

  // 并行执行查询和计数，提高性能
  const [items, total] = await Promise.all([
    // 查询知识点列表
    Knowledge.find(query)
      // 列表中不返回详细内容和标准答案，减少数据传输
      .select('-content.detail -content.standardAnswer')
      // 按排序权重升序，创建时间降序排列
      .sort({ order: 1, createdAt: -1 })
      // 分页：跳过前面的记录
      .skip((pageNum - 1) * limitNum)
      // 限制返回数量
      .limit(limitNum),
    // 统计符合条件的总数
    Knowledge.countDocuments(query),
  ]);

  // 返回知识点列表和分页信息
  res.json({
    success: true,
    data: {
      items,                                    // 知识点数组
      pagination: {
        page: pageNum,                          // 当前页码
        limit: limitNum,                        // 每页数量
        total,                                  // 总条数
        totalPages: Math.ceil(total / limitNum), // 总页数
      },
    },
  });
});

/**
 * 获取知识点详情
 * @route GET /api/knowledge/:id
 * @description 获取单个知识点的详细信息
 * @access 公开（但内容根据用户权限过滤）
 * 
 * @param {string} req.params.id - 知识点 ID
 * 
 * @returns {Object} 知识点详细信息
 * @throws {404} 知识点不存在
 * @throws {403} 需要会员权限
 */
export const getKnowledgeDetail = asyncHandler(async (req: Request, res: Response) => {
  // 从路由参数获取知识点 ID
  const { id } = req.params;

  // 查询知识点，并关联查询相关编程题
  const knowledge = await Knowledge.findById(id).populate('relatedProblems', 'title difficulty');

  // 检查知识点是否存在且已发布
  if (!knowledge || !knowledge.isPublished) {
    throw errors.notFound('知识点不存在');
  }

  // 权限检查逻辑
  const user = req.user;
  // 高级内容只有会员/管理员可访问
  const isAdvanced = knowledge.level === KnowledgeLevel.ADVANCED;
  const needMember = isAdvanced;

  // 普通用户无法访问高级内容
  if (needMember && (!user || user.role === UserRole.USER)) {
    throw errors.forbidden('此内容需要会员权限', 'MEMBER_REQUIRED');
  }

  // 增加浏览次数（异步保存，不阻塞响应）
  knowledge.viewCount += 1;
  await knowledge.save();

  // 将 Mongoose 文档转换为普通对象，方便修改
  let responseData = knowledge.toObject();
  
  // 普通用户访问进阶内容时，隐藏部分敏感内容
  if (knowledge.level === KnowledgeLevel.INTERMEDIATE && user?.role === UserRole.USER) {
    // 隐藏标准答案
    responseData.content.standardAnswer = '完整解析需要开通会员查看';
    // 清空拓展延伸
    responseData.content.extensions = [];
  }

  // 返回知识点详情
  res.json({
    success: true,
    data: responseData,
  });
});

/**
 * 获取知识点分类列表
 * @route GET /api/knowledge/categories
 * @description 获取所有知识点分类及其数量统计
 * @access 公开
 * 
 * @returns {Object[]} 分类名称和对应知识点数量
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  // 使用聚合管道统计各分类的知识点数量
  const categories = await Knowledge.aggregate([
    // 第一阶段：过滤已发布的知识点
    { $match: { isPublished: true } },
    // 第二阶段：按分类分组并计数
    { $group: { _id: '$category', count: { $sum: 1 } } },
    // 第三阶段：按数量降序排列
    { $sort: { count: -1 } },
  ]);

  // 返回分类列表
  res.json({
    success: true,
    data: categories.map(c => ({
      name: c._id,      // 分类名称
      count: c.count,   // 知识点数量
    })),
  });
});

/**
 * 收藏/取消收藏知识点
 * @route POST /api/knowledge/:id/favorite
 * @description 切换知识点的收藏状态（收藏/取消收藏）
 * @access 需要认证
 * 
 * @param {string} req.params.id - 知识点 ID
 * 
 * @returns {Object} 当前收藏状态
 * @throws {404} 知识点不存在
 */
export const favoriteKnowledge = asyncHandler(async (req: Request, res: Response) => {
  // 获取知识点 ID
  const { id } = req.params;
  // 获取当前登录用户
  const user = req.user!;

  // 验证知识点是否存在
  const knowledge = await Knowledge.findById(id);
  if (!knowledge) {
    throw errors.notFound('知识点不存在');
  }

  // 检查用户是否已收藏该知识点
  // 使用 .some() 判断数组中是否存在匹配项
  const alreadyFavorited = user.favorites.knowledge.some(
    (k) => k.toString() === id
  );

  if (alreadyFavorited) {
    // 如果已收藏，则取消收藏
    // 使用 .filter() 从数组中移除该知识点 ID
    user.favorites.knowledge = user.favorites.knowledge.filter(
      (k) => k.toString() !== id
    );
    // 减少知识点的收藏计数（确保不小于0）
    knowledge.favoriteCount = Math.max(0, knowledge.favoriteCount - 1);
    // 并行保存用户和知识点
    await Promise.all([user.save(), knowledge.save()]);

    res.json({
      success: true,
      message: '取消收藏成功',
      data: { favorited: false },
    });
  } else {
    // 如果未收藏，则添加收藏
    user.favorites.knowledge.push(knowledge._id);
    // 增加收藏计数
    knowledge.favoriteCount += 1;
    await Promise.all([user.save(), knowledge.save()]);

    res.json({
      success: true,
      message: '收藏成功',
      data: { favorited: true },
    });
  }
});

/**
 * 标记/取消标记薄弱项
 * @route POST /api/knowledge/:id/weak-point
 * @description 将知识点标记为薄弱项或取消标记
 * @access 需要认证
 * 
 * @param {string} req.params.id - 知识点 ID
 * 
 * @returns {Object} 当前标记状态
 * @throws {404} 知识点不存在
 */
export const markWeakPoint = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 验证知识点是否存在
  const knowledge = await Knowledge.findById(id);
  if (!knowledge) {
    throw errors.notFound('知识点不存在');
  }

  // 检查是否已标记为薄弱项
  const isMarked = user.weakPoints.some((k) => k.toString() === id);

  if (isMarked) {
    // 已标记，取消标记
    user.weakPoints = user.weakPoints.filter((k) => k.toString() !== id);
    await user.save();
    res.json({
      success: true,
      message: '已取消薄弱项标记',
      data: { marked: false },
    });
  } else {
    // 未标记，添加标记
    user.weakPoints.push(knowledge._id);
    await user.save();
    res.json({
      success: true,
      message: '已标记为薄弱项',
      data: { marked: true },
    });
  }
});

/**
 * 标记知识点为已学习
 * @route POST /api/knowledge/:id/complete
 * @description 将知识点标记为已完成学习
 * @access 需要认证
 * 
 * @param {string} req.params.id - 知识点 ID
 * 
 * @returns {Object} 完成状态
 * @throws {404} 知识点不存在
 */
export const completeKnowledge = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 验证知识点是否存在
  const knowledge = await Knowledge.findById(id);
  if (!knowledge) {
    throw errors.notFound('知识点不存在');
  }

  // 检查是否已经完成
  const isCompleted = user.learningProgress.completedKnowledge.some(
    (k) => k.toString() === id
  );

  // 只有未完成时才添加到完成列表
  if (!isCompleted) {
    user.learningProgress.completedKnowledge.push(knowledge._id);
    await user.save();
  }

  res.json({
    success: true,
    message: '已标记为完成',
    data: { completed: true },
  });
});

/**
 * 获取用户收藏的知识点
 * @route GET /api/knowledge/favorites
 * @description 获取当前用户收藏的所有知识点
 * @access 需要认证
 * 
 * @returns {Object[]} 收藏的知识点列表
 * @throws {404} 用户不存在
 */
export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  // 查询用户并关联查询收藏的知识点
  const user = await User.findById(req.userId)
    .populate('favorites.knowledge', 'title category level tags viewCount');

  if (!user) {
    throw errors.notFound('用户不存在');
  }

  res.json({
    success: true,
    data: user.favorites.knowledge,
  });
});

/**
 * 获取用户薄弱项
 * @route GET /api/knowledge/weak-points
 * @description 获取当前用户标记的所有薄弱项知识点
 * @access 需要认证
 * 
 * @returns {Object[]} 薄弱项知识点列表
 * @throws {404} 用户不存在
 */
export const getWeakPoints = asyncHandler(async (req: Request, res: Response) => {
  // 查询用户并关联查询薄弱项知识点
  const user = await User.findById(req.userId)
    .populate('weakPoints', 'title category level tags');

  if (!user) {
    throw errors.notFound('用户不存在');
  }

  res.json({
    success: true,
    data: user.weakPoints,
  });
});

// ==================== 管理员接口 ====================

/**
 * 创建知识点（管理员）
 * @route POST /api/admin/knowledge
 * @description 创建新的知识点
 * @access 需要管理员权限
 * 
 * @param {Object} req.body - 知识点数据
 * 
 * @returns {Object} 创建的知识点
 */
export const createKnowledge = asyncHandler(async (req: Request, res: Response) => {
  // 使用请求体数据创建知识点
  const knowledge = await Knowledge.create(req.body);

  res.status(201).json({
    success: true,
    message: '知识点创建成功',
    data: knowledge,
  });
});

/**
 * 更新知识点（管理员）
 * @route PUT /api/admin/knowledge/:id
 * @description 更新已有的知识点
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 知识点 ID
 * @param {Object} req.body - 要更新的字段
 * 
 * @returns {Object} 更新后的知识点
 * @throws {404} 知识点不存在
 */
export const updateKnowledge = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // findByIdAndUpdate 选项说明：
  // - $set: 只更新提供的字段
  // - new: true 返回更新后的文档
  // - runValidators: true 运行 Schema 验证
  const knowledge = await Knowledge.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!knowledge) {
    throw errors.notFound('知识点不存在');
  }

  res.json({
    success: true,
    message: '知识点更新成功',
    data: knowledge,
  });
});

/**
 * 删除知识点（管理员）
 * @route DELETE /api/admin/knowledge/:id
 * @description 删除知识点
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 知识点 ID
 * 
 * @returns {Object} 删除成功消息
 * @throws {404} 知识点不存在
 */
export const deleteKnowledge = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查找并删除知识点
  const knowledge = await Knowledge.findByIdAndDelete(id);
  if (!knowledge) {
    throw errors.notFound('知识点不存在');
  }

  res.json({
    success: true,
    message: '知识点删除成功',
  });
});

/**
 * 批量导入知识点（管理员）
 * @route POST /api/admin/knowledge/batch-import
 * @description 批量导入多个知识点
 * @access 需要管理员权限
 * 
 * @param {Object} req.body - 请求体
 * @param {Object[]} req.body.items - 知识点数组
 * 
 * @returns {Object} 导入结果统计
 * @throws {400} 请求体格式错误
 */
export const batchImportKnowledge = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.body;

  // 验证请求体
  if (!Array.isArray(items) || items.length === 0) {
    throw errors.badRequest('请提供要导入的知识点列表');
  }

  // 批量插入
  // ordered: false 表示即使某条记录失败也继续处理其他记录
  const result = await Knowledge.insertMany(items, { ordered: false });

  res.status(201).json({
    success: true,
    message: `成功导入 ${result.length} 个知识点`,
    data: {
      imported: result.length,    // 成功导入数量
      total: items.length,        // 请求导入数量
    },
  });
});

/**
 * 导出所有控制器方法
 */
export default {
  getKnowledgeList,      // 获取知识点列表
  getKnowledgeDetail,    // 获取知识点详情
  getCategories,         // 获取分类列表
  favoriteKnowledge,     // 收藏/取消收藏
  markWeakPoint,         // 标记/取消薄弱项
  completeKnowledge,     // 标记完成
  getFavorites,          // 获取收藏列表
  getWeakPoints,         // 获取薄弱项列表
  createKnowledge,       // 创建知识点（管理员）
  updateKnowledge,       // 更新知识点（管理员）
  deleteKnowledge,       // 删除知识点（管理员）
  batchImportKnowledge,  // 批量导入（管理员）
};
