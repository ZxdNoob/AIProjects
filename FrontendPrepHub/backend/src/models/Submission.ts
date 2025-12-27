/**
 * @file 提交记录数据模型
 * @description 定义用户代码提交记录的 Mongoose Schema 和接口
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';

/**
 * 提交记录文档接口
 * @interface ISubmission
 * @extends Document
 * @description 定义提交记录文档的完整结构
 */
export interface ISubmission extends Document {
  /** 提交记录唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 提交用户 ID */
  userId: mongoose.Types.ObjectId;

  // ==================== 关联题目 ====================
  
  /** 关联的编程题 ID（与 algorithmId 二选一） */
  problemId?: mongoose.Types.ObjectId;
  
  /** 关联的算法题 ID（与 problemId 二选一） */
  algorithmId?: mongoose.Types.ObjectId;
  
  /** 提交类型：编程题或算法题 */
  type: 'problem' | 'algorithm';

  // ==================== 提交内容 ====================
  
  /** 用户提交的代码 */
  code: string;
  
  /** 编程语言 */
  language: 'javascript' | 'typescript';

  // ==================== 执行结果 ====================
  
  /**
   * 提交状态
   * @description 表示代码执行的最终状态
   * - pending: 等待执行
   * - running: 正在执行
   * - accepted: 通过
   * - wrong_answer: 答案错误
   * - runtime_error: 运行时错误
   * - timeout: 执行超时
   */
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'runtime_error' | 'timeout';
  
  /**
   * 测试结果数组
   * @description 每个测试用例的执行结果
   */
  testResults: {
    /** 测试用例索引 */
    testCaseIndex: number;
    /** 是否通过 */
    passed: boolean;
    /** 输入值 */
    input: string;
    /** 期望输出 */
    expectedOutput: string;
    /** 实际输出 */
    actualOutput: string;
    /** 执行时间（毫秒） */
    executionTime?: number;
    /** 错误信息（如果有） */
    error?: string;
  }[];

  /** 通过的测试用例数量 */
  passedCount: number;
  
  /** 总测试用例数量 */
  totalCount: number;
  
  /** 总执行时间（毫秒） */
  executionTime: number;

  /** 创建时间（提交时间） */
  createdAt: Date;
}

/**
 * 提交记录 Schema 定义
 * @description 定义提交记录集合的文档结构
 */
const submissionSchema = new Schema<ISubmission>(
  {
    /**
     * 用户 ID
     * @description 关联到 User 集合
     */
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',                            // 引用 User 模型
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
     * 提交类型
     */
    type: {
      type: String,
      enum: ['problem', 'algorithm'],         // 枚举验证
      required: true,
    },
    
    /**
     * 用户代码
     * @description 存储用户提交的完整代码
     */
    code: {
      type: String,
      required: true,
    },
    
    /**
     * 编程语言
     */
    language: {
      type: String,
      enum: ['javascript', 'typescript'],
      default: 'javascript',
    },
    
    /**
     * 提交状态
     */
    status: {
      type: String,
      enum: ['pending', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'timeout'],
      default: 'pending',
    },
    
    /**
     * 测试结果数组
     * @description 嵌套文档数组，记录每个测试用例的结果
     */
    testResults: [{
      testCaseIndex: { type: Number, required: true },  // 索引，必填
      passed: { type: Boolean, required: true },        // 是否通过，必填
      input: String,                                     // 输入
      expectedOutput: String,                            // 期望输出
      actualOutput: String,                              // 实际输出
      executionTime: Number,                             // 执行时间
      error: String,                                     // 错误信息
    }],
    
    /**
     * 通过的测试用例数
     */
    passedCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 总测试用例数
     */
    totalCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 总执行时间
     */
    executionTime: {
      type: Number,
      default: 0,
    },
  },
  {
    /**
     * Schema 选项
     * @description 只需要创建时间，不需要更新时间
     */
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/**
 * ==================== 索引定义 ====================
 */

/**
 * 用户提交记录索引
 * @description 复合索引，用于查询用户的提交历史（按时间倒序）
 */
submissionSchema.index({ userId: 1, createdAt: -1 });

// 编程题索引
submissionSchema.index({ problemId: 1 });

// 算法题索引
submissionSchema.index({ algorithmId: 1 });

// 状态索引
submissionSchema.index({ status: 1 });

/**
 * 导出 Submission 模型
 */
export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

// 默认导出
export default Submission;
