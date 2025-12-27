/**
 * API 服务模块
 * 封装所有与后端的 HTTP 请求
 */

// 导入 axios 及其类型
// axios: HTTP 客户端库
// AxiosError: axios 错误类型
// AxiosInstance: axios 实例类型
// AxiosRequestConfig: 请求配置类型
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
// 导入类型定义
import {
  ApiResponse,        // API 响应通用类型
  User,               // 用户类型
  Knowledge,          // 知识点类型
  Problem,            // 编程题类型
  Algorithm,          // 算法题类型
  Submission,         // 提交记录类型
  WrongRecord,        // 错题记录类型
  UserCode,           // 用户代码类型
  PaginatedResponse,  // 分页响应类型
  PaginationParams,   // 分页参数类型
} from '@/types';

// ============================================================
// axios 实例配置
// ============================================================

/**
 * 创建 axios 实例
 * 统一配置请求的基础 URL、超时时间、请求头等
 */
const api: AxiosInstance = axios.create({
  // API 基础路径，所有请求都会以此为前缀
  baseURL: '/api',
  // 请求超时时间：30秒
  timeout: 30000,
  // 默认请求头
  headers: {
    // 设置内容类型为 JSON
    'Content-Type': 'application/json',
  },
});

// ============================================================
// 请求拦截器
// ============================================================

/**
 * 请求拦截器
 * 在请求发送前执行，用于：
 * 1. 自动添加认证 token 到请求头
 * 2. 统一处理请求配置
 */
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取认证状态
    // auth-storage 是 zustand persist 中间件存储的 key
    const authStorage = localStorage.getItem('auth-storage');
    // 如果存在认证数据
    if (authStorage) {
      try {
        // 解析 JSON 数据
        const { state } = JSON.parse(authStorage);
        // 如果存在 token，添加到请求头
        if (state?.token) {
          // 使用 Bearer token 认证方式
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        // 解析失败时输出错误
        console.error('Parse auth storage error:', e);
      }
    }
    // 返回处理后的配置
    return config;
  },
  (error) => {
    // 请求配置出错时直接拒绝
    return Promise.reject(error);
  }
);

// ============================================================
// 响应拦截器
// ============================================================

/**
 * 响应拦截器
 * 在收到响应后执行，用于：
 * 1. 统一处理响应数据格式
 * 2. 统一处理错误
 * 3. 处理 token 过期等特殊情况
 */
api.interceptors.response.use(
  (response) => {
    // 成功响应：直接返回响应数据（去掉 axios 包装层）
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    // 提取错误信息，优先使用服务器返回的消息
    const message = error.response?.data?.message || error.message || '请求失败';
    // 获取错误码
    const code = error.response?.data?.code;

    // 处理 token 过期或无效的情况
    if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
      // 清除本地存储的认证信息
      localStorage.removeItem('auth-storage');
      // 重定向到登录页
      window.location.href = '/login';
    }

    // 返回统一格式的错误对象
    return Promise.reject({ message, code, status: error.response?.status });
  }
);

// ============================================================
// 认证 API
// ============================================================

/**
 * 认证相关 API
 * 包含注册、登录、获取用户信息、更新资料等功能
 */
