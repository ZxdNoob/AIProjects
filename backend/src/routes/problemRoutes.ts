/**
 * @file 编程题路由
 * @description 定义编程题相关的 API 路由，包括列表、详情、提交、收藏等
 * @author FrontendPrepHub Team
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入编程题控制器
import { problemController } from '../controllers';
// 导入中间件
import {
  authenticate,             // 认证中间件
  optionalAuth,             // 可选认证中间件
  validate,                 // 验证中间件
  paginationValidation,     // 分页验证规则
  objectIdValidation,       // ObjectId 验证规则
  submissionValidation,     // 代码提交验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 获取编程题列表
 * @route   GET /api/problems
 * @desc    获取编程题列表，支持分页和筛选
 * @access  Public（带可选认证）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [difficulty] - 难度筛选（easy/medium/hard）
 * @query {string} [category] - 分类筛选
 * @query {string} [tag] - 标签筛选
 * @query {string} [isFree] - 是否免费筛选
 * @query {string} [search] - 搜索关键词
 * 
 * @returns {Object} 编程题列表和分页信息
 */
router.get(
  '/',
  optionalAuth,                       // 可选认证
  validate(paginationValidation),     // 验证分页参数
  problemController.getProblemList
);

/**
 * 获取编程题详情
 * @route   GET /api/problems/:id
 * @desc    获取单个编程题的详细信息
 * @access  Public（带可选认证，付费题目需会员权限）
 * 
 * @param {string} id - 编程题 ID
 * 
 * @returns {Object} 编程题详细信息
 */
router.get(
  '/:id',
  optionalAuth,
  validate(objectIdValidation('id')),
  problemController.getProblemDetail
);

/**
 * 提交代码
 * @route   POST /api/problems/:id/submit
 * @desc    提交代码进行判题
 * @access  Private（需要认证，付费题目需会员权限）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 编程题 ID
 * @body {string} code - 用户代码
 * @body {string} [language='javascript'] - 编程语言
 * 
 * @returns {Object} 提交结果和测试详情
 */
router.post(
  '/:id/submit',
  authenticate,                       // 需要登录
  // 合并 ID 验证和提交内容验证
  validate([...objectIdValidation('id'), ...submissionValidation]),
  problemController.submitProblem
);

/**
 * 获取用户提交历史
 * @route   GET /api/problems/:id/submissions
 * @desc    获取当前用户对某道题的所有提交记录
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 编程题 ID
 * @query {number} [page=1] - 页码
 * @query {number} [limit=10] - 每页数量
 * 
 * @returns {Object} 提交历史列表和分页信息
 */
router.get(
  '/:id/submissions',
  authenticate,
  validate([...objectIdValidation('id'), ...paginationValidation]),
  problemController.getSubmissions
);

/**
 * 收藏/取消收藏编程题
 * @route   POST /api/problems/:id/favorite
 * @desc    切换编程题的收藏状态
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 编程题 ID
 * 
 * @returns {Object} 当前收藏状态
 */
router.post(
  '/:id/favorite',
  authenticate,
  validate(objectIdValidation('id')),
  problemController.favoriteProblem
);

/**
 * 获取提交详情
 * @route   GET /api/submissions/:id
 * @desc    获取单次提交的详细信息
 * @access  Private（需要认证，只能查看自己的提交）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 提交记录 ID
 * 
 * @returns {Object} 提交详情
 * 
 * @note 这个路由挂载在 /api/problems 下，完整路径是 /api/problems/submissions/:id
 */
router.get(
  '/submissions/:id',
  authenticate,
  validate(objectIdValidation('id')),
  problemController.getSubmissionDetail
);

// 导出路由器
export default router;
