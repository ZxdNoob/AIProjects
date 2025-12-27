/**
 * 404 页面未找到组件
 * 当用户访问不存在的路由时显示
 */

// 导入路由链接组件
import { Link } from 'react-router-dom';
// 导入图标组件
import { Home, ArrowLeft } from 'lucide-react';

/**
 * 404 页面组件
 * 展示友好的错误提示和导航选项
 */
const NotFoundPage: React.FC = () => {
  return (
    // 页面容器：全屏高度，居中显示
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 大字：渐变色效果 */}
        <div className="text-9xl font-bold text-gradient mb-4">404</div>
        
        {/* 错误标题 */}
        <h1 className="text-3xl font-bold text-dark-100 mb-4">页面不存在</h1>
        
        {/* 错误说明 */}
        <p className="text-dark-400 mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
        
        {/* 导航按钮组 */}
        <div className="flex justify-center space-x-4">
          {/* 返回首页按钮 */}
          <Link to="/" className="btn-primary flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
          
          {/* 返回上页按钮：使用浏览器历史 */}
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回上页</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 导出 404 页面组件
export default NotFoundPage;
