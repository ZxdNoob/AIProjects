/**
 * @file 错题记录数据模型
 * @description 定义用户错题记录的 Mongoose Schema 和接口，用于错题本功能
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';

/**
 * 错题记录文档接口
 * @interface IWrongRecord
 * @extends Document
 * @description 定义错题记录文档的完整结构
 */
export interface IWrongRecord extends Document {
  /** 记录唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 用户 ID */
  userId: mongoose.Types.ObjectId;

  // ==================== 关联题目 ====================
  
  /** 关联的编程题 ID（与 algorithmId 二选一） */
  problemId?: mongoose.Types.ObjectId;
  
  /** 关联的算法题 ID（与 problemId 二选一） */
  algorithmId?: mongoose.Types.ObjectId;
  
  /** 题目类型：编程题或算法题 */
  type: 'problem' | 'algorithm';

  // ==================== 错误信息 ====================
  
  /** 错误次数（累计） */
  wrongCount: number;
  
  /** 最后一次错误时间 */
  lastWrongAt: Date;
  
  /** 最后一次错误的代码 */
  lastWrongCode: string;
  
  /** 错误原因分析（可选，用户填写或系统生成） */
  lastWrongReason?: string;

  // ==================== 状态 ====================
  
  /** 是否已解决（用户标记） */
  isResolved: boolean;
  
  /** 解决时间 */
  resolvedAt?: Date;
  
  /** 复习次数 */
  reviewCount: number;
  
  /** 最后复习时间 */
  lastReviewAt?: Date;

  // ==================== 笔记 ====================
  
  /** 用户笔记（可选） */
  notes?: string;

  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 错题记录 Schema 定义
 * @description 定义错题记录集合的文档结构和验证规则
 */
const wrongRecordSchema = new Schema<IWrongRecord>(
  {
    /**
     * 用户 ID
     * @description 关联到 User 集合，必填
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    /**
     * 编程题 ID
     * @description 可选，与 algorithmId 互斥
     */
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
    },
    
    /**
     * 算法题 ID
     * @description 可选，与 problemId 互斥
     */
    algorithmId: {
      type: Schema.Types.ObjectId,
      ref: 'Algorithm',
    },
    
    /**
     * 题目类型
     */
    type: {
      type: String,
      enum: ['problem', 'algorithm'],
      required: true,
    },
    
    /**
     * 错误次数
     * @description 每次答错累加，用于统计薄弱项
     */
    wrongCount: {
      type: Number,
      default: 1,
    },
    
    /**
     * 最后错误时间
     */
    lastWrongAt: {
      type: Date,
      default: Date.now,
    },
    
    /**
     * 最后错误代码
     * @description 保存最近一次错误的代码，方便回顾
     */
    lastWrongCode: {
      type: String,
      default: '',
    },
    
    /**
     * 错误原因
     * @description 可以是用户自己的分析或系统生成
     */
    lastWrongReason: {
      type: String,
    },
    
    /**
     * 解决状态
     * @description 用户标记该题已掌握
     */
    isResolved: {
      type: Boolean,
      default: false,
    },
    
    /**
     * 解决时间
     */
    resolvedAt: {
      type: Date,
    },
    
    /**
     * 复习次数
     * @description 用于实现间隔复习功能
     */
    reviewCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 最后复习时间
     */
    lastReviewAt: {
      type: Date,
    },
    
    /**
     * 用户笔记
     * @description 用户可以添加学习笔记
     */
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,  // 自动管理创建和更新时间
  }
);

/**
 * ==================== 索引定义 ====================
 */

/**
 * 用户-编程题复合唯一索引
 * @description 确保每个用户对每道编程题只有一条错题记录
 * sparse: true 表示只为非空值创建索引
 */
wrongRecordSchema.index({ userId: 1, problemId: 1 }, { unique: true, sparse: true });

/**
 * 用户-算法题复合唯一索引
 * @description 确保每个用户对每道算法题只有一条错题记录
 */
wrongRecordSchema.index({ userId: 1, algorithmId: 1 }, { unique: true, sparse: true });

/**
 * 用户-解决状态复合索引
 * @description 用于查询用户的未解决/已解决错题
 */
wrongRecordSchema.index({ userId: 1, isResolved: 1 });

/**
 * 用户-类型复合索引
 * @description 用于按类型筛选用户的错题
 */
wrongRecordSchema.index({ userId: 1, type: 1 });

/**
 * 导出 WrongRecord 模型
 */
export const WrongRecord = mongoose.model<IWrongRecord>('WrongRecord', wrongRecordSchema);

// 默认导出
export default WrongRecord;
