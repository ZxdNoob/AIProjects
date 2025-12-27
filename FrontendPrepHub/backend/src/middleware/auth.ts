/**
 * @file 认证中间件
 * @description 提供 JWT 认证和角色授权相关的中间件
 * @author FrontendPrepHub Team
 */

// 导入 Express 类型
import { Request, Response, NextFunction } from 'express';
// 导入 jsonwebtoken 库用于 JWT 操作
import jwt from 'jsonwebtoken';
// 导入用户模型和接口
import { User, IUser } from '../models';
// 导入配置和角色枚举
import { config, UserRole } from '../config';

/**
 * 扩展 Express Request 类型
 * @description 在 Request 对象上添加用户相关属性
 * @global
 */
declare global {
  namespace Express {
    interface Request {
      /** 当前登录用户的完整信息 */
      user?: IUser;
      /** 当前登录用户的 ID 字符串 */
      userId?: string;
    }
  }
}

/**
 * JWT Token 载荷接口
 * @interface JwtPayload
 * @description 定义 JWT Token 中包含的数据结构
 */
interface JwtPayload {
  /** 用户 ID */
  userId: string;
  /** 用户邮箱 */
  email: string;
  /** 用户角色 */
  role: UserRole;
  /** 签发时间（秒级时间戳） */
  iat: number;
  /** 过期时间（秒级时间戳） */
  exp: number;
}

/**
 * 认证中间件
 * @function authenticate
 * @description 验证 JWT Token 并将用户信息附加到请求对象
 * @access 用于需要登录的路由
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * 
 * @returns {Promise<void>}
 * 
 * @example
 * // 在路由中使用
 * router.get('/profile', authenticate, profileController.getProfile);
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从请求头获取 Authorization 字段
    const authHeader = req.headers.authorization;
    
    // 检查是否提供了 Token
    // Token 格式应为: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: '未提供认证令牌',
        code: 'NO_TOKEN',
      });
      return;
    }

    // 提取 Token（去掉 "Bearer " 前缀）
    const token = authHeader.split(' ')[1];

    // 验证 Token
    let decoded: JwtPayload;
    try {
      // 使用密钥验证并解码 Token
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      // 处理 Token 过期错误
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: '登录已过期，请重新登录',
          code: 'TOKEN_EXPIRED',
        });
        return;
      }
      // 处理其他 Token 验证错误
      res.status(401).json({
        success: false,
        message: '无效的认证令牌',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // 根据 Token 中的用户 ID 查找用户
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户不存在',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // 检查用户账号是否被禁用
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: '账号已被禁用',
        code: 'USER_DISABLED',
      });
      return;
    }

    // 将用户信息附加到请求对象，供后续中间件和控制器使用
    req.user = user;
    req.userId = user._id.toString();

    // 继续执行下一个中间件
    next();
  } catch (error) {
    // 处理未预期的错误
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      code: 'SERVER_ERROR',
    });
  }
};

/**
 * 可选认证中间件
 * @function optionalAuth
 * @description Token 存在时验证，不存在时也放行（不阻断请求）
 * @access 用于公开但登录用户有更多功能的路由
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * 
 * @example
 * // 在路由中使用
 * // 未登录用户可以查看列表，登录用户可以看到额外信息
 * router.get('/knowledge', optionalAuth, knowledgeController.getList);
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 获取 Authorization 头
    const authHeader = req.headers.authorization;
    
    // 如果没有提供 Token，直接放行
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    // 提取 Token
    const token = authHeader.split(' ')[1];
    
    try {
      // 验证 Token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      // 查找用户
      const user = await User.findById(decoded.userId);
      
      // 如果用户存在且未被禁用，附加用户信息
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
      }
    } catch {
      // Token 无效时静默失败，不阻断请求
      // 这允许未登录用户正常访问公开内容
    }

    // 继续执行
    next();
  } catch (error) {
    // 发生错误时也继续执行，不阻断请求
    next();
  }
};

/**
 * 角色权限检查中间件工厂函数
 * @function authorize
 * @description 创建一个检查用户角色的中间件
 * @access 用于限制特定角色访问的路由
 * 
 * @param {...UserRole} allowedRoles - 允许访问的角色列表
 * @returns {Function} Express 中间件函数
 * 
 * @example
 * // 只允许会员和管理员访问
 * router.get('/premium', authenticate, authorize(UserRole.MEMBER, UserRole.ADMIN), controller);
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 检查是否已通过认证
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '请先登录',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // 检查用户角色是否在允许列表中
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足，无法访问此资源',
        code: 'PERMISSION_DENIED',
      });
      return;
    }

    // 权限检查通过
    next();
  };
};

/**
 * 会员权限检查中间件
 * @function requireMember
 * @description 检查用户是否为有效会员或管理员
 * @access 用于会员专属内容
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * 
 * @example
 * router.get('/premium-content', authenticate, requireMember, controller);
 */
export const requireMember = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 检查是否已登录
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '请先登录',
      code: 'NOT_AUTHENTICATED',
    });
    return;
  }

  // 管理员直接放行（拥有所有权限）
  if (req.user.role === UserRole.ADMIN) {
    next();
    return;
  }

  // 会员需要检查有效期
  if (req.user.role === UserRole.MEMBER) {
    // 调用 isMemberValid() 方法检查会员是否在有效期内
    if (req.user.isMemberValid()) {
      next();
      return;
    }
    // 会员已过期
    res.status(403).json({
      success: false,
      message: '会员已过期，请续费',
      code: 'MEMBER_EXPIRED',
    });
    return;
  }

  // 普通用户无法访问会员内容
  res.status(403).json({
    success: false,
    message: '此内容仅会员可访问，请开通会员',
    code: 'MEMBER_REQUIRED',
  });
};

/**
 * 管理员权限检查中间件
 * @function requireAdmin
 * @description 检查用户是否为管理员
 * @access 用于管理后台功能
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 * 
 * @example
 * router.delete('/users/:id', authenticate, requireAdmin, adminController.deleteUser);
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 检查是否已登录
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: '请先登录',
      code: 'NOT_AUTHENTICATED',
    });
    return;
  }

  // 检查是否为管理员角色
  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: '此操作需要管理员权限',
      code: 'ADMIN_REQUIRED',
    });
    return;
  }

  // 管理员权限验证通过
  next();
};

/**
 * 生成 JWT Token
 * @function generateToken
 * @description 为用户生成 JWT Token
 * 
 * @param {IUser} user - 用户对象
 * @returns {string} JWT Token 字符串
 * 
 * @example
 * const token = generateToken(user);
 * res.json({ token });
 */
export const generateToken = (user: IUser): string => {
  // 构建 Token 载荷
  const payload = {
    userId: user._id.toString(),    // 用户 ID
    email: user.email,               // 用户邮箱
    role: user.role,                 // 用户角色
  };

  // 使用密钥签名并返回 Token
  // expiresIn 来自配置文件（如 "7d"）
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * 默认导出所有中间件
 */
export default {
  authenticate,      // 必须认证
  optionalAuth,      // 可选认证
  authorize,         // 角色授权
  requireMember,     // 会员权限
  requireAdmin,      // 管理员权限
  generateToken,     // 生成 Token
};
