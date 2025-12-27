/**
 * 类型定义文件
 * 定义前端应用中使用的所有 TypeScript 类型和接口
 */

// ============================================================
// 用户相关类型
// ============================================================

/**
 * 用户角色枚举
 * 定义系统中的用户角色等级
 */
export enum UserRole {
  /** 普通用户 - 基础访问权限 */
  USER = 'user',
  /** 会员用户 - 可访问付费内容 */
  MEMBER = 'member',
  /** 管理员 - 拥有所有权限 */
  ADMIN = 'admin',
}

/**
 * 用户信息接口
 * 描述用户的基本信息和相关数据
 */
export interface User {
  /** 用户唯一标识 */
  id: string;
  /** 用户邮箱（登录账号） */
  email: string;
  /** 用户昵称 */
  nickname: string;
  /** 头像 URL */
  avatar?: string;
  /** 手机号码 */
  phone?: string;
  /** 用户角色 */
  role: UserRole;
  /** 会员过期时间 */
  memberExpireAt?: string;
  /** 会员状态是否有效 */
  isMemberValid?: boolean;
  /** 账号创建时间 */
  createdAt?: string;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 登录次数统计 */
  loginCount?: number;
  /** 学习进度数据 */
  learningProgress?: LearningProgress;
  /** 学习计划 */
  studyPlan?: StudyPlan;
}

/**
 * 学习进度接口
 * 记录用户完成的各类学习内容
 */
export interface LearningProgress {
  /** 已完成的知识点 ID 列表 */
  completedKnowledge: string[];
  /** 已完成的编程题 ID 列表 */
  completedProblems: string[];
  /** 已完成的算法题 ID 列表 */
  completedAlgorithms: string[];
}

/**
 * 学习计划接口
 * 记录用户的学习目标和每日任务
 */
export interface StudyPlan {
  /** 目标完成日期 */
  targetDate?: string;
  /** 目标等级（如：初级/中级/高级） */
  targetLevel?: string;
  /** 每日学习任务列表 */
  dailyTasks?: string[];
}

// ============================================================
// 知识点相关类型
// ============================================================

/**
 * 知识点难度级别枚举
 */
export enum KnowledgeLevel {
  /** 基础 - 入门级知识 */
  BASIC = 'basic',
  /** 中级 - 进阶知识 */
  INTERMEDIATE = 'intermediate',
  /** 高级 - 深入知识 */
  ADVANCED = 'advanced',
}

/**
 * 知识点接口
 * 描述一个完整的知识点数据结构
 */
