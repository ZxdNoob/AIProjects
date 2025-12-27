/**
 * 管理后台布局组件
 * 用于管理员后台的专用布局
 * 特点：左侧固定侧边栏 + 右侧主内容区
 */

// 导入 React Router 相关组件和钩子
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入图标组件
import {
  LayoutDashboard,  // 仪表盘图标
  Users,            // 用户图标
  FileText,         // 文件图标（内容管理）
  Settings,         // 设置图标
  LogOut,           // 退出图标
  ChevronLeft,      // 左箭头图标（返回）
  Code2,            // 代码图标（Logo）
} from 'lucide-react';

/**
 * 管理后台布局组件
 * 提供管理后台的整体框架结构
 */
const AdminLayout: React.FC = () => {
  // 从 authStore 获取用户信息和登出方法
  const { user, logout } = useAuthStore();
  // 获取当前路由位置
  const location = useLocation();
  // 获取导航函数
  const navigate = useNavigate();

  /**
   * 侧边栏菜单配置
   * 定义管理后台的导航菜单项
   */
  const menuItems = [
    { 
      path: '/admin',           // 路由路径
      label: '仪表盘',          // 显示文本
      icon: LayoutDashboard,    // 图标组件
      exact: true               // 是否精确匹配（仅 /admin，不匹配子路由）
    },
    { 
      path: '/admin/users',     // 用户管理路由
      label: '用户管理', 
      icon: Users 
    },
    { 
      path: '/admin/content',   // 内容管理路由
      label: '内容管理', 
      icon: FileText 
    },
  ];

  /**
   * 判断菜单项是否激活
   * @param path - 菜单路径
   * @param exact - 是否精确匹配
   * @returns 是否激活
   */
  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      // 精确匹配：路径必须完全相同
      return location.pathname === path;
    }
    // 前缀匹配：路径以指定值开头即可
    return location.pathname.startsWith(path);
  };

  /**
   * 处理退出登录
   * 清除用户状态并跳转到首页
   */
  const handleLogout = () => {
    logout();        // 调用 store 的 logout 方法
    navigate('/');   // 跳转到首页
  };

  return (
    // 页面容器：全屏高度，深色背景，flex 横向布局
    <div className="min-h-screen bg-dark-950 flex">
      
      {/* ==================== 左侧侧边栏 ==================== */}
      {/* 固定宽度 256px，深色背景，右边框 */}
      <aside className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        
        {/* -------------------- Logo 区域 -------------------- */}
        <div className="p-6 border-b border-dark-800">
          <Link to="/" className="flex items-center space-x-3">
            {/* Logo 图标 */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                          flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            {/* Logo 文字 */}
            <div>
              <h1 className="text-lg font-bold text-dark-100">管理后台</h1>
              <p className="text-xs text-dark-400">FrontendPrepHub</p>
            </div>
          </Link>
        </div>

        {/* -------------------- 导航菜单 -------------------- */}
        {/* flex-1: 占据剩余空间 */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                ${isActive(item.path, item.exact)
                  ? 'bg-primary-500/20 text-primary-300 shadow-lg shadow-primary-500/10'  // 激活状态
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800'  // 默认状态
                }`}
            >
              {/* 动态渲染图标组件 */}
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* -------------------- 底部区域 -------------------- */}
        <div className="p-4 border-t border-dark-800 space-y-3">
          
          {/* 返回前台链接 */}
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 text-dark-400 
                     hover:text-dark-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>返回前台</span>
          </Link>
          
          {/* 用户信息卡片 */}
          <div className="flex items-center space-x-3 px-4 py-3 bg-dark-800 rounded-lg">
            {/* 用户头像：渐变背景，显示首字母 */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
                          flex items-center justify-center text-white font-medium">
              {user?.nickname?.charAt(0).toUpperCase()}
            </div>
            {/* 用户信息 */}
            <div className="flex-1 min-w-0">
              {/* truncate: 文本超出时显示省略号 */}
              <p className="text-sm font-medium text-dark-100 truncate">
                {user?.nickname}
              </p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* 退出登录按钮 */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 w-full
                     text-danger-500 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* ==================== 右侧主内容区 ==================== */}
      {/* flex-1: 占据剩余宽度 */}
      <div className="flex-1 flex flex-col">
        
        {/* -------------------- 顶栏 -------------------- */}
        <header className="h-16 bg-dark-900/50 border-b border-dark-800 flex items-center px-6">
          {/* 动态显示当前页面标题 */}
          <h2 className="text-lg font-medium text-dark-100">
            {/* 查找当前激活的菜单项的标签，找不到则显示默认文本 */}
            {menuItems.find((item) => isActive(item.path, item.exact))?.label ||
              '管理后台'}
          </h2>
        </header>

        {/* -------------------- 内容区域 -------------------- */}
        {/* flex-1: 占据剩余高度 */}
        {/* overflow-auto: 内容超出时显示滚动条 */}
        <main className="flex-1 p-6 overflow-auto">
          {/* 渲染匹配的子路由组件 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// 导出管理后台布局组件
export default AdminLayout;
