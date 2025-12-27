import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api';
import { UserRole } from '@/types';
import { User, Mail, Phone, Crown, Calendar, Shield, Loader2, Check } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await authApi.updateProfile(formData);
      if (response.success && response.data) {
        updateUser(response.data.user);
        setEditing(false);
        setMessage({ type: 'success', text: '保存成功' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeMember = async () => {
    try {
      const response = await authApi.upgradeMember(30);
      if (response.success && response.data) {
        updateUser({
          role: response.data.role as UserRole,
          memberExpireAt: response.data.memberExpireAt,
        });
        setMessage({ type: 'success', text: '会员开通成功！' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '开通失败' });
    }
  };

  const getRoleBadge = () => {
    if (user?.role === UserRole.ADMIN) {
      return (
        <span className="badge flex items-center space-x-1 bg-danger-500/20 text-danger-500">
          <Shield className="w-3 h-3" />
          <span>管理员</span>
        </span>
      );
    }
    if (user?.role === UserRole.MEMBER) {
      return (
        <span className="badge flex items-center space-x-1 bg-accent-500/20 text-accent-300">
          <Crown className="w-3 h-3" />
          <span>会员</span>
        </span>
      );
    }
    return (
      <span className="badge bg-dark-700 text-dark-400">普通用户</span>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-dark-100 mb-8">个人中心</h1>

      {/* 消息提示 */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-success-500/10 text-success-500'
              : 'bg-danger-500/10 text-danger-500'
          }`}
        >
          {message.type === 'success' && <Check className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 用户信息卡片 */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
                          flex items-center justify-center text-white text-3xl font-bold">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-dark-100">{user.nickname}</h2>
                {getRoleBadge()}
              </div>
              <p className="text-dark-400 mt-1">{user.email}</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary btn-sm"
            >
              编辑资料
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">昵称</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">手机号</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '保存'
                )}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({ nickname: user.nickname, phone: user.phone || '' });
                }}
                className="btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-dark-900/50 rounded-lg">
              <Mail className="w-5 h-5 text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">邮箱</p>
                <p className="text-dark-200">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-dark-900/50 rounded-lg">
              <Phone className="w-5 h-5 text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">手机号</p>
                <p className="text-dark-200">{user.phone || '未设置'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-dark-900/50 rounded-lg">
              <Calendar className="w-5 h-5 text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">注册时间</p>
                <p className="text-dark-200">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-dark-900/50 rounded-lg">
              <User className="w-5 h-5 text-dark-500" />
              <div>
                <p className="text-xs text-dark-500">登录次数</p>
                <p className="text-dark-200">{user.loginCount || 0} 次</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 会员状态 */}
      {user.role !== UserRole.ADMIN && (
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">会员状态</h3>
          {user.role === UserRole.MEMBER ? (
            <div>
              <div className="flex items-center space-x-2 text-accent-300 mb-4">
                <Crown className="w-5 h-5" />
                <span>当前为会员用户</span>
              </div>
              {user.memberExpireAt && (
                <p className="text-dark-400">
                  有效期至：{new Date(user.memberExpireAt).toLocaleDateString()}
                </p>
              )}
              <button className="btn-accent mt-4">续费会员</button>
            </div>
          ) : (
            <div>
              <p className="text-dark-400 mb-4">
                开通会员即可解锁全部知识点、编程题和算法动画
              </p>
              <ul className="space-y-2 mb-6 text-sm text-dark-400">
                <li>✨ 80+ 高级知识点解锁</li>
                <li>💻 50 道编程题 + 答案解析</li>
                <li>🎬 30 道算法动画演示</li>
                <li>☁️ 云端代码备份</li>
              </ul>
              <button onClick={handleUpgradeMember} className="btn-accent">
                立即开通 ¥99/月
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

