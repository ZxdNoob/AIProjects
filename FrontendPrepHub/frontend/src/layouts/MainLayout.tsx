/**
 * 主布局组件
 * 用于大部分页面的通用布局，包含顶部导航栏、内容区和底部
 */

// 导入 React Router 相关组件和钩子
// Outlet: 渲染子路由
// Link: 声明式导航
// useNavigate: 编程式导航
// useLocation: 获取当前路由信息
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入图标组件（来自 lucide-react）
import {
  Code2,       // 代码图标（Logo）
  BookOpen,    // 书本图标（知识学习）
  Cpu,         // CPU 图标（IDE）
  PlayCircle,  // 播放图标（算法动画）
  User,        // 用户图标
  LogOut,      // 退出图标
  Menu,        // 菜单图标（移动端）
  X,           // 关闭图标（移动端）
  Crown,       // 皇冠图标（会员标识）
  Shield,      // 盾牌图标（管理员）
} from 'lucide-react';
// 导入 useState Hook
import { useState } from 'react';

/**
 * 主布局组件
 * 提供统一的页面结构：顶部导航 + 内容区 + 底部
 */
const MainLayout: React.FC = () => {
  // 从 authStore 获取用户信息和认证方法
  const { user, isAuthenticated, isMember, isAdmin, logout } = useAuthStore();
  // 获取导航函数
  const navigate = useNavigate();
  // 获取当前路由位置
  const location = useLocation();
  // 移动端菜单展开状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * 导航菜单配置
   * 定义主要的导航项目
   */
  const navItems = [
    { path: '/knowledge', label: '知识学习', icon: BookOpen },  // 知识点模块
    { path: '/problems', label: '编程题库', icon: Code2 },      // 编程题模块
    { path: '/algorithms', label: '算法动画', icon: PlayCircle }, // 算法题模块
    { path: '/ide', label: '在线 IDE', icon: Cpu },              // 在线编辑器
  ];

  /**
   * 处理退出登录
   * 清除用户状态并跳转到首页
   */
  const handleLogout = () => {
    logout();        // 调用 store 的 logout 方法
    navigate('/');   // 跳转到首页
  };

  /**
   * 判断导航项是否激活
   * @param path - 导航路径
   * @returns 是否激活
   */
  const isActive = (path: string) => {
    // 完全匹配或前缀匹配（处理子路由）
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    // 页面容器：最小高度全屏，深色背景，flex 布局
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* ==================== 顶部导航栏 ==================== */}
      {/* sticky: 粘性定位，滚动时固定在顶部 */}
      {/* glass: 玻璃态效果（半透明 + 模糊） */}
      <header className="sticky top-0 z-50 glass border-b border-dark-700/50">
        {/* 内容容器：最大宽度限制 + 水平内边距 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 导航栏内容：flex 布局，垂直居中，两端对齐 */}
          <div className="flex items-center justify-between h-16">
            
            {/* -------------------- Logo -------------------- */}
            <Link to="/" className="flex items-center space-x-3 group">
              {/* Logo 图标容器：渐变背景 + 阴影 */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                            flex items-center justify-center shadow-lg shadow-primary-500/20
                            group-hover:shadow-xl group-hover:shadow-primary-500/30 transition-all">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              {/* Logo 文字：渐变色，小屏隐藏 */}
              <span className="text-xl font-bold text-gradient hidden sm:block">
                FrontendPrepHub
              </span>
            </Link>

            {/* -------------------- 桌面端导航菜单 -------------------- */}
            {/* hidden md:flex: 小屏隐藏，中屏及以上显示 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                    ${isActive(item.path)
                      ? 'bg-primary-500/20 text-primary-300'  // 激活状态样式
                      : 'text-dark-300 hover:text-dark-100 hover:bg-dark-800'  // 默认状态样式
                    }`}
                >
                  {/* 动态渲染图标组件 */}
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* -------------------- 用户区域（桌面端） -------------------- */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 根据登录状态渲染不同内容 */}
              {isAuthenticated() ? (
                // 已登录：显示用户信息和菜单
                <div className="flex items-center space-x-3">
                  {/* 会员标识：仅会员显示 */}
                  {isMember() && (
                    <span className="badge-accent flex items-center space-x-1">
                      <Crown className="w-3 h-3" />
                      <span>会员</span>
                    </span>
                  )}
                  
                  {/* 管理员入口：仅管理员显示 */}
                  {isAdmin() && (
                    <Link
                      to="/admin"
                      className="btn-ghost text-sm flex items-center space-x-1"
                    >
                      <Shield className="w-4 h-4" />
                      <span>管理后台</span>
                    </Link>
                  )}
                  
                  {/* 用户下拉菜单 */}
                  <div className="relative group">
                    {/* 触发按钮：用户头像和昵称 */}
                    <button className="flex items-center space-x-2 p-2 rounded-lg
                                     hover:bg-dark-800 transition-colors">
                      {/* 用户头像：渐变背景，显示首字母 */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
                                    flex items-center justify-center text-white text-sm font-medium">
                        {user?.nickname?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark-200">{user?.nickname}</span>
                    </button>
                    
                    {/* 下拉菜单：悬停时显示 */}
                    <div className="absolute right-0 top-full mt-2 w-48 py-2 
                                  bg-dark-800 border border-dark-700 rounded-lg shadow-xl
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200 transform origin-top-right">
                      {/* 个人中心链接 */}
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 
                                 text-dark-300 hover:text-dark-100 hover:bg-dark-700"
                      >
                        <User className="w-4 h-4" />
                        <span>个人中心</span>
                      </Link>
                      {/* 学习进度链接 */}
                      <Link
                        to="/learning"
                        className="flex items-center space-x-2 px-4 py-2 
                                 text-dark-300 hover:text-dark-100 hover:bg-dark-700"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>学习进度</span>
                      </Link>
                      {/* 分隔线 */}
                      <div className="divider my-2" />
                      {/* 退出登录按钮 */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 w-full
                                 text-danger-500 hover:bg-dark-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // 未登录：显示登录和注册按钮
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-ghost">
                    登录
                  </Link>
                  <Link to="/register" className="btn-primary">
                    免费注册
                  </Link>
                </div>
              )}
            </div>

            {/* -------------------- 移动端菜单按钮 -------------------- */}
            {/* md:hidden: 中屏及以上隐藏 */}
            <button
              className="md:hidden p-2 text-dark-300 hover:text-dark-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* 根据状态显示不同图标 */}
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />  // 关闭图标
              ) : (
                <Menu className="w-6 h-6" />  // 菜单图标
              )}
            </button>
          </div>
        </div>

        {/* -------------------- 移动端展开菜单 -------------------- */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {/* 导航链接列表 */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}  // 点击后关闭菜单
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg
                    ${isActive(item.path)
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-dark-300 hover:bg-dark-800'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* 分隔线 */}
              <div className="divider my-4" />
              
              {/* 根据登录状态显示不同内容 */}
              {isAuthenticated() ? (
                // 已登录：显示个人中心和退出
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-dark-300 hover:bg-dark-800 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    <span>个人中心</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-danger-500 hover:bg-dark-800 rounded-lg w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </button>
                </>
              ) : (
                // 未登录：显示登录和注册按钮
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center"
                  >
                    免费注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ==================== 主内容区 ==================== */}
      {/* flex-1: 占据剩余空间 */}
      <main className="flex-1">
        {/* Outlet: 渲染匹配的子路由组件 */}
        <Outlet />
      </main>

      {/* ==================== 底部 ==================== */}
      {/* mt-auto: 自动上边距，确保底部始终在最下方 */}
      <footer className="border-t border-dark-800 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 底部内容：响应式布局 */}
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo 和名称 */}
            <div className="flex items-center space-x-2 text-dark-400">
              <Code2 className="w-5 h-5" />
              <span>FrontendPrepHub</span>
            </div>
            {/* 版权信息 */}
            <p className="text-dark-500 text-sm">
              专业的前端面试备战平台 · 助你拿下心仪 Offer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 导出主布局组件
export default MainLayout;
