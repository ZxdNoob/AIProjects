/**
 * @file 学习管理路由
 * @description 定义学习进度、错题本、学习计划相关的 API 路由
 * @author FrontendPrepHub Team
 * 
 * @note 所有学习管理路由都需要认证
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入学习管理控制器
import { learningController } from '../controllers';
// 导入中间件
import {
  authenticate,             // 认证中间件
  validate,                 // 验证中间件
  paginationValidation,     // 分页验证规则
  objectIdValidation,       // ObjectId 验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 全局中间件
 * @description 所有学习管理路由都需要通过认证
 */
router.use(authenticate);

/**
 * 获取学习进度报告
 * @route   GET /api/learning/progress
 * @desc    获取当前用户的完整学习进度报告
 * @access  Private（需要认证）
 * 
 * @returns {Object} 学习进度概览、分类进度、学习计划和最近活动
 */
router.get('/progress', learningController.getProgress);

/**
 * 获取错题本
 * @route   GET /api/learning/wrong-records
 * @desc    获取当前用户的错题记录列表
 * @access  Private（需要认证）
 * 
 * @query {number} [page=1] - 页码
 * @query {number} [limit=20] - 每页数量
 * @query {string} [type] - 类型筛选（problem/algorithm）
 * @query {string} [isResolved] - 是否已解决筛选
 * 
 * @returns {Object} 错题列表和分页信息
 */
router.get(
  '/wrong-records',
  validate(paginationValidation),
  learningController.getWrongRecords
);

/**
 * 获取错题详情
 * @route   GET /api/learning/wrong-records/:id
 * @desc    获取单个错题记录的详细信息
 * @access  Private（需要认证）
 * 
 * @param {string} id - 错题记录 ID
 * 
 * @returns {Object} 错题详情，包含关联的题目信息
 */
router.get(
  '/wrong-records/:id',
  validate(objectIdValidation('id')),
  learningController.getWrongRecordDetail
);

/**
 * 标记错题为已解决
 * @route   PUT /api/learning/wrong-records/:id/resolve
 * @desc    将错题标记为已解决（已掌握）
 * @access  Private（需要认证）
 * 
 * @param {string} id - 错题记录 ID
 * 
 * @returns {Object} 更新后的错题记录
 */
router.put(
  '/wrong-records/:id/resolve',
  validate(objectIdValidation('id')),
  learningController.resolveWrongRecord
);

/**
 * 记录错题复习
 * @route   PUT /api/learning/wrong-records/:id/review
 * @desc    记录用户对错题进行了复习
 * @access  Private（需要认证）
 * 
 * @param {string} id - 错题记录 ID
 * @body {string} [notes] - 复习笔记
 * 
 * @returns {Object} 更新后的错题记录
 */
router.put(
  '/wrong-records/:id/review',
  validate(objectIdValidation('id')),
  learningController.reviewWrongRecord
);

/**
 * 获取学习统计
 * @route   GET /api/learning/stats
 * @desc    获取用户的学习统计数据
 * @access  Private（需要认证）
 * 
 * @returns {Object} 提交统计、错题统计、趋势数据和难度分布
 */
router.get('/stats', learningController.getStats);

/**
 * 生成学习计划
 * @route   POST /api/learning/generate-plan
 * @desc    根据目标日期和级别生成个性化学习计划
 * @access  Private（需要认证）
 * 
 * @body {string} targetDate - 目标日期（ISO 格式）
 * @body {string} targetLevel - 目标级别（junior/mid/senior）
 * 
 * @returns {Object} 生成的学习计划和当前状态
 */
router.post('/generate-plan', learningController.generateStudyPlan);

/**
 * 获取每日任务完成情况
 * @route   GET /api/learning/daily-tasks
 * @desc    获取用户今日的任务完成情况
 * @access  Private（需要认证）
 * 
 * @returns {Object} 每日任务列表和今日完成进度
 */
router.get('/daily-tasks', learningController.getDailyTasks);

// 导出路由器
export default router;