export interface Knowledge {
  /** MongoDB 文档 ID */
  _id: string;
  /** 知识点标题 */
  title: string;
  /** 所属分类 */
  category: string;
  /** 难度级别 */
  level: KnowledgeLevel;
  /** 相关标签数组 */
  tags: string[];
  /** 知识点内容 */
  content: {
    /** 简短摘要 */
    summary: string;
    /** 详细内容（Markdown） */
    detail: string;
    /** 面试问题 */
    interviewQuestion: string;
    /** 标准答案 */
    standardAnswer: string;
    /** 常见错误列表 */
    commonMistakes: string[];
    /** 扩展知识列表 */
    extensions: string[];
  };
  /** 关联的编程题 */
  relatedProblems?: Problem[];
  /** 浏览次数 */
  viewCount: number;
  /** 收藏次数 */
  favoriteCount: number;
  /** 来源公司 */
  company?: string;
  /** 面试职位 */
  position?: string;
  /** 是否已发布 */
  isPublished: boolean;
  /** 排序顺序 */
  order: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============================================================
// 编程题相关类型
// ============================================================

/**
 * 编程题难度枚举
 */
export enum ProblemDifficulty {
  /** 简单 */
  EASY = 'easy',
  /** 中等 */
  MEDIUM = 'medium',
  /** 困难 */
  HARD = 'hard',
}

/**
 * 测试用例接口
 * 描述单个测试用例的结构
 */
export interface TestCase {
  /** 输入数据 */
  input: string;
  /** 期望输出 */
  expectedOutput: string;
  /** 测试用例描述 */
  description?: string;
  /** 是否为隐藏用例（不显示给用户） */
  isHidden?: boolean;
}

/**
 * 编程题接口
 * 描述一道编程题的完整结构
 */
export interface Problem {
  /** MongoDB 文档 ID */
  _id: string;
  /** 题目标题 */
  title: string;
  /** 难度级别 */
  difficulty: ProblemDifficulty;
  /** 所属分类 */
  category: string;
  /** 相关标签 */
  tags: string[];
  /** 题目描述（Markdown） */
  description: string;
  /** 示例数组 */
  examples: {
    /** 输入示例 */
    input: string;
    /** 输出示例 */
    output: string;
    /** 示例解释 */
    explanation?: string;
  }[];
  /** 约束条件列表 */
  constraints: string[];
  /** 提示信息列表 */
  hints: string[];
  /** 代码模板 */
  codeTemplate: {
    /** JavaScript 模板 */
    javascript: string;
    /** TypeScript 模板 */
    typescript: string;
  };
  /** 测试用例数组 */
  testCases: TestCase[];
  /** 参考答案 */
  solution: {
    /** 答案代码 */
    code: string;
    /** 解题思路 */
    explanation: string;
    /** 时间复杂度 */
    timeComplexity: string;
    /** 空间复杂度 */
    spaceComplexity: string;
  };
  /** 关联的知识点 */
  relatedKnowledge?: Knowledge[];
  /** 提交次数 */
  submitCount: number;
  /** 通过次数 */
  acceptCount: number;
  /** 通过率 */
  acceptRate?: string;
  /** 是否免费 */
  isFree: boolean;
  /** 排序顺序 */
  order: number;
  /** 是否已发布 */
  isPublished: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============================================================
// 算法题相关类型
// ============================================================

/**
 * 算法分类枚举
 */
export enum AlgorithmCategory {
  /** 基础算法 */
  BASIC = 'basic',
  /** 中级算法 */
  INTERMEDIATE = 'intermediate',
  /** 高级算法 */
  ADVANCED = 'advanced',
}

/**
 * 动画步骤接口
 * 描述算法可视化动画的单个步骤
 */
export interface AnimationStep {
  /** 步骤编号 */
  stepNumber: number;
  /** 步骤描述 */
  description: string;
  /** 代码高亮范围 */
  codeHighlight: {
    /** 开始行号 */
    startLine: number;
    /** 结束行号 */
    endLine: number;
  };
  /** 当前数据状态（JSON 字符串） */
  dataState: string;
  /** 当前步骤的时间复杂度 */
  timeComplexity?: string;
}

/**
 * 算法题接口
 * 描述一道算法题的完整结构，包含动画配置
 */
export interface Algorithm {
  /** MongoDB 文档 ID */
  _id: string;
  /** 算法标题 */
  title: string;
  /** 算法分类 */
  category: AlgorithmCategory;
  /** 相关标签 */
  tags: string[];
  /** 算法描述（Markdown） */
  description: string;
  /** 代码模板 */
  codeTemplate: {
    /** JavaScript 模板 */
    javascript: string;
    /** TypeScript 模板 */
    typescript: string;
  };
  /** 参考答案 */
  solution: {
    /** 答案代码 */
    code: string;
    /** 解题思路 */
    explanation: string;
    /** 时间复杂度 */
    timeComplexity: string;
    /** 空间复杂度 */
    spaceComplexity: string;
  };
  /** 动画配置 */
  animation: {
    /** 动画类型：数组/树/图/矩阵/自定义 */
    type: 'array' | 'tree' | 'graph' | 'matrix' | 'custom';
    /** 默认输入数据 */
    defaultData: string;
    /** 动画步骤数组 */
    steps: AnimationStep[];
  };
  /** 测试用例数组 */
  testCases: {
    /** 输入数据 */
    input: string;
    /** 期望输出 */
    expectedOutput: string;
    /** 用例描述 */
    description?: string;
  }[];
  /** 关联的知识点 */
  relatedKnowledge?: Knowledge[];
  /** 浏览次数 */
  viewCount: number;
  /** 提交次数 */
  submitCount: number;
  /** 通过次数 */
  acceptCount: number;
  /** 是否免费 */
  isFree: boolean;
  /** 排序顺序 */
  order: number;
  /** 是否已发布 */
  isPublished: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============================================================
// 提交记录相关类型
// ============================================================

/**
 * 提交状态类型
 * 描述代码提交的评测状态
 */
export type SubmissionStatus =
  | 'pending'       // 等待评测
  | 'running'       // 评测中
  | 'accepted'      // 通过
  | 'wrong_answer'  // 答案错误
  | 'runtime_error' // 运行时错误
  | 'timeout';      // 超时

/**
 * 提交记录接口
 * 描述用户提交代码的完整记录
 */
export interface Submission {
  /** MongoDB 文档 ID */
  _id: string;
  /** 用户 ID */
  userId: string;
  /** 关联的编程题 ID */
  problemId?: string;
  /** 关联的算法题 ID */
  algorithmId?: string;
  /** 提交类型：编程题或算法题 */
  type: 'problem' | 'algorithm';
  /** 提交的代码 */
  code: string;
  /** 编程语言 */
  language: 'javascript' | 'typescript';
  /** 评测状态 */
  status: SubmissionStatus;
  /** 测试结果详情 */
  testResults: {
    /** 测试用例索引 */
    testCaseIndex: number;
    /** 是否通过 */
    passed: boolean;
    /** 输入数据 */
    input: string;
    /** 期望输出 */
    expectedOutput: string;
    /** 实际输出 */
    actualOutput: string;
    /** 执行时间（毫秒） */
    executionTime?: number;
    /** 错误信息 */
    error?: string;
  }[];
  /** 通过的测试用例数 */
  passedCount: number;
  /** 总测试用例数 */
  totalCount: number;
  /** 总执行时间（毫秒） */
  executionTime: number;
  /** 提交时间 */
  createdAt: string;
}

// ============================================================
// 错题记录相关类型
// ============================================================

/**
 * 错题记录接口
 * 描述用户的错题记录，用于复习和巩固
 */
export interface WrongRecord {
  /** MongoDB 文档 ID */
  _id: string;
  /** 用户 ID */
  userId: string;
  /** 关联的编程题 ID */
  problemId?: string;
  /** 关联的算法题 ID */
  algorithmId?: string;
  /** 错题类型：编程题或算法题 */
  type: 'problem' | 'algorithm';
  /** 关联的编程题详情 */
  problem?: Problem;
  /** 关联的算法题详情 */
  algorithm?: Algorithm;
  /** 错误次数 */
  wrongCount: number;
  /** 最后一次错误时间 */
  lastWrongAt: string;
  /** 最后一次错误的代码 */
  lastWrongCode: string;
  /** 最后一次错误原因 */
  lastWrongReason?: string;
  /** 是否已解决 */
  isResolved: boolean;
  /** 解决时间 */
  resolvedAt?: string;
  /** 复习次数 */
  reviewCount: number;
  /** 最后复习时间 */
  lastReviewAt?: string;
  /** 复习笔记 */
  notes?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============================================================
// 用户代码相关类型
// ============================================================

/**
 * 用户代码接口
 * 描述用户保存的代码项目
 */
export interface UserCode {
  /** MongoDB 文档 ID */
  _id: string;
  /** 用户 ID */
  userId: string;
  /** 项目名称 */
  projectName: string;
  /** 项目描述 */
  description?: string;
  /** 文件列表 */
  files: {
    /** 文件名 */
    filename: string;
    /** 文件内容 */
    content: string;
    /** 文件语言 */
    language: string;
  }[];
  /** 入口文件名 */
  entryFile: string;
  /** 项目类型：自定义/编程题/算法题 */
  type: 'custom' | 'problem' | 'algorithm';
  /** 关联的编程题 ID */
  relatedProblemId?: string;
  /** 关联的算法题 ID */
  relatedAlgorithmId?: string;
  /** 审核状态 */
  auditStatus: 'pending' | 'approved' | 'rejected';
  /** 审核备注 */
  auditNote?: string;
  /** 是否公开 */
  isPublic: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

// ============================================================
// 通用类型
// ============================================================

/**
 * 分页参数接口
 * 用于分页请求的参数
 */
export interface PaginationParams {
  /** 页码（从 1 开始） */
  page?: number;
  /** 每页数量 */
  limit?: number;
}

/**
 * 分页响应接口
 * 泛型接口，用于包装分页数据
 * @template T - 列表项的类型
 */
export interface PaginatedResponse<T> {
  /** 数据列表 */
  items: T[];
  /** 分页信息 */
  pagination: {
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    limit: number;
    /** 总记录数 */
    total: number;
    /** 总页数 */
    totalPages: number;
  };
}

/**
 * API 响应接口
 * 泛型接口，用于包装 API 返回的数据
 * @template T - 响应数据的类型，默认为 unknown
 */
export interface ApiResponse<T = unknown> {
  /** 请求是否成功 */
  success: boolean;
  /** 提示消息 */
  message?: string;
  /** 错误码 */
  code?: string;
  /** 响应数据 */
  data?: T;
  /** 字段验证错误列表 */
  errors?: {
    /** 错误字段名 */
    field: string;
    /** 错误信息 */
    message: string;
  }[];
}
