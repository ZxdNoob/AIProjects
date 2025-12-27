/**
 * 路由配置文件
 * 定义应用的所有页面路由和访问权限
 */

// 导入 React Router 组件
// Routes: 路由容器
// Route: 单个路由定义
// Navigate: 编程式导航组件
import { Routes, Route, Navigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入用户角色类型
import { UserRole } from '@/types';

// ============================================================
// 布局组件导入
// ============================================================

// 主布局：包含导航栏、侧边栏的通用布局
import MainLayout from '@/layouts/MainLayout';
// 认证布局：用于登录、注册页面的简洁布局
import AuthLayout from '@/layouts/AuthLayout';
// 管理员布局：包含管理后台侧边栏的布局
import AdminLayout from '@/layouts/AdminLayout';

// ============================================================
// 页面组件导入
// ============================================================

// 首页
import HomePage from '@/pages/HomePage';
// 认证相关页面
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
// 知识点相关页面
import KnowledgePage from '@/pages/knowledge/KnowledgePage';
import KnowledgeDetailPage from '@/pages/knowledge/KnowledgeDetailPage';
// 编程题相关页面
import ProblemsPage from '@/pages/problems/ProblemsPage';
import ProblemDetailPage from '@/pages/problems/ProblemDetailPage';
// 算法题相关页面
import AlgorithmsPage from '@/pages/algorithms/AlgorithmsPage';
import AlgorithmDetailPage from '@/pages/algorithms/AlgorithmDetailPage';
// 在线 IDE 页面
import IDEPage from '@/pages/ide/IDEPage';
// 用户中心相关页面
import ProfilePage from '@/pages/user/ProfilePage';
import LearningPage from '@/pages/user/LearningPage';
import WrongRecordsPage from '@/pages/user/WrongRecordsPage';
// 管理后台相关页面
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminContent from '@/pages/admin/AdminContent';
// 错误页面
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';

// ============================================================
// 路由守卫组件
// ============================================================

/**
 * 受保护的路由组件属性接口
 */
interface ProtectedRouteProps {
  /** 子组件（被保护的页面） */
  children: React.ReactNode;
  /** 可选：所需的用户角色，用于角色权限验证 */
  requiredRole?: UserRole;
}

/**
 * 受保护的路由组件
 * 
 * 功能：
 * 1. 检查用户是否已登录
 * 2. 可选：检查用户是否具有指定角色权限
 * 
 * 重定向逻辑：
 * - 未登录 → 跳转到登录页
 * - 已登录但权限不足 → 跳转到禁止访问页
 * - 已登录且有权限 → 显示子组件
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  // 从 store 获取认证和权限检查方法
  const { isAuthenticated, hasAccess } = useAuthStore();

  // 检查是否已登录
  if (!isAuthenticated()) {
    // 未登录，重定向到登录页
    // replace 属性表示替换历史记录，防止用户后退回来
    return <Navigate to="/login" replace />;
  }

  // 如果指定了所需角色，检查权限
  if (requiredRole && !hasAccess(requiredRole)) {
    // 权限不足，重定向到禁止访问页
    return <Navigate to="/forbidden" replace />;
  }

  // 权限验证通过，渲染子组件
  return <>{children}</>;
};

/**
 * 会员专属路由组件属性接口
 */
interface MemberRouteProps {
  /** 子组件（会员专属页面） */
  children: React.ReactNode;
}

/**
 * 会员专属路由组件
 * 
 * 功能：
 * 1. 检查用户是否已登录
 * 2. 检查用户是否为有效会员
 * 
 * 重定向逻辑：
 * - 未登录 → 跳转到登录页
 * - 已登录但非会员 → 跳转到禁止访问页
 * - 有效会员 → 显示子组件
 */
const MemberRoute: React.FC<MemberRouteProps> = ({ children }) => {
  // 从 store 获取认证和会员检查方法
  const { isAuthenticated, isMember } = useAuthStore();

  // 检查是否已登录
  if (!isAuthenticated()) {
    // 未登录，重定向到登录页
    return <Navigate to="/login" replace />;
  }

  // 检查是否为有效会员
  if (!isMember()) {
    // 非会员，重定向到禁止访问页
    return <Navigate to="/forbidden" replace />;
  }

  // 权限验证通过，渲染子组件
  return <>{children}</>;
};

// ============================================================
// 主路由配置
// ============================================================

/**
 * 应用路由配置组件
 * 
 * 路由结构：
 * 1. 公开路由 - 所有用户可访问
 * 2. 认证路由 - 登录、注册页面
 * 3. 用户路由 - 需要登录才能访问
 * 4. 管理员路由 - 仅管理员可访问
 * 5. 错误页面 - 404、403 等
 */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* ==================== 公开路由 ==================== */}
      {/* 使用 MainLayout 作为布局的公开页面 */}
      <Route element={<MainLayout />}>
        {/* 首页 */}
        <Route path="/" element={<HomePage />} />
        {/* 知识点列表页 */}
        <Route path="/knowledge" element={<KnowledgePage />} />
        {/* 知识点详情页，:id 为动态参数 */}
        <Route path="/knowledge/:id" element={<KnowledgeDetailPage />} />
        {/* 编程题列表页 */}
        <Route path="/problems" element={<ProblemsPage />} />
        {/* 编程题详情页 */}
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        {/* 算法题列表页 */}
        <Route path="/algorithms" element={<AlgorithmsPage />} />
        {/* 算法题详情页 */}
        <Route path="/algorithms/:id" element={<AlgorithmDetailPage />} />
        {/* 在线 IDE 页面 */}
        <Route path="/ide" element={<IDEPage />} />
      </Route>

      {/* ==================== 认证路由 ==================== */}
      {/* 使用 AuthLayout 作为布局的认证页面 */}
      <Route element={<AuthLayout />}>
        {/* 登录页 */}
        <Route path="/login" element={<LoginPage />} />
        {/* 注册页 */}
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ==================== 需要登录的用户路由 ==================== */}
      {/* 使用 MainLayout 布局，但需要通过 ProtectedRoute 进行权限验证 */}
      <Route element={<MainLayout />}>
        {/* 用户个人资料页 */}
        <Route
          path="/profile"
          element={
            // 使用 ProtectedRoute 包装，确保用户已登录
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* 学习进度页 */}
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          }
        />
        {/* 错题记录页 */}
        <Route
          path="/wrong-records"
          element={
            <ProtectedRoute>
              <WrongRecordsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ==================== 管理员路由 ==================== */}
      {/* 管理员后台，需要 ADMIN 角色权限 */}
      <Route
        path="/admin"
        element={
          // 使用 ProtectedRoute 包装，并指定需要 ADMIN 角色
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            {/* 管理员专用布局 */}
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* 管理后台首页/仪表盘，index 表示默认子路由 */}
        <Route index element={<AdminDashboard />} />
        {/* 用户管理页 */}
        <Route path="users" element={<AdminUsers />} />
        {/* 内容管理页 */}
        <Route path="content" element={<AdminContent />} />
      </Route>

      {/* ==================== 错误页面 ==================== */}
      {/* 403 禁止访问页 */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      {/* 404 页面未找到，* 匹配所有未定义的路由 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// 导出路由配置组件
export default AppRouter;
