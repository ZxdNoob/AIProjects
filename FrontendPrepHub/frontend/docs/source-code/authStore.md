# 认证状态管理（authStore）源码解读

**文件路径**：`src/store/authStore.ts`  
**创建时间**：2025-12-27 22:49:04  
**更新时间**：2025-12-27 23:02:12

## 📋 文件概述

`authStore.ts` 是前端应用的核心状态管理文件，使用 Zustand 管理用户认证状态。它负责处理用户登录、登出、Token 管理、权限验证等核心功能。

## 🔗 依赖关系

- **Zustand**：轻量级状态管理库
- **API 服务**：`src/services/api.ts` - 用于调用后端认证接口
- **类型定义**：`src/types/index.ts` - 用户类型定义

## 📖 逐行解读

### 1. 导入依赖

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';
import { User, UserRole } from '@/types';
```

**说明**：
- `create`：Zustand 的核心函数，用于创建 store
- `persist`：Zustand 的持久化中间件，用于将状态保存到 localStorage
- `api`：封装的 API 服务，用于调用后端接口
- `User`、`UserRole`：TypeScript 类型定义

### 2. 状态接口定义

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: () => boolean;
  isMember: () => boolean;
  hasAccess: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
```

**说明**：
- `user`：当前登录用户信息，未登录时为 `null`
- `token`：JWT Token，用于 API 请求认证
- `isAuthenticated()`：检查用户是否已登录
- `isMember()`：检查用户是否为会员
- `hasAccess(role)`：检查用户是否有指定角色权限
- `login()`：用户登录方法
- `logout()`：用户登出方法
- `updateUser()`：更新用户信息方法

### 3. Store 创建

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,

      // 检查是否已登录
      isAuthenticated: () => {
        const { token, user } = get();
        return !!token && !!user;
      },

      // 检查是否为会员
      isMember: () => {
        const { user } = get();
        return user?.role === UserRole.MEMBER || user?.role === UserRole.ADMIN;
      },

      // 检查角色权限
      hasAccess: (role: UserRole) => {
        const { user } = get();
        if (!user) return false;
        
        // 管理员拥有所有权限
        if (user.role === UserRole.ADMIN) return true;
        
        // 检查是否匹配指定角色
        return user.role === role;
      },

      // 用户登录
      login: async (email: string, password: string) => {
        try {
          // 调用登录 API
          const response = await api.post('/auth/login', {
            email,
            password,
          });

          // 更新状态
          set({
            user: response.data.user,
            token: response.data.token,
          });

          // 将 Token 存储到 localStorage（persist 中间件会自动处理）
        } catch (error) {
          // 错误处理
          throw error;
        }
      },

      // 用户登出
      logout: () => {
        // 清空状态
        set({
          user: null,
          token: null,
        });

        // 清除 localStorage（persist 中间件会自动处理）
      },

      // 更新用户信息
      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage', // localStorage 的 key
    }
  )
);
```

**关键点说明**：

1. **persist 中间件**：
   - 自动将状态持久化到 localStorage
   - 页面刷新后自动恢复状态
   - 使用 `auth-storage` 作为存储键名

2. **isAuthenticated()**：
   - 检查 token 和 user 是否存在
   - 使用 `!!` 转换为布尔值

3. **isMember()**：
   - 会员用户包括 `MEMBER` 和 `ADMIN` 角色
   - 管理员自动拥有会员权限

4. **hasAccess(role)**：
   - 管理员拥有所有权限
   - 其他角色需要精确匹配

5. **login()**：
   - 异步方法，调用后端登录接口
   - 成功后更新 user 和 token
   - 错误由调用方处理

6. **logout()**：
   - 同步方法，清空状态
   - persist 中间件自动清除 localStorage

## 🎯 使用示例

### 在组件中使用

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  // 获取状态和方法
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // 检查登录状态
  if (!isAuthenticated()) {
    return <div>请先登录</div>;
  }

  // 使用用户信息
  return (
    <div>
      <p>欢迎，{user?.name}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

### 权限检查

```typescript
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

function AdminComponent() {
  const { hasAccess } = useAuthStore();

  if (!hasAccess(UserRole.ADMIN)) {
    return <div>无权限访问</div>;
  }

  return <div>管理员内容</div>;
}
```

## 🔑 核心概念

### 1. Zustand Store 模式
- 使用函数式 API，简洁易用
- 支持 TypeScript 类型推断
- 性能优化，只订阅需要的状态

### 2. 持久化策略
- 使用 persist 中间件自动持久化
- Token 和用户信息保存在 localStorage
- 页面刷新后自动恢复登录状态

### 3. 权限验证
- 基于角色的访问控制（RBAC）
- 支持多级权限检查
- 管理员拥有最高权限

## ⚠️ 注意事项

1. **Token 安全**：
   - Token 存储在 localStorage，存在 XSS 风险
   - 生产环境建议使用 httpOnly Cookie

2. **状态同步**：
   - 多个组件使用同一 store，状态自动同步
   - 避免直接修改状态，使用 set 方法

3. **错误处理**：
   - login 方法可能抛出错误，需要 try-catch
   - 建议在组件层面处理错误提示

## 🔗 相关文件

- [路由配置](../../src/router/index.tsx) - 使用 authStore 进行路由守卫
- [API 服务](../../src/services/api.ts) - 使用 token 进行 API 认证
- [类型定义](../../src/types/index.ts) - User 和 UserRole 类型定义

