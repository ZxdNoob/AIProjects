/**
 * 保存/加载面板组件
 * 用于管理云端项目的保存和加载
 */

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  FolderOpen,
  Trash2,
  Clock,
  Code2,
  AlertCircle,
  Loader2,
  Cloud,
  CloudOff,
  FileCode,
  Search,
} from 'lucide-react';
import { userCodeApi } from '@/services/api';
import { UserCode } from '@/types';

// ============================================================
// 类型定义
// ============================================================

interface SaveLoadPanelProps {
  /** 面板类型 */
  mode: 'save' | 'load';
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 保存成功回调 */
  onSave?: (name: string, description: string) => void;
  /** 加载项目回调 */
  onLoad?: (project: UserCode) => void;
  /** 当前项目名称 */
  currentName?: string;
  /** 当前项目描述 */
  currentDescription?: string;
}

// ============================================================
// 主组件
// ============================================================

const SaveLoadPanel: React.FC<SaveLoadPanelProps> = ({
  mode,
  isOpen,
  onClose,
  onSave,
  onLoad,
  currentName = '',
  currentDescription = '',
}) => {
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription);
  const [projects, setProjects] = useState<UserCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<UserCode | null>(null);

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription);
      setError(null);
      setSelectedProject(null);
      setSearchQuery('');
      
      if (mode === 'load') {
        loadProjects();
      }
    }
  }, [isOpen, mode, currentName, currentDescription]);

  // 加载项目列表
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userCodeApi.getList({ limit: 50 });
      if (response.success && response.data) {
        setProjects(response.data.items);
      }
    } catch (err: any) {
      setError(err.message || '加载项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存项目
  const handleSave = async () => {
    if (!name.trim()) {
      setError('请输入项目名称');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      onSave?.(name.trim(), description.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 加载项目
  const handleLoad = () => {
    if (selectedProject) {
      onLoad?.(selectedProject);
      onClose();
    }
  };

  // 删除项目
  const handleDelete = async (projectId: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      await userCodeApi.delete(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
      }
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  // 过滤项目
  const filteredProjects = projects.filter(p =>
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            {mode === 'save' ? (
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Cloud className="w-5 h-5 text-green-400" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-400" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">
                {mode === 'save' ? '保存到云端' : '从云端加载'}
              </h2>
              <p className="text-xs text-dark-400">
                {mode === 'save' ? '将项目保存到你的账户' : '选择一个项目加载'}
              </p>
            </div>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 错误提示 */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {mode === 'save' ? (
            /* 保存表单 */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  项目名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="给你的项目起个名字"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  项目描述
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简单描述一下这个项目（可选）"
                  rows={3}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                    ${saving
                      ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/20'
                    }
                  `}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>保存项目</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* 加载列表 */
            <div className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索项目..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* 项目列表 */}
              <div className="max-h-80 overflow-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-dark-400">
                    <CloudOff className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-sm">
                      {searchQuery ? '没有找到匹配的项目' : '暂无保存的项目'}
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      className={`
                        relative p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedProject?._id === project._id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 hover:border-dark-500 bg-dark-800/50'
                        }
                      `}
                      onClick={() => setSelectedProject(project)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileCode className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate">
                              {project.projectName}
                            </h4>
                            {project.description && (
                              <p className="text-sm text-dark-400 truncate mt-0.5">
                                {project.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-3 mt-2 text-xs text-dark-500">
                              <span className="flex items-center space-x-1">
                                <Code2 className="w-3 h-3" />
                                <span>{project.files.length} 个文件</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(project.updatedAt)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          className="p-1.5 rounded hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project._id);
                          }}
                          title="删除项目"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 加载按钮 */}
              <div className="pt-2">
                <button
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                    ${selectedProject
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-500/20'
                      : 'bg-dark-700 text-dark-400 cursor-not-allowed'
                    }
                  `}
                  onClick={handleLoad}
                  disabled={!selectedProject}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>加载项目</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadPanel;

