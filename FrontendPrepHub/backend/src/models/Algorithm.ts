/**
 * @file 算法题数据模型
 * @description 定义算法题的 Mongoose Schema 和接口，包括算法内容、动画配置、测试用例等
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';
// 导入算法分类枚举
import { AlgorithmCategory } from '../config';

/**
 * 算法动画步骤接口
 * @interface IAnimationStep
 * @description 定义动画演示中每一步的结构
 */
export interface IAnimationStep {
  /** 步骤序号（从 1 开始） */
  stepNumber: number;
  
  /** 步骤描述文本 */
  description: string;
  
  /**
   * 代码高亮范围
   * @description 指示当前步骤对应的代码行
   */
  codeHighlight: {
    /** 起始行号 */
    startLine: number;
    /** 结束行号 */
    endLine: number;
  };
  
  /** 数据状态（JSON 字符串格式） */
  dataState: string;
  
  /** 当前步骤的时间复杂度说明（可选） */
  timeComplexity?: string;
}

/**
 * 算法题文档接口
 * @interface IAlgorithm
 * @extends Document
 * @description 定义算法题文档的完整结构
 */
export interface IAlgorithm extends Document {
  /** 算法题唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 算法标题 */
  title: string;
  
  /** 算法分类（basic/intermediate/advanced） */
  category: AlgorithmCategory;
  
  /** 标签数组 */
  tags: string[];

  // ==================== 算法内容 ====================
  
  /** 算法描述（Markdown 格式） */
  description: string;

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

  // ==================== 标准解法 ====================
  
  /**
   * 标准解答
   * @description 包含完整代码、解释和复杂度分析
   */
  solution: {
    /** 解答代码 */
    code: string;
    /** 算法思路说明 */
    explanation: string;
    /** 时间复杂度 */
    timeComplexity: string;
    /** 空间复杂度 */
    spaceComplexity: string;
  };

  // ==================== 动画配置 ====================
  
  /**
   * 动画配置
   * @description 用于可视化展示算法执行过程
   */
  animation: {
    /** 可视化类型：数组/树/图/矩阵/自定义 */
    type: 'array' | 'tree' | 'graph' | 'matrix' | 'custom';
    /** 默认演示数据（JSON 格式） */
    defaultData: string;
    /** 预设动画步骤 */
    steps: IAnimationStep[];
  };

  // ==================== 测试用例 ====================
  
  /**
   * 测试用例数组
   */
  testCases: {
    /** 输入参数 */
    input: string;
    /** 期望输出 */
    expectedOutput: string;
    /** 用例描述（可选） */
    description?: string;
  }[];

  /** 关联知识点 ID 列表 */
  relatedKnowledge: mongoose.Types.ObjectId[];

  // ==================== 统计数据 ====================
  
  /** 浏览次数 */
  viewCount: number;
  
  /** 提交次数 */
  submitCount: number;
  
  /** 通过次数 */
  acceptCount: number;

  // ==================== 权限控制 ====================
  
  /** 是否免费 */
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
 * 算法题 Schema 定义
 * @description 定义算法题集合的文档结构和验证规则
 */
const algorithmSchema = new Schema<IAlgorithm>(
  {
    /**
     * 算法标题
     */
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    
    /**
     * 算法分类
     * @description 按难度分为基础/进阶/高级
     */
    category: {
      type: String,
      enum: Object.values(AlgorithmCategory),  // 枚举验证
      required: true,
    },
    
    /**
     * 标签数组
     * @description 如：排序、搜索、动态规划等
     */
    tags: [{
      type: String,
      trim: true,
    }],
    
    /**
     * 算法描述
     */
    description: {
      type: String,
      required: [true, '描述不能为空'],
    },
    
    /**
     * 代码模板
     */
    codeTemplate: {
      javascript: {
        type: String,
        default: '// 请在此处编写算法代码\nfunction algorithm(data) {\n  \n}\n',
      },
      typescript: {
        type: String,
        default: '// 请在此处编写算法代码\nfunction algorithm(data: any): any {\n  \n}\n',
      },
    },
    
    /**
     * 标准解答
     */
    solution: {
      code: { type: String, default: '' },
      explanation: { type: String, default: '' },
      timeComplexity: { type: String, default: '' },
      spaceComplexity: { type: String, default: '' },
    },
    
    /**
     * 动画配置嵌套文档
     * @description 包含动画类型、默认数据和步骤配置
     */
    animation: {
      /**
       * 可视化类型
       * @description 决定前端使用哪种可视化组件
       */
      type: {
        type: String,
        enum: ['array', 'tree', 'graph', 'matrix', 'custom'],
        default: 'array',
      },
      
      /**
       * 默认演示数据
       * @description JSON 格式的初始数据
       */
      defaultData: {
        type: String,
        default: '[]',
      },
      
      /**
       * 动画步骤数组
       * @description 每个步骤包含描述、代码高亮和数据状态
       */
      steps: [{
        stepNumber: { type: Number, required: true },
        description: { type: String, required: true },
        codeHighlight: {
          startLine: Number,
          endLine: Number,
        },
        dataState: { type: String, required: true },
        timeComplexity: String,
      }],
    },
    
    /**
     * 测试用例数组
     */
    testCases: [{
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      description: String,
    }],
    
    /**
     * 关联知识点
     */
    relatedKnowledge: [{
      type: Schema.Types.ObjectId,
      ref: 'Knowledge',
    }],
    
    /**
     * 浏览次数
     */
    viewCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 提交次数
     */
    submitCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 通过次数
     */
    acceptCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 免费标志
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
    timestamps: true,  // 自动管理时间戳
  }
);

/**
 * ==================== 索引定义 ====================
 */

// 分类索引
algorithmSchema.index({ category: 1 });

// 标签索引
algorithmSchema.index({ tags: 1 });

// 免费标志索引
algorithmSchema.index({ isFree: 1 });

// 发布状态索引
algorithmSchema.index({ isPublished: 1 });

// 排序权重索引
algorithmSchema.index({ order: 1 });

/**
 * 全文索引
 * @description 支持标题和描述的全文搜索
 */
algorithmSchema.index({ title: 'text', description: 'text' });

/**
 * 导出 Algorithm 模型
 */
export const Algorithm = mongoose.model<IAlgorithm>('Algorithm', algorithmSchema);

// 默认导出
export default Algorithm;
