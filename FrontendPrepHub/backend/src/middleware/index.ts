/**
 * @file 中间件统一导出文件
 * @description 集中导出所有中间件模块，方便其他文件引用
 * @author FrontendPrepHub Team
 * 
 * @example
 * // 在路由或控制器中导入中间件
 * import { authenticate, validate, errors } from '../middleware';
 */

/**
 * 认证相关中间件
 * @description 从 auth.ts 导出认证和授权中间件
 */
export {
  authenticate,        // JWT 认证中间件（必须登录）
  optionalAuth,        // 可选认证中间件（登录增强）
  authorize,           // 角色授权中间件工厂
  requireMember,       // 会员权限检查
  requireAdmin,        // 管理员权限检查
  generateToken,       // JWT Token 生成函数
} from './auth';

/**
 * 请求验证中间件
 * @description 从 validator.ts 导出请求参数验证相关函数和规则
 */
export {
  validate,                    // 验证处理函数
  registerValidation,          // 注册请求验证规则
  loginValidation,             // 登录请求验证规则
  updateUserValidation,        // 更新用户信息验证规则
  changePasswordValidation,    // 修改密码验证规则
  knowledgeValidation,         // 知识点验证规则
  problemValidation,           // 编程题验证规则
  algorithmValidation,         // 算法题验证规则
  submissionValidation,        // 代码提交验证规则
  userCodeValidation,          // 用户代码保存验证规则
  paginationValidation,        // 分页参数验证规则
  objectIdValidation,          // MongoDB ObjectId 验证规则
} from './validator';

/**
 * 错误处理中间件
 * @description 从 errorHandler.ts 导出错误处理相关类和函数
 */
export {
  AppError,            // 自定义错误类
  errors,              // 常见错误构造函数集合
  asyncHandler,        // 异步处理包装器
  notFoundHandler,     // 404 路由处理中间件
  errorHandler,        // 全局错误处理中间件
} from './errorHandler';
