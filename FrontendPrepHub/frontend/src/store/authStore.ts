/**
 * 认证状态管理 Store
 * 使用 Zustand 管理用户登录状态、权限验证等
 */

// 导入 Zustand 核心函数
import { create } from 'zustand';
// 导入持久化中间件，用于将状态存储到 localStorage
import { persist } from 'zustand/middleware';
// 导入类型定义
import { User, UserRole } from '@/types';
// 导入认证 API
import { authApi } from '@/services/api';

// ============================================================
// 类型定义
// ============================================================

/**
 * 认证状态接口
 * 定义 Store 中的状态和方法
 */
interface AuthState {
  // -------------------- 状态 --------------------
  /** 当前登录用户信息 */
  user: User | null;
  /** 用户认证 token */
  token: string | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;

  // -------------------- 操作方法 --------------------
  /** 用户登录 */
  login: (email: string, password: string) => Promise<void>;
  /** 用户注册 */
  register: (data: {
    email: string;
    password: string;
    nickname: string;
    phone?: string;
  }) => Promise<void>;
  /** 用户登出 */
  logout: () => void;
  /** 更新用户信息 */
  updateUser: (user: Partial<User>) => void;
  /** 获取当前用户信息 */
  fetchUser: () => Promise<void>;
  /** 清除错误信息 */
  clearError: () => void;

  // -------------------- 权限检查方法 --------------------
  /** 检查是否已认证（登录） */
  isAuthenticated: () => boolean;
  /** 检查是否为有效会员 */
  isMember: () => boolean;
  /** 检查是否为管理员 */
  isAdmin: () => boolean;
  /** 检查是否有指定角色的权限 */
  hasAccess: (requiredRole?: UserRole) => boolean;
}

// ============================================================
// Store 实现
// ============================================================

/**
 * 创建认证 Store
 * 
 * 使用 create 创建 Zustand store
 * 使用 persist 中间件实现状态持久化
 */
export const useAuthStore = create<AuthState>()(
  // 使用 persist 中间件包装，实现状态持久化到 localStorage
  persist(
    // Store 定义函数，接收 set 和 get 方法
    (set, get) => ({
      // -------------------- 初始状态 --------------------
      /** 初始用户为空 */
      user: null,
      /** 初始 token 为空 */
      token: null,
      /** 初始不在加载状态 */
      isLoading: false,
      /** 初始无错误 */
      error: null,

      // -------------------- 登录方法 --------------------
      /**
       * 用户登录
       * @param email - 邮箱
       * @param password - 密码
       */
      login: async (email, password) => {
        // 开始加载，清除之前的错误
        set({ isLoading: true, error: null });
        try {
          // 调用登录 API
          const response = await authApi.login(email, password);
          // 如果登录成功
          if (response.success && response.data) {
            // 更新状态：保存用户信息和 token
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
            });
          } else {
            // 登录失败，抛出错误
            throw new Error(response.message || '登录失败');
          }
        } catch (error: any) {
          // 捕获错误，设置错误信息
          set({
            error: error.message || '登录失败',
            isLoading: false,
          });
          // 继续抛出错误，让调用方处理
          throw error;
        }
      },

      // -------------------- 注册方法 --------------------
      /**
       * 用户注册
       * @param data - 注册信息
       */
      register: async (data) => {
        // 开始加载，清除之前的错误
        set({ isLoading: true, error: null });
        try {
          // 调用注册 API
          const response = await authApi.register(data);
          // 如果注册成功
          if (response.success && response.data) {
            // 更新状态：保存用户信息和 token（注册后自动登录）
            set({
              user: response.data.user,
              token: response.data.token,
              isLoading: false,
            });
          } else {
            // 注册失败，抛出错误
            throw new Error(response.message || '注册失败');
          }
        } catch (error: any) {
          // 捕获错误，设置错误信息
          set({
            error: error.message || '注册失败',
            isLoading: false,
          });
          // 继续抛出错误
          throw error;
        }
      },

      // -------------------- 登出方法 --------------------
      /**
       * 用户登出
       * 清除所有认证相关状态
       */
      logout: () => {
        // 清除用户信息、token 和错误信息
        set({ user: null, token: null, error: null });
      },

      // -------------------- 更新用户信息方法 --------------------
      /**
       * 更新用户信息
       * @param userData - 要更新的用户数据（部分字段）
       */
      updateUser: (userData) => {
        // 获取当前用户
        const currentUser = get().user;
        // 如果用户存在，合并更新
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      // -------------------- 获取用户信息方法 --------------------
      /**
       * 从服务器获取当前用户信息
       * 用于刷新页面后恢复用户状态
       */
      fetchUser: async () => {
        // 获取当前 token
        const token = get().token;
        // 如果没有 token，直接返回
        if (!token) return;

        // 开始加载
        set({ isLoading: true });
        try {
          // 调用获取用户信息 API
          const response = await authApi.getMe();
          // 如果成功，更新用户信息
          if (response.success && response.data) {
            set({ user: response.data.user, isLoading: false });
          }
        } catch (error) {
          // 获取失败，只结束加载状态（不清除已有信息）
          set({ isLoading: false });
        }
      },

      // -------------------- 清除错误方法 --------------------
      /**
       * 清除错误信息
       */
      clearError: () => set({ error: null }),

      // -------------------- 认证检查方法 --------------------
      /**
       * 检查用户是否已认证（登录）
       * @returns 是否已登录
       */
      isAuthenticated: () => {
        // 同时检查 token 和 user 是否存在
        return !!get().token && !!get().user;
      },

      // -------------------- 会员检查方法 --------------------
      /**
       * 检查用户是否为有效会员
       * @returns 是否为有效会员
       */
      isMember: () => {
        const user = get().user;
        // 如果没有用户，返回 false
        if (!user) return false;
        // 管理员拥有所有权限
        if (user.role === UserRole.ADMIN) return true;
        // 会员角色且会员状态有效
        if (user.role === UserRole.MEMBER && user.isMemberValid) return true;
        // 其他情况返回 false
        return false;
      },

      // -------------------- 管理员检查方法 --------------------
      /**
       * 检查用户是否为管理员
       * @returns 是否为管理员
       */
      isAdmin: () => {
        const user = get().user;
        // 检查角色是否为 ADMIN
        return user?.role === UserRole.ADMIN;
      },

      // -------------------- 角色权限检查方法 --------------------
      /**
       * 检查用户是否有指定角色的访问权限
       * @param requiredRole - 所需的最低角色
       * @returns 是否有权限
       */
      hasAccess: (requiredRole) => {
        const user = get().user;
        // 如果没有用户，无权限
        if (!user) return false;
        // 如果没有指定所需角色，有权限
        if (!requiredRole) return true;

        // 定义角色层级（数值越大权限越高）
        const roleHierarchy = {
          [UserRole.USER]: 0,    // 普通用户
          [UserRole.MEMBER]: 1,  // 会员
          [UserRole.ADMIN]: 2,   // 管理员
        };

        // 比较用户角色层级是否大于等于所需角色
        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
      },
    }),
    // -------------------- 持久化配置 --------------------
    {
      /** localStorage 中的存储 key */
      name: 'auth-storage',
      /** 选择需要持久化的状态（只持久化 token 和 user） */
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
