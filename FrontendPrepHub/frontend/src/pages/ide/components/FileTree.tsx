/**
 * 文件树组件
 * 显示项目文件结构，支持文件的增删改查操作
 */

import { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  FileCode,
  FileText,
  FileJson,
  Image,
  FileType,
  MoreVertical,
} from 'lucide-react';

// ============================================================
// 类型定义
// ============================================================

/** 文件/文件夹节点类型 */
export interface FileNode {
  /** 唯一标识符 */
  id: string;
  /** 文件/文件夹名称 */
  name: string;
  /** 节点类型 */
  type: 'file' | 'folder';
  /** 子节点（仅文件夹） */
  children?: FileNode[];
  /** 文件内容（仅文件） */
  content?: string;
  /** 文件语言 */
  language?: string;
}

interface FileTreeProps {
  /** 文件树数据 */
  files: FileNode[];
  /** 当前选中的文件ID */
  selectedFileId: string | null;
  /** 文件选中事件 */
  onFileSelect: (file: FileNode) => void;
  /** 文件树变更事件 */
  onFilesChange: (files: FileNode[]) => void;
  /** 文件删除事件 */
  onFileDelete: (fileId: string) => void;
}

// ============================================================
// 工具函数
// ============================================================

/** 根据文件扩展名获取语言类型 */
export const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    less: 'less',
    json: 'json',
    md: 'markdown',
    py: 'python',
    vue: 'vue',
    svg: 'xml',
  };
  return langMap[ext || ''] || 'plaintext';
};

/** 根据文件名获取图标 */
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, { icon: typeof File; color: string }> = {
    js: { icon: FileCode, color: 'text-yellow-400' },
    jsx: { icon: FileCode, color: 'text-cyan-400' },
    ts: { icon: FileCode, color: 'text-blue-400' },
    tsx: { icon: FileCode, color: 'text-blue-400' },
    html: { icon: FileCode, color: 'text-orange-400' },
    css: { icon: FileType, color: 'text-pink-400' },
    scss: { icon: FileType, color: 'text-pink-500' },
    json: { icon: FileJson, color: 'text-yellow-300' },
    md: { icon: FileText, color: 'text-gray-400' },
    svg: { icon: Image, color: 'text-green-400' },
    png: { icon: Image, color: 'text-purple-400' },
    jpg: { icon: Image, color: 'text-purple-400' },
    jpeg: { icon: Image, color: 'text-purple-400' },
  };
  return iconMap[ext || ''] || { icon: File, color: 'text-dark-400' };
};

