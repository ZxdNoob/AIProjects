/**
 * 可调整大小的面板组件
 * 支持水平和垂直方向的拖拽调整
 */

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';

// ============================================================
// 类型定义
// ============================================================

interface ResizablePanelProps {
  /** 左侧/上方面板内容 */
  first: ReactNode;
  /** 右侧/下方面板内容 */
  second: ReactNode;
  /** 分割方向 */
  direction: 'horizontal' | 'vertical';
  /** 初始第一个面板大小（百分比） */
  defaultSize?: number;
  /** 最小大小（像素） */
  minSize?: number;
  /** 最大大小（百分比） */
  maxSize?: number;
  /** 是否隐藏第一个面板 */
  hideFirst?: boolean;
  /** 是否隐藏第二个面板 */
  hideSecond?: boolean;
  /** 分割线类名 */
  dividerClassName?: string;
  /** 面板类名 */
  panelClassName?: string;
}

// ============================================================
// 主组件
// ============================================================

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  first,
  second,
  direction,
  defaultSize = 50,
  minSize = 100,
  maxSize = 80,
  hideFirst = false,
  hideSecond = false,
  dividerClassName = '',
  panelClassName = '',
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取容器尺寸
  const getContainerSize = useCallback(() => {
    if (!containerRef.current) return 0;
    return direction === 'horizontal'
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;
  }, [direction]);

  // 鼠标移动处理
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerSize = getContainerSize();
      
      let position: number;
      if (direction === 'horizontal') {
        position = e.clientX - containerRect.left;
      } else {
        position = e.clientY - containerRect.top;
      }

      // 计算百分比
      let newSize = (position / containerSize) * 100;

      // 限制最小尺寸
      const minPercent = (minSize / containerSize) * 100;
      newSize = Math.max(minPercent, Math.min(maxSize, newSize));

      setSize(newSize);
    },
    [isDragging, direction, getContainerSize, minSize, maxSize]
  );

  // 鼠标抬起处理
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // 鼠标按下处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    },
    [direction]
  );

  // 绑定事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 计算实际大小
  const firstSize = hideFirst ? 0 : hideSecond ? 100 : size;
  const secondSize = hideSecond ? 0 : hideFirst ? 100 : 100 - size;

  // 根据方向设置样式
  const containerStyle = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  } as const;

  const firstPanelStyle = {
    [direction === 'horizontal' ? 'width' : 'height']: `${firstSize}%`,
    display: hideFirst ? 'none' : 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    transition: isDragging ? 'none' : 'all 0.15s ease',
  };

  const secondPanelStyle = {
    [direction === 'horizontal' ? 'width' : 'height']: `${secondSize}%`,
    display: hideSecond ? 'none' : 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    transition: isDragging ? 'none' : 'all 0.15s ease',
  };

  const dividerStyle = {
    flexShrink: 0,
    [direction === 'horizontal' ? 'width' : 'height']: '4px',
    [direction === 'horizontal' ? 'cursor' : 'cursor']: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    display: hideFirst || hideSecond ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* 第一个面板 */}
      <div style={firstPanelStyle} className={panelClassName}>
        {first}
      </div>

      {/* 分割线 */}
      {!hideFirst && !hideSecond && (
        <div
          style={dividerStyle}
          className={`
            bg-dark-700 hover:bg-primary-500/50 transition-colors
            ${isDragging ? 'bg-primary-500' : ''}
            ${dividerClassName}
          `}
          onMouseDown={handleMouseDown}
        >
          {/* 拖拽指示器 */}
          <div
            className={`
              ${direction === 'horizontal' ? 'h-8 w-1' : 'w-8 h-1'}
              bg-dark-500 rounded-full
              ${isDragging ? 'bg-primary-400' : ''}
            `}
          />
        </div>
      )}

      {/* 第二个面板 */}
      <div style={secondPanelStyle} className={panelClassName}>
        {second}
      </div>
    </div>
  );
};

export default ResizablePanel;

