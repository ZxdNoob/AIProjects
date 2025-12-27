/**
 * 登录页面组件
 * 提供用户登录表单和验证功能
 */

// 导入 React Hook
import { useState } from 'react';
// 导入路由相关组件和钩子
import { Link, useNavigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入图标组件
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

/**
 * 登录页面组件
 * 包含邮箱密码表单、验证、错误处理等功能
 */
const LoginPage: React.FC = () => {
  // 获取导航函数
  const navigate = useNavigate();
  // 从 authStore 获取登录方法和状态
  const { login, isLoading, error, clearError } = useAuthStore();

  // -------------------- 组件状态 --------------------
  
  /**
   * 表单数据状态
   */
  const [formData, setFormData] = useState({
    email: '',           // 邮箱
    password: '',        // 密码
    rememberMe: false,   // 记住我
  });
  
  /** 密码可见性状态 */
  const [showPassword, setShowPassword] = useState(false);
  
  /** 表单验证错误 */
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  // -------------------- 表单验证 --------------------
  
  /**
   * 验证表单数据
   * @returns 验证是否通过
   */
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    // 验证邮箱
    if (!formData.email) {
      errors.email = '请输入邮箱';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    // 验证密码
    if (!formData.password) {
      errors.password = '请输入密码';
    }
    
    setFormErrors(errors);
    // 返回是否无错误
    return Object.keys(errors).length === 0;
  };

  // -------------------- 事件处理 --------------------
  
  /**
   * 处理表单提交
   * @param e - 表单事件
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // 阻止默认提交行为
    e.preventDefault();
    // 清除之前的错误
    clearError();
    
    // 验证表单
    if (!validateForm()) return;

    try {
      // 调用登录方法
      await login(formData.email, formData.password);
      // 登录成功，跳转到首页
      navigate('/');
    } catch (err) {
      // 错误已经在 store 中处理，这里不需要额外处理
    }
  };

  /**
   * 处理输入框变化
   * @param e - 输入事件
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // 更新表单数据
    setFormData(prev => ({
      ...prev,
      // checkbox 使用 checked，其他使用 value
      [name]: type === 'checkbox' ? checked : value,
    }));
    // 清除对应字段的验证错误
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    // 清除全局错误
    if (error) clearError();
  };

  return (
    // 动画容器：淡入效果
    <div className="animate-fade-in">
      {/* 页面标题 */}
      <h2 className="text-3xl font-bold text-dark-100 mb-2">欢迎回来</h2>
      <p className="text-dark-400 mb-8">登录继续你的学习之旅</p>

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* -------------------- 全局错误提示 -------------------- */}
        {error && (
          <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg">
            <p className="text-danger-500 text-sm">{error}</p>
          </div>
        )}

        {/* -------------------- 邮箱输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            邮箱
          </label>
          <div className="relative">
            {/* 邮箱图标 */}
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              className={`input pl-12 ${formErrors.email ? 'input-error' : ''}`}
            />
          </div>
          {/* 邮箱错误提示 */}
          {formErrors.email && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.email}</p>
          )}
        </div>

        {/* -------------------- 密码输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            密码
          </label>
          <div className="relative">
            {/* 锁图标 */}
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              // 根据 showPassword 切换类型
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              className={`input pl-12 pr-12 ${formErrors.password ? 'input-error' : ''}`}
            />
            {/* 密码可见性切换按钮 */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {/* 密码错误提示 */}
          {formErrors.password && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.password}</p>
          )}
        </div>

        {/* -------------------- 记住我 & 忘记密码 -------------------- */}
        <div className="flex items-center justify-between">
          {/* 记住我复选框 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-dark-600 bg-dark-800 
                       text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-dark-400">记住我</span>
          </label>
          {/* 忘记密码链接 */}
          <button type="button" className="text-sm text-primary-400 hover:text-primary-300">
            忘记密码？
          </button>
        </div>

        {/* -------------------- 登录按钮 -------------------- */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base disabled:opacity-50"
        >
          {isLoading ? (
            // 加载状态
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </button>

        {/* -------------------- 注册入口 -------------------- */}
        <p className="text-center text-dark-400">
          还没有账号？{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            立即注册
          </Link>
        </p>
      </form>

      {/* -------------------- 测试账号提示 -------------------- */}
      <div className="mt-8 p-4 bg-dark-800/50 border border-dark-700 rounded-lg">
        <p className="text-sm text-dark-400 mb-2">测试账号：</p>
        <div className="space-y-1 text-sm text-dark-500">
          <p>管理员: admin@frontendprephub.com / Admin@123456</p>
          <p>普通用户: user@test.com / Test@123456</p>
          <p>会员用户: member@test.com / Test@123456</p>
        </div>
      </div>
    </div>
  );
};

// 导出登录页面组件
export default LoginPage;
