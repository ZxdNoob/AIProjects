/**
 * 终端/控制台组件
 * 显示代码执行输出、错误信息和调试日志
 */

import { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  Bug,
  Network,
} from 'lucide-react';

// ============================================================
// 类型定义
// ============================================================

/** 控制台消息类型 */
export type ConsoleMessageType = 'log' | 'info' | 'warn' | 'error' | 'success' | 'system';

/** 控制台消息 */
export interface ConsoleMessage {
  /** 唯一标识符 */
  id: string;
  /** 消息类型 */
  type: ConsoleMessageType;
  /** 消息内容 */
  content: string;
  /** 时间戳 */
  timestamp: Date;
  /** 调用栈（错误时） */
  stack?: string;
}

/** 终端面板类型 */
type PanelTab = 'console' | 'problems' | 'network';

interface TerminalProps {
  /** 控制台消息列表 */
  messages: ConsoleMessage[];
  /** 清空消息回调 */
  onClear: () => void;
  /** 是否最小化 */
  isMinimized: boolean;
  /** 切换最小化状态 */
  onToggleMinimize: () => void;
}

// ============================================================
// 工具函数：获取消息样式
// ============================================================

const getMessageStyle = (type: ConsoleMessageType) => {
  const styles: Record<ConsoleMessageType, { icon: typeof Info; color: string; bgColor: string }> = {
    log: { icon: TerminalIcon, color: 'text-dark-300', bgColor: 'bg-transparent' },
    info: { icon: Info, color: 'text-blue-400', bgColor: 'bg-blue-500/5' },
    warn: { icon: AlertCircle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/5' },
    error: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/5' },
    success: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/5' },
    system: { icon: Info, color: 'text-purple-400', bgColor: 'bg-purple-500/5' },
  };
  return styles[type];
};

// ============================================================
// 子组件：消息项
// ============================================================

const MessageItem: React.FC<{ message: ConsoleMessage }> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const style = getMessageStyle(message.type);
  const Icon = style.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`group px-3 py-1.5 border-b border-dark-800/50 ${style.bgColor} hover:bg-dark-800/30`}>
      <div className="flex items-start space-x-2">
        {/* 图标 */}
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.color}`} />
        
        {/* 时间戳 */}
        <span className="text-xs text-dark-500 font-mono flex-shrink-0">
          {formatTime(message.timestamp)}
        </span>
        
        {/* 内容 */}
        <pre className={`flex-1 text-sm font-mono whitespace-pre-wrap break-all ${style.color}`}>
          {message.content}
        </pre>

        {/* 展开按钮（有调用栈时显示） */}
        {message.stack && (
          <button
            className="p-1 rounded hover:bg-dark-700 text-dark-400"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 调用栈 */}
      {message.stack && isExpanded && (
        <div className="mt-2 ml-6 p-2 bg-dark-900 rounded text-xs font-mono text-dark-400 overflow-x-auto">
          {message.stack}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 主组件
// ============================================================

const Terminal: React.FC<TerminalProps> = ({
  messages,
  onClear,
  isMinimized,
  onToggleMinimize,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('console');
  const [filter, setFilter] = useState<ConsoleMessageType | 'all'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (!isMinimized && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // 过滤消息
  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter((m) => m.type === filter);

  // 统计各类型消息数量
  const counts = {
    error: messages.filter((m) => m.type === 'error').length,
    warn: messages.filter((m) => m.type === 'warn').length,
    info: messages.filter((m) => m.type === 'info' || m.type === 'log').length,
  };

  // 导出日志
  const handleExport = () => {
    const content = messages
      .map((m) => `[${m.timestamp.toISOString()}] [${m.type.toUpperCase()}] ${m.content}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { id: PanelTab; label: string; icon: typeof TerminalIcon }[] = [
    { id: 'console', label: '控制台', icon: TerminalIcon },
    { id: 'problems', label: '问题', icon: Bug },
    { id: 'network', label: '网络', icon: Network },
  ];

  return (
    <div className={`flex flex-col bg-dark-900 border-t border-dark-700 transition-all duration-200 ${isMinimized ? 'h-10' : 'h-full'}`}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-2 h-10 border-b border-dark-800 bg-dark-850 flex-shrink-0">
        {/* 标签页 */}
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`
                flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${activeTab === tab.id
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
                }
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'console' && counts.error > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px]">
                  {counts.error}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 右侧工具 */}
        <div className="flex items-center space-x-1">
          {/* 过滤器 */}
          {!isMinimized && activeTab === 'console' && (
            <div className="flex items-center space-x-1 mr-2">
              <button
                className={`px-2 py-0.5 text-xs rounded ${filter === 'all' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-white'}`}
                onClick={() => setFilter('all')}
              >
                全部
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded flex items-center space-x-1 ${filter === 'error' ? 'bg-red-500/20 text-red-400' : 'text-dark-400 hover:text-red-400'}`}
                onClick={() => setFilter('error')}
              >
                <XCircle className="w-3 h-3" />
                <span>{counts.error}</span>
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded flex items-center space-x-1 ${filter === 'warn' ? 'bg-yellow-500/20 text-yellow-400' : 'text-dark-400 hover:text-yellow-400'}`}
                onClick={() => setFilter('warn')}
              >
                <AlertCircle className="w-3 h-3" />
                <span>{counts.warn}</span>
              </button>
            </div>
          )}

          {/* 清空按钮 */}
          <button
            className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            title="清空控制台"
            onClick={onClear}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* 导出按钮 */}
          <button
            className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            title="导出日志"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* 最小化按钮 */}
          <button
            className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            title={isMinimized ? '展开' : '最小化'}
            onClick={onToggleMinimize}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {!isMinimized && (
        <div className="flex-1 overflow-auto">
          {activeTab === 'console' && (
            <>
              {filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-dark-500 text-sm">
                  <TerminalIcon className="w-5 h-5 mr-2" />
                  控制台暂无输出
                </div>
              ) : (
                <>
                  {filteredMessages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </>
          )}

          {activeTab === 'problems' && (
            <div className="flex items-center justify-center h-full text-dark-500 text-sm">
              <Bug className="w-5 h-5 mr-2" />
              暂无代码问题
            </div>
          )}

          {activeTab === 'network' && (
            <div className="flex items-center justify-center h-full text-dark-500 text-sm">
              <Network className="w-5 h-5 mr-2" />
              暂无网络请求
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Terminal;

