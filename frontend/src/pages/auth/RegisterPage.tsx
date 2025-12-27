/**
 * 注册页面组件
 * 提供用户注册表单和验证功能
 */

// 导入 React Hook
import { useState } from 'react';
// 导入路由相关组件和钩子
import { Link, useNavigate } from 'react-router-dom';
// 导入认证状态 Store
import { useAuthStore } from '@/store/authStore';
// 导入图标组件
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

/**
 * 注册页面组件
 * 包含完整的注册表单、多字段验证、密码确认等功能
 */
const RegisterPage: React.FC = () => {
  // 获取导航函数
  const navigate = useNavigate();
  // 从 authStore 获取注册方法和状态
  const { register, isLoading, error, clearError } = useAuthStore();

  // -------------------- 组件状态 --------------------
  
  /**
   * 表单数据状态
   */
  const [formData, setFormData] = useState({
    email: '',           // 邮箱
    password: '',        // 密码
    confirmPassword: '', // 确认密码
    nickname: '',        // 昵称
    phone: '',           // 手机号（可选）
    agreeTerms: false,   // 同意服务条款
  });
  
  /** 密码可见性状态 */
  const [showPassword, setShowPassword] = useState(false);
  /** 确认密码可见性状态 */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  /** 表单验证错误 */
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // -------------------- 表单验证 --------------------
  
  /**
   * 验证表单数据
   * @returns 验证是否通过
   */
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // 验证邮箱
    if (!formData.email) {
      errors.email = '请输入邮箱';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }
    
    // 验证密码：长度和复杂度
    if (!formData.password) {
      errors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      errors.password = '密码至少6个字符';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = '密码需要包含字母和数字';
    }
    
    // 验证确认密码
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }
    
    // 验证昵称
    if (!formData.nickname) {
      errors.nickname = '请输入昵称';
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      errors.nickname = '昵称长度需要在2-20个字符之间';
    }
    
    // 验证手机号（可选，但如果填写需要验证格式）
    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      errors.phone = '请输入有效的手机号';
    }
    
    // 验证服务条款
    if (!formData.agreeTerms) {
      errors.agreeTerms = '请阅读并同意服务条款';
    }
    
    setFormErrors(errors);
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
      // 调用注册方法
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        phone: formData.phone || undefined,  // 空字符串转为 undefined
      });
      // 注册成功，跳转到首页（注册后自动登录）
      navigate('/');
    } catch (err) {
      // 错误已经在 store 中处理
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
      [name]: type === 'checkbox' ? checked : value,
    }));
    // 清除对应字段的验证错误
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    // 清除全局错误
    if (error) clearError();
  };

  return (
    // 动画容器：淡入效果
    <div className="animate-fade-in">
      {/* 页面标题 */}
      <h2 className="text-3xl font-bold text-dark-100 mb-2">创建账号</h2>
      <p className="text-dark-400 mb-8">开始你的前端面试备战之旅</p>

      {/* 注册表单 */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* -------------------- 全局错误提示 -------------------- */}
        {error && (
          <div className="p-4 bg-danger-500/10 border border-danger-500/30 rounded-lg">
            <p className="text-danger-500 text-sm">{error}</p>
          </div>
        )}

        {/* -------------------- 邮箱输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            邮箱 <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
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
          {formErrors.email && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.email}</p>
          )}
        </div>

        {/* -------------------- 昵称输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            昵称 <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="请输入昵称"
              className={`input pl-12 ${formErrors.nickname ? 'input-error' : ''}`}
            />
          </div>
          {formErrors.nickname && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.nickname}</p>
          )}
        </div>

        {/* -------------------- 密码输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            密码 <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码（至少6位，包含字母和数字）"
              className={`input pl-12 pr-12 ${formErrors.password ? 'input-error' : ''}`}
            />
            {/* 密码可见性切换 */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.password}</p>
          )}
        </div>

        {/* -------------------- 确认密码输入框 -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            确认密码 <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="请再次输入密码"
              className={`input pl-12 pr-12 ${formErrors.confirmPassword ? 'input-error' : ''}`}
            />
            {/* 确认密码可见性切换 */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.confirmPassword}</p>
          )}
        </div>

        {/* -------------------- 手机号输入框（可选） -------------------- */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            手机号 <span className="text-dark-500">（可选）</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="请输入手机号"
              className={`input pl-12 ${formErrors.phone ? 'input-error' : ''}`}
            />
          </div>
          {formErrors.phone && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.phone}</p>
          )}
        </div>

        {/* -------------------- 服务条款复选框 -------------------- */}
        <div>
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4 mt-0.5 rounded border-dark-600 bg-dark-800 
                       text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-dark-400">
              我已阅读并同意{' '}
              <button type="button" className="text-primary-400 hover:text-primary-300">
                服务条款
              </button>{' '}
              和{' '}
              <button type="button" className="text-primary-400 hover:text-primary-300">
                隐私政策
              </button>
            </span>
          </label>
          {formErrors.agreeTerms && (
            <p className="mt-1 text-sm text-danger-500">{formErrors.agreeTerms}</p>
          )}
        </div>

        {/* -------------------- 注册按钮 -------------------- */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base disabled:opacity-50"
        >
          {isLoading ? (
            // 加载状态
            <span className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              注册中...
            </span>
          ) : (
            '立即注册'
          )}
        </button>

        {/* -------------------- 登录入口 -------------------- */}
        <p className="text-center text-dark-400">
          已有账号？{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            立即登录
          </Link>
        </p>
      </form>
    </div>
  );
};

// 导出注册页面组件
export default RegisterPage;
