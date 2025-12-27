/**
 * @file 编程题数据模型
 * @description 定义编程题的 Mongoose Schema 和接口，包括题目内容、测试用例、解答等
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';
// 导入编程题难度枚举
import { ProblemDifficulty } from '../config';

/**
 * 测试用例接口
 * @interface ITestCase
 * @description 定义单个测试用例的结构
 */
export interface ITestCase {
  /** 输入参数（JSON 字符串格式） */
  input: string;
  
  /** 期望输出（JSON 字符串格式） */
  expectedOutput: string;
  
  /** 测试用例描述（可选） */
  description?: string;
  
  /** 是否为隐藏测试用例（用于防止作弊） */
  isHidden?: boolean;
}

/**
 * 编程题文档接口
 * @interface IProblem
 * @extends Document
 * @description 定义编程题文档的完整结构
 */
export interface IProblem extends Document {
  /** 编程题唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 题目标题 */
  title: string;
  
  /** 难度等级（easy/medium/hard） */
  difficulty: ProblemDifficulty;
  
  /** 题目分类（如：数组操作、Promise/异步） */
  category: string;
  
  /** 标签数组 */
  tags: string[];

  // ==================== 题目内容 ====================
  
  /** 题目描述（Markdown 格式） */
  description: string;
  
  /**
   * 示例数组
   * @description 展示给用户的输入输出示例
   */
  examples: {
    /** 示例输入 */
    input: string;
    /** 示例输出 */
    output: string;
    /** 示例解释（可选） */
    explanation?: string;
  }[];
  
  /** 约束条件数组 */
  constraints: string[];
  
  /** 提示信息数组 */
  hints: string[];

  // ==================== 代码模板 ====================
  
  /**
   * 代码模板
   * @description 为用户提供的初始代码框架
   */
  codeTemplate: {
    /** JavaScript 代码模板 */
    javascript: string;
    /** TypeScript 代码模板 */
    typescript: string;
  };

  // ==================== 测试用例 ====================
  
  /** 测试用例数组 */
  testCases: ITestCase[];

  // ==================== 解答 ====================
  
  /**
   * 标准解答
   * @description 包含代码、解释和复杂度分析
   */
  solution: {
    /** 解答代码 */
    code: string;
    /** 解题思路说明 */
    explanation: string;
    /** 时间复杂度 */
    timeComplexity: string;
    /** 空间复杂度 */
    spaceComplexity: string;
  };

  /** 关联知识点 ID 列表 */
  relatedKnowledge: mongoose.Types.ObjectId[];

  // ==================== 统计数据 ====================
  
  /** 提交总次数 */
  submitCount: number;
  
  /** 通过次数 */
  acceptCount: number;

  // ==================== 权限控制 ====================
  
  /** 是否免费（true: 普通用户可访问） */
  isFree: boolean;
  
  /** 排序权重 */
  order: number;
  
  /** 是否发布 */
  isPublished: boolean;

  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 编程题 Schema 定义
 * @description 定义编程题集合的文档结构和验证规则
 */
const problemSchema = new Schema<IProblem>(
  {
    /**
     * 题目标题
     */
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    
    /**
     * 难度等级
     */
    difficulty: {
      type: String,
      enum: Object.values(ProblemDifficulty),  // 枚举验证
      required: true,
    },
    
    /**
     * 题目分类
     * @description 使用预定义的分类列表
     */
    category: {
      type: String,
      required: [true, '分类不能为空'],
      trim: true,
      enum: [
        '数组操作',           // 数组相关算法和操作
        '字符串处理',          // 字符串操作和正则
        '对象操作',           // 对象深拷贝、合并等
        'Promise/异步',      // Promise、async/await
        'DOM操作',           // DOM 操作和事件
        '函数实现',           // 函数柯里化、节流防抖等
        '类与继承',           // 原型链、继承模式
        '设计模式',           // 常见设计模式实现
        '性能优化',           // 性能相关问题
        '其他',               // 其他类型
      ],
    },
    
    /**
     * 标签数组
     */
    tags: [{
      type: String,
      trim: true,
    }],
    
    /**
     * 题目描述
     * @description 使用 Markdown 格式描述题目要求
     */
    description: {
      type: String,
      required: [true, '题目描述不能为空'],
    },
    
    /**
     * 示例数组
     * @description 嵌套文档，包含输入输出示例
     */
    examples: [{
      input: { type: String, required: true },      // 输入，必填
      output: { type: String, required: true },     // 输出，必填
      explanation: String,                           // 解释，选填
    }],
    
    /**
     * 约束条件
     * @description 如时间限制、参数范围等
     */
    constraints: [{
      type: String,
    }],
    
    /**
     * 提示信息
     * @description 帮助用户解题的提示
     */
    hints: [{
      type: String,
    }],
    
    /**
     * 代码模板
     * @description 提供 JS 和 TS 两种语言的初始代码
     */
    codeTemplate: {
      javascript: {
        type: String,
        default: '// 请在此处编写代码\nfunction solution() {\n  \n}\n',
      },
      typescript: {
        type: String,
        default: '// 请在此处编写代码\nfunction solution(): void {\n  \n}\n',
      },
    },
    
    /**
     * 测试用例数组
     * @description 包含公开和隐藏的测试用例
     */
    testCases: [{
      input: { type: String, required: true },           // 输入参数
      expectedOutput: { type: String, required: true },  // 期望输出
      description: String,                                // 用例描述
      isHidden: { type: Boolean, default: false },       // 是否隐藏
    }],
    
    /**
     * 标准解答嵌套文档
     */
    solution: {
      code: { type: String, default: '' },              // 解答代码
      explanation: { type: String, default: '' },       // 解题思路
      timeComplexity: { type: String, default: '' },    // 时间复杂度，如 O(n)
      spaceComplexity: { type: String, default: '' },   // 空间复杂度，如 O(1)
    },
    
    /**
     * 关联知识点
     */
    relatedKnowledge: [{
      type: Schema.Types.ObjectId,
      ref: 'Knowledge',
    }],
    
    /**
     * 提交次数统计
     */
    submitCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 通过次数统计
     */
    acceptCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 免费标志
     * @description true 表示普通用户可以访问
     */
    isFree: {
      type: Boolean,
      default: false,
    },
    
    /**
     * 排序权重
     */
    order: {
      type: Number,
      default: 0,
    },
    
    /**
     * 发布状态
     */
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,                                    // 自动管理时间戳
  }
);

/**
 * ==================== 索引定义 ====================
 */

// 难度索引
problemSchema.index({ difficulty: 1 });

// 分类索引
problemSchema.index({ category: 1 });

// 标签索引
problemSchema.index({ tags: 1 });

// 免费标志索引
problemSchema.index({ isFree: 1 });

// 发布状态索引
problemSchema.index({ isPublished: 1 });

// 排序权重索引
problemSchema.index({ order: 1 });

/**
 * 全文索引
 * @description 支持标题和描述的全文搜索
 */
problemSchema.index({ title: 'text', description: 'text' });

/**
 * 虚拟字段 - 通过率
 * @description 计算题目的通过率百分比
 * 虚拟字段不会存储在数据库中，而是在查询时动态计算
 */
problemSchema.virtual('acceptRate').get(function () {
  // 如果没有提交记录，返回 0
  if (this.submitCount === 0) return 0;
  // 计算通过率并保留一位小数
  return ((this.acceptCount / this.submitCount) * 100).toFixed(1);
});

/**
 * 导出 Problem 模型
 */
export const Problem = mongoose.model<IProblem>('Problem', problemSchema);

// 默认导出
export default Problem;
