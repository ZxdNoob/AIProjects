/**
 * @file 用户代码控制器
 * @description 处理用户保存的代码项目相关业务逻辑，包括增删改查和代码执行
 * @author FrontendPrepHub Team
 */

// 导入 Express 的请求和响应类型
import { Request, Response } from 'express';
// 导入用户代码模型
import { UserCode } from '../models';
// 导入异步处理器和错误工具
import { asyncHandler, errors } from '../middleware';
// 导入用户角色枚举
import { UserRole } from '../config';

/**
 * 获取用户代码列表
 * @route GET /api/user-codes
 * @description 获取当前用户保存的代码项目列表
 * @access 需要认证
 * 
 * @param {Object} req.query - 查询参数
 * @param {number} [req.query.page=1] - 页码
 * @param {number} [req.query.limit=20] - 每页数量
 * @param {string} [req.query.type] - 类型筛选（custom/problem/algorithm）
 * 
 * @returns {Object} 代码项目列表和分页信息
 */
export const getUserCodeList = asyncHandler(async (req: Request, res: Response) => {
  // 从查询参数中解构分页和筛选条件
  const { page = 1, limit = 20, type } = req.query;
  const user = req.user!;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  // 构建查询条件：只查询当前用户的代码
  const query: any = { userId: user._id };
  if (type) query.type = type;

  // 查询代码列表
  const [items, total] = await Promise.all([
    UserCode.find(query)
      // 列表只返回基本信息，不返回文件内容
      .select('projectName description type entryFile auditStatus createdAt updatedAt')
      .sort({ updatedAt: -1 })            // 按更新时间倒序
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    UserCode.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * 获取代码详情
 * @route GET /api/user-codes/:id
 * @description 获取单个代码项目的详细信息，包括文件内容
 * @access 需要认证
 * 
 * @param {string} req.params.id - 代码项目 ID
 * 
 * @returns {Object} 代码项目详情
 * @throws {404} 代码不存在
 */
export const getUserCodeDetail = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 查询代码（限制只能查看自己的）
  const userCode = await UserCode.findOne({
    _id: id,
    userId: user._id,
  });

  if (!userCode) {
    throw errors.notFound('代码不存在');
  }

  res.json({
    success: true,
    data: userCode,
  });
});

/**
 * 保存代码
 * @route POST /api/user-codes
 * @description 创建新的代码项目
 * @access 需要认证（普通用户有数量限制）
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.projectName - 项目名称
 * @param {string} [req.body.description] - 项目描述
 * @param {Object[]} req.body.files - 代码文件数组
 * @param {string} [req.body.entryFile='index.js'] - 入口文件名
 * @param {string} [req.body.type='custom'] - 项目类型
 * @param {string} [req.body.relatedProblemId] - 关联的编程题 ID
 * @param {string} [req.body.relatedAlgorithmId] - 关联的算法题 ID
 * 
 * @returns {Object} 创建的代码项目
 * @throws {403} 普通用户超过保存数量限制
 */
export const saveUserCode = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  // 从请求体中解构代码项目数据
  const {
    projectName,
    description,
    files,
    entryFile,
    type = 'custom',
    relatedProblemId,
    relatedAlgorithmId,
  } = req.body;

  // 会员权限检查：普通用户限制保存数量
  if (user.role === UserRole.USER) {
    // 统计当前用户已保存的代码数量
    const existingCount = await UserCode.countDocuments({ userId: user._id });
    if (existingCount >= 5) {
      // 普通用户最多保存5个项目
      throw errors.forbidden('普通用户最多保存5个代码项目，请开通会员', 'MEMBER_REQUIRED');
    }
  }

  // 创建代码项目
  const userCode = await UserCode.create({
    userId: user._id,
    projectName,
    description,
    files,
    entryFile: entryFile || 'index.js',     // 默认入口文件
    type,
    relatedProblemId,
    relatedAlgorithmId,
    auditStatus: 'approved',                 // 默认通过审核
    isPublic: false,                         // 默认私有
  });

  res.status(201).json({
    success: true,
    message: '代码保存成功',
    data: userCode,
  });
});

