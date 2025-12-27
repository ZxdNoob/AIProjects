import { useState } from 'react';
import { BookOpen, Code2, PlayCircle, Plus, Search } from 'lucide-react';

const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'problems' | 'algorithms'>('knowledge');

  const tabs = [
    { key: 'knowledge', label: '知识点', icon: BookOpen },
    { key: 'problems', label: '编程题', icon: Code2 },
    { key: 'algorithms', label: '算法题', icon: PlayCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-100">内容管理</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>新增内容</span>
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex items-center space-x-4 border-b border-dark-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors
              ${activeTab === tab.key
                ? 'border-primary-500 text-primary-300'
                : 'border-transparent text-dark-400 hover:text-dark-200'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
        <input
          type="text"
          placeholder={`搜索${tabs.find((t) => t.key === activeTab)?.label}...`}
          className="input pl-12"
        />
      </div>

      {/* 内容区 */}
      <div className="card text-center py-12">
        <div className="text-dark-500 mb-4">
          {activeTab === 'knowledge' && <BookOpen className="w-16 h-16 mx-auto" />}
          {activeTab === 'problems' && <Code2 className="w-16 h-16 mx-auto" />}
          {activeTab === 'algorithms' && <PlayCircle className="w-16 h-16 mx-auto" />}
        </div>
        <h3 className="text-lg font-medium text-dark-300 mb-2">
          {tabs.find((t) => t.key === activeTab)?.label}管理
        </h3>
        <p className="text-dark-500">
          内容管理功能开发中，敬请期待...
        </p>
        <p className="text-dark-600 text-sm mt-4">
          您可以通过数据库脚本初始化内容数据
        </p>
      </div>

      {/* 功能说明 */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h4 className="font-medium text-dark-200 mb-2">新增内容</h4>
          <p className="text-dark-500 text-sm">支持新增知识点、编程题、算法题</p>
        </div>
        <div className="card">
          <h4 className="font-medium text-dark-200 mb-2">编辑内容</h4>
          <p className="text-dark-500 text-sm">修改已发布的内容信息</p>
        </div>
        <div className="card">
          <h4 className="font-medium text-dark-200 mb-2">批量导入</h4>
          <p className="text-dark-500 text-sm">支持 JSON 格式批量导入内容</p>
        </div>
      </div>
    </div>
  );
};

export default AdminContent;

