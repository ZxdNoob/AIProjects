/**
 * 编辑器标签页组件
 * 管理多个打开的文件标签，支持关闭、切换、拖拽等操作
 */

import { useState } from 'react';
import { X, Circle } from 'lucide-react';
import { FileNode, getLanguageFromFilename } from './FileTree';

// ============================================================
// 类型定义
// ============================================================

/** 打开的标签页信息 */
export interface OpenTab {
  /** 文件ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 是否有未保存修改 */
  isDirty: boolean;
  /** 文件语言 */
  language: string;
}

interface EditorTabsProps {
  /** 打开的标签页列表 */
  tabs: OpenTab[];
  /** 当前活动的标签页ID */
  activeTabId: string | null;
  /** 标签页点击事件 */
  onTabClick: (tabId: string) => void;
  /** 标签页关闭事件 */
  onTabClose: (tabId: string) => void;
  /** 关闭全部标签页 */
  onCloseAll: () => void;
  /** 关闭其他标签页 */
  onCloseOthers: (tabId: string) => void;
}

// ============================================================
// 工具函数：根据语言获取颜色
// ============================================================

const getLanguageColor = (language: string): string => {
  const colorMap: Record<string, string> = {
    javascript: 'bg-yellow-500',
    typescript: 'bg-blue-500',
    html: 'bg-orange-500',
    css: 'bg-pink-500',
    scss: 'bg-pink-600',
    json: 'bg-yellow-400',
    markdown: 'bg-gray-500',
    python: 'bg-green-500',
    vue: 'bg-emerald-500',
  };
  return colorMap[language] || 'bg-gray-500';
};

// ============================================================
// 主组件
// ============================================================

const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onCloseAll,
  onCloseOthers,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(
    null
  );

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className="relative">
      {/* 标签页容器 */}
      <div className="flex items-center bg-dark-900/80 border-b border-dark-700 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`
              group flex items-center min-w-0 max-w-[200px] px-3 py-2 
              border-r border-dark-700 cursor-pointer select-none
              transition-all duration-150
              ${
                activeTabId === tab.id
                  ? 'bg-dark-800 text-white border-b-2 border-b-primary-500'
                  : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
              }
            `}
            onClick={() => onTabClick(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
          >
            {/* 语言指示器 */}
            <span className={`w-2 h-2 rounded-full ${getLanguageColor(tab.language)} mr-2 flex-shrink-0`} />
            
            {/* 文件名 */}
            <span className="text-sm truncate flex-1">{tab.name}</span>

            {/* 修改指示器 / 关闭按钮 */}
            <button
              className={`
                ml-2 p-0.5 rounded flex-shrink-0 transition-all duration-150
                ${tab.isDirty ? 'text-primary-400' : 'opacity-0 group-hover:opacity-100 text-dark-400 hover:text-white hover:bg-dark-600'}
              `}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              {tab.isDirty ? (
                <Circle className="w-3 h-3 fill-current" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        ))}

        {/* 空白填充区 */}
        <div className="flex-1 min-w-[50px]" />
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          {/* 遮罩层 */}
          <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
          
          {/* 菜单 */}
          <div
            className="fixed z-50 bg-dark-800 border border-dark-600 rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-1.5 text-sm text-left text-dark-200 hover:bg-dark-700 hover:text-white"
              onClick={() => {
                onTabClose(contextMenu.tabId);
                closeContextMenu();
              }}
            >
              关闭
            </button>
            <button
              className="w-full px-3 py-1.5 text-sm text-left text-dark-200 hover:bg-dark-700 hover:text-white"
              onClick={() => {
                onCloseOthers(contextMenu.tabId);
                closeContextMenu();
              }}
            >
              关闭其他
            </button>
            <button
              className="w-full px-3 py-1.5 text-sm text-left text-dark-200 hover:bg-dark-700 hover:text-white"
              onClick={() => {
                onCloseAll();
                closeContextMenu();
              }}
            >
              关闭全部
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditorTabs;