export const authApi = {
  /**
   * 用户注册
   * @param data - 注册信息（邮箱、密码、昵称、手机号）
   * @returns 返回用户信息和 token
   */
  register: (data: {
    email: string;      // 邮箱
    password: string;   // 密码
    nickname: string;   // 昵称
    phone?: string;     // 手机号（可选）
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    return api.post('/auth/register', data);
  },

  /**
   * 用户登录
   * @param email - 邮箱
   * @param password - 密码
   * @returns 返回用户信息和 token
   */
  login: (
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    return api.post('/auth/login', { email, password });
  },

  /**
   * 获取当前登录用户信息
   * @returns 返回当前用户信息
   */
  getMe: (): Promise<ApiResponse<{ user: User }>> => {
    return api.get('/auth/me');
  },

  /**
   * 更新用户资料
   * @param data - 要更新的字段（昵称、头像、手机号）
   * @returns 返回更新后的用户信息
   */
  updateProfile: (data: {
    nickname?: string;  // 昵称
    avatar?: string;    // 头像 URL
    phone?: string;     // 手机号
  }): Promise<ApiResponse<{ user: User }>> => {
    return api.put('/auth/profile', data);
  },

  /**
   * 修改密码
   * @param oldPassword - 原密码
   * @param newPassword - 新密码
   * @returns 返回新的 token
   */
  changePassword: (
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ token: string }>> => {
    return api.put('/auth/password', { oldPassword, newPassword });
  },

  /**
   * 升级为会员
   * @param duration - 会员时长（月），可选
   * @returns 返回新角色和会员过期时间
   */
  upgradeMember: (
    duration?: number
  ): Promise<ApiResponse<{ role: string; memberExpireAt: string }>> => {
    return api.post('/auth/upgrade-member', { duration });
  },

  /**
   * 更新学习计划
   * @param data - 学习计划数据（目标日期、目标等级、每日任务）
   * @returns 返回更新后的学习计划
   */
  updateStudyPlan: (data: {
    targetDate?: string;   // 目标完成日期
    targetLevel?: string;  // 目标等级
    dailyTasks?: string[]; // 每日任务列表
  }): Promise<ApiResponse<{ studyPlan: any }>> => {
    return api.put('/auth/study-plan', data);
  },
};

// ============================================================
// 知识点 API
// ============================================================

/**
 * 知识点相关 API
 * 包含获取列表、详情、分类、收藏、标记等功能
 */
export const knowledgeApi = {
  /**
   * 获取知识点列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的知识点列表
   */
  getList: (params?: {
    page?: number;      // 页码
    limit?: number;     // 每页数量
    category?: string;  // 分类筛选
    level?: string;     // 难度级别筛选
    tag?: string;       // 标签筛选
    company?: string;   // 公司筛选
    search?: string;    // 搜索关键词
  }): Promise<ApiResponse<PaginatedResponse<Knowledge>>> => {
    return api.get('/knowledge', { params });
  },

  /**
   * 获取知识点详情
   * @param id - 知识点 ID
   * @returns 返回知识点详细信息
   */
  getDetail: (id: string): Promise<ApiResponse<Knowledge>> => {
    return api.get(`/knowledge/${id}`);
  },

  /**
   * 获取知识点分类列表
   * @returns 返回分类名称和对应数量
   */
  getCategories: (): Promise<
    ApiResponse<{ name: string; count: number }[]>
  > => {
    return api.get('/knowledge/categories');
  },

  /**
   * 获取用户收藏的知识点
   * @returns 返回收藏的知识点列表
   */
  getFavorites: (): Promise<ApiResponse<Knowledge[]>> => {
    return api.get('/knowledge/favorites');
  },

  /**
   * 获取用户标记的薄弱点
   * @returns 返回薄弱点列表
   */
  getWeakPoints: (): Promise<ApiResponse<Knowledge[]>> => {
    return api.get('/knowledge/weak-points');
  },

  /**
   * 收藏/取消收藏知识点
   * @param id - 知识点 ID
   * @returns 返回收藏状态
   */
  favorite: (id: string): Promise<ApiResponse<{ favorited: boolean }>> => {
    return api.post(`/knowledge/${id}/favorite`);
  },

  /**
   * 标记/取消标记为薄弱点
   * @param id - 知识点 ID
   * @returns 返回标记状态
   */
  markWeakPoint: (id: string): Promise<ApiResponse<{ marked: boolean }>> => {
    return api.post(`/knowledge/${id}/weak-point`);
  },

  /**
   * 标记知识点为已完成
   * @param id - 知识点 ID
   * @returns 返回完成状态
   */
  complete: (id: string): Promise<ApiResponse<{ completed: boolean }>> => {
    return api.post(`/knowledge/${id}/complete`);
  },
};

// ============================================================
// 编程题 API
// ============================================================

/**
 * 编程题相关 API
 * 包含获取列表、详情、提交代码、收藏等功能
 */
export const problemApi = {
  /**
   * 获取编程题列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的编程题列表
   */
  getList: (params?: {
    page?: number;       // 页码
    limit?: number;      // 每页数量
    difficulty?: string; // 难度筛选
    category?: string;   // 分类筛选
    tag?: string;        // 标签筛选
    search?: string;     // 搜索关键词
    isFree?: boolean;    // 是否免费
  }): Promise<ApiResponse<PaginatedResponse<Problem>>> => {
    return api.get('/problems', { params });
  },

  /**
   * 获取编程题详情
   * @param id - 编程题 ID
   * @returns 返回编程题详细信息
   */
  getDetail: (id: string): Promise<ApiResponse<Problem>> => {
    return api.get(`/problems/${id}`);
  },

  /**
   * 提交代码
   * @param id - 编程题 ID
   * @param code - 提交的代码
   * @param language - 编程语言
   * @returns 返回评测结果
   */
  submit: (
    id: string,
    code: string,
    language: 'javascript' | 'typescript'
  ): Promise<
    ApiResponse<{
      status: string;        // 状态：accepted/wrong_answer/error 等
      passedCount: number;   // 通过的测试用例数
      totalCount: number;    // 总测试用例数
      testResults: any[];    // 详细测试结果
    }>
  > => {
    return api.post(`/problems/${id}/submit`, { code, language });
  },

  /**
   * 获取提交记录
   * @param id - 编程题 ID
   * @param params - 分页参数
   * @returns 返回分页的提交记录
   */
  getSubmissions: (
    id: string,
    params?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Submission>>> => {
    return api.get(`/problems/${id}/submissions`, { params });
  },

  /**
   * 收藏/取消收藏编程题
   * @param id - 编程题 ID
   * @returns 返回收藏状态
   */
  favorite: (id: string): Promise<ApiResponse<{ favorited: boolean }>> => {
    return api.post(`/problems/${id}/favorite`);
  },
};

// ============================================================
// 算法题 API
// ============================================================

/**
 * 算法题相关 API
 * 包含获取列表、详情、动画数据、提交代码、收藏等功能
 */
export const algorithmApi = {
  /**
   * 获取算法题列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的算法题列表
   */
  getList: (params?: {
    page?: number;     // 页码
    limit?: number;    // 每页数量
    category?: string; // 分类筛选
    tag?: string;      // 标签筛选
    search?: string;   // 搜索关键词
    isFree?: boolean;  // 是否免费
  }): Promise<ApiResponse<PaginatedResponse<Algorithm>>> => {
    return api.get('/algorithms', { params });
  },

  /**
   * 获取算法题详情
   * @param id - 算法题 ID
   * @returns 返回算法题详细信息
   */
  getDetail: (id: string): Promise<ApiResponse<Algorithm>> => {
    return api.get(`/algorithms/${id}`);
  },

  /**
   * 获取算法动画数据
   * @param id - 算法题 ID
   * @param inputData - 可选的自定义输入数据
   * @returns 返回动画类型、默认数据、步骤和解答
   */
  getAnimation: (
    id: string,
    inputData?: string
  ): Promise<
    ApiResponse<{
      type: string;       // 动画类型（array/tree/graph 等）
      defaultData: string; // 默认输入数据
      steps: any[];       // 动画步骤数组
      solution: any;      // 参考解答
    }>
  > => {
    return api.get(`/algorithms/${id}/animation`, {
      params: { inputData },
    });
  },

  /**
   * 提交算法代码
   * @param id - 算法题 ID
   * @param code - 提交的代码
   * @param language - 编程语言
   * @returns 返回评测结果
   */
  submit: (
    id: string,
    code: string,
    language: 'javascript' | 'typescript'
  ): Promise<
    ApiResponse<{
      status: string;       // 状态
      passedCount: number;  // 通过数
      totalCount: number;   // 总数
      testResults: any[];   // 详细结果
    }>
  > => {
    return api.post(`/algorithms/${id}/submit`, { code, language });
  },

  /**
   * 收藏/取消收藏算法题
   * @param id - 算法题 ID
   * @returns 返回收藏状态
   */
  favorite: (id: string): Promise<ApiResponse<{ favorited: boolean }>> => {
    return api.post(`/algorithms/${id}/favorite`);
  },
};

// ============================================================
// 用户代码 API
// ============================================================

/**
 * 用户代码相关 API
 * 包含获取列表、详情、保存、更新、删除、运行等功能
 */
export const userCodeApi = {
  /**
   * 获取用户代码项目列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的代码项目列表
   */
  getList: (params?: {
    page?: number;  // 页码
    limit?: number; // 每页数量
    type?: string;  // 类型筛选
  }): Promise<ApiResponse<PaginatedResponse<UserCode>>> => {
    return api.get('/user-codes', { params });
  },

  /**
   * 获取代码项目详情
   * @param id - 代码项目 ID
   * @returns 返回项目详细信息
   */
  getDetail: (id: string): Promise<ApiResponse<UserCode>> => {
    return api.get(`/user-codes/${id}`);
  },

  /**
   * 保存新的代码项目
   * @param data - 项目数据（项目名、描述、文件列表等）
   * @returns 返回保存后的项目信息
   */
  save: (data: {
    projectName: string;      // 项目名称
    description?: string;     // 项目描述
    files: {                  // 文件列表
      filename: string;       // 文件名
      content: string;        // 文件内容
      language: string;       // 文件语言
    }[];
    entryFile?: string;       // 入口文件
    type?: string;            // 项目类型
    relatedProblemId?: string;    // 关联的编程题 ID
    relatedAlgorithmId?: string;  // 关联的算法题 ID
  }): Promise<ApiResponse<UserCode>> => {
    return api.post('/user-codes', data);
  },

  /**
   * 更新代码项目
   * @param id - 项目 ID
   * @param data - 要更新的字段
   * @returns 返回更新后的项目信息
   */
  update: (
    id: string,
    data: {
      projectName?: string;  // 项目名称
      description?: string;  // 项目描述
      files?: {              // 文件列表
        filename: string;
        content: string;
        language: string;
      }[];
      entryFile?: string;    // 入口文件
    }
  ): Promise<ApiResponse<UserCode>> => {
    return api.put(`/user-codes/${id}`, data);
  },

  /**
   * 删除代码项目
   * @param id - 项目 ID
   */
  delete: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/user-codes/${id}`);
  },

  /**
   * 运行代码
   * @param code - 要执行的代码
   * @param language - 编程语言
   * @returns 返回执行结果（输出、执行时间、内存使用、错误信息）
   */
  run: (
    code: string,
    language: 'javascript' | 'typescript'
  ): Promise<
    ApiResponse<{
      output: string;        // 输出内容
      executionTime: number; // 执行时间（毫秒）
      memoryUsage: number;   // 内存使用（字节）
      error?: string;        // 错误信息
    }>
  > => {
    return api.post('/user-codes/run', { code, language });
  },
};

// ============================================================
// 学习管理 API
// ============================================================

/**
 * 学习管理相关 API
 * 包含学习进度、错题记录、学习统计、学习计划等功能
 */
export const learningApi = {
  /**
   * 获取学习进度报告
   * @returns 返回总览、分类进度、学习计划、最近活动
   */
  getProgress: (): Promise<
    ApiResponse<{
      overview: {  // 总览数据
        knowledge: { completed: number; total: number; percentage: string };  // 知识点进度
        problems: { completed: number; total: number; percentage: string };   // 编程题进度
        algorithms: { completed: number; total: number; percentage: string }; // 算法题进度
      };
      categoryProgress: any[];  // 分类进度
      studyPlan: any;          // 学习计划
      recentActivity: any;     // 最近活动
    }>
  > => {
    return api.get('/learning/progress');
  },

  /**
   * 获取错题记录列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的错题记录
   */
  getWrongRecords: (params?: {
    page?: number;       // 页码
    limit?: number;      // 每页数量
    type?: string;       // 类型筛选
    isResolved?: boolean; // 是否已解决
  }): Promise<ApiResponse<PaginatedResponse<WrongRecord>>> => {
    return api.get('/learning/wrong-records', { params });
  },

  /**
   * 获取错题记录详情
   * @param id - 错题记录 ID
   * @returns 返回详细信息
   */
  getWrongRecordDetail: (id: string): Promise<ApiResponse<WrongRecord>> => {
    return api.get(`/learning/wrong-records/${id}`);
  },

  /**
   * 解决错题记录
   * @param id - 错题记录 ID
   * @returns 返回更新后的记录
   */
  resolveWrongRecord: (
    id: string
  ): Promise<ApiResponse<WrongRecord>> => {
    return api.put(`/learning/wrong-records/${id}/resolve`);
  },

  /**
   * 复习错题记录
   * @param id - 错题记录 ID
   * @param notes - 复习笔记
   * @returns 返回更新后的记录
   */
  reviewWrongRecord: (
    id: string,
    notes?: string
  ): Promise<ApiResponse<WrongRecord>> => {
    return api.put(`/learning/wrong-records/${id}/review`, { notes });
  },

  /**
   * 获取学习统计数据
   * @returns 返回提交统计、错题统计、提交趋势、难度分布
   */
  getStats: (): Promise<
    ApiResponse<{
      submissions: any;          // 提交统计
      wrongRecords: any;         // 错题统计
      submissionTrend: any[];    // 提交趋势
      problemsByDifficulty: any[]; // 难度分布
    }>
  > => {
    return api.get('/learning/stats');
  },

  /**
   * 生成学习计划
   * @param data - 目标日期和目标等级
   * @returns 返回生成的学习计划
   */
  generatePlan: (data: {
    targetDate: string;   // 目标完成日期
    targetLevel: string;  // 目标等级
  }): Promise<
    ApiResponse<{
      studyPlan: any;       // 学习计划
      currentStatus: any;   // 当前状态
      daysRemaining: number; // 剩余天数
    }>
  > => {
    return api.post('/learning/generate-plan', data);
  },

  /**
   * 获取今日任务
   * @returns 返回今日任务列表和进度
   */
  getDailyTasks: (): Promise<
    ApiResponse<{
      tasks: string[];      // 任务列表
      todayProgress: any;   // 今日进度
      targetDate: string;   // 目标日期
      targetLevel: string;  // 目标等级
    }>
  > => {
    return api.get('/learning/daily-tasks');
  },
};

// ============================================================
// 管理员 API
// ============================================================

/**
 * 管理员相关 API
 * 包含用户管理、内容管理、数据统计、代码审核等功能
 */
export const adminApi = {
  // -------------------- 用户管理 --------------------

  /**
   * 获取用户列表
   * @param params - 筛选、分页和排序参数
   * @returns 返回分页的用户列表
   */
  getUsers: (params?: {
    page?: number;        // 页码
    limit?: number;       // 每页数量
    role?: string;        // 角色筛选
    search?: string;      // 搜索关键词
    isActive?: boolean;   // 是否激活
    sortBy?: string;      // 排序字段
    sortOrder?: 'asc' | 'desc'; // 排序方向
  }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return api.get('/admin/users', { params });
  },

  /**
   * 获取用户详情
   * @param id - 用户 ID
   * @returns 返回用户信息和统计数据
   */
  getUserDetail: (
    id: string
  ): Promise<ApiResponse<{ user: User; stats: any }>> => {
    return api.get(`/admin/users/${id}`);
  },

  /**
   * 更新用户角色
   * @param id - 用户 ID
   * @param role - 新角色
   * @param memberExpireAt - 会员过期时间（可选）
   * @returns 返回更新结果
   */
  updateUserRole: (
    id: string,
    role: string,
    memberExpireAt?: string
  ): Promise<ApiResponse<any>> => {
    return api.put(`/admin/users/${id}/role`, { role, memberExpireAt });
  },

  /**
   * 重置用户密码
   * @param id - 用户 ID
   * @param newPassword - 新密码
   */
  resetUserPassword: (
    id: string,
    newPassword: string
  ): Promise<ApiResponse<void>> => {
    return api.put(`/admin/users/${id}/reset-password`, { newPassword });
  },

  /**
   * 更新用户状态（启用/禁用）
   * @param id - 用户 ID
   * @param isActive - 是否激活
   * @returns 返回更新结果
   */
  updateUserStatus: (
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<any>> => {
    return api.put(`/admin/users/${id}/status`, { isActive });
  },

  /**
   * 删除用户
   * @param id - 用户 ID
   */
  deleteUser: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/users/${id}`);
  },

  // -------------------- 内容管理 --------------------

  /**
   * 创建知识点
   * @param data - 知识点数据
   * @returns 返回创建的知识点
   */
  createKnowledge: (data: any): Promise<ApiResponse<Knowledge>> => {
    return api.post('/admin/knowledge', data);
  },

  /**
   * 更新知识点
   * @param id - 知识点 ID
   * @param data - 要更新的数据
   * @returns 返回更新后的知识点
   */
  updateKnowledge: (id: string, data: any): Promise<ApiResponse<Knowledge>> => {
    return api.put(`/admin/knowledge/${id}`, data);
  },

  /**
   * 删除知识点
   * @param id - 知识点 ID
   */
  deleteKnowledge: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/knowledge/${id}`);
  },

  /**
   * 批量导入知识点
   * @param items - 知识点数组
   * @returns 返回导入数量
   */
  batchImportKnowledge: (
    items: any[]
  ): Promise<ApiResponse<{ imported: number; total: number }>> => {
    return api.post('/admin/knowledge/batch-import', { items });
  },

  /**
   * 创建编程题
   * @param data - 编程题数据
   * @returns 返回创建的编程题
   */
  createProblem: (data: any): Promise<ApiResponse<Problem>> => {
    return api.post('/admin/problems', data);
  },

  /**
   * 更新编程题
   * @param id - 编程题 ID
   * @param data - 要更新的数据
   * @returns 返回更新后的编程题
   */
  updateProblem: (id: string, data: any): Promise<ApiResponse<Problem>> => {
    return api.put(`/admin/problems/${id}`, data);
  },

  /**
   * 删除编程题
   * @param id - 编程题 ID
   */
  deleteProblem: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/problems/${id}`);
  },

  /**
   * 创建算法题
   * @param data - 算法题数据
   * @returns 返回创建的算法题
   */
  createAlgorithm: (data: any): Promise<ApiResponse<Algorithm>> => {
    return api.post('/admin/algorithms', data);
  },

  /**
   * 更新算法题
   * @param id - 算法题 ID
   * @param data - 要更新的数据
   * @returns 返回更新后的算法题
   */
  updateAlgorithm: (id: string, data: any): Promise<ApiResponse<Algorithm>> => {
    return api.put(`/admin/algorithms/${id}`, data);
  },

  /**
   * 删除算法题
   * @param id - 算法题 ID
   */
  deleteAlgorithm: (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/admin/algorithms/${id}`);
  },

  // -------------------- 数据统计 --------------------

  /**
   * 获取平台统计数据
   * @returns 返回总览、注册趋势、热门内容
   */
  getStats: (): Promise<
    ApiResponse<{
      overview: any;           // 数据总览
      registrationTrend: any[]; // 注册趋势
      hotKnowledge: any[];     // 热门知识点
      hotProblems: any[];      // 热门编程题
    }>
  > => {
    return api.get('/admin/stats');
  },

  // -------------------- 代码审核 --------------------

  /**
   * 获取待审核代码列表
   * @param params - 筛选和分页参数
   * @returns 返回分页的代码列表
   */
  getPendingCodes: (params?: {
    page?: number;   // 页码
    limit?: number;  // 每页数量
    status?: string; // 状态筛选
  }): Promise<ApiResponse<PaginatedResponse<UserCode>>> => {
    return api.get('/admin/user-codes', { params });
  },

  /**
   * 审核用户代码
   * @param id - 代码 ID
   * @param status - 审核状态（approved/rejected）
   * @param note - 审核备注
   * @returns 返回更新后的代码信息
   */
  auditUserCode: (
    id: string,
    status: 'approved' | 'rejected',
    note?: string
  ): Promise<ApiResponse<UserCode>> => {
    return api.put(`/admin/user-codes/${id}/audit`, { status, note });
  },
};

// 导出 axios 实例，供其他地方直接使用
export default api;
