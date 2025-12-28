/**
 * IDE 组件索引文件
 * 统一导出所有 IDE 相关组件
 */

export { default as FileTree } from './FileTree';
export { default as EditorTabs } from './EditorTabs';
export { default as Terminal } from './Terminal';
export { default as Preview } from './Preview';
export { default as ProjectTemplates } from './ProjectTemplates';
export { default as Toolbar } from './Toolbar';
export { default as SaveLoadPanel } from './SaveLoadPanel';
export { default as ResizablePanel } from './ResizablePanel';

// 类型导出
export type { FileNode } from './FileTree';
export type { OpenTab } from './EditorTabs';
export type { ConsoleMessage, ConsoleMessageType } from './Terminal';
export type { ProjectTemplate } from './ProjectTemplates';

// 工具函数导出
export { getLanguageFromFilename } from './FileTree';
export { templates } from './ProjectTemplates';