/**
 * 更新代码
 * @route PUT /api/user-codes/:id
 * @description 更新已有的代码项目
 * @access 需要认证
 * 
 * @param {string} req.params.id - 代码项目 ID
 * @param {Object} req.body - 请求体
 * @param {string} [req.body.projectName] - 新的项目名称
 * @param {string} [req.body.description] - 新的项目描述
 * @param {Object[]} [req.body.files] - 新的文件数组
 * @param {string} [req.body.entryFile] - 新的入口文件
 * 
 * @returns {Object} 更新后的代码项目
 * @throws {404} 代码不存在
 */
export const updateUserCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const { projectName, description, files, entryFile } = req.body;

  // 查询代码（限制只能更新自己的）
  const userCode = await UserCode.findOne({
    _id: id,
    userId: user._id,
  });

  if (!userCode) {
    throw errors.notFound('代码不存在');
  }

  // 更新字段（只更新提供的字段）
  if (projectName) userCode.projectName = projectName;
  if (description !== undefined) userCode.description = description;
  if (files) userCode.files = files;
  if (entryFile) userCode.entryFile = entryFile;

  await userCode.save();

  res.json({
    success: true,
    message: '代码更新成功',
    data: userCode,
  });
});

/**
 * 删除代码
 * @route DELETE /api/user-codes/:id
 * @description 删除代码项目
 * @access 需要认证
 * 
 * @param {string} req.params.id - 代码项目 ID
 * 
 * @returns {Object} 删除成功消息
 * @throws {404} 代码不存在
 */
export const deleteUserCode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // 查找并删除代码（限制只能删除自己的）
  const userCode = await UserCode.findOneAndDelete({
    _id: id,
    userId: user._id,
  });

  if (!userCode) {
    throw errors.notFound('代码不存在');
  }

  res.json({
    success: true,
    message: '代码删除成功',
  });
});

/**
 * 执行代码
 * @route POST /api/user-codes/run
 * @description 在沙箱中执行用户代码（简化版实现）
 * @access 需要认证
 * 
 * @param {Object} req.body - 请求体
 * @param {string} req.body.code - 要执行的代码
 * @param {string} [req.body.language='javascript'] - 编程语言
 * 
 * @returns {Object} 执行结果或错误信息
 * 
 * @note 这是一个简化的实现，实际生产环境应该使用：
 * - VM2 等沙箱库在隔离环境中执行
 * - Docker 容器进行完全隔离
 * - 设置 CPU 和内存限制
 * - 设置执行超时时间
 */
export const runCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, language = 'javascript' } = req.body;

  // 简化的代码执行逻辑
  try {
    /**
     * 危险 API 检测
     * @description 检查代码中是否包含可能造成安全问题的 API 调用
     * 这是一个基础的安全检查，实际应使用更完善的沙箱机制
     */
    const dangerousPatterns = [
      /eval\s*\(/,           // eval 函数
      /Function\s*\(/,       // Function 构造函数
      /document\.write/,     // document.write
      /innerHTML\s*=/,       // innerHTML 赋值
      /require\s*\(/,        // Node.js require
      /import\s+/,           // ES6 import
      /process\./,           // Node.js process 对象
      /child_process/,       // 子进程模块
      /fs\./,                // 文件系统模块
      /__dirname/,           // 当前目录
      /__filename/,          // 当前文件名
    ];

    // 遍历检查每个危险模式
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('代码包含不安全的API调用');
      }
    }

    // 返回模拟的执行结果
    // 实际实现应该真正执行代码并返回结果
    res.json({
      success: true,
      data: {
        output: '代码执行成功（演示模式）',
        executionTime: 10,        // 执行时间（毫秒）
        memoryUsage: 1024,        // 内存使用（字节）
      },
    });
  } catch (error: any) {
    // 执行失败，返回错误信息
    res.json({
      success: false,
      message: error.message || '代码执行失败',
      data: {
        error: error.message,
      },
    });
  }
});

/**
 * 导出所有控制器方法
 */
export default {
  getUserCodeList,       // 获取代码列表
  getUserCodeDetail,     // 获取代码详情
  saveUserCode,          // 保存代码
  updateUserCode,        // 更新代码
  deleteUserCode,        // 删除代码
  runCode,               // 执行代码
};
