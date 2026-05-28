import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';
import './EllipsisTooltip.less';

export interface EllipsisTooltipProps {
  /**
   * 要显示的文本内容
   */
  children: React.ReactNode;
  /**
   * 最大显示行数，默认为 2
   */
  lines?: number;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
  /**
   * Tooltip 的配置项，可以自定义 Tooltip 的行为
   */
  tooltipProps?: Omit<TooltipProps, 'title' | 'children'>;
  /**
   * 是否启用 Tooltip（默认在文本溢出时自动启用）
   */
  showTooltip?: boolean;
  /**
   * 文本对齐方式
   */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /**
   * 自定义 Tooltip 标题（如果不提供，则使用 children）
   */
  tooltipTitle?: React.ReactNode;
}

/**
 * EllipsisTooltip 组件
 * 
 * 用于文本溢出时显示省略号，并使用 Tooltip 展示全部内容的通用组件。
 * 
 * 特性：
 * - 支持单行或多行省略（可配置行数）
 * - 自动检测文本是否溢出，仅在溢出时显示 Tooltip
 * - 高度可配置，支持自定义样式
 * - 可扩展性强，支持自定义 Tooltip 配置
 * 
 * @example
 * ```tsx
 * // 默认两行省略
 * <EllipsisTooltip>
 *   这是一个很长的文本内容，当文本超出两行时会显示省略号...
 * </EllipsisTooltip>
 * 
 * // 单行省略
 * <EllipsisTooltip lines={1}>
 *   单行文本
 * </EllipsisTooltip>
 * 
 * // 自定义样式
 * <EllipsisTooltip 
 *   lines={3} 
 *   className="custom-ellipsis"
 *   style={{ fontSize: '16px' }}
 * >
 *   文本内容
 * </EllipsisTooltip>
 * ```
 */
export default function EllipsisTooltip({
  children,
  lines = 2,
  className = '',
  style,
  tooltipProps,
  showTooltip: controlledShowTooltip,
  textAlign = 'left',
  tooltipTitle,
}: EllipsisTooltipProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // 检测文本是否溢出
  useEffect(() => {
    const checkOverflow = () => {
      const element = contentRef.current;
      if (!element) {
        return;
      }

      // 检查元素的实际高度是否超过可视高度
      const isOverflow = element.scrollHeight > element.clientHeight;
      const shouldShowTooltip =
        controlledShowTooltip !== undefined
          ? controlledShowTooltip
          : isOverflow;

      setShowTooltip(shouldShowTooltip);
    };

    // 初始检测
    checkOverflow();

    // 监听窗口大小变化和内容变化
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // 监听内容变化（MutationObserver）
    const mutationObserver = new MutationObserver(checkOverflow);
    if (contentRef.current) {
      mutationObserver.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [children, lines, controlledShowTooltip]);

  // 构建样式
  const contentStyle: React.CSSProperties = {
    textAlign,
    ...style,
    // 使用 CSS 变量支持动态行数
    ['--ellipsis-lines' as string]: lines,
  };

  // 构建类名
  const contentClassName = `ellipsis-tooltip-content ${className}`.trim();

  // 确定 Tooltip 标题
  const tooltipTitleContent = tooltipTitle !== undefined ? tooltipTitle : children;

  // 渲染内容
  const content = (
    <div
      ref={contentRef}
      className={contentClassName}
      style={contentStyle}
      data-lines={lines}
    >
      {children}
    </div>
  );

  // 如果不需要显示 Tooltip 或未溢出，直接返回内容
  if (!showTooltip) {
    return content;
  }

  // 显示 Tooltip
  return (
    <Tooltip
      title={tooltipTitleContent}
      placement="top"
      overlayStyle={{ maxWidth: '400px' }}
      {...tooltipProps}
    >
      {content}
    </Tooltip>
  );
}

