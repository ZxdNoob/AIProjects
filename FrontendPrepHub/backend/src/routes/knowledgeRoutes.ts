/**
 * @file 知识点路由
 * @description 定义知识点相关的 API 路由，包括列表、详情、收藏、标记等
 * @author FrontendPrepHub Team
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入知识点控制器
import { knowledgeController } from '../controllers';
// 导入中间件
import {
  authenticate,           // 认证中间件
  optionalAuth,           // 可选认证中间件
  validate,               // 验证中间件
  paginationValidation,   // 分页验证规则
  objectIdValidation,     // ObjectId 验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 获取知识点列表
 * @route   GET /api/knowledge
 * @desc    获取知识点列表，支持分页和筛选
 * @access  Public（带可选认证，用于根据用户角色过滤内容）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [category] - 分类筛选
 * @query {string} [level] - 难度筛选
 * @query {string} [tag] - 标签筛选
 * @query {string} [search] - 搜索关键词
 * 
 * @returns {Object} 知识点列表和分页信息
 */
router.get(
  '/',
  optionalAuth,                       // 可选认证：登录用户可以看到更多内容
  validate(paginationValidation),     // 验证分页参数
  knowledgeController.getKnowledgeList
);

/**
 * 获取知识点分类列表
 * @route   GET /api/knowledge/categories
 * @desc    获取所有知识点分类及其数量
 * @access  Public（公开访问）
 * 
 * @returns {Object[]} 分类名称和对应数量
 */
router.get('/categories', knowledgeController.getCategories);

/**
 * 获取用户收藏的知识点
 * @route   GET /api/knowledge/favorites
 * @desc    获取当前用户收藏的所有知识点
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * 
 * @returns {Object[]} 收藏的知识点列表
 */
router.get('/favorites', authenticate, knowledgeController.getFavorites);

/**
 * 获取用户薄弱项
 * @route   GET /api/knowledge/weak-points
 * @desc    获取当前用户标记的薄弱项知识点
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * 
 * @returns {Object[]} 薄弱项知识点列表
 */
router.get('/weak-points', authenticate, knowledgeController.getWeakPoints);

/**
 * 获取知识点详情
 * @route   GET /api/knowledge/:id
 * @desc    获取单个知识点的详细信息
 * @access  Public（带可选认证，进阶内容需会员权限）
 * 
 * @param {string} id - 知识点 ID
 * 
 * @returns {Object} 知识点详细信息
 * 
 * @note 路由顺序很重要：带参数的路由要放在固定路径路由之后
 *       否则 /favorites 会被当作 :id 处理
 */
router.get(
  '/:id',
  optionalAuth,                       // 可选认证
  validate(objectIdValidation('id')), // 验证 ID 格式
  knowledgeController.getKnowledgeDetail
);

/**
 * 收藏/取消收藏知识点
 * @route   POST /api/knowledge/:id/favorite
 * @desc    切换知识点的收藏状态
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 知识点 ID
 * 
 * @returns {Object} 当前收藏状态
 */
router.post(
  '/:id/favorite',
  authenticate,                       // 需要登录
  validate(objectIdValidation('id')),
  knowledgeController.favoriteKnowledge
);

/**
 * 标记/取消薄弱项
 * @route   POST /api/knowledge/:id/weak-point
 * @desc    将知识点标记为薄弱项或取消标记
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 知识点 ID
 * 
 * @returns {Object} 当前标记状态
 */
router.post(
  '/:id/weak-point',
  authenticate,
  validate(objectIdValidation('id')),
  knowledgeController.markWeakPoint
);

/**
 * 标记知识点为已学习
 * @route   POST /api/knowledge/:id/complete
 * @desc    将知识点标记为已完成学习
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @param {string} id - 知识点 ID
 * 
 * @returns {Object} 完成状态
 */
router.post(
  '/:id/complete',
  authenticate,
  validate(objectIdValidation('id')),
  knowledgeController.completeKnowledge
);

// 导出路由器
export default router;
