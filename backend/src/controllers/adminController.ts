/**
 * @file 管理员控制器
 * @description 处理管理员后台相关的所有业务逻辑，包括用户管理、平台统计、代码审核等
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入所有需要的数据模型
import { User, Knowledge, Problem, Algorithm, Submission, UserCode } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';
// 导入用户角色枚举
import { UserRole } from '../config';
// 导入 bcryptjs 用于密码加密（实际上这里没用到，可以移除）
import bcrypt from 'bcryptjs';

/**
 * 获取用户列表
 * @route GET /api/admin/users
 * @description 获取所有用户列表，支持分页、筛选和搜索
 * @access 需要管理员权限
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.role] - 角色筛选
 * @param {string} [req.query.search] - 搜索关键词（邮箱/昵称/手机号）
 * @param {string} [req.query.isActive] - 账号状态筛选
 * @param {string} [req.query.sortBy='createdAt'] - 排序字段
 * @param {string} [req.query.sortOrder='desc'] - 排序方向
 * 
 * @returns {Object} 用户列表和分页信息
 */
export const getUserList = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件
  const {
    page = 1,
    limit = 20,
    role,                         // 角色筛选
    search,                       // 搜索关键词
    isActive,                     // 账号状态
    sortBy = 'createdAt',         // 排序字段
    sortOrder = 'desc',           // 排序方向
  } = req.query;

  // 将分页参数转换为数字
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建查询条件
  const query: any = {};

  // 角色筛选
  if (role) query.role = role;
  // 账号状态筛选
  if (isActive !== undefined) query.isActive = isActive === 'true';
  // 搜索：支持邮箱、昵称、手机号的模糊匹配
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },     // 邮箱模糊匹配
      { nickname: { $regex: search, $options: 'i' } },  // 昵称模糊匹配
      { phone: { $regex: search, $options: 'i' } },     // 手机号模糊匹配
    ];
  }

  // 构建排序选项
  const sortOptions: any = {};
  sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  // 并行执行查询和计数
  const [items, total] = await Promise.all([
    User.find(query)
      .select('-password')          // 排除密码字段
      .sort(sortOptions)            // 应用排序
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  // 返回用户列表和分页信息
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
 * 获取用户详情
 * @route GET /api/admin/users/:id
 * @description 获取单个用户的详细信息，包括学习进度和统计数据
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 用户 ID
 * 
 * @returns {Object} 用户详情和统计数据
 * @throws {404} 用户不存在
 */
export const getUserDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // 查询用户，并关联查询学习进度
  const user = await User.findById(id)
    .populate('learningProgress.completedKnowledge', 'title category')
    .populate('learningProgress.completedProblems', 'title difficulty')
    .populate('learningProgress.completedAlgorithms', 'title category');

  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 获取用户的提交统计数据
  const [submissionCount, wrongRecordCount] = await Promise.all([
    // 总提交次数
    Submission.countDocuments({ userId: id }),
    // 未通过的提交次数
    Submission.countDocuments({ userId: id, status: { $ne: 'accepted' } }),
  ]);

  // 返回用户详情和统计
  res.json({
    success: true,
    data: {
      user,
      stats: {
        submissionCount,                            // 总提交次数
        wrongRecordCount,                           // 错误提交次数
        // 计算通过率
        acceptRate: submissionCount > 0
          ? (((submissionCount - wrongRecordCount) / submissionCount) * 100).toFixed(1)
          : '0.0',
      },
    },
  });
});

/**
 * 更新用户角色
 * @route PUT /api/admin/users/:id/role
 * @description 更新用户的角色（如升级为会员或管理员）
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 用户 ID
 * @param {Object} req.body - 请求体
 * @param {string} req.body.role - 新角色
 * @param {string} [req.body.memberExpireAt] - 会员过期时间（仅当角色为 member 时）
 * 
 * @returns {Object} 更新后的角色信息
 * @throws {400} 无效的角色类型或试图修改自己
 * @throws {404} 用户不存在
 */
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, memberExpireAt } = req.body;

  // 验证角色是否有效
  if (!Object.values(UserRole).includes(role)) {
    throw errors.badRequest('无效的角色类型');
  }

  // 查询用户
  const user = await User.findById(id);
  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 安全检查：不能修改自己的角色
  if (user._id.toString() === req.userId) {
    throw errors.badRequest('不能修改自己的角色');
  }

  // 更新角色
  user.role = role;
  // 如果设置为会员，同时设置过期时间
  if (role === UserRole.MEMBER && memberExpireAt) {
    user.memberExpireAt = new Date(memberExpireAt);
  }

  await user.save();

  // 返回更新结果
  res.json({
    success: true,
    message: '用户角色更新成功',
    data: {
      id: user._id,
      role: user.role,
      memberExpireAt: user.memberExpireAt,
    },
  });
});

/**
 * 重置用户密码
 * @route PUT /api/admin/users/:id/reset-password
 * @description 管理员为用户重置密码
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 用户 ID
 * @param {Object} req.body - 请求体
 * @param {string} req.body.newPassword - 新密码
 * 
 * @returns {Object} 重置成功消息
 * @throws {400} 密码长度不足
 * @throws {404} 用户不存在
 */
export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  // 验证密码长度
  if (!newPassword || newPassword.length < 6) {
    throw errors.badRequest('密码长度至少6个字符');
  }

  // 查询用户
  const user = await User.findById(id);
  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 更新密码（会在 pre('save') 钩子中自动加密）
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: '密码重置成功',
  });
});

