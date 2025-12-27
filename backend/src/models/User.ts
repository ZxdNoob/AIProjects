/**
 * @file 用户数据模型
 * @description 定义用户的 Mongoose Schema 和相关接口，包括用户信息、学习进度、收藏等
 * @author FrontendPrepHub Team
 */

// 导入 mongoose 核心模块
import mongoose, { Document, Schema } from 'mongoose';
// 导入 bcryptjs 用于密码加密和验证
import bcrypt from 'bcryptjs';
// 导入用户角色枚举
import { UserRole } from '../config';

/**
 * 用户文档接口
 * @interface IUser
 * @extends Document
 * @description 定义用户文档的结构，继承 Mongoose Document 接口
 */
export interface IUser extends Document {
  /** 用户唯一标识符 */
  _id: mongoose.Types.ObjectId;
  
  /** 用户邮箱（唯一，用于登录） */
  email: string;
  
  /** 用户手机号（可选） */
  phone?: string;
  
  /** 用户密码（加密存储） */
  password: string;
  
  /** 用户昵称 */
  nickname: string;
  
  /** 用户头像 URL（可选） */
  avatar?: string;
  
  /** 用户角色（user/member/admin） */
  role: UserRole;
  
  /** 账户是否激活 */
  isActive: boolean;
  
  /** 会员过期时间（仅会员用户有效） */
  memberExpireAt?: Date;
  
  /** 最后登录时间 */
  lastLoginAt?: Date;
  
  /** 登录次数统计 */
  loginCount: number;

  /**
   * 学习进度数据
   * @description 记录用户已完成的学习内容
   */
  learningProgress: {
    /** 已完成的知识点 ID 列表 */
    completedKnowledge: mongoose.Types.ObjectId[];
    /** 已完成的编程题 ID 列表 */
    completedProblems: mongoose.Types.ObjectId[];
    /** 已完成的算法题 ID 列表 */
    completedAlgorithms: mongoose.Types.ObjectId[];
  };

  /**
   * 收藏数据
   * @description 记录用户收藏的内容
   */
  favorites: {
    /** 收藏的知识点 ID 列表 */
    knowledge: mongoose.Types.ObjectId[];
    /** 收藏的编程题 ID 列表 */
    problems: mongoose.Types.ObjectId[];
    /** 收藏的算法题 ID 列表 */
    algorithms: mongoose.Types.ObjectId[];
  };

  /** 薄弱项知识点 ID 列表 */
  weakPoints: mongoose.Types.ObjectId[];

  /**
   * 学习计划
   * @description 用户的个性化学习计划配置
   */
  studyPlan?: {
    /** 目标面试时间 */
    targetDate?: Date;
    /** 目标岗位级别（如：P5、P6、P7） */
    targetLevel?: string;
    /** 每日任务列表 */
    dailyTasks?: string[];
  };

  /** 创建时间（自动生成） */
  createdAt: Date;
  
  /** 更新时间（自动生成） */
  updatedAt: Date;

  // ==================== 实例方法 ====================
  
  /**
   * 比较密码
   * @method comparePassword
   * @param candidatePassword - 待验证的密码
   * @returns Promise<boolean> - 密码是否匹配
   */
  comparePassword(candidatePassword: string): Promise<boolean>;
  
  /**
   * 检查会员是否有效
   * @method isMemberValid
   * @returns boolean - 会员资格是否有效
   */
  isMemberValid(): boolean;
}

/**
 * 用户 Schema 定义
 * @description 定义用户集合的文档结构和验证规则
 */