// ============================================================
// 子组件：文件树节点
// ============================================================

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  selectedFileId: string | null;
  expandedFolders: Set<string>;
  onFileSelect: (file: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
  onRename: (node: FileNode, newName: string) => void;
  onDelete: (node: FileNode) => void;
  onAddFile: (parentId: string | null, type: 'file' | 'folder') => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  selectedFileId,
  expandedFolders,
  onFileSelect,
  onToggleFolder,
  onRename,
  onDelete,
  onAddFile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedFileId === node.id;
  const { icon: FileIcon, color: iconColor } = getFileIcon(node.name);

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 编辑模式自动聚焦
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (node.type === 'folder') {
      onToggleFolder(node.id);
    } else {
      onFileSelect(node);
    }
  };

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(node.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative">
      {/* 节点行 */}
      <div
        className={`
          group flex items-center px-2 py-1 cursor-pointer rounded-md transition-all duration-150
          hover:bg-dark-700/50
          ${isSelected ? 'bg-primary-500/20 text-primary-300' : 'text-dark-300'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        {/* 展开/折叠图标（仅文件夹） */}
        {node.type === 'folder' ? (
          <span className="w-4 h-4 mr-1 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-dark-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
            )}
          </span>
        ) : (
          <span className="w-4 h-4 mr-1" />
        )}

        {/* 文件/文件夹图标 */}
        {node.type === 'folder' ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 mr-2 text-amber-400" />
          ) : (
            <Folder className="w-4 h-4 mr-2 text-amber-400" />
          )
        ) : (
          <FileIcon className={`w-4 h-4 mr-2 ${iconColor}`} />
        )}

        {/* 文件名 / 编辑输入框 */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-dark-700 border border-primary-500 rounded px-1 py-0.5 text-sm text-white outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm truncate">{node.name}</span>
        )}

        {/* 操作按钮 */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 ml-2 flex-shrink-0">
          <button
            ref={buttonRef}
            className="p-1 rounded hover:bg-dark-600"
            onClick={(e) => {
              e.stopPropagation();
              // 计算菜单位置
              if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                setMenuPosition({
                  top: rect.bottom + 4,
                  left: Math.min(rect.left, window.innerWidth - 150), // 确保菜单不会超出屏幕
                });
              }
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 右键菜单 - 使用 fixed 定位避免被遮挡 */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed w-36 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl py-1 overflow-hidden"
          style={{ 
            zIndex: 9999,
            top: menuPosition.top,
            left: menuPosition.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {node.type === 'folder' && (
            <>
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-dark-700 flex items-center space-x-2 text-dark-200"
                onClick={() => {
                  onAddFile(node.id, 'file');
                  setShowMenu(false);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建文件</span>
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-dark-700 flex items-center space-x-2 text-dark-200"
                onClick={() => {
                  onAddFile(node.id, 'folder');
                  setShowMenu(false);
                }}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>新建文件夹</span>
              </button>
              <div className="h-px bg-dark-600 my-1" />
            </>
          )}
          <button
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-dark-700 flex items-center space-x-2 text-dark-200"
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>重命名</span>
          </button>
          <button
            className="w-full px-3 py-1.5 text-sm text-left hover:bg-dark-700 flex items-center space-x-2 text-danger-400"
            onClick={() => {
              onDelete(node);
              setShowMenu(false);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除</span>
          </button>
        </div>
      )}

      {/* 子节点（文件夹展开时显示） */}
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFileId={selectedFileId}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onToggleFolder={onToggleFolder}
              onRename={onRename}
              onDelete={onDelete}
              onAddFile={onAddFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// 主组件
// ============================================================

const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFileId,
  onFileSelect,
  onFilesChange,
  onFileDelete,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [newItemName, setNewItemName] = useState('');
  const newItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newItemParent !== null && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [newItemParent]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // 生成唯一ID
  const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 递归更新节点
  const updateNode = (
    nodes: FileNode[],
    targetId: string,
    updater: (node: FileNode) => FileNode
  ): FileNode[] => {
    return nodes.map((node) => {
      if (node.id === targetId) {
        return updater(node);
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children, targetId, updater) };
      }
      return node;
    });
  };

  // 递归删除节点
  const deleteNode = (nodes: FileNode[], targetId: string): FileNode[] => {
    return nodes
      .filter((node) => node.id !== targetId)
      .map((node) => {
        if (node.children) {
          return { ...node, children: deleteNode(node.children, targetId) };
        }
        return node;
      });
  };

  // 递归添加节点
  const addNodeToParent = (
    nodes: FileNode[],
    parentId: string | null,
    newNode: FileNode
  ): FileNode[] => {
    if (parentId === null) {
      return [...nodes, newNode];
    }
    return nodes.map((node) => {
      if (node.id === parentId && node.type === 'folder') {
        return { ...node, children: [...(node.children || []), newNode] };
      }
      if (node.children) {
        return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const handleRename = (node: FileNode, newName: string) => {
    const updated = updateNode(files, node.id, (n) => ({
      ...n,
      name: newName,
      language: n.type === 'file' ? getLanguageFromFilename(newName) : undefined,
    }));
    onFilesChange(updated);
  };

  const handleDelete = (node: FileNode) => {
    const updated = deleteNode(files, node.id);
    onFilesChange(updated);
    onFileDelete(node.id);
  };

  const handleAddFile = (parentId: string | null, type: 'file' | 'folder') => {
    setNewItemParent(parentId);
    setNewItemType(type);
    setNewItemName('');
    if (parentId) {
      setExpandedFolders((prev) => new Set([...prev, parentId]));
    }
  };

  const handleNewItemSubmit = () => {
    if (!newItemName.trim()) {
      setNewItemParent(null);
      return;
    }

    const newNode: FileNode = {
      id: generateId(),
      name: newItemName.trim(),
      type: newItemType,
      ...(newItemType === 'folder'
        ? { children: [] }
        : { content: '', language: getLanguageFromFilename(newItemName) }),
    };

    const updated = addNodeToParent(files, newItemParent, newNode);
    onFilesChange(updated);
    setNewItemParent(null);
    setNewItemName('');
  };

  const handleNewItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNewItemSubmit();
    } else if (e.key === 'Escape') {
      setNewItemParent(null);
      setNewItemName('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-900/50">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700">
        <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
          文件资源管理器
        </span>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            title="新建文件"
            onClick={() => handleAddFile(null, 'file')}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            title="新建文件夹"
            onClick={() => handleAddFile(null, 'folder')}
          >
            <Folder className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 文件树内容 */}
      <div className="flex-1 overflow-auto py-2">
        {files.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedFileId={selectedFileId}
            expandedFolders={expandedFolders}
            onFileSelect={onFileSelect}
            onToggleFolder={toggleFolder}
            onRename={handleRename}
            onDelete={handleDelete}
            onAddFile={handleAddFile}
          />
        ))}

        {/* 新建项目输入框（根级别） */}
        {newItemParent === null && newItemName !== undefined && newItemParent !== undefined && (
          <div className="px-2 py-1" style={{ paddingLeft: '20px' }}>
            {/* 此处仅在用户点击新建按钮后显示 */}
          </div>
        )}
      </div>

      {/* 新建输入框浮层 */}
      {newItemParent !== null && (
        <div className="px-2 py-2 border-t border-dark-700">
          <div className="flex items-center space-x-2">
            {newItemType === 'folder' ? (
              <Folder className="w-4 h-4 text-amber-400" />
            ) : (
              <File className="w-4 h-4 text-dark-400" />
            )}
            <input
              ref={newItemInputRef}
              type="text"
              placeholder={newItemType === 'folder' ? '文件夹名称' : '文件名称'}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={handleNewItemSubmit}
              onKeyDown={handleNewItemKeyDown}
              className="flex-1 bg-dark-700 border border-primary-500 rounded px-2 py-1 text-sm text-white outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTree;