/**
 * 禁用/启用用户
 * @route PUT /api/admin/users/:id/status
 * @description 更新用户的账号状态（启用/禁用）
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 用户 ID
 * @param {Object} req.body - 请求体
 * @param {boolean} req.body.isActive - 是否启用
 * 
 * @returns {Object} 更新后的状态
 * @throws {400} 试图禁用自己的账号
 * @throws {404} 用户不存在
 */
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 安全检查：不能禁用自己
  if (user._id.toString() === req.userId) {
    throw errors.badRequest('不能禁用自己的账号');
  }

  // 更新状态
  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    message: isActive ? '用户已启用' : '用户已禁用',
    data: {
      id: user._id,
      isActive: user.isActive,
    },
  });
});

/**
 * 删除用户
 * @route DELETE /api/admin/users/:id
 * @description 删除用户及其所有相关数据
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 用户 ID
 * 
 * @returns {Object} 删除成功消息
 * @throws {400} 试图删除自己
 * @throws {404} 用户不存在
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 安全检查：不能删除自己
  if (user._id.toString() === req.userId) {
    throw errors.badRequest('不能删除自己的账号');
  }

  // 删除用户及其所有相关数据
  // 并行删除以提高效率
  await Promise.all([
    User.findByIdAndDelete(id),              // 删除用户
    Submission.deleteMany({ userId: id }),    // 删除提交记录
    UserCode.deleteMany({ userId: id }),      // 删除保存的代码
    // 可以添加更多相关数据的删除...
  ]);

  res.json({
    success: true,
    message: '用户删除成功',
  });
});

/**
 * 获取平台统计数据
 * @route GET /api/admin/stats
 * @description 获取平台整体统计数据，包括用户数、内容数、趋势等
 * @access 需要管理员权限
 * 
 * @returns {Object} 平台统计数据
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  // 并行获取各项统计数据
  const [
    userCount,                    // 总用户数
    memberCount,                  // 会员数
    knowledgeCount,               // 知识点数
    problemCount,                 // 编程题数
    algorithmCount,               // 算法题数
    submissionCount,              // 总提交数
    todayUserCount,               // 今日新增用户
    todaySubmissionCount,         // 今日提交数
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: UserRole.MEMBER }),
    Knowledge.countDocuments({ isPublished: true }),
    Problem.countDocuments({ isPublished: true }),
    Algorithm.countDocuments({ isPublished: true }),
    Submission.countDocuments(),
    // 今日零点作为起始时间
    User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Submission.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  // 获取最近7天的注册趋势
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 使用聚合管道按日期分组统计注册人数
  const registrationTrend = await User.aggregate([
    {
      // 筛选最近7天的用户
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      // 按日期分组
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    // 按日期升序排列
    { $sort: { _id: 1 } },
  ]);

  // 获取热门知识点（按浏览量排序）
  const hotKnowledge = await Knowledge.find({ isPublished: true })
    .select('title category viewCount')
    .sort({ viewCount: -1 })
    .limit(10);

  // 获取热门编程题（按提交量排序）
  const hotProblems = await Problem.find({ isPublished: true })
    .select('title difficulty submitCount acceptCount')
    .sort({ submitCount: -1 })
    .limit(10);

  // 返回统计数据
  res.json({
    success: true,
    data: {
      // 概览数据
      overview: {
        userCount,
        memberCount,
        knowledgeCount,
        problemCount,
        algorithmCount,
        submissionCount,
        todayUserCount,
        todaySubmissionCount,
      },
      // 注册趋势
      registrationTrend,
      // 热门内容
      hotKnowledge,
      hotProblems,
    },
  });
});

/**
 * 获取待审核代码列表
 * @route GET /api/admin/user-codes
 * @description 获取用户提交的待审核代码列表
 * @access 需要管理员权限
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.status='pending'] - 审核状态筛选
 * 
 * @returns {Object} 代码列表和分页信息
 */
export const getPendingCodes = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, status = 'pending' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建查询条件
  const query: any = {};
  if (status) query.auditStatus = status;

  // 查询代码列表
  const [items, total] = await Promise.all([
    UserCode.find(query)
      .populate('userId', 'nickname email')     // 关联查询用户信息
      .sort({ createdAt: -1 })                  // 按创建时间倒序
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    UserCode.countDocuments(query),
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
 * 审核用户代码
 * @route PUT /api/admin/user-codes/:id/audit
 * @description 审核用户提交的代码（通过/拒绝）
 * @access 需要管理员权限
 * 
 * @param {string} req.params.id - 代码 ID
 * @param {Object} req.body - 请求体
 * @param {string} req.body.status - 审核状态（approved/rejected）
 * @param {string} [req.body.note] - 审核备注
 * 
 * @returns {Object} 更新后的代码信息
 * @throws {400} 无效的审核状态
 * @throws {404} 代码不存在
 */
export const auditUserCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  // 验证审核状态
  if (!['approved', 'rejected'].includes(status)) {
    throw errors.badRequest('无效的审核状态');
  }

  // 查询代码
  const userCode = await UserCode.findById(id);
  if (!userCode) {
    throw errors.notFound('代码不存在');
  }

  // 更新审核状态
  userCode.auditStatus = status;
  userCode.auditNote = note || '';
  await userCode.save();

  res.json({
    success: true,
    message: status === 'approved' ? '审核通过' : '审核拒绝',
    data: userCode,
  });
});

/**
 * 导出所有控制器方法
 */
export default {
  getUserList,           // 获取用户列表
  getUserDetail,         // 获取用户详情
  updateUserRole,        // 更新用户角色
  resetUserPassword,     // 重置用户密码
  updateUserStatus,      // 禁用/启用用户
  deleteUser,            // 删除用户
  getStats,              // 获取平台统计
  getPendingCodes,       // 获取待审核代码
  auditUserCode,         // 审核代码
};
