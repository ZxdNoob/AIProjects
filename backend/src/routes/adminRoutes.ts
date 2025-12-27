/**
 * @file 管理后台路由
 * @description 定义管理员后台相关的 API 路由，包括用户管理、内容管理、统计等
 * @author FrontendPrepHub Team
 * 
 * @note 所有管理员路由都需要认证和管理员权限
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入各模块控制器
import {
  adminController,         // 管理员控制器
  knowledgeController,     // 知识点控制器（用于内容管理）
  problemController,       // 编程题控制器（用于内容管理）
  algorithmController,     // 算法题控制器（用于内容管理）
} from '../controllers';
// 导入中间件
import {
  authenticate,            // 认证中间件
  requireAdmin,            // 管理员权限中间件
  validate,                // 验证中间件
  paginationValidation,    // 分页验证规则
  objectIdValidation,      // ObjectId 验证规则
  knowledgeValidation,     // 知识点验证规则
  problemValidation,       // 编程题验证规则
  algorithmValidation,     // 算法题验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 全局中间件
 * @description 所有管理员路由都需要通过认证和管理员权限检查
 * 这样就不需要在每个路由上单独添加这两个中间件
 */
router.use(authenticate, requireAdmin);

// ==================== 用户管理 ====================

/**
 * 获取用户列表
 * @route   GET /api/admin/users
 * @desc    获取所有用户列表，支持分页和筛选
 * @access  Admin（需要管理员权限）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [role] - 角色筛选
 * @query {string} [search] - 搜索关键词
 * @query {string} [isActive] - 账号状态筛选
 * @query {string} [sortBy='createdAt'] - 排序字段
 * @query {string} [sortOrder='desc'] - 排序方向
 * 
 * @returns {Object} 用户列表和分页信息
 */
router.get(
  '/users',
  validate(paginationValidation),
  adminController.getUserList
);

/**
 * 获取用户详情
 * @route   GET /api/admin/users/:id
 * @desc    获取单个用户的详细信息和统计数据
 * @access  Admin
 * 
 * @param {string} id - 用户 ID
 * 
 * @returns {Object} 用户详情和统计数据
 */
router.get(
  '/users/:id',
  validate(objectIdValidation('id')),
  adminController.getUserDetail
);

/**
 * 更新用户角色
 * @route   PUT /api/admin/users/:id/role
 * @desc    更新用户的角色
 * @access  Admin
 * 
 * @param {string} id - 用户 ID
 * @body {string} role - 新角色
 * @body {string} [memberExpireAt] - 会员过期时间（设为会员时需要）
 * 
 * @returns {Object} 更新后的角色信息
 */
router.put(
  '/users/:id/role',
  validate(objectIdValidation('id')),
  adminController.updateUserRole
);

/**
 * 重置用户密码
 * @route   PUT /api/admin/users/:id/reset-password
 * @desc    管理员为用户重置密码
 * @access  Admin
 * 
 * @param {string} id - 用户 ID
 * @body {string} newPassword - 新密码
 * 
 * @returns {Object} 重置成功消息
 */
router.put(
  '/users/:id/reset-password',
  validate(objectIdValidation('id')),
  adminController.resetUserPassword
);

/**
 * 禁用/启用用户
 * @route   PUT /api/admin/users/:id/status
 * @desc    更新用户的账号状态
 * @access  Admin
 * 
 * @param {string} id - 用户 ID
 * @body {boolean} isActive - 是否启用
 * 
 * @returns {Object} 更新后的状态
 */
router.put(
  '/users/:id/status',
  validate(objectIdValidation('id')),
  adminController.updateUserStatus
);

/**
 * 删除用户
 * @route   DELETE /api/admin/users/:id
 * @desc    删除用户及其所有相关数据
 * @access  Admin
 * 
 * @param {string} id - 用户 ID
 * 
 * @returns {Object} 删除成功消息
 */
router.delete(
  '/users/:id',
  validate(objectIdValidation('id')),
  adminController.deleteUser
);

// ==================== 知识点管理 ====================

/**
 * 创建知识点
 * @route   POST /api/admin/knowledge
 * @desc    创建新的知识点
 * @access  Admin
 * 
 * @body {Object} - 知识点数据（参见 knowledgeValidation）
 * 
 * @returns {Object} 创建的知识点
 */
router.post(
  '/knowledge',
  validate(knowledgeValidation),
  knowledgeController.createKnowledge
);

/**
 * 更新知识点
 * @route   PUT /api/admin/knowledge/:id
 * @desc    更新已有的知识点
 * @access  Admin
 * 
 * @param {string} id - 知识点 ID
 * @body {Object} - 要更新的字段
 * 
 * @returns {Object} 更新后的知识点
 */
