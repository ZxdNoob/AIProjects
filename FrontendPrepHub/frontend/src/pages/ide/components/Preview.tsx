/**
 * 预览组件
 * 实时预览 HTML/CSS/JS 代码效果，支持响应式视图和设备模拟
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

// ============================================================
// 类型定义
// ============================================================

type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'custom';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: typeof Monitor;
}

interface PreviewProps {
  /** HTML 内容 */
  html: string;
  /** CSS 内容 */
  css: string;
  /** JavaScript 内容 */
  js: string;
  /** 自动刷新 */
  autoRefresh: boolean;
  /** 控制台日志回调 */
  onConsoleMessage: (type: 'log' | 'info' | 'warn' | 'error', content: string) => void;
}

// ============================================================
// 设备预设
// ============================================================

const devicePresets: Record<DeviceType, DevicePreset> = {
  desktop: { name: '桌面', width: 1280, height: 720, icon: Monitor },
  tablet: { name: '平板', width: 768, height: 1024, icon: Tablet },
  mobile: { name: '手机', width: 375, height: 667, icon: Smartphone },
  custom: { name: '自定义', width: 800, height: 600, icon: Monitor },
};

// 热门设备尺寸
const popularDevices = [
  { name: 'iPhone 14 Pro', width: 393, height: 852 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  { name: 'MacBook Air', width: 1280, height: 800 },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117 },
  { name: 'Desktop HD', width: 1920, height: 1080 },
  { name: 'Desktop 4K', width: 3840, height: 2160 },
];

// ============================================================
// 主组件
// ============================================================

