import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { User, UserRole } from '@/types';
import { Search, MoreVertical, Shield, Crown, User as UserIcon, Loader2 } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        page: pagination.page,
        limit: 20,
      });
      if (response.success && response.data) {
        setUsers(response.data.items);
        setPagination({
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await adminApi.updateUserStatus(userId, isActive);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4 text-danger-500" />;
      case UserRole.MEMBER:
        return <Crown className="w-4 h-4 text-accent-400" />;
      default:
        return <UserIcon className="w-4 h-4 text-dark-400" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <span className="badge bg-danger-500/20 text-danger-500">管理员</span>;
      case UserRole.MEMBER:
        return <span className="badge bg-accent-500/20 text-accent-300">会员</span>;
      default:
        return <span className="badge bg-dark-700 text-dark-400">普通用户</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-100">用户管理</h1>
        <span className="text-dark-400">共 {pagination.total} 位用户</span>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户..."
            className="input pl-12"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-full sm:w-40"
        >
          <option value="">全部角色</option>
          <option value="user">普通用户</option>
          <option value="member">会员</option>
          <option value="admin">管理员</option>
        </select>
      </div>

      {/* 用户列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-dark-800/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">用户</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">角色</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">状态</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">注册时间</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-dark-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500
                                    flex items-center justify-center text-white font-medium">
                        {user.nickname?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-dark-100 font-medium">{user.nickname}</p>
                        <p className="text-dark-500 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs
                        ${user.isActive !== false
                          ? 'bg-success-500/20 text-success-500'
                          : 'bg-danger-500/20 text-danger-500'
                        }`}
                    >
                      {user.isActive !== false ? '正常' : '已禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-400 text-sm">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                        className="input py-1 text-sm w-28"
                      >
                        <option value="user">普通用户</option>
                        <option value="member">会员</option>
                        <option value="admin">管理员</option>
                      </select>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive === false)}
                        className={`btn-sm ${
                          user.isActive !== false ? 'btn-danger' : 'btn-secondary'
                        }`}
                      >
                        {user.isActive !== false ? '禁用' : '启用'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPagination({ ...pagination, page })}
              className={`px-4 py-2 rounded-lg transition-colors
                ${pagination.page === page
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700'
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