const userSchema = new Schema<IUser>(
  {
    /**
     * 用户邮箱字段
     * @description 用作登录唯一标识，必须是有效的邮箱格式
     */
    email: {
      type: String,                           // 数据类型：字符串
      required: [true, '邮箱不能为空'],          // 必填，自定义错误信息
      unique: true,                           // 唯一索引
      lowercase: true,                        // 自动转换为小写
      trim: true,                             // 自动去除首尾空格
      match: [/^\S+@\S+\.\S+$/, '请输入有效的邮箱地址'], // 正则验证
    },
    
    /**
     * 手机号字段
     * @description 可选字段，用于备用联系方式
     */
    phone: {
      type: String,
      sparse: true,                           // 稀疏索引：只为非空值创建索引
      trim: true,
      match: [/^1[3-9]\d{9}$/, '请输入有效的手机号'], // 中国大陆手机号格式
    },
    
    /**
     * 密码字段
     * @description 加密存储，默认查询时不返回
     */
    password: {
      type: String,
      required: [true, '密码不能为空'],
      minlength: [6, '密码至少6个字符'],
      select: false,                          // 查询时默认不返回此字段
    },
    
    /**
     * 昵称字段
     * @description 用于显示的用户名称
     */
    nickname: {
      type: String,
      required: [true, '昵称不能为空'],
      trim: true,
      maxlength: [20, '昵称最多20个字符'],
    },
    
    /**
     * 头像 URL
     */
    avatar: {
      type: String,
      default: '',                            // 默认空字符串
    },
    
    /**
     * 用户角色
     * @description 决定用户的权限等级
     */
    role: {
      type: String,
      enum: Object.values(UserRole),          // 枚举验证：只能是 UserRole 中的值
      default: UserRole.USER,                 // 默认为普通用户
    },
    
    /**
     * 账户激活状态
     * @description 管理员可以禁用用户账户
     */
    isActive: {
      type: Boolean,
      default: true,
    },
    
    /**
     * 会员过期时间
     * @description 仅对会员用户有效，过期后降级为普通用户
     */
    memberExpireAt: {
      type: Date,
    },
    
    /**
     * 最后登录时间
     */
    lastLoginAt: {
      type: Date,
    },
    
    /**
     * 登录次数
     */
    loginCount: {
      type: Number,
      default: 0,
    },
    
    /**
     * 学习进度嵌套文档
     * @description 使用 ObjectId 数组关联其他集合
     */
    learningProgress: {
      // 已完成的知识点，关联 Knowledge 集合
      completedKnowledge: [{
        type: Schema.Types.ObjectId,
        ref: 'Knowledge',                     // 引用 Knowledge 模型
      }],
      // 已完成的编程题，关联 Problem 集合
      completedProblems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem',
      }],
      // 已完成的算法题，关联 Algorithm 集合
      completedAlgorithms: [{
        type: Schema.Types.ObjectId,
        ref: 'Algorithm',
      }],
    },
    
    /**
     * 收藏嵌套文档
     */
    favorites: {
      // 收藏的知识点
      knowledge: [{
        type: Schema.Types.ObjectId,
        ref: 'Knowledge',
      }],
      // 收藏的编程题
      problems: [{
        type: Schema.Types.ObjectId,
        ref: 'Problem',
      }],
      // 收藏的算法题
      algorithms: [{
        type: Schema.Types.ObjectId,
        ref: 'Algorithm',
      }],
    },
    
    /**
     * 薄弱项知识点
     * @description 用户标记的需要重点复习的知识点
     */
    weakPoints: [{
      type: Schema.Types.ObjectId,
      ref: 'Knowledge',
    }],
    
    /**
     * 学习计划嵌套文档
     */
    studyPlan: {
      targetDate: Date,                       // 目标日期
      targetLevel: String,                    // 目标级别
      dailyTasks: [String],                   // 每日任务数组
    },
  },
  {
    /**
     * Schema 选项
     */
    timestamps: true,                         // 自动添加 createdAt 和 updatedAt
    
    /**
     * JSON 转换选项
     * @description 定义 toJSON() 方法的行为
     */
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;                  // 序列化时删除密码字段
        delete ret.__v;                       // 删除版本号字段
        return ret;
      },
    },
  }
);

/**
 * ==================== 索引定义 ====================
 * @description 为常用查询字段创建索引，提高查询性能
 */
userSchema.index({ email: 1 });               // 邮箱索引（升序）
userSchema.index({ phone: 1 }, { sparse: true }); // 手机号稀疏索引
userSchema.index({ role: 1 });                // 角色索引
userSchema.index({ createdAt: -1 });          // 创建时间索引（降序，用于排序）

/**
 * 保存前中间件 - 密码加密
 * @description 在保存文档前，如果密码被修改，则进行加密
 * @this IUser - 当前用户文档
 */
userSchema.pre('save', async function (next) {
  // 如果密码未被修改，跳过加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 生成盐值，12 是加密强度（越高越安全但越慢）
    const salt = await bcrypt.genSalt(12);
    // 使用盐值加密密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    // 发生错误时传递给下一个中间件
    next(error as Error);
  }
});

/**
 * 实例方法 - 比较密码
 * @description 验证输入的密码是否与存储的加密密码匹配
 * @param candidatePassword - 用户输入的密码（明文）
 * @returns Promise<boolean> - 是否匹配
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    // 使用 bcrypt.compare 比较明文密码和加密密码
    return await bcrypt.compare(candidatePassword, this.password);
  } catch {
    // 发生错误时返回 false
    return false;
  }
};

/**
 * 实例方法 - 检查会员有效性
 * @description 判断用户的会员资格是否有效
 * @returns boolean - 会员是否有效
 */
userSchema.methods.isMemberValid = function (): boolean {
  // 管理员始终有效
  if (this.role === UserRole.ADMIN) return true;
  // 非会员角色返回 false
  if (this.role !== UserRole.MEMBER) return false;
  // 没有设置过期时间返回 false
  if (!this.memberExpireAt) return false;
  // 检查是否在有效期内
  return new Date() < this.memberExpireAt;
};

/**
 * 导出 User 模型
 * @description 基于 userSchema 创建并导出 User 模型
 */
export const User = mongoose.model<IUser>('User', userSchema);

// 默认导出
export default User;
