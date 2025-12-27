/**
 * 认证布局组件
 * 用于登录和注册页面的专用布局
 * 特点：左侧装饰区 + 右侧表单区的分屏设计
 */

// 导入 React Router 相关组件
// Outlet: 渲染子路由（登录/注册表单）
// Link: 声明式导航
// Navigate: 编程式重定向
import { Outlet, Link, Navigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入代码图标
import { Code2 } from 'lucide-react';

/**
 * 认证布局组件
 * 提供登录和注册页面的视觉框架
 */
const AuthLayout: React.FC = () => {
  // 从 authStore 获取认证检查方法
  const { isAuthenticated } = useAuthStore();

  /**
   * 已登录用户重定向
   * 如果用户已登录，直接跳转到首页
   * replace: 替换历史记录，防止后退回到登录页
   */
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    // 页面容器：全屏高度，深色背景，flex 布局
    <div className="min-h-screen bg-dark-950 flex">
      
      {/* ==================== 左侧装饰区 ==================== */}
      {/* hidden lg:flex: 小屏隐藏，大屏显示 */}
      {/* lg:w-1/2: 大屏占一半宽度 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        
        {/* -------------------- 背景渐变 -------------------- */}
        {/* 从左上到右下的渐变：主色 → 深色 → 强调色 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-dark-900 to-accent-900/50" />
        
        {/* -------------------- 网格背景图案 -------------------- */}
        {/* 半透明的网格图案，增加视觉层次 */}
        <div className="absolute inset-0 bg-mesh-pattern opacity-30" />
        
        {/* -------------------- 光晕效果 -------------------- */}
        {/* 两个大圆形模糊光晕，营造氛围 */}
        {/* 左上角：主色光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        {/* 右下角：强调色光晕 */}
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
        
        {/* -------------------- 内容区 -------------------- */}
        {/* relative z-10: 确保内容在背景之上 */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="max-w-md text-center">
            
            {/* Logo 图标 */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 
                          flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            
            {/* 标题：渐变文字效果 */}
            <h1 className="text-4xl font-bold text-gradient mb-4">
              FrontendPrepHub
            </h1>
            
            {/* 副标题 */}
            <p className="text-xl text-dark-300 mb-8">
              专业的前端面试备战平台
            </p>
            
            {/* 特性列表 */}
            <div className="space-y-4 text-left">
              {/* 定义平台特性数组，使用 emoji 增加视觉吸引力 */}
              {[
                '✨ 80+ 高频面试知识点',   // 知识点数量
                '💻 50 道经典手写题',       // 编程题数量
                '🎬 30 道算法动画演示',     // 算法题数量
                '📊 个性化学习进度跟踪',   // 学习追踪功能
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-dark-200 animate-fade-in"
                  // 交错动画延迟，形成依次出现的效果
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 右侧表单区 ==================== */}
      {/* w-full lg:w-1/2: 小屏全宽，大屏半宽 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* -------------------- 移动端 Logo -------------------- */}
          {/* lg:hidden: 大屏隐藏（因为左侧装饰区已有 Logo） */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              {/* Logo 图标 */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 
                            flex items-center justify-center shadow-lg">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              {/* Logo 文字 */}
              <span className="text-2xl font-bold text-gradient">
                FrontendPrepHub
              </span>
            </Link>
          </div>

          {/* 渲染子路由（登录或注册表单） */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// 导出认证布局组件
export default AuthLayout;
