/**
 * @file 知识点数据模型
 * @description 定义知识点的 Mongoose Schema 和接口，包括内容、分类、难度等
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';
// 导入知识点层级枚举
import { KnowledgeLevel } from '../config';

/**
 * 知识点文档接口
 * @interface IKnowledge
 * @extends Document
 * @description 定义知识点文档的结构
 */
export interface IKnowledge extends Document {
  /** 知识点唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 知识点标题 */
  title: string;
  
  /** 分类（如：JavaScript基础、React、Vue 等） */
  category: string;
  
  /** 难度层级（basic/intermediate/advanced） */
  level: KnowledgeLevel;
  
  /** 标签数组（用于筛选和搜索） */
  tags: string[];

  /**
   * 知识点内容
   * @description 包含多个维度的内容，用于全面学习
   */
  content: {
    /** 概要 - 简短描述 */
    summary: string;
    /** 详细内容 - Markdown 格式 */
    detail: string;
    /** 面试提问方式 - 面试官可能的提问 */
    interviewQuestion: string;
    /** 标准答案 - 完美回答模板 */
    standardAnswer: string;
    /** 易错点 - 常见错误和陷阱 */
    commonMistakes: string[];
    /** 拓展延伸 - 深入学习的方向 */
    extensions: string[];
  };

  /** 关联的编程题 ID 列表 */
  relatedProblems: mongoose.Types.ObjectId[];

  /** 浏览次数 */
  viewCount: number;
  
  /** 收藏次数 */
  favoriteCount: number;

  /** 来源公司（可选，如：字节、腾讯） */
  company?: string;
  
  /** 岗位级别（可选，如：P5、P6） */
  position?: string;

  /** 是否发布（控制前端可见性） */
  isPublished: boolean;
  
  /** 排序权重（数值越小越靠前） */
  order: number;

  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 知识点 Schema 定义
 * @description 定义知识点集合的文档结构和验证规则
 */
const knowledgeSchema = new Schema<IKnowledge>(
  {
    /**
     * 标题字段
     * @description 知识点的标题，必填且有长度限制
     */
    title: {
      type: String,
      required: [true, '标题不能为空'],          // 必填验证
      trim: true,                             // 自动去除首尾空格
      maxlength: [100, '标题最多100个字符'],     // 最大长度验证
    },
    
    /**
     * 分类字段
     * @description 使用枚举限制分类值，确保数据一致性
     */
    category: {
      type: String,
      required: [true, '分类不能为空'],
      trim: true,
      enum: [
        'JavaScript基础',     // JS 核心概念
        'HTML5',             // HTML5 特性
        'CSS3',              // CSS3 样式
        '浏览器原理',          // 浏览器工作原理
        '网络协议',           // HTTP/HTTPS/TCP 等
        'React',             // React 框架
        'Vue',               // Vue 框架
        '工程化',             // Webpack/Vite 等构建工具
        '性能优化',           // 前端性能优化
        '安全',               // Web 安全
        '算法数据结构',        // 数据结构与算法
        '其他',               // 其他知识点
      ],
    },
    
    /**
     * 难度层级
     * @description 控制内容的访问权限
     */
    level: {
      type: String,
      enum: Object.values(KnowledgeLevel),    // 枚举验证
      default: KnowledgeLevel.BASIC,          // 默认基础层级
    },
    
    /**
     * 标签数组
     * @description 用于更细粒度的分类和搜索
     */
    tags: [{
      type: String,
      trim: true,
    }],
    
    /**
     * 内容嵌套文档
     * @description 包含知识点的所有详细内容
     */
    content: {
      /**
       * 概要
       * @description 200字以内的简短总结
       */
      summary: {
        type: String,
        required: [true, '概要不能为空'],
      },
      
      /**
       * 详细内容
       * @description 使用 Markdown 格式，支持代码块、图片等
       */
      detail: {
        type: String,
        required: [true, '详细内容不能为空'],
      },
      
      /**
       * 面试提问方式
       * @description 记录面试官常见的提问方式
       */
      interviewQuestion: {
        type: String,
        default: '',
      },
      
      /**
       * 标准答案
       * @description 面试时的标准回答模板
       */
      standardAnswer: {
        type: String,
        default: '',
      },
      
      /**
       * 易错点数组
       * @description 列举常见的错误理解
       */
      commonMistakes: [{
        type: String,
      }],
      
      /**
       * 拓展延伸数组
       * @description 深入学习的相关主题
       */
      extensions: [{
        type: String,
      }],
    },
    
    /**
     * 关联编程题
     * @description 通过 ObjectId 关联相关的编程练习题
     */
    relatedProblems: [{
      type: Schema.Types.ObjectId,
      ref: 'Problem',                         // 引用 Problem 模型
    }],
    
    /**
     * 浏览次数
     * @description 用于统计知识点热度
     */
    viewCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 收藏次数
     * @description 用于统计知识点受欢迎程度
     */
    favoriteCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 来源公司
     * @description 记录该知识点来自哪家公司的面试
     */
    company: {
      type: String,
      trim: true,
    },
    
    /**
     * 岗位级别
     * @description 记录该知识点适合的岗位级别
     */
    position: {
      type: String,
      trim: true,
    },
    
    /**
     * 发布状态
     * @description 未发布的知识点不会显示在前端
     */
    isPublished: {
      type: Boolean,
      default: true,
    },
    
    /**
     * 排序权重
     * @description 用于控制显示顺序，数值越小越靠前
     */
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    /**
     * Schema 选项
     */
    timestamps: true,                         // 自动管理 createdAt 和 updatedAt
  }
);

/**
 * ==================== 索引定义 ====================
 * @description 为常用查询字段创建索引，提高查询性能
 */

// 分类索引 - 用于按分类筛选
knowledgeSchema.index({ category: 1 });

// 层级索引 - 用于按难度筛选
knowledgeSchema.index({ level: 1 });

// 标签索引 - 用于标签筛选
knowledgeSchema.index({ tags: 1 });

// 发布状态索引 - 用于过滤已发布内容
knowledgeSchema.index({ isPublished: 1 });

// 浏览次数索引（降序） - 用于热门排序
knowledgeSchema.index({ viewCount: -1 });

// 排序权重索引 - 用于自定义排序
knowledgeSchema.index({ order: 1 });

/**
 * 全文索引
 * @description 支持标题和概要的全文搜索
 * MongoDB 全文索引允许对字符串字段进行文本搜索
 */
knowledgeSchema.index({ title: 'text', 'content.summary': 'text' });

/**
 * 导出 Knowledge 模型
 */
export const Knowledge = mongoose.model<IKnowledge>('Knowledge', knowledgeSchema);

// 默认导出
export default Knowledge;
