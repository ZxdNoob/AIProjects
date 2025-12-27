/**
 * @file 请求验证中间件
 * @description 使用 express-validator 提供请求参数验证功能
 * @author FrontendPrepHub Team
 */

// 导入 Express 类型
import { Request, Response, NextFunction } from 'express';
// 导入 express-validator 验证函数
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

/**
 * 验证结果处理中间件
 * @function validate
 * @description 执行验证规则并处理验证结果
 * 
 * @param {ValidationChain[]} validations - 验证规则数组
 * @returns {Function} Express 中间件函数
 * 
 * @example
 * router.post('/register', validate(registerValidation), authController.register);
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 并行执行所有验证规则
    await Promise.all(validations.map(validation => validation.run(req)));

    // 获取验证结果
    const errors = validationResult(req);
    
    // 如果没有错误，继续执行下一个中间件
    if (errors.isEmpty()) {
      next();
      return;
    }

    // 格式化错误信息
    const formattedErrors = errors.array().map(err => ({
      // 获取错误字段名（兼容不同版本的 express-validator）
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
    }));

    // 返回 400 错误响应
    res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors,          // 详细的错误列表
    });
  };
};

/**
 * 用户注册验证规则
 * @const registerValidation
 * @description 验证注册请求的参数
 */
export const registerValidation = [
  // 邮箱验证
  body('email')
    .trim()                              // 去除首尾空格
    .isEmail()                           // 验证邮箱格式
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),                   // 标准化邮箱格式
  
  // 密码验证
  body('password')
    .isLength({ min: 6, max: 20 })       // 长度限制
    .withMessage('密码长度需要在6-20个字符之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)  // 必须包含字母和数字
    .withMessage('密码需要包含字母和数字'),
  
  // 昵称验证
  body('nickname')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('昵称长度需要在2-20个字符之间'),
  
  // 手机号验证（可选）
  body('phone')
    .optional()                           // 可选字段
    .matches(/^1[3-9]\d{9}$/)            // 中国大陆手机号格式
    .withMessage('请输入有效的手机号'),
];

/**
 * 用户登录验证规则
 * @const loginValidation
 * @description 验证登录请求的参数
 */
export const loginValidation = [
  // 邮箱验证
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  
  // 密码验证（仅验证非空）
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
];

/**
 * 用户信息更新验证规则
 * @const updateUserValidation
 * @description 验证更新用户信息请求的参数
 */
export const updateUserValidation = [
  // 昵称验证（可选）
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('昵称长度需要在2-20个字符之间'),
  
  // 头像 URL 验证（可选）
  body('avatar')
    .optional()
    .isURL()                              // 验证 URL 格式
    .withMessage('请输入有效的头像URL'),
  
  // 手机号验证（可选）
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('请输入有效的手机号'),
];

/**
 * 修改密码验证规则
 * @const changePasswordValidation
 * @description 验证修改密码请求的参数
 */
