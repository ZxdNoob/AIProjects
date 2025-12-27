/**
 * @file 认证控制器
 * @description 处理用户认证相关的所有业务逻辑，包括注册、登录、资料更新等
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入用户模型
import { User } from '../models';
// 导入认证中间件和错误处理工具
import { generateToken, asyncHandler, errors } from '../middleware';
// 导入用户角色枚举
import { UserRole } from '../config';

/**
 * 用户注册
 * @route POST /api/auth/register
 * @description 创建新用户账号，返回用户信息和 JWT Token
 * @access 公开
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.email - 用户邮箱（必填，唯一）
 * @param {string} req.body.password - 用户密码（必填，最少6位）
 * @param {string} req.body.nickname - 用户昵称（必填）
 * @param {string} [req.body.phone] - 用户手机号（可选）
 * 
 * @returns {Object} 用户信息和 JWT Token
 * @throws {409} 邮箱或手机号已被注册
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体中解构用户注册信息
  const { email, password, nickname, phone } = req.body;

  // 检查邮箱是否已被注册
  // 使用 findOne 查询是否存在相同邮箱的用户
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // 如果邮箱已存在，抛出 409 冲突错误
    throw errors.conflict('邮箱已被注册', 'EMAIL_EXISTS');
  }

  // 如果提供了手机号，检查手机号是否已被注册
  if (phone) {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      throw errors.conflict('手机号已被注册', 'PHONE_EXISTS');
    }
  }

  // 创建新用户
  // User.create() 会自动触发 pre('save') 钩子进行密码加密
  const user = await User.create({
    email,                           // 用户邮箱
    password,                        // 密码（会被自动加密）
    nickname,                        // 昵称
    phone,                           // 手机号（可选）
    role: UserRole.USER,             // 默认角色为普通用户
    // 初始化学习进度为空数组
    learningProgress: {
      completedKnowledge: [],        // 已完成的知识点
      completedProblems: [],         // 已完成的编程题
      completedAlgorithms: [],       // 已完成的算法题
    },
    // 初始化收藏列表为空数组
    favorites: {
      knowledge: [],                 // 收藏的知识点
      problems: [],                  // 收藏的编程题
      algorithms: [],                // 收藏的算法题
    },
    weakPoints: [],                  // 初始化薄弱项为空
  });

  // 为新用户生成 JWT Token
  const token = generateToken(user);

  // 返回 201 状态码和用户信息
  res.status(201).json({
    success: true,
    message: '注册成功',
    data: {
      user: {
        id: user._id,                // 用户 ID
        email: user.email,           // 邮箱
        nickname: user.nickname,     // 昵称
        avatar: user.avatar,         // 头像（默认为空）
        role: user.role,             // 角色
        phone: user.phone,           // 手机号
      },
      token,                         // JWT Token，用于后续请求认证
    },
  });
});

/**
 * 用户登录
 * @route POST /api/auth/login
 * @description 验证用户凭证，返回用户信息和 JWT Token
 * @access 公开
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.email - 用户邮箱
 * @param {string} req.body.password - 用户密码
 * 
 * @returns {Object} 用户信息和 JWT Token
 * @throws {401} 邮箱或密码错误
 * @throws {403} 账号已被禁用
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体中获取登录凭证
  const { email, password } = req.body;

  // 查找用户
  // 注意：使用 .select('+password') 显式包含密码字段
  // 因为在 Schema 中 password 字段设置了 select: false
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    // 用户不存在时返回通用错误信息（避免暴露用户是否存在）
    throw errors.unauthorized('邮箱或密码错误', 'INVALID_CREDENTIALS');
  }

  // 验证密码
  // 使用 bcrypt.compare 比较明文密码和哈希密码
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // 密码错误
    throw errors.unauthorized('邮箱或密码错误', 'INVALID_CREDENTIALS');
  }

  // 检查用户账户状态
  if (!user.isActive) {
    // 账户已被管理员禁用
    throw errors.forbidden('账号已被禁用，请联系管理员', 'USER_DISABLED');
  }

  // 更新登录统计信息
  user.lastLoginAt = new Date();     // 记录最后登录时间
  user.loginCount += 1;               // 登录次数加 1
  await user.save();                  // 保存更新

  // 生成 JWT Token
  const token = generateToken(user);

  // 返回登录成功响应
  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        memberExpireAt: user.memberExpireAt,      // 会员过期时间
        isMemberValid: user.isMemberValid(),      // 会员是否有效
      },
      token,
    },
  });
});

/**
 * 获取当前用户信息
 * @route GET /api/auth/me
 * @description 获取当前登录用户的详细信息
 * @access 需要认证
 * 
 * @returns {Object} 用户详细信息，包括学习进度和学习计划
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // 从认证中间件中获取当前用户
  // 使用 ! 断言用户一定存在（已通过认证中间件验证）
  const user = req.user!;

  // 返回用户详细信息
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        memberExpireAt: user.memberExpireAt,
        isMemberValid: user.isMemberValid(),
        createdAt: user.createdAt,                // 注册时间
        lastLoginAt: user.lastLoginAt,            // 最后登录时间
        loginCount: user.loginCount,              // 登录次数
        learningProgress: user.learningProgress,  // 学习进度
        studyPlan: user.studyPlan,                // 学习计划
      },
    },
  });
});

/**
 * 更新用户信息
 * @route PUT /api/auth/profile
 * @description 更新当前用户的个人信息
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {string} [req.body.nickname] - 新昵称
 * @param {string} [req.body.avatar] - 新头像 URL
 * @param {string} [req.body.phone] - 新手机号
 * 
 * @returns {Object} 更新后的用户信息
 * @throws {409} 手机号已被其他账号使用
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体中获取要更新的字段
  const { nickname, avatar, phone } = req.body;
  // 获取当前登录用户
  const user = req.user!;

  // 如果要更新手机号，检查是否被其他用户占用
  if (phone && phone !== user.phone) {
    // 查询是否有其他用户使用此手机号
    // $ne 表示 "not equal"，排除当前用户
    const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingPhone) {
      throw errors.conflict('手机号已被其他账号使用', 'PHONE_EXISTS');
    }
  }

  // 更新用户信息（仅更新非空字段）
  if (nickname) user.nickname = nickname;
  if (avatar) user.avatar = avatar;
  if (phone) user.phone = phone;

  // 保存更新到数据库
  await user.save();

  // 返回更新后的用户信息
  res.json({
    success: true,
    message: '信息更新成功',
    data: {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
      },
    },
  });
});

/**
 * 修改密码
 * @route PUT /api/auth/password
 * @description 修改当前用户的密码
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.oldPassword - 原密码
 * @param {string} req.body.newPassword - 新密码
 * 
 * @returns {Object} 新的 JWT Token
 * @throws {400} 原密码错误
 * @throws {404} 用户不存在
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体中获取新旧密码
  const { oldPassword, newPassword } = req.body;

  // 获取用户（包含密码字段用于验证）
  const user = await User.findById(req.userId).select('+password');
  if (!user) {
    throw errors.notFound('用户不存在');
  }

  // 验证原密码是否正确
  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    throw errors.badRequest('原密码错误', 'INVALID_OLD_PASSWORD');
  }

  // 更新密码
  // 密码会在 pre('save') 钩子中自动加密
  user.password = newPassword;
  await user.save();

  // 生成新 Token（密码修改后旧 Token 仍可用，但为了安全建议使用新 Token）
  const token = generateToken(user);

  // 返回新 Token
  res.json({
    success: true,
    message: '密码修改成功',
    data: { token },
  });
});

/**
 * 开通会员（模拟支付）
 * @route POST /api/auth/upgrade-member
 * @description 升级用户为会员（实际项目需要接入支付系统）
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {number} [req.body.duration=30] - 会员时长（天数）
 * 
 * @returns {Object} 新的角色和会员过期时间
 */
