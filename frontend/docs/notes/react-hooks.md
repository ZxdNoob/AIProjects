# React Hooks 学习笔记

**创建时间**：2025-12-27 22:49:04  
**更新时间**：2025-12-27 23:02:13

## 📋 学习目标

- 理解 React Hooks 的核心概念
- 掌握常用 Hooks 的使用方法
- 学习 Hooks 的最佳实践
- 了解自定义 Hooks 的编写

## 🎯 核心概念

### 1. 什么是 Hooks？

Hooks 是 React 16.8 引入的新特性，允许你在函数组件中使用状态（state）和其他 React 特性。

**为什么需要 Hooks？**
- 函数组件更简洁
- 逻辑复用更容易
- 代码组织更清晰

### 2. Hooks 规则

1. **只在顶层调用 Hooks**
   - 不要在循环、条件或嵌套函数中调用
   - 确保每次渲染时 Hooks 的调用顺序一致

2. **只在 React 函数中调用 Hooks**
   - 在函数组件中调用
   - 在自定义 Hooks 中调用

## 📚 常用 Hooks

### 1. useState

用于在函数组件中添加状态。

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
}
```

**要点**：
- 返回数组：`[state, setState]`
- 初始值可以是值或函数
- 状态更新是异步的

### 2. useEffect

用于处理副作用（数据获取、订阅、DOM 操作等）。

```typescript
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 组件挂载或 userId 变化时执行
    fetchUser(userId).then(setUser);

    // 清理函数（可选）
    return () => {
      // 组件卸载或依赖变化前执行
      console.log('清理');
    };
  }, [userId]); // 依赖数组

  return <div>{user?.name}</div>;
}
```

**依赖数组**：
- `[]`：只在挂载时执行一次
- `[dep1, dep2]`：依赖变化时执行
- 无依赖数组：每次渲染都执行

### 3. useContext

用于在组件树中共享数据。

```typescript
import { createContext, useContext } from 'react';

// 创建 Context
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>按钮</button>;
}
```

### 4. useMemo

用于缓存计算结果，避免不必要的重新计算。

```typescript
import { useMemo } from 'react';

function ExpensiveComponent({ items }) {
  const expensiveValue = useMemo(() => {
    // 昂贵的计算
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]); // 只在 items 变化时重新计算

  return <div>{expensiveValue}</div>;
}
```

### 5. useCallback

用于缓存函数，避免子组件不必要的重新渲染。

```typescript
import { useCallback, useState } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('点击');
  }, []); // 函数不会改变

  return <Child onClick={handleClick} />;
}
```

### 6. useRef

用于获取 DOM 引用或保存可变值。

```typescript
import { useRef, useEffect } from 'react';

function InputFocus() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

## 🛠️ 自定义 Hooks

自定义 Hooks 是复用逻辑的方式。

### 示例：useAuth Hook

```typescript
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    login: handleLogin,
    logout,
    loading,
  };
}
```

## 💡 最佳实践

### 1. 状态提升
- 将共享状态提升到最近的公共父组件
- 或使用 Context 或状态管理库

### 2. 避免过度使用 useMemo/useCallback
- 只在性能确实需要优化时使用
- 简单计算不需要缓存

### 3. 清理副作用
- useEffect 中创建的订阅、定时器等需要清理
- 返回清理函数

### 4. 依赖数组要完整
- 包含所有使用的变量
- 使用 ESLint 规则检查

## 🔗 在项目中的应用

### 1. 状态管理
- 使用 Zustand 进行全局状态管理
- 使用 useState 进行组件局部状态

### 2. 数据获取
- 使用 useEffect 获取数据
- 结合 loading 和 error 状态

### 3. 表单处理
- 使用 useState 管理表单状态
- 使用 useRef 获取表单引用

## 📚 参考资料

- [React Hooks 官方文档](https://react.dev/reference/react)
- [React Hooks 最佳实践](https://react.dev/learn/escape-hatches)
- [useHooks](https://usehooks.com/) - Hooks 示例集合

