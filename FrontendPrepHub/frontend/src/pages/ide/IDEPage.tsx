/**
 * 在线 IDE 页面
 * 功能强大的前端代码编辑器，支持多文件管理、实时预览、云端存储
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  FileTree,
  EditorTabs,
  Terminal,
  Preview,
  ProjectTemplates,
  Toolbar,
  SaveLoadPanel,
  ResizablePanel,
  FileNode,
  OpenTab,
  ConsoleMessage,
  ProjectTemplate,
  getLanguageFromFilename,
  templates,
} from './components';
import { useAuthStore } from '@/store/authStore';
import { userCodeApi } from '@/services/api';
import { UserCode } from '@/types';

// ============================================================
// 类型定义
// ============================================================

type LayoutMode = 'horizontal' | 'vertical' | 'preview-only' | 'editor-only';
type PanelMode = 'save' | 'load';

// ============================================================
// 默认项目文件
// ============================================================

const defaultFiles: FileNode[] = [
  {
    id: 'default-html',
    name: 'index.html',
    type: 'file',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FrontendPrepHub IDE</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="hero-content">
        <h1 class="title">
          欢迎使用 <span class="gradient">FrontendPrepHub</span>
        </h1>
        <p class="subtitle">
          专业的前端在线开发环境，助你快速学习和练习
        </p>
        <div class="buttons">
          <button class="btn primary" onclick="handleStart()">开始编码</button>
          <button class="btn secondary" onclick="handleDemo()">查看示例</button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="code-block">
          <pre><code>const hello = () => {
  console.log('Hello, World!');
};

hello();</code></pre>
        </div>
      </div>
    </header>
    
    <section class="features">
      <div class="feature">
        <span class="icon">⚡</span>
        <h3>实时预览</h3>
        <p>代码改动即时呈现</p>
      </div>
      <div class="feature">
        <span class="icon">📁</span>
        <h3>多文件支持</h3>
        <p>管理完整项目结构</p>
      </div>
      <div class="feature">
        <span class="icon">☁️</span>
        <h3>云端存储</h3>
        <p>随时保存你的作品</p>
      </div>
    </section>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
  },
  {
    id: 'default-css',
    name: 'style.css',
    type: 'file',
    language: 'css',
    content: `/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero 区域 */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80vh;
  gap: 4rem;
}

.hero-content {
  flex: 1;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient {
  background: linear-gradient(135deg, #6366f1, #ec4899, #6366f1);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  line-height: 1.8;
  margin-bottom: 2rem;
}

/* 按钮 */
.buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn.primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
}

.btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
}

.btn.secondary {
  background: transparent;
  color: #94a3b8;
  border: 2px solid #334155;
}

.btn.secondary:hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* 代码块 */
.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
}

.code-block {
  background: #1e1e2e;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
  color: #a5b4fc;
  line-height: 1.8;
}

/* 特性区域 */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.feature {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.1);
}

.feature .icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.feature h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #64748b;
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
  
  .title {
    font-size: 2.5rem;
  }
  
  .buttons {
    justify-content: center;
  }
  
  .hero-visual {
    width: 100%;
  }
}`,
  },
  {
    id: 'default-js',
    name: 'script.js',
    type: 'file',
    language: 'javascript',
    content: `// FrontendPrepHub IDE - 示例代码

// 开始编码按钮点击事件
function handleStart() {
  console.log('🚀 开始编码！');
  
  // 添加一些动画效果
  const title = document.querySelector('.title');
  title.style.animation = 'pulse 0.5s ease';
  
  setTimeout(() => {
    title.style.animation = '';
  }, 500);
  
  // 显示提示信息
  showNotification('准备就绪，开始你的编码之旅！', 'success');
}

// 查看示例按钮点击事件
function handleDemo() {
  console.log('📚 查看示例代码...');
  
  const features = document.querySelectorAll('.feature');
  features.forEach((feature, index) => {
    setTimeout(() => {
      feature.style.transform = 'scale(1.05)';
      setTimeout(() => {
        feature.style.transform = '';
      }, 200);
    }, index * 100);
  });
  
  showNotification('这是一个交互示例！', 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    color: white;
    font-weight: 500;
    z-index: 9999;
    animation: slideIn 0.3s ease;
    background: \${type === 'success' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)'};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  \`;
  notification.textContent = message;
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = \`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
  \`;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // 3秒后移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ FrontendPrepHub IDE 已加载');
  console.log('💡 提示：点击按钮查看交互效果');
});`,
  },
];

// ============================================================
// 主组件
// ============================================================