const Preview: React.FC<PreviewProps> = ({
  html,
  css,
  js,
  autoRefresh,
  onConsoleMessage,
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [isRotated, setIsRotated] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showDeviceFrame, setShowDeviceFrame] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取当前设备尺寸
  const currentDevice = devicePresets[deviceType];
  let width = deviceType === 'custom' ? customWidth : currentDevice.width;
  let height = deviceType === 'custom' ? customHeight : currentDevice.height;
  
  // 横屏时交换宽高
  if (isRotated && deviceType !== 'desktop') {
    [width, height] = [height, width];
  }

  // 生成预览内容
  const generatePreviewContent = useCallback(() => {
    // 注入控制台拦截器
    const consoleInterceptor = `
      <script>
        (function() {
          const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
          };
          
          function sendToParent(type, args) {
            try {
              const content = Array.from(args).map(arg => {
                if (typeof arg === 'object') {
                  return JSON.stringify(arg, null, 2);
                }
                return String(arg);
              }).join(' ');
              
              window.parent.postMessage({
                type: 'console',
                level: type,
                content: content,
              }, '*');
            } catch (e) {}
          }
          
          console.log = function() { sendToParent('log', arguments); originalConsole.log.apply(console, arguments); };
          console.info = function() { sendToParent('info', arguments); originalConsole.info.apply(console, arguments); };
          console.warn = function() { sendToParent('warn', arguments); originalConsole.warn.apply(console, arguments); };
          console.error = function() { sendToParent('error', arguments); originalConsole.error.apply(console, arguments); };
          
          window.onerror = function(message, source, lineno, colno, error) {
            sendToParent('error', [message + ' (line: ' + lineno + ', col: ' + colno + ')']);
            return false;
          };
          
          window.onunhandledrejection = function(event) {
            sendToParent('error', ['Unhandled Promise Rejection: ' + event.reason]);
          };
        })();
      </script>
    `;

    // 组合完整 HTML
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            ${css}
          </style>
          ${consoleInterceptor}
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (e) {
              console.error('Script Error:', e.message);
            }
          </script>
        </body>
      </html>
    `;

    return fullHtml;
  }, [html, css, js]);

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        onConsoleMessage(event.data.level, event.data.content);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleMessage]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        setKey((k) => k + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [html, css, js, autoRefresh]);

  // 手动刷新
  const handleRefresh = () => {
    setKey((k) => k + 1);
  };

  // 复制代码
  const handleCopyCode = () => {
    const content = generatePreviewContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 在新窗口打开
  const handleOpenInNewTab = () => {
    const content = generatePreviewContent();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 缩放控制
  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const handleZoomOut = () => setZoom((z) => Math.max(25, z - 10));
  const handleZoomReset = () => setZoom(100);

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-dark-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700 bg-dark-850">
        {/* 左侧：设备选择 */}
        <div className="flex items-center space-x-1">
          {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map((type) => {
            const device = devicePresets[type];
            const Icon = device.icon;
            return (
              <button
                key={type}
                className={`
                  p-1.5 rounded-md transition-all
                  ${deviceType === type
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                  }
                `}
                title={device.name}
                onClick={() => setDeviceType(type)}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}

          {/* 更多设备 */}
          <div className="relative">
            <button
              className="px-2 py-1 text-xs text-dark-400 hover:text-white hover:bg-dark-700 rounded-md"
              onClick={() => setShowDeviceList(!showDeviceList)}
            >
              更多
            </button>
            
            {showDeviceList && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDeviceList(false)} />
                <div className="absolute left-0 top-full mt-1 w-48 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 py-1 max-h-64 overflow-auto">
                  {popularDevices.map((device, index) => (
                    <button
                      key={index}
                      className="w-full px-3 py-1.5 text-sm text-left text-dark-300 hover:bg-dark-700 hover:text-white"
                      onClick={() => {
                        setDeviceType('custom');
                        setCustomWidth(device.width);
                        setCustomHeight(device.height);
                        setShowDeviceList(false);
                      }}
                    >
                      <span>{device.name}</span>
                      <span className="text-dark-500 ml-2 text-xs">
                        {device.width}×{device.height}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 分隔线 */}
          <div className="w-px h-4 bg-dark-600 mx-2" />

          {/* 旋转按钮 */}
          {deviceType !== 'desktop' && (
            <button
              className={`p-1.5 rounded-md transition-all ${isRotated ? 'bg-primary-500/20 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
              title="旋转"
              onClick={() => setIsRotated(!isRotated)}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* 设备框架 */}
          <button
            className={`p-1.5 rounded-md transition-all ${showDeviceFrame ? 'bg-primary-500/20 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-700'}`}
            title={showDeviceFrame ? '隐藏设备边框' : '显示设备边框'}
            onClick={() => setShowDeviceFrame(!showDeviceFrame)}
          >
            {showDeviceFrame ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* 尺寸显示 */}
          <span className="text-xs text-dark-500 font-mono ml-2">
            {width} × {height}
          </span>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center space-x-1">
          {/* 缩放控制 */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-white"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              className="px-1.5 py-0.5 text-xs text-dark-400 hover:text-white rounded hover:bg-dark-700 min-w-[40px]"
              onClick={handleZoomReset}
            >
              {zoom}%
            </button>
            <button
              className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-white"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-px h-4 bg-dark-600" />

          {/* 刷新 */}
          <button
            className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            title="刷新预览"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* 复制代码 */}
          <button
            className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            title="复制完整代码"
            onClick={handleCopyCode}
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* 新窗口打开 */}
          <button
            className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            title="在新窗口打开"
            onClick={handleOpenInNewTab}
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* 全屏 */}
          <button
            className="p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-700 transition-all"
            title={isFullscreen ? '退出全屏' : '全屏预览'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 overflow-auto bg-[#1a1a2e] flex items-center justify-center p-4">
        <div
          className={`
            relative transition-all duration-300
            ${showDeviceFrame && deviceType !== 'desktop' ? 'p-4' : ''}
          `}
          style={{
            width: deviceType === 'desktop' ? '100%' : `${width * zoom / 100}px`,
            height: deviceType === 'desktop' ? '100%' : `${height * zoom / 100}px`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {/* 设备边框 */}
          {showDeviceFrame && deviceType !== 'desktop' && (
            <div className="absolute inset-0 rounded-[40px] border-[14px] border-dark-700 pointer-events-none shadow-2xl" />
          )}
          
          {/* 预览 iframe */}
          <iframe
            key={key}
            ref={iframeRef}
            title="preview"
            className={`
              w-full h-full border-0 bg-white
              ${showDeviceFrame && deviceType !== 'desktop' ? 'rounded-[28px]' : 'rounded-lg'}
            `}
            sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
            srcDoc={generatePreviewContent()}
          />

          {/* 设备底部凹槽（仅移动设备） */}
          {showDeviceFrame && deviceType === 'mobile' && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-dark-600 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;

