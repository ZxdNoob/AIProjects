/**
 * @file 用户代码路由
 * @description 定义用户保存的代码项目相关的 API 路由
 * @author FrontendPrepHub Team
 * 
 * @note 所有用户代码路由都需要认证
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入用户代码控制器
import { userCodeController } from '../controllers';
// 导入中间件
import {
  authenticate,             // 认证中间件
  validate,                 // 验证中间件
  paginationValidation,     // 分页验证规则
  objectIdValidation,       // ObjectId 验证规则
  userCodeValidation,       // 用户代码验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 全局中间件
 * @description 所有用户代码路由都需要通过认证
 */
router.use(authenticate);

/**
 * 获取用户代码列表
 * @route   GET /api/user-codes
 * @desc    获取当前用户保存的代码项目列表
 * @access  Private（需要认证）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [type] - 类型筛选（custom/problem/algorithm）
 * 
 * @returns {Object} 代码项目列表和分页信息
 */
router.get(
  '/',
  validate(paginationValidation),
  userCodeController.getUserCodeList
);

/**
 * 获取代码详情
 * @route   GET /api/user-codes/:id
 * @desc    获取单个代码项目的详细信息，包括文件内容
 * @access  Private（需要认证，只能查看自己的代码）
 * 
 * @param {string} id - 代码项目 ID
 * 
 * @returns {Object} 代码项目详情
 */
router.get(
  '/:id',
  validate(objectIdValidation('id')),
  userCodeController.getUserCodeDetail
);

/**
 * 保存代码
 * @route   POST /api/user-codes
 * @desc    创建新的代码项目
 * @access  Private（需要认证，普通用户有数量限制）
 * 
 * @body {string} projectName - 项目名称
 * @body {string} [description] - 项目描述
 * @body {Object[]} files - 代码文件数组
 * @body {string} [entryFile='index.js'] - 入口文件名
 * @body {string} [type='custom'] - 项目类型
 * @body {string} [relatedProblemId] - 关联的编程题 ID
 * @body {string} [relatedAlgorithmId] - 关联的算法题 ID
 * 
 * @returns {Object} 创建的代码项目
 */
router.post(
  '/',
  validate(userCodeValidation),
  userCodeController.saveUserCode
);

/**
 * 更新代码
 * @route   PUT /api/user-codes/:id
 * @desc    更新已有的代码项目
 * @access  Private（需要认证，只能更新自己的代码）
 * 
 * @param {string} id - 代码项目 ID
 * @body {string} [projectName] - 新的项目名称
 * @body {string} [description] - 新的项目描述
 * @body {Object[]} [files] - 新的文件数组
 * @body {string} [entryFile] - 新的入口文件
 * 
 * @returns {Object} 更新后的代码项目
 */
router.put(
  '/:id',
  validate(objectIdValidation('id')),
  userCodeController.updateUserCode
);

/**
 * 删除代码
 * @route   DELETE /api/user-codes/:id
 * @desc    删除代码项目
 * @access  Private（需要认证，只能删除自己的代码）
 * 
 * @param {string} id - 代码项目 ID
 * 
 * @returns {Object} 删除成功消息
 */
router.delete(
  '/:id',
  validate(objectIdValidation('id')),
  userCodeController.deleteUserCode
);

/**
 * 执行代码
 * @route   POST /api/user-codes/run
 * @desc    在沙箱中执行用户代码
 * @access  Private（需要认证）
 * 
 * @body {string} code - 要执行的代码
 * @body {string} [language='javascript'] - 编程语言
 * 
 * @returns {Object} 执行结果或错误信息
 * 
 * @note 这是简化版实现，实际生产环境需要更安全的沙箱机制
 */
router.post('/run', userCodeController.runCode);

// 导出路由器
export default router;
