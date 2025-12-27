import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Save,
  FolderOpen,
  Settings,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Maximize2,
  X,
} from 'lucide-react';

const IDEPage: React.FC = () => {
  const [code, setCode] = useState(`// 欢迎使用 FrontendPrepHub 在线 IDE
// 在这里编写你的代码，点击运行查看效果

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
`);
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 20px;
      background: linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      text-align: center;
    }
    h1 {
      color: #1e3a8a;
      margin: 0;
    }
    p {
      color: #64748b;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, FrontendPrepHub!</h1>
    <p>开始你的前端学习之旅</p>
  </div>
</body>
</html>`);

  const [activeTab, setActiveTab] = useState<'js' | 'html'>('html');
  const [output, setOutput] = useState('');
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewSizes = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleRun = () => {
    if (activeTab === 'html') {
      // 更新预览
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    } else {
      // 执行 JS 代码
      try {
        // 捕获 console.log 输出
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(String).join(' '));
        };

        // eslint-disable-next-line no-eval
        eval(code);

        console.log = originalLog;
        setOutput(logs.join('\n'));
      } catch (error: any) {
        setOutput(`Error: ${error.message}`);
      }
    }
  };

  const handleSave = () => {
    // TODO: 实现保存功能
    alert('保存功能开发中...');
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-dark-950">
      {/* 工具栏 */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-dark-800 bg-dark-900/50">
        <div className="flex items-center space-x-2">
          {/* 标签页 */}
          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-1.5 rounded text-sm transition-colors
              ${activeTab === 'html'
                ? 'bg-primary-500/20 text-primary-300'
                : 'text-dark-400 hover:text-dark-200'
              }`}
          >
            index.html
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`px-4 py-1.5 rounded text-sm transition-colors
              ${activeTab === 'js'
                ? 'bg-primary-500/20 text-primary-300'
                : 'text-dark-400 hover:text-dark-200'
              }`}
          >
            script.js
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRun}
            className="btn-primary btn-sm flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>运行</span>
          </button>
          <button onClick={handleSave} className="btn-ghost btn-sm">
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 编辑器 */}
        <div className="w-1/2 border-r border-dark-800">
          <Editor
            height="100%"
            language={activeTab === 'html' ? 'html' : 'javascript'}
            value={activeTab === 'html' ? html : code}
            onChange={(value) => {
              if (activeTab === 'html') {
                setHtml(value || '');
              } else {
                setCode(value || '');
              }
            }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              automaticLayout: true,
            }}
          />
        </div>

        {/* 预览区 */}
        <div className="w-1/2 flex flex-col">
          {/* 预览工具栏 */}
          <div className="h-10 px-4 flex items-center justify-between border-b border-dark-800 bg-dark-900/50">
            <span className="text-sm text-dark-400">预览</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewSize('desktop')}
                className={`p-1.5 rounded ${previewSize === 'desktop' ? 'bg-dark-700' : ''}`}
              >
                <Monitor className="w-4 h-4 text-dark-400" />
              </button>
              <button
                onClick={() => setPreviewSize('tablet')}
                className={`p-1.5 rounded ${previewSize === 'tablet' ? 'bg-dark-700' : ''}`}
              >
                <Tablet className="w-4 h-4 text-dark-400" />
              </button>
              <button
                onClick={() => setPreviewSize('mobile')}
                className={`p-1.5 rounded ${previewSize === 'mobile' ? 'bg-dark-700' : ''}`}
              >
                <Smartphone className="w-4 h-4 text-dark-400" />
              </button>
              <div className="w-px h-4 bg-dark-700" />
              <button onClick={handleRun} className="p-1.5 rounded hover:bg-dark-700">
                <RefreshCw className="w-4 h-4 text-dark-400" />
              </button>
            </div>
          </div>

          {/* 预览内容 */}
          <div className="flex-1 bg-dark-900 flex items-start justify-center p-4 overflow-auto">
            {activeTab === 'html' ? (
              <div
                style={{
                  width: previewSizes[previewSize],
                  maxWidth: '100%',
                  height: '100%',
                }}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
              >
                <iframe
                  ref={iframeRef}
                  title="preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={html}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-dark-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-dark-500 mb-2">控制台输出:</div>
                <pre className="text-dark-300 whitespace-pre-wrap">{output || '// 点击运行查看输出'}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDEPage;

