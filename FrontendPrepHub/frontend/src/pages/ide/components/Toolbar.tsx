/**
 * IDE 工具栏组件
 * 包含运行、保存、设置等操作按钮
 */

import { useState } from 'react';
import {
  Play,
  Save,
  FolderOpen,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Layout,
  Palette,
  Code,
  ChevronDown,
  Share2,
  Keyboard,
  HelpCircle,
  Zap,
  Moon,
  Sun,
  Columns,
  Rows,
  Square,
} from 'lucide-react';

// ============================================================
// 类型定义
// ============================================================

type LayoutMode = 'horizontal' | 'vertical' | 'preview-only' | 'editor-only';

interface ToolbarProps {
  /** 运行代码 */
  onRun: () => void;
  /** 保存项目 */
  onSave: () => void;
  /** 加载项目 */
  onLoad: () => void;
  /** 新建项目 */
  onNew: () => void;
  /** 格式化代码 */
  onFormat: () => void;
  /** 导出项目 */
  onExport: () => void;
  /** 自动刷新状态 */
  autoRefresh: boolean;
  /** 切换自动刷新 */
  onToggleAutoRefresh: () => void;
  /** 当前主题 */
  theme: string;
  /** 切换主题 */
  onThemeChange: (theme: string) => void;
  /** 布局模式 */
  layoutMode: LayoutMode;
  /** 切换布局模式 */
  onLayoutChange: (mode: LayoutMode) => void;
  /** 是否正在保存 */
  isSaving: boolean;
  /** 是否已登录 */
  isLoggedIn: boolean;
}

// ============================================================
// 编辑器主题列表
// ============================================================

const editorThemes = [
  { id: 'vs-dark', name: 'VS Code Dark', icon: Moon },
  { id: 'vs', name: 'VS Code Light', icon: Sun },
  { id: 'hc-black', name: 'High Contrast', icon: Square },
];

// ============================================================
// 主组件
// ============================================================

const Toolbar: React.FC<ToolbarProps> = ({
  onRun,
  onSave,
  onLoad,
  onNew,
  onFormat,
  onExport,
  autoRefresh,
  onToggleAutoRefresh,
  theme,
  onThemeChange,
  layoutMode,
  onLayoutChange,
  isSaving,
  isLoggedIn,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  const layoutOptions = [
    { id: 'horizontal', name: '水平分割', icon: Columns },
    { id: 'vertical', name: '垂直分割', icon: Rows },
    { id: 'preview-only', name: '仅预览', icon: Layout },
    { id: 'editor-only', name: '仅编辑器', icon: Code },
  ] as const;

  const shortcuts = [
    { key: 'Ctrl/⌘ + S', action: '保存项目' },
    { key: 'Ctrl/⌘ + Enter', action: '运行代码' },
    { key: 'Shift + Alt + F', action: '格式化代码' },
    { key: 'Ctrl/⌘ + P', action: '快速打开文件' },
    { key: 'Ctrl/⌘ + B', action: '切换侧边栏' },
  ];

  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm">
      {/* 左侧：Logo 和主要操作 */}
      <div className="flex items-center space-x-3">
        {/* Logo */}
        <div className="flex items-center space-x-2 pr-4 border-r border-dark-700">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white hidden sm:inline">IDE</span>
        </div>

        {/* 新建按钮 */}
        <button
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-dark-300 hover:text-white hover:bg-dark-700 transition-all"
          onClick={onNew}
          title="新建项目"
        >
          <Layout className="w-4 h-4" />
          <span className="text-sm hidden md:inline">新建</span>
        </button>

        {/* 打开按钮 */}
        <button
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-dark-300 hover:text-white hover:bg-dark-700 transition-all"
          onClick={onLoad}
          title="打开项目"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm hidden md:inline">打开</span>
        </button>

        {/* 保存按钮 */}
        <button
          className={`
            flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all
            ${isSaving
              ? 'text-primary-400 bg-primary-500/10'
              : 'text-dark-300 hover:text-white hover:bg-dark-700'
            }
          `}
          onClick={onSave}
          disabled={isSaving}
          title={isLoggedIn ? '保存项目 (Ctrl+S)' : '请先登录'}
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="text-sm hidden md:inline">
            {isSaving ? '保存中...' : '保存'}
          </span>
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-dark-700" />

        {/* 运行按钮 */}
        <button
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20"
          onClick={onRun}
          title="运行 (Ctrl+Enter)"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm">运行</span>
        </button>

        {/* 自动刷新开关 */}
        <button
          className={`
            flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all
            ${autoRefresh
              ? 'text-primary-400 bg-primary-500/10'
              : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }
          `}
          onClick={onToggleAutoRefresh}
          title={autoRefresh ? '关闭自动刷新' : '开启自动刷新'}
        >
          <Zap className={`w-4 h-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
          <span className="text-sm hidden lg:inline">自动运行</span>
        </button>
      </div>

      {/* 右侧：设置和工具 */}
      <div className="flex items-center space-x-1">
        {/* 格式化 */}
        <button
          className="p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
          onClick={onFormat}
          title="格式化代码 (Shift+Alt+F)"
        >
          <Code className="w-4 h-4" />
        </button>

        {/* 导出 */}
        <button
          className="p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
          onClick={onExport}
          title="导出项目"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-dark-700 mx-1" />

        {/* 主题选择 */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="编辑器主题"
          >
            <Palette className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {showThemeMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 py-1">
                {editorThemes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`
                        w-full px-3 py-2 text-sm text-left flex items-center space-x-2
                        ${theme === t.id ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300 hover:bg-dark-700 hover:text-white'}
                      `}
                      onClick={() => {
                        onThemeChange(t.id);
                        setShowThemeMenu(false);
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 布局选择 */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            title="布局模式"
          >
            <Layout className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLayoutMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLayoutMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 py-1">
                {layoutOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      className={`
                        w-full px-3 py-2 text-sm text-left flex items-center space-x-2
                        ${layoutMode === opt.id ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300 hover:bg-dark-700 hover:text-white'}
                      `}
                      onClick={() => {
                        onLayoutChange(opt.id);
                        setShowLayoutMenu(false);
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{opt.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 快捷键帮助 */}
        <div className="relative">
          <button
            className="p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            onClick={() => setShowHelpMenu(!showHelpMenu)}
            title="快捷键"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {showHelpMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowHelpMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-56 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 p-3">
                <h4 className="text-sm font-semibold text-white mb-2">快捷键</h4>
                <div className="space-y-1">
                  {shortcuts.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-dark-400">{s.action}</span>
                      <kbd className="px-1.5 py-0.5 bg-dark-700 rounded text-dark-300 font-mono">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 帮助 */}
        <button
          className="p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
          title="帮助"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;