router.put(
  '/knowledge/:id',
  validate(objectIdValidation('id')),
  knowledgeController.updateKnowledge
);

/**
 * 删除知识点
 * @route   DELETE /api/admin/knowledge/:id
 * @desc    删除知识点
 * @access  Admin
 * 
 * @param {string} id - 知识点 ID
 * 
 * @returns {Object} 删除成功消息
 */
router.delete(
  '/knowledge/:id',
  validate(objectIdValidation('id')),
  knowledgeController.deleteKnowledge
);

/**
 * 批量导入知识点
 * @route   POST /api/admin/knowledge/batch-import
 * @desc    批量导入多个知识点
 * @access  Admin
 * 
 * @body {Object[]} items - 知识点数组
 * 
 * @returns {Object} 导入结果统计
 */
router.post('/knowledge/batch-import', knowledgeController.batchImportKnowledge);

// ==================== 编程题管理 ====================

/**
 * 创建编程题
 * @route   POST /api/admin/problems
 * @desc    创建新的编程题
 * @access  Admin
 * 
 * @body {Object} - 编程题数据（参见 problemValidation）
 * 
 * @returns {Object} 创建的编程题
 */
router.post(
  '/problems',
  validate(problemValidation),
  problemController.createProblem
);

/**
 * 更新编程题
 * @route   PUT /api/admin/problems/:id
 * @desc    更新已有的编程题
 * @access  Admin
 * 
 * @param {string} id - 编程题 ID
 * @body {Object} - 要更新的字段
 * 
 * @returns {Object} 更新后的编程题
 */
router.put(
  '/problems/:id',
  validate(objectIdValidation('id')),
  problemController.updateProblem
);

/**
 * 删除编程题
 * @route   DELETE /api/admin/problems/:id
 * @desc    删除编程题
 * @access  Admin
 * 
 * @param {string} id - 编程题 ID
 * 
 * @returns {Object} 删除成功消息
 */
router.delete(
  '/problems/:id',
  validate(objectIdValidation('id')),
  problemController.deleteProblem
);

// ==================== 算法题管理 ====================

/**
 * 创建算法题
 * @route   POST /api/admin/algorithms
 * @desc    创建新的算法题
 * @access  Admin
 * 
 * @body {Object} - 算法题数据（参见 algorithmValidation）
 * 
 * @returns {Object} 创建的算法题
 */
router.post(
  '/algorithms',
  validate(algorithmValidation),
  algorithmController.createAlgorithm
);

/**
 * 更新算法题
 * @route   PUT /api/admin/algorithms/:id
 * @desc    更新已有的算法题
 * @access  Admin
 * 
 * @param {string} id - 算法题 ID
 * @body {Object} - 要更新的字段
 * 
 * @returns {Object} 更新后的算法题
 */
router.put(
  '/algorithms/:id',
  validate(objectIdValidation('id')),
  algorithmController.updateAlgorithm
);

/**
 * 删除算法题
 * @route   DELETE /api/admin/algorithms/:id
 * @desc    删除算法题
 * @access  Admin
 * 
 * @param {string} id - 算法题 ID
 * 
 * @returns {Object} 删除成功消息
 */
router.delete(
  '/algorithms/:id',
  validate(objectIdValidation('id')),
  algorithmController.deleteAlgorithm
);

// ==================== 数据统计 ====================

/**
 * 获取平台统计数据
 * @route   GET /api/admin/stats
 * @desc    获取平台整体统计数据
 * @access  Admin
 * 
 * @returns {Object} 用户数、内容数、趋势等统计数据
 */
router.get('/stats', adminController.getStats);

// ==================== 用户代码审核 ====================

/**
 * 获取待审核代码列表
 * @route   GET /api/admin/user-codes
 * @desc    获取用户提交的代码列表（按审核状态筛选）
 * @access  Admin
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [status='pending'] - 审核状态筛选
 * 
 * @returns {Object} 代码列表和分页信息
 */
router.get(
  '/user-codes',
  validate(paginationValidation),
  adminController.getPendingCodes
);

/**
 * 审核用户代码
 * @route   PUT /api/admin/user-codes/:id/audit
 * @desc    审核用户提交的代码（通过/拒绝）
 * @access  Admin
 * 
 * @param {string} id - 代码 ID
 * @body {string} status - 审核状态（approved/rejected）
 * @body {string} [note] - 审核备注
 * 
 * @returns {Object} 更新后的代码信息
 */
router.put(
  '/user-codes/:id/audit',
  validate(objectIdValidation('id')),
  adminController.auditUserCode
);

// 导出路由器
export default router;
