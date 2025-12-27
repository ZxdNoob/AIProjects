/**
 * @file 路由主入口文件
 * @description 聚合所有功能模块的路由，统一注册到主路由器
 * @author FrontendPrepHub Team
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入各功能模块的路由
import authRoutes from './authRoutes';           // 认证路由
import knowledgeRoutes from './knowledgeRoutes'; // 知识点路由
import problemRoutes from './problemRoutes';     // 编程题路由
import algorithmRoutes from './algorithmRoutes'; // 算法题路由
import adminRoutes from './adminRoutes';         // 管理后台路由
import userCodeRoutes from './userCodeRoutes';   // 用户代码路由
import learningRoutes from './learningRoutes';   // 学习管理路由

// 创建主路由器实例
const router = Router();

/**
 * ==================== API 路由注册 ====================
 * 所有路由都会挂载到 /api 前缀下（在 index.ts 中配置）
 */

/**
 * 认证相关路由
 * @route /api/auth/*
 * @description 处理用户注册、登录、个人资料等
 */
router.use('/auth', authRoutes);

/**
 * 知识点模块路由
 * @route /api/knowledge/*
 * @description 处理知识点的列表、详情、收藏、标记等
 */
router.use('/knowledge', knowledgeRoutes);

/**
 * 编程题模块路由
 * @route /api/problems/*
 * @description 处理编程题的列表、详情、提交、收藏等
 */
router.use('/problems', problemRoutes);

/**
 * 算法题模块路由
 * @route /api/algorithms/*
 * @description 处理算法题的列表、详情、动画、提交等
 */
router.use('/algorithms', algorithmRoutes);

/**
 * 用户代码模块路由
 * @route /api/user-codes/*
 * @description 处理用户保存的代码项目的增删改查
 */
router.use('/user-codes', userCodeRoutes);

/**
 * 学习管理模块路由
 * @route /api/learning/*
 * @description 处理学习进度、错题本、学习计划等
 */
router.use('/learning', learningRoutes);

/**
 * 管理员后台路由
 * @route /api/admin/*
 * @description 处理用户管理、内容管理、平台统计等管理功能
 * @access 需要管理员权限
 */
router.use('/admin', adminRoutes);

/**
 * 健康检查端点
 * @route GET /api/health
 * @description 用于检查 API 服务是否正常运行
 * @access 公开
 * 
 * @returns {Object} 包含服务状态和时间戳的响应
 * 
 * @example
 * // 请求示例
 * GET /api/health
 * 
 * // 响应示例
 * {
 *   "success": true,
 *   "message": "FrontendPrepHub API is running",
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FrontendPrepHub API is running',
    timestamp: new Date().toISOString(),
  });
});

// 导出主路由器
export default router;
