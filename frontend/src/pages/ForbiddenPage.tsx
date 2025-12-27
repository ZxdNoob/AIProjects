/**
 * 403 禁止访问页面组件
 * 当用户没有权限访问某个页面时显示
 */

// 导入路由相关组件和钩子
import { Link, useNavigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入图标组件
import { Lock, Crown, ArrowLeft, Home } from 'lucide-react';

/**
 * 禁止访问页面组件
 * 根据用户状态显示不同的提示内容：
 * - 未登录：提示登录
 * - 已登录但非会员：提示开通会员
 * - 其他情况：显示通用权限不足提示
 */
const ForbiddenPage: React.FC = () => {
  // 获取导航函数
  const navigate = useNavigate();
  // 获取认证检查方法
  const { isAuthenticated, isMember } = useAuthStore();

  return (
    // 页面容器：全屏高度，居中显示
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        
        {/* 锁图标：警告色背景 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-warning-500/20 
                      flex items-center justify-center">
          <Lock className="w-12 h-12 text-warning-500" />
        </div>
        
        {/* 错误标题 */}
        <h1 className="text-3xl font-bold text-dark-100 mb-4">访问受限</h1>
        
        {/* 根据用户状态显示不同内容 */}
        {!isAuthenticated() ? (
          // ==================== 未登录状态 ====================
          <>
            <p className="text-dark-400 mb-8">
              请先登录后访问此内容
            </p>
            {/* 登录/注册按钮 */}
            <div className="flex justify-center space-x-4">
              <Link to="/login" className="btn-primary">
                立即登录
              </Link>
              <Link to="/register" className="btn-secondary">
                免费注册
              </Link>
            </div>
          </>
        ) : !isMember() ? (
          // ==================== 非会员状态 ====================
          <>
            <p className="text-dark-400 mb-6">
              此内容需要会员权限才能访问
            </p>
            
            {/* 会员升级提示卡片 */}
            <div className="p-6 bg-gradient-to-br from-accent-900/30 to-primary-900/30 
                          rounded-xl border border-accent-500/30 mb-8">
              {/* 皇冠图标 */}
              <Crown className="w-10 h-10 mx-auto mb-4 text-accent-400" />
              <h3 className="text-lg font-semibold text-dark-100 mb-2">
                开通会员解锁更多
              </h3>
              {/* 会员权益列表 */}
              <ul className="text-sm text-dark-400 space-y-2 mb-4 text-left">
                <li>✨ 全部高级知识点</li>
                <li>💻 50 道编程题 + 解析</li>
                <li>🎬 30 道算法动画</li>
                <li>☁️ 云端代码备份</li>
              </ul>
              {/* 开通按钮 */}
              <Link to="/profile" className="btn-accent w-full">
                立即开通 ¥99/月
              </Link>
            </div>
          </>
        ) : (
          // ==================== 其他权限不足情况 ====================
          <p className="text-dark-400 mb-8">
            您没有权限访问此页面
          </p>
        )}

        {/* 导航按钮：返回上页和返回首页 */}
        <div className="flex justify-center space-x-4">
          {/* 返回上页：使用 navigate(-1) 回退历史 */}
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回上页</span>
          </button>
          {/* 返回首页 */}
          <Link to="/" className="btn-ghost flex items-center space-x-2">
            <Home className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// 导出禁止访问页面组件
export default ForbiddenPage;
