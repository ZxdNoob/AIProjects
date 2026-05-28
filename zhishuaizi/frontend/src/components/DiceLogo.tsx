import "./DiceLogo.less";

interface DiceLogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

/**
 * 顶级骰子 Logo 组件
 * 采用现代设计风格，具有立体感和动态效果
 */
export default function DiceLogo({
  size = 80,
  animated = false,
  className = "",
}: DiceLogoProps) {
  return (
    <div
      className={`dice-logo ${animated ? "animated" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="dice-logo-container">
        {/* 骰子主体 - 使用 CSS 3D 变换创建立体效果 */}
        <div className="dice-logo-cube">
          {/* 前面 - 显示 3 点 */}
          <div className="dice-logo-face dice-logo-front">
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
          </div>
          {/* 右面 */}
          <div className="dice-logo-face dice-logo-right"></div>
          {/* 上面 */}
          <div className="dice-logo-face dice-logo-top"></div>
          {/* 左面 */}
          <div className="dice-logo-face dice-logo-left"></div>
          {/* 下面 */}
          <div className="dice-logo-face dice-logo-bottom"></div>
          {/* 后面 */}
          <div className="dice-logo-face dice-logo-back">
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
            <div className="dice-logo-dot"></div>
          </div>
        </div>

        {/* 光晕效果 */}
        <div className="dice-logo-glow"></div>
      </div>
    </div>
  );
}
