/**
 * @file 用户代码保存数据模型
 * @description 定义用户保存的代码项目的 Mongoose Schema 和接口
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';

/**
 * 代码文件接口
 * @interface ICodeFile
 * @description 定义单个代码文件的结构
 */
export interface ICodeFile {
  /** 文件名（如：index.js、style.css） */
  filename: string;
  
  /** 文件内容 */
  content: string;
  
  /** 编程语言（如：javascript、css、html） */
  language: string;
}

/**
 * 用户代码保存文档接口
 * @interface IUserCode
 * @extends Document
 * @description 定义用户代码项目文档的完整结构
 */
export interface IUserCode extends Document {
  /** 记录唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 用户 ID */
  userId: mongoose.Types.ObjectId;

  // ==================== 项目信息 ====================
  
  /** 项目名称 */
  projectName: string;
  
  /** 项目描述（可选） */
  description?: string;

  // ==================== 代码文件 ====================
  
  /** 代码文件数组（支持多文件项目） */
  files: ICodeFile[];
  
  /** 主入口文件名 */
  entryFile: string;

  // ==================== 类型和关联 ====================
  
  /**
   * 项目类型
   * - custom: 自定义项目（在线 IDE 创建）
   * - problem: 编程题解答
   * - algorithm: 算法题解答
   */
  type: 'custom' | 'problem' | 'algorithm';
  
  /** 关联的编程题 ID（可选） */
  relatedProblemId?: mongoose.Types.ObjectId;
  
  /** 关联的算法题 ID（可选） */
  relatedAlgorithmId?: mongoose.Types.ObjectId;

  // ==================== 审核状态 ====================
  
  /**
   * 审核状态
   * - pending: 待审核
   * - approved: 已通过
   * - rejected: 已拒绝
   */
  auditStatus: 'pending' | 'approved' | 'rejected';
  
  /** 审核备注（管理员填写） */
  auditNote?: string;

  // ==================== 可见性 ====================
  
  /** 是否公开（其他用户可见） */
  isPublic: boolean;

  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 用户代码保存 Schema 定义
 * @description 定义用户代码集合的文档结构和验证规则
 */
const userCodeSchema = new Schema<IUserCode>(
  {
    /**
     * 用户 ID
     * @description 关联到 User 集合
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    /**
     * 项目名称
     */
    projectName: {
      type: String,
      required: [true, '项目名称不能为空'],
      trim: true,
      maxlength: [50, '项目名称最多50个字符'],
    },
    
    /**
     * 项目描述
     */
    description: {
      type: String,
      maxlength: [500, '描述最多500个字符'],
    },
    
    /**
     * 代码文件数组
     * @description 嵌套文档数组，每个元素代表一个文件
     */
    files: [{
      /**
       * 文件名
       */
      filename: {
        type: String,
        required: true,
      },
      
      /**
       * 文件内容
       */
      content: {
        type: String,
        required: true,
      },
      
      /**
       * 编程语言
       */
      language: {
        type: String,
        default: 'javascript',
      },
    }],
    
    /**
     * 入口文件
     * @description 项目的主入口文件名
     */
    entryFile: {
      type: String,
      default: 'index.js',
    },
    
    /**
     * 项目类型
     */
    type: {
      type: String,
      enum: ['custom', 'problem', 'algorithm'],
      default: 'custom',
    },
    
    /**
     * 关联编程题 ID
     */
    relatedProblemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
    },
    
    /**
     * 关联算法题 ID
     */
    relatedAlgorithmId: {
      type: Schema.Types.ObjectId,
      ref: 'Algorithm',
    },
    
    /**
     * 审核状态
     * @description 默认通过，管理员可后台审核
     */
    auditStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    
    /**
     * 审核备注
     */
    auditNote: {
      type: String,
    },
    
    /**
     * 公开状态
     * @description 公开的代码可被其他用户查看
     */
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,  // 自动管理时间戳
  }
);

/**
 * ==================== 索引定义 ====================
 */

/**
 * 用户代码列表索引
 * @description 复合索引，用于查询用户的代码列表（按时间倒序）
 */
userCodeSchema.index({ userId: 1, createdAt: -1 });

// 类型索引
userCodeSchema.index({ type: 1 });

// 审核状态索引
userCodeSchema.index({ auditStatus: 1 });

// 公开状态索引
userCodeSchema.index({ isPublic: 1 });

/**
 * 导出 UserCode 模型
 */
export const UserCode = mongoose.model<IUserCode>('UserCode', userCodeSchema);

// 默认导出
export default UserCode;