export const upgradeMember = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体获取会员时长，默认 30 天
  const { duration = 30 } = req.body;
  // 获取当前用户
  const user = req.user!;

  // 计算会员到期时间
  const now = new Date();
  let expireAt: Date;
  
  // 如果用户已是会员且未过期，在原有期限基础上续费
  if (user.memberExpireAt && user.memberExpireAt > now) {
    expireAt = new Date(user.memberExpireAt);
  } else {
    // 否则从当前时间开始计算
    expireAt = now;
  }
  
  // 增加会员天数
  expireAt.setDate(expireAt.getDate() + duration);

  // 更新用户角色和会员到期时间
  user.role = UserRole.MEMBER;
  user.memberExpireAt = expireAt;
  await user.save();

  // 返回更新结果
  res.json({
    success: true,
    message: `会员开通成功，有效期至 ${expireAt.toLocaleDateString()}`,
    data: {
      role: user.role,
      memberExpireAt: user.memberExpireAt,
    },
  });
});

/**
 * 更新学习计划
 * @route PUT /api/auth/study-plan
 * @description 更新用户的个性化学习计划
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {string} [req.body.targetDate] - 目标面试日期（ISO 格式）
 * @param {string} [req.body.targetLevel] - 目标岗位级别
 * @param {string[]} [req.body.dailyTasks] - 每日任务列表
 * 
 * @returns {Object} 更新后的学习计划
 */
export const updateStudyPlan = asyncHandler(async (req: Request, res: Response) => {
  // 从请求体获取学习计划字段
  const { targetDate, targetLevel, dailyTasks } = req.body;
  // 获取当前用户
  const user = req.user!;

  // 更新学习计划
  user.studyPlan = {
    // 如果提供了目标日期，转换为 Date 对象
    targetDate: targetDate ? new Date(targetDate) : undefined,
    targetLevel,                      // 目标级别（如 P5、P6）
    dailyTasks,                       // 每日任务数组
  };
  
  // 保存更新
  await user.save();

  // 返回更新后的学习计划
  res.json({
    success: true,
    message: '学习计划更新成功',
    data: {
      studyPlan: user.studyPlan,
    },
  });
});

/**
 * 导出所有控制器方法
 * @description 将所有方法打包为一个对象导出，方便在路由中使用
 */
export default {
  register,           // 用户注册
  login,              // 用户登录
  getMe,              // 获取当前用户信息
  updateProfile,      // 更新用户资料
  changePassword,     // 修改密码
  upgradeMember,      // 开通会员
  updateStudyPlan,    // 更新学习计划
};
