/**
 * 应用根组件
 * 负责初始化应用状态和渲染路由
 */

// 导入 React 的 useEffect Hook
import { useEffect } from 'react';
// 导入应用路由组件
import AppRouter from '@/router';
// 导入认证状态管理 Store
import { useAuthStore } from '@/store/authStore';

/**
 * App 根组件
 * 
 * 主要职责：
 * 1. 在应用启动时检查用户登录状态
 * 2. 如果存在 token，则获取用户信息
 * 3. 渲染应用路由
 */
function App() {
  // 从 authStore 中解构获取 token 和 fetchUser 方法
  // token: 用户的认证令牌，存储在本地
  // fetchUser: 获取当前登录用户信息的异步方法
  const { token, fetchUser } = useAuthStore();

  /**
   * 初始化效果：检查并获取用户信息
   * 
   * 当组件挂载时，如果存在 token，说明用户之前已登录，
   * 此时调用 fetchUser 获取用户的最新信息
   * 
   * 依赖项 [token, fetchUser]：
   * - 当 token 变化时（登录/登出）重新执行
   * - fetchUser 是 zustand store 的稳定引用，不会导致额外渲染
   */
  useEffect(() => {
    // 只有在存在 token 时才获取用户信息
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  // 渲染应用路由组件
  // AppRouter 包含所有页面的路由配置
  return <AppRouter />;
}

// 导出 App 组件作为默认导出
export default App;
