/**
 * @file 错误处理中间件
 * @description 提供自定义错误类和全局错误处理机制
 * @author FrontendPrepHub Team
 */

// 导入 Express 类型
import { Request, Response, NextFunction } from 'express';

/**
 * 自定义应用错误类
 * @class AppError
 * @extends Error
 * @description 用于创建包含状态码和错误代码的自定义错误
 * 
 * @example
 * throw new AppError('用户不存在', 404, 'USER_NOT_FOUND');
 */
export class AppError extends Error {
  /** HTTP 状态码 */
  statusCode: number;
  
  /** 错误代码（用于前端识别） */
  code: string;
  
  /** 是否为可操作错误（可预期的业务错误） */
  isOperational: boolean;

  /**
   * 创建 AppError 实例
   * @param {string} message - 错误消息
   * @param {number} statusCode - HTTP 状态码
   * @param {string} [code='ERROR'] - 错误代码
   */
  constructor(message: string, statusCode: number, code: string = 'ERROR') {
    // 调用父类构造函数
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    // 标记为可操作错误（可预期的业务错误）
    this.isOperational = true;

    // 捕获堆栈跟踪，排除构造函数本身
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 常见错误构造函数集合
 * @const errors
 * @description 提供便捷的错误创建方法
 * 
 * @example
 * throw errors.notFound('用户不存在');
 * throw errors.badRequest('参数错误', 'INVALID_PARAMS');
 */
export const errors = {
  /**
   * 400 错误请求
   * @param {string} message - 错误消息
   * @param {string} [code='BAD_REQUEST'] - 错误代码
   */
  badRequest: (message: string, code = 'BAD_REQUEST') =>
    new AppError(message, 400, code),
  
  /**
   * 401 未授权
   * @param {string} [message='请先登录'] - 错误消息
   * @param {string} [code='UNAUTHORIZED'] - 错误代码
   */
  unauthorized: (message = '请先登录', code = 'UNAUTHORIZED') =>
    new AppError(message, 401, code),
  
  /**
   * 403 禁止访问
   * @param {string} [message='权限不足'] - 错误消息
   * @param {string} [code='FORBIDDEN'] - 错误代码
   */
  forbidden: (message = '权限不足', code = 'FORBIDDEN') =>
    new AppError(message, 403, code),
  
  /**
   * 404 资源不存在
   * @param {string} [message='资源不存在'] - 错误消息
   * @param {string} [code='NOT_FOUND'] - 错误代码
   */
  notFound: (message = '资源不存在', code = 'NOT_FOUND') =>
    new AppError(message, 404, code),
  
  /**
   * 409 冲突（如重复数据）
   * @param {string} message - 错误消息
   * @param {string} [code='CONFLICT'] - 错误代码
   */
  conflict: (message: string, code = 'CONFLICT') =>
    new AppError(message, 409, code),
  
  /**
   * 500 服务器内部错误
   * @param {string} [message='服务器内部错误'] - 错误消息
   * @param {string} [code='INTERNAL_ERROR'] - 错误代码
   */
  internal: (message = '服务器内部错误', code = 'INTERNAL_ERROR') =>
    new AppError(message, 500, code),
};

/**
 * 异步处理包装器
 * @function asyncHandler
 * @description 自动捕获异步函数中的错误并传递给错误处理中间件
 * 
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的中间件函数
 * 
 * @example
 * // 不使用 asyncHandler 时需要手动 try-catch
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await User.find();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * // 使用 asyncHandler 后
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 将异步函数的结果转换为 Promise 并捕获错误
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 未找到路由处理中间件
 * @function notFoundHandler
 * @description 处理所有未匹配的路由，返回 404 错误
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
};

/**
 * 全局错误处理中间件
 * @function errorHandler
 * @description 处理所有未捕获的错误，返回统一格式的错误响应
 * 
 * @param {Error|AppError} err - 错误对象
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件（必须声明但不使用）
 * 
 * @note Express 要求错误处理中间件必须有 4 个参数
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // 默认错误值
  let statusCode = 500;
  let message = '服务器内部错误';
  let code = 'INTERNAL_ERROR';
  let stack: string | undefined;

  // 处理自定义 AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  /**
   * 处理 MongoDB 重复键错误
   * @description MongoDB 唯一索引冲突时会抛出 code 为 11000 的错误
   */
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = '数据已存在';
    code = 'DUPLICATE_KEY';
    
    // 尝试获取具体是哪个字段重复
    const keyValue = (err as any).keyValue;
    if (keyValue) {
      const field = Object.keys(keyValue)[0];
      if (field === 'email') {
        message = '邮箱已被注册';
      } else if (field === 'phone') {
        message = '手机号已被注册';
      }
    }
  }

  /**
   * 处理 MongoDB 验证错误
   * @description Schema 验证失败时抛出
   */
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    code = 'VALIDATION_ERROR';
  }

  /**
   * 处理 MongoDB CastError
   * @description 无效的 ObjectId 格式
   */
  if (err.name === 'CastError') {
    statusCode = 400;
    message = '无效的ID格式';
    code = 'INVALID_ID';
  }

  /**
   * 处理 JWT 验证错误
   * @description Token 格式无效或签名验证失败
   */
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的认证令牌';
    code = 'INVALID_TOKEN';
  }

  /**
   * 处理 JWT 过期错误
   * @description Token 已超过有效期
   */
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '登录已过期，请重新登录';
    code = 'TOKEN_EXPIRED';
  }

  // 开发环境输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    stack = err.stack;
    console.error('Error:', err);
  }

  // 返回统一格式的错误响应
  res.status(statusCode).json({
    success: false,
    message,
    code,
    // 仅在开发环境返回堆栈信息
    ...(stack && { stack }),
  });
};

/**
 * 默认导出所有错误处理工具
 */
export default {
  AppError,          // 自定义错误类
  errors,            // 错误构造函数集合
  asyncHandler,      // 异步处理包装器
  notFoundHandler,   // 404 处理
  errorHandler,      // 全局错误处理
};
