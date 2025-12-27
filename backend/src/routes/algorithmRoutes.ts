/**
 * @file 算法题路由
 * @description 定义算法题相关的 API 路由，包括列表、详情、动画、提交等
 * @author FrontendPrepHub Team
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入算法题控制器
import { algorithmController } from '../controllers';
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
 * 获取算法题列表
 * @route   GET /api/algorithms
 * @desc    获取算法题列表，支持分页和筛选
 * @access  Public（带可选认证）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [category] - 分类筛选（basic/intermediate/advanced）
 * @query {string} [tag] - 标签筛选
 * @query {string} [isFree] - 是否免费筛选
 * @query {string} [search] - 搜索关键词
 * 
 * @returns {Object} 算法题列表和分页信息
 */
router.get(
  '/',
  optionalAuth,                       // 可选认证
  validate(paginationValidation),     // 验证分页参数
  algorithmController.getAlgorithmList
);

/**
 * 获取算法题详情
 * @route   GET /api/algorithms/:id
 * @desc    获取单个算法题的详细信息
 * @access  Public（带可选认证，付费题目需会员权限）
 * 
 * @param {string} id - 算法题 ID
 * 
 * @returns {Object} 算法题详细信息
 */
router.get(
  '/:id',
  optionalAuth,
  validate(objectIdValidation('id')),
  algorithmController.getAlgorithmDetail
);

/**
 * 获取算法动画数据
 * @route   GET /api/algorithms/:id/animation
 * @desc    获取算法的动画配置和步骤数据
 * @access  Public（带可选认证，付费动画需会员权限）
 * 
 * @param {string} id - 算法题 ID
 * @query {string} [inputData] - 自定义输入数据（JSON 格式）
 * 
 * @returns {Object} 动画类型、默认数据、步骤和解答信息
 */
router.get(
  '/:id/animation',
  optionalAuth,
  validate(objectIdValidation('id')),
  algorithmController.getAlgorithmAnimation
);

/**
 * 提交算法代码
 * @route   POST /api/algorithms/:id/submit
 * @desc    提交算法代码进行判题
 * @access  Private（需要认证，付费题目需会员权限）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 算法题 ID
 * @body {string} code - 用户代码
 * @body {string} [language='javascript'] - 编程语言
 * 
 * @returns {Object} 提交结果和测试详情
 */
router.post(
  '/:id/submit',
  authenticate,                       // 需要登录
  validate([...objectIdValidation('id'), ...submissionValidation]),
  algorithmController.submitAlgorithm
);

/**
 * 收藏/取消收藏算法题
 * @route   POST /api/algorithms/:id/favorite
 * @desc    切换算法题的收藏状态
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 算法题 ID
 * 
 * @returns {Object} 当前收藏状态
 */
router.post(
  '/:id/favorite',
  authenticate,
  validate(objectIdValidation('id')),
  algorithmController.favoriteAlgorithm
);

// 导出路由器
export default router;