const IDEPage: React.FC = () => {
  // 认证状态
  const { isAuthenticated, user } = useAuthStore();

  // 文件管理状态
  const [files, setFiles] = useState<FileNode[]>(defaultFiles);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([
    { id: 'default-html', name: 'index.html', isDirty: false, language: 'html' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('default-html');
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const contents: Record<string, string> = {};
    defaultFiles.forEach((file) => {
      if (file.content) contents[file.id] = file.content;
    });
    return contents;
  });

  // 项目信息
  const [projectName, setProjectName] = useState('未命名项目');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);

  // 编辑器状态
  const [theme, setTheme] = useState('vs-dark');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // 布局状态
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [showSidebar, setShowSidebar] = useState(true);
  const [terminalMinimized, setTerminalMinimized] = useState(false);

  // 控制台消息
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([
    {
      id: '1',
      type: 'system',
      content: '欢迎使用 FrontendPrepHub IDE！开始编写你的代码吧 🚀',
      timestamp: new Date(),
    },
  ]);

  // 面板状态
  const [showTemplates, setShowTemplates] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('save');
  const [showSaveLoadPanel, setShowSaveLoadPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 编辑器引用
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<any>(null);

  // ==================== 文件操作 ====================

  // 获取当前活动文件
  const activeFile = files.find((f) => f.id === activeTabId) || 
    files.flatMap(f => f.children || []).find(f => f.id === activeTabId);

  // 递归查找文件
  const findFile = (nodes: FileNode[], id: string): FileNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFile(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // 文件选中处理
  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'folder') return;

    // 检查是否已打开
    const existingTab = openTabs.find((tab) => tab.id === file.id);
    if (existingTab) {
      setActiveTabId(file.id);
      return;
    }

    // 添加新标签页
    setOpenTabs([
      ...openTabs,
      {
        id: file.id,
        name: file.name,
        isDirty: false,
        language: file.language || getLanguageFromFilename(file.name),
      },
    ]);
    setActiveTabId(file.id);

    // 初始化文件内容
    if (!fileContents[file.id] && file.content) {
      setFileContents((prev) => ({ ...prev, [file.id]: file.content || '' }));
    }
  };

  // 文件删除处理
  const handleFileDelete = (fileId: string) => {
    // 关闭对应标签页
    const tabIndex = openTabs.findIndex((tab) => tab.id === fileId);
    if (tabIndex !== -1) {
      const newTabs = openTabs.filter((tab) => tab.id !== fileId);
      setOpenTabs(newTabs);
      
      // 如果删除的是当前活动标签，切换到其他标签
      if (activeTabId === fileId && newTabs.length > 0) {
        setActiveTabId(newTabs[Math.max(0, tabIndex - 1)].id);
      }
    }

    // 删除文件内容
    setFileContents((prev) => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
  };

  // 标签页操作
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const tabIndex = openTabs.findIndex((tab) => tab.id === tabId);
    const newTabs = openTabs.filter((tab) => tab.id !== tabId);
    setOpenTabs(newTabs);

    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[Math.max(0, tabIndex - 1)].id);
    } else if (newTabs.length === 0) {
      setActiveTabId(null as any);
    }
  };

  const handleCloseAll = () => {
    setOpenTabs([]);
    setActiveTabId(null as any);
  };

  const handleCloseOthers = (tabId: string) => {
    setOpenTabs(openTabs.filter((tab) => tab.id === tabId));
    setActiveTabId(tabId);
  };

  // ==================== 编辑器操作 ====================

  // 编辑器内容变更
  const handleEditorChange = (value: string | undefined) => {
    if (!activeTabId || !value) return;

    setFileContents((prev) => ({ ...prev, [activeTabId]: value }));

    // 标记为已修改
    setOpenTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId ? { ...tab, isDirty: true } : tab
      )
    );
  };

  // 编辑器挂载
  const handleEditorMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 添加快捷键
    editor.addAction({
      id: 'run-code',
      label: '运行代码',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleRun(),
    });

    editor.addAction({
      id: 'save-project',
      label: '保存项目',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => handleSave(),
    });

    editor.addAction({
      id: 'format-document',
      label: '格式化代码',
      keybindings: [
        monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      ],
      run: () => handleFormat(),
    });
  };

  // 格式化代码
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      addConsoleMessage('info', '代码格式化完成');
    }
  };

  // ==================== 项目操作 ====================

  // 运行代码
  const handleRun = () => {
    addConsoleMessage('system', '▶ 运行代码...');
    // 预览会自动更新，这里只是添加日志
  };

  // 新建项目
  const handleNew = () => {
    setShowTemplates(true);
  };

  // 选择模板
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setFiles(template.files);
    setProjectName(template.name);
    setProjectId(null);

    // 初始化文件内容
    const contents: Record<string, string> = {};
    template.files.forEach((file) => {
      if (file.content) contents[file.id] = file.content;
    });
    setFileContents(contents);

    // 打开入口文件
    const entryFile = template.files.find((f) => f.id === template.entryFileId) || template.files[0];
    setOpenTabs([
      {
        id: entryFile.id,
        name: entryFile.name,
        isDirty: false,
        language: entryFile.language || getLanguageFromFilename(entryFile.name),
      },
    ]);
    setActiveTabId(entryFile.id);

    addConsoleMessage('success', `✨ 已创建项目：${template.name}`);
  };

  // 保存项目
  const handleSave = async () => {
    if (!isAuthenticated) {
      addConsoleMessage('warn', '请先登录后再保存项目');
      return;
    }

    setPanelMode('save');
    setShowSaveLoadPanel(true);
  };

  // 执行保存
  const handleDoSave = async (name: string, description: string) => {
    setIsSaving(true);
    
    try {
      // 准备文件数据
      const filesData = files.map((file) => ({
        filename: file.name,
        content: fileContents[file.id] || file.content || '',
        language: file.language || getLanguageFromFilename(file.name),
      }));

      if (projectId) {
        // 更新现有项目
        await userCodeApi.update(projectId, {
          projectName: name,
          description,
          files: filesData,
        });
        addConsoleMessage('success', `✅ 项目已更新：${name}`);
      } else {
        // 创建新项目
        const response = await userCodeApi.save({
          projectName: name,
          description,
          files: filesData,
          type: 'custom',
        });
        
        if (response.success && response.data) {
          setProjectId(response.data._id);
        }
        addConsoleMessage('success', `✅ 项目已保存：${name}`);
      }

      setProjectName(name);
      setProjectDescription(description);

      // 清除脏标记
      setOpenTabs((prev) => prev.map((tab) => ({ ...tab, isDirty: false })));
    } catch (err: any) {
      addConsoleMessage('error', `保存失败：${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 加载项目
  const handleLoad = () => {
    if (!isAuthenticated) {
      addConsoleMessage('warn', '请先登录后再加载项目');
      return;
    }

    setPanelMode('load');
    setShowSaveLoadPanel(true);
  };

  // 执行加载
  const handleDoLoad = (project: UserCode) => {
    // 转换为 FileNode 格式
    const loadedFiles: FileNode[] = project.files.map((file, index) => ({
      id: `loaded_${index}_${Date.now()}`,
      name: file.filename,
      type: 'file' as const,
      language: file.language,
      content: file.content,
    }));

    setFiles(loadedFiles);
    setProjectId(project._id);
    setProjectName(project.projectName);
    setProjectDescription(project.description || '');

    // 初始化文件内容
    const contents: Record<string, string> = {};
    loadedFiles.forEach((file) => {
      if (file.content) contents[file.id] = file.content;
    });
    setFileContents(contents);

    // 打开第一个文件
    if (loadedFiles.length > 0) {
      const firstFile = loadedFiles[0];
      setOpenTabs([
        {
          id: firstFile.id,
          name: firstFile.name,
          isDirty: false,
          language: firstFile.language || getLanguageFromFilename(firstFile.name),
        },
      ]);
      setActiveTabId(firstFile.id);
    }

    addConsoleMessage('success', `📂 已加载项目：${project.projectName}`);
  };

  // 导出项目
  const handleExport = () => {
    // 创建 HTML 文件内容
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFile = files.find(f => f.name.endsWith('.css'));
    const jsFile = files.find(f => f.name.endsWith('.js'));

    const htmlContent = htmlFile ? fileContents[htmlFile.id] || htmlFile.content : '';
    const cssContent = cssFile ? fileContents[cssFile.id] || cssFile.content : '';
    const jsContent = jsFile ? fileContents[jsFile.id] || jsFile.content : '';

    // 组合完整 HTML
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
${cssContent}
  </style>
</head>
<body>
${htmlContent.replace(/<\/?(!DOCTYPE|html|head|body|meta|title|link|script)[^>]*>/gi, '')}
  <script>
${jsContent}
  </script>
</body>
</html>`;

    // 下载文件
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);

    addConsoleMessage('success', `📦 项目已导出：${a.download}`);
  };

  // ==================== 控制台操作 ====================

  const addConsoleMessage = (type: ConsoleMessage['type'], content: string) => {
    setConsoleMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleConsoleMessage = (type: 'log' | 'info' | 'warn' | 'error', content: string) => {
    addConsoleMessage(type, content);
  };

  const handleClearConsole = () => {
    setConsoleMessages([]);
  };

  // ==================== 获取预览内容 ====================

  const getPreviewContent = useCallback(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFile = files.find(f => f.name.endsWith('.css'));
    const jsFile = files.find(f => f.name.endsWith('.js'));

    return {
      html: htmlFile ? (fileContents[htmlFile.id] || htmlFile.content || '') : '',
      css: cssFile ? (fileContents[cssFile.id] || cssFile.content || '') : '',
      js: jsFile ? (fileContents[jsFile.id] || jsFile.content || '') : '',
    };
  }, [files, fileContents]);

  const previewContent = getPreviewContent();

  // ==================== 渲染 ====================

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-dark-950">
      {/* 顶部工具栏 */}
      <Toolbar
        onRun={handleRun}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        onFormat={handleFormat}
        onExport={handleExport}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        theme={theme}
        onThemeChange={setTheme}
        layoutMode={layoutMode}
        onLayoutChange={setLayoutMode}
        isSaving={isSaving}
        isLoggedIn={isAuthenticated}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏切换按钮 */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-dark-800 border border-dark-700 rounded-r-lg hover:bg-dark-700 transition-colors"
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
        >
          {showSidebar ? (
            <PanelLeftClose className="w-4 h-4 text-dark-400" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-dark-400" />
          )}
        </button>

        {/* 侧边栏 - 文件树 */}
        <div
          className={`
            flex-shrink-0 border-r border-dark-700 transition-all duration-200
            ${showSidebar ? 'w-60' : 'w-0'}
          `}
        >
          {showSidebar && (
            <FileTree
              files={files}
              selectedFileId={activeTabId}
              onFileSelect={handleFileSelect}
              onFilesChange={setFiles}
              onFileDelete={handleFileDelete}
            />
          )}
        </div>

        {/* 编辑器和预览区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResizablePanel
            direction={layoutMode === 'vertical' ? 'vertical' : 'horizontal'}
            defaultSize={50}
            minSize={200}
            maxSize={80}
            hideFirst={layoutMode === 'preview-only'}
            hideSecond={layoutMode === 'editor-only'}
            first={
              /* 编辑器区域 */
              <div className="h-full flex flex-col">
                {/* 编辑器标签页 */}
                <EditorTabs
                  tabs={openTabs}
                  activeTabId={activeTabId}
                  onTabClick={handleTabClick}
                  onTabClose={handleTabClose}
                  onCloseAll={handleCloseAll}
                  onCloseOthers={handleCloseOthers}
                />

                {/* Monaco 编辑器 */}
                <div className="flex-1">
                  {activeTabId && activeFile ? (
                    <Editor
                      height="100%"
                      language={activeFile.language || getLanguageFromFilename(activeFile.name)}
                      value={fileContents[activeTabId] || activeFile.content || ''}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      theme={theme}
                      options={{
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                        fontLigatures: true,
                        minimap: { enabled: true, maxColumn: 80 },
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        automaticLayout: true,
                        wordWrap: 'on',
                        tabSize: 2,
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        renderWhitespace: 'selection',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        bracketPairColorization: { enabled: true },
                        guides: {
                          indentation: true,
                          bracketPairs: true,
                        },
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-dark-500">
                      <div className="text-center">
                        <p className="text-lg mb-2">没有打开的文件</p>
                        <p className="text-sm">从左侧文件树选择一个文件开始编辑</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            }
            second={
              /* 预览区域 */
              <div className="h-full flex flex-col">
                <ResizablePanel
                  direction="vertical"
                  defaultSize={70}
                  minSize={100}
                  maxSize={90}
                  hideSecond={terminalMinimized}
                  first={
                    <Preview
                      html={previewContent.html}
                      css={previewContent.css}
                      js={previewContent.js}
                      autoRefresh={autoRefresh}
                      onConsoleMessage={handleConsoleMessage}
                    />
                  }
                  second={
                    <Terminal
                      messages={consoleMessages}
                      onClear={handleClearConsole}
                      isMinimized={terminalMinimized}
                      onToggleMinimize={() => setTerminalMinimized(!terminalMinimized)}
                    />
                  }
                />
              </div>
            }
          />
        </div>
      </div>

      {/* 模态框 */}
      <ProjectTemplates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <SaveLoadPanel
        mode={panelMode}
        isOpen={showSaveLoadPanel}
        onClose={() => setShowSaveLoadPanel(false)}
        onSave={handleDoSave}
        onLoad={handleDoLoad}
        currentName={projectName}
        currentDescription={projectDescription}
      />
    </div>
  );
};

export default IDEPage;