export const changePasswordValidation = [
  // 原密码验证
  body('oldPassword')
    .notEmpty()
    .withMessage('原密码不能为空'),
  
  // 新密码验证
  body('newPassword')
    .isLength({ min: 6, max: 20 })
    .withMessage('新密码长度需要在6-20个字符之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('新密码需要包含字母和数字'),
];

/**
 * 知识点验证规则
 * @const knowledgeValidation
 * @description 验证创建/更新知识点的参数
 */
export const knowledgeValidation = [
  // 标题验证
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  
  // 分类验证
  body('category')
    .notEmpty()
    .withMessage('分类不能为空'),
  
  // 难度等级验证
  body('level')
    .isIn(['basic', 'intermediate', 'advanced'])
    .withMessage('无效的难度等级'),
  
  // 概要验证
  body('content.summary')
    .notEmpty()
    .withMessage('概要不能为空'),
  
  // 详细内容验证
  body('content.detail')
    .notEmpty()
    .withMessage('详细内容不能为空'),
];

/**
 * 编程题验证规则
 * @const problemValidation
 * @description 验证创建/更新编程题的参数
 */
export const problemValidation = [
  // 标题验证
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  
  // 难度验证
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('无效的难度等级'),
  
  // 分类验证
  body('category')
    .notEmpty()
    .withMessage('分类不能为空'),
  
  // 题目描述验证
  body('description')
    .notEmpty()
    .withMessage('题目描述不能为空'),
  
  // 测试用例验证
  body('testCases')
    .isArray({ min: 1 })                  // 至少一个测试用例
    .withMessage('至少需要一个测试用例'),
];

/**
 * 算法题验证规则
 * @const algorithmValidation
 * @description 验证创建/更新算法题的参数
 */
export const algorithmValidation = [
  // 标题验证
  body('title')
    .trim()
    .notEmpty()
    .withMessage('标题不能为空')
    .isLength({ max: 100 })
    .withMessage('标题最多100个字符'),
  
  // 分类验证
  body('category')
    .isIn(['basic', 'intermediate', 'advanced'])
    .withMessage('无效的分类'),
  
  // 描述验证
  body('description')
    .notEmpty()
    .withMessage('算法描述不能为空'),
];

/**
 * 代码提交验证规则
 * @const submissionValidation
 * @description 验证代码提交请求的参数
 */
export const submissionValidation = [
  // 代码验证
  body('code')
    .notEmpty()
    .withMessage('代码不能为空'),
  
  // 语言验证
  body('language')
    .isIn(['javascript', 'typescript'])
    .withMessage('不支持的编程语言'),
];

/**
 * 用户代码保存验证规则
 * @const userCodeValidation
 * @description 验证保存代码项目的参数
 */
export const userCodeValidation = [
  // 项目名称验证
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 50 })
    .withMessage('项目名称最多50个字符'),
  
  // 文件数组验证
  body('files')
    .isArray({ min: 1 })
    .withMessage('至少需要一个代码文件'),
  
  // 验证数组中每个文件的文件名
  body('files.*.filename')
    .notEmpty()
    .withMessage('文件名不能为空'),
  
  // 验证数组中每个文件的内容
  body('files.*.content')
    .notEmpty()
    .withMessage('文件内容不能为空'),
];

/**
 * 分页查询验证规则
 * @const paginationValidation
 * @description 验证分页参数
 */
export const paginationValidation = [
  // 页码验证（可选）
  query('page')
    .optional()
    .isInt({ min: 1 })                    // 必须是大于0的整数
    .withMessage('页码必须是大于0的整数'),
  
  // 每页数量验证（可选）
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })          // 限制范围
    .withMessage('每页数量必须在1-100之间'),
];

/**
 * MongoDB ObjectId 验证规则工厂函数
 * @function objectIdValidation
 * @description 创建验证 URL 参数中 ObjectId 的规则
 * 
 * @param {string} paramName - 参数名称
 * @returns {ValidationChain[]} 验证规则数组
 * 
 * @example
 * router.get('/:id', validate(objectIdValidation('id')), controller.getById);
 */
export const objectIdValidation = (paramName: string) => [
  param(paramName)
    .isMongoId()                          // 验证 MongoDB ObjectId 格式
    .withMessage('无效的ID格式'),
];

/**
 * 默认导出所有验证规则和函数
 */
export default {
  validate,                   // 验证处理函数
  registerValidation,         // 注册验证
  loginValidation,            // 登录验证
  updateUserValidation,       // 更新用户验证
  changePasswordValidation,   // 修改密码验证
  knowledgeValidation,        // 知识点验证
  problemValidation,          // 编程题验证
  algorithmValidation,        // 算法题验证
  submissionValidation,       // 代码提交验证
  userCodeValidation,         // 用户代码验证
  paginationValidation,       // 分页验证
  objectIdValidation,         // ObjectId 验证
};
