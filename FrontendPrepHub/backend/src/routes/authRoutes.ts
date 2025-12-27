/**
 * @file 认证路由
 * @description 定义用户认证相关的 API 路由，包括注册、登录、个人资料管理等
 * @author FrontendPrepHub Team
 */

// 导入 Express 路由器
import { Router } from 'express';
// 导入认证控制器
import { authController } from '../controllers';
// 导入中间件
import {
  authenticate,               // 认证中间件
  validate,                   // 验证中间件
  registerValidation,         // 注册验证规则
  loginValidation,            // 登录验证规则
  updateUserValidation,       // 更新资料验证规则
  changePasswordValidation,   // 修改密码验证规则
} from '../middleware';

// 创建路由器实例
const router = Router();

/**
 * 用户注册
 * @route   POST /api/auth/register
 * @desc    创建新用户账号
 * @access  Public（公开访问）
 * 
 * @body {string} email - 用户邮箱（必填，唯一）
 * @body {string} password - 用户密码（必填，6-20位，需含字母和数字）
 * @body {string} nickname - 用户昵称（必填，2-20位）
 * @body {string} [phone] - 手机号（可选）
 * 
 * @returns {Object} 用户信息和 JWT Token
 */
router.post(
  '/register',
  validate(registerValidation),   // 应用注册验证规则
  authController.register         // 调用注册控制器
);

/**
 * 用户登录
 * @route   POST /api/auth/login
 * @desc    验证用户凭证并返回 Token
 * @access  Public（公开访问）
 * 
 * @body {string} email - 用户邮箱
 * @body {string} password - 用户密码
 * 
 * @returns {Object} 用户信息和 JWT Token
 */
router.post(
  '/login',
  validate(loginValidation),      // 应用登录验证规则
  authController.login            // 调用登录控制器
);

/**
 * 获取当前用户信息
 * @route   GET /api/auth/me
 * @desc    获取当前登录用户的详细信息
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * 
 * @returns {Object} 用户详细信息
 */
router.get('/me', authenticate, authController.getMe);

/**
 * 更新用户信息
 * @route   PUT /api/auth/profile
 * @desc    更新当前用户的个人资料
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @body {string} [nickname] - 新昵称
 * @body {string} [avatar] - 新头像 URL
 * @body {string} [phone] - 新手机号
 * 
 * @returns {Object} 更新后的用户信息
 */
router.put(
  '/profile',
  authenticate,                   // 需要登录
  validate(updateUserValidation), // 应用更新验证规则
  authController.updateProfile    // 调用更新控制器
);

/**
 * 修改密码
 * @route   PUT /api/auth/password
 * @desc    修改当前用户的密码
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @body {string} oldPassword - 原密码
 * @body {string} newPassword - 新密码（6-20位，需含字母和数字）
 * 
 * @returns {Object} 新的 JWT Token
 */
router.put(
  '/password',
  authenticate,                       // 需要登录
  validate(changePasswordValidation), // 应用密码验证规则
  authController.changePassword       // 调用修改密码控制器
);

/**
 * 开通会员
 * @route   POST /api/auth/upgrade-member
 * @desc    升级为会员用户（模拟支付，实际项目需接入支付系统）
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @body {number} [duration=30] - 会员时长（天数）
 * 
 * @returns {Object} 新的角色和会员过期时间
 */
router.post('/upgrade-member', authenticate, authController.upgradeMember);

/**
 * 更新学习计划
 * @route   PUT /api/auth/study-plan
 * @desc    更新用户的个性化学习计划
 * @access  Private（需要认证）
 * 
 * @header {string} Authorization - Bearer Token
 * @body {string} [targetDate] - 目标日期（ISO 格式）
 * @body {string} [targetLevel] - 目标级别
 * @body {string[]} [dailyTasks] - 每日任务列表
 * 
 * @returns {Object} 更新后的学习计划
 */
router.put('/study-plan', authenticate, authController.updateStudyPlan);

// 导出路由器
export default router;
