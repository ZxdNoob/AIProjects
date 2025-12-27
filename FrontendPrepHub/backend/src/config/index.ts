/**
 * @file 应用配置文件
 * @description 集中管理所有应用配置，包括服务器、数据库、JWT、权限等配置
 * @author FrontendPrepHub Team
 */

// 导入 dotenv 用于加载环境变量文件
import dotenv from 'dotenv';
// 导入 path 用于处理文件路径
import path from 'path';

/**
 * 加载环境变量
 * @description 从项目根目录的 .env 文件中读取环境变量
 * __dirname 是当前文件所在目录，向上两级到达项目根目录
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * 应用配置对象
 * @description 从环境变量中读取配置，并提供默认值
 * @const
 */
export const config = {
  // ==================== 服务器配置 ====================
  /**
   * 服务器监听端口
   * @default 3001
   */
  port: parseInt(process.env.PORT || '3001', 10),
  
  /**
   * 运行环境
   * @description 'development' | 'production' | 'test'
   * @default 'development'
   */
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // ==================== MongoDB 配置 ====================
  /**
   * MongoDB 连接 URI
   * @description 数据库连接字符串，格式：mongodb://host:port/database
   * @default 'mongodb://localhost:27017/frontend_prep_hub'
   */
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/frontend_prep_hub',
  
  // ==================== JWT 配置 ====================
  /**
   * JWT（JSON Web Token）配置
   * @description 用于用户认证的 Token 配置
   */
  jwt: {
    /**
     * JWT 签名密钥
     * @description 用于对 Token 进行签名和验证，生产环境必须使用强密钥
     * @warning 生产环境切勿使用默认值！
     */
    secret: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    
    /**
     * Token 过期时间
     * @description 支持格式：'7d'（7天）、'24h'（24小时）、'60m'（60分钟）
     * @default '7d'
     */
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // ==================== 文件上传配置 ====================
  /**
   * 文件上传配置
   */
  upload: {
    /**
     * 上传文件存储目录
     * @default './uploads'
     */
    dir: process.env.UPLOAD_DIR || './uploads',
    
    /**
     * 单个文件最大大小（字节）
     * @default 10485760 (10MB)
     */
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
  
  // ==================== CORS 配置 ====================
  /**
   * 跨域资源共享配置
   */
  cors: {
    /**
     * 允许访问的前端源地址
     * @description 开发环境默认为 Vite 的默认端口
     * @default 'http://localhost:5173'
     */
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    
    /**
     * 是否允许携带凭证（Cookie）
     * @default true
     */
    credentials: true,
  },
  
  // ==================== 管理员初始账号配置 ====================
  /**
   * 初始管理员账号
   * @description 用于数据库初始化时创建的超级管理员账号
   */
  admin: {
    /**
     * 管理员邮箱
     * @default 'admin@frontendprephub.com'
     */
    email: process.env.ADMIN_EMAIL || 'admin@frontendprephub.com',
    
    /**
     * 管理员密码
     * @warning 生产环境必须修改默认密码！
     * @default 'Admin@123456'
     */
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
  },
} as const; // as const 使配置对象成为只读类型

/**
 * 用户角色枚举
 * @description 定义系统中的用户角色类型
 * @enum {string}
 */
export enum UserRole {
  /** 普通用户 - 免费用户，有访问限制 */
  USER = 'user',
  
  /** 会员用户 - 付费用户，可访问全部内容 */
  MEMBER = 'member',
  
  /** 超级管理员 - 拥有系统所有权限 */
  ADMIN = 'admin',
}

/**
 * 角色权限映射表
 * @description 定义每个角色可以访问的资源和功能
 * @const
 */
export const RolePermissions = {
  /**
   * 普通用户权限
   * @description 免费用户的访问限制
   */
  [UserRole.USER]: {
    /** 可访问的知识点层级 */
    knowledge: ['basic', 'intermediate_basic'],
    /** 编程题访问限制：免费15道 */
    codingProblems: { free: 15, total: 15 },
    /** 算法题访问限制：免费10道 */
    algorithms: { free: 10, total: 10 },
    /** 可用功能列表 */
    features: ['basic_preview', 'basic_debug'],
  },
  
  /**
   * 会员用户权限
   * @description 付费会员可访问全部内容
   */
  [UserRole.MEMBER]: {
    /** 可访问全部知识点层级 */
    knowledge: ['basic', 'intermediate', 'advanced'],
    /** 编程题访问限制：全部50道 */
    codingProblems: { free: 50, total: 50 },
    /** 算法题访问限制：全部30道 */
    algorithms: { free: 30, total: 30 },
    /** 可用功能列表：完整功能 */
    features: ['full_preview', 'full_debug', 'download', 'backup'],
  },
  
  /**
   * 管理员权限
   * @description 拥有系统全部权限
   */
  [UserRole.ADMIN]: {
    /** 访问所有知识点 */
    knowledge: ['all'],
    /** 无限制访问编程题 */
    codingProblems: { free: Infinity, total: Infinity },
    /** 无限制访问算法题 */
    algorithms: { free: Infinity, total: Infinity },
    /** 可用功能列表：全部功能 */
    features: ['all'],
  },
} as const;

/**
 * 知识点层级枚举
 * @description 定义知识点的难度层级
 * @enum {string}
 */
export enum KnowledgeLevel {
  /** 基础层 - 所有用户可访问 */
  BASIC = 'basic',
  
  /** 进阶层 - 普通用户可访问基础内容，会员可访问完整解析 */
  INTERMEDIATE = 'intermediate',
  
  /** 原理层 - 仅会员和管理员可访问 */
  ADVANCED = 'advanced',
}

/**
 * 编程题难度枚举
 * @description 定义编程题的难度等级
 * @enum {string}
 */
export enum ProblemDifficulty {
  /** 基础题 - 普通用户免费（15道） */
  EASY = 'easy',
  
  /** 进阶题 - 会员专属（20道） */
  MEDIUM = 'medium',
  
  /** 原理题 - 会员专属（15道） */
  HARD = 'hard',
}

/**
 * 算法题分类枚举
 * @description 定义算法题的难度分类
 * @enum {string}
 */
export enum AlgorithmCategory {
  /** 基础算法 - 普通用户免费（10道） */
  BASIC = 'basic',
  
  /** 进阶算法 - 会员专属（10道） */
  INTERMEDIATE = 'intermediate',
  
  /** 高级算法 - 会员专属（10道） */
  ADVANCED = 'advanced',
}

// 默认导出配置对象
export default config;
