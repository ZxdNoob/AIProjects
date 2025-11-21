import React from 'react';
import './DiceReadyIcon.less';

interface DiceReadyIconProps {
  size?: number;
}

export default function DiceReadyIcon({ size = 200 }: DiceReadyIconProps) {
  return (
    <div className="dice-ready-icon" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="dice-ready-svg"
      >
        {/* 渐变定义 */}
        <defs>
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
          <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd4e0" />
            <stop offset="50%" stopColor="#ffc0d0" />
            <stop offset="100%" stopColor="#ffb0c4" />
          </linearGradient>
          <radialGradient id="diceHighlight" cx="50%" cy="30%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.25" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景光晕 */}
        <circle
          cx="120"
          cy="120"
          r="80"
          fill="url(#diceGradient)"
          opacity="0.08"
          className="dice-ready-glow"
        />

        {/* 左手 */}
        <g className="dice-ready-hand-left">
          {/* 手掌 */}
          <ellipse
            cx="70"
            cy="110"
            rx="18"
            ry="25"
            fill="url(#handGradient)"
            filter="url(#shadow)"
            stroke="#ffa0b8"
            strokeWidth="2"
          />
          {/* 拇指 */}
          <ellipse
            cx="55"
            cy="105"
            rx="8"
            ry="12"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
            transform="rotate(-20 55 105)"
          />
          {/* 手指 */}
          <ellipse
            cx="65"
            cy="95"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
          <ellipse
            cx="72"
            cy="92"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
          <ellipse
            cx="78"
            cy="95"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
        </g>

        {/* 骰子 */}
        <g className="dice-ready-dice">
          {/* 骰子主体 */}
          <rect
            x="95"
            y="95"
            width="50"
            height="50"
            rx="6"
            fill="url(#diceGradient)"
            filter="url(#shadow)"
            stroke="#5a6fd8"
            strokeWidth="2"
          />
          {/* 高光效果 */}
          <rect
            x="95"
            y="95"
            width="50"
            height="50"
            rx="6"
            fill="url(#diceHighlight)"
          />
          {/* 骰子点数 - 5点 */}
          <circle cx="107" cy="107" r="4" fill="white" opacity="0.95" />
          <circle cx="133" cy="107" r="4" fill="white" opacity="0.95" />
          <circle cx="120" cy="120" r="4" fill="white" opacity="0.95" />
          <circle cx="107" cy="133" r="4" fill="white" opacity="0.95" />
          <circle cx="133" cy="133" r="4" fill="white" opacity="0.95" />
        </g>

        {/* 右手 */}
        <g className="dice-ready-hand-right">
          {/* 手掌 */}
          <ellipse
            cx="170"
            cy="110"
            rx="18"
            ry="25"
            fill="url(#handGradient)"
            filter="url(#shadow)"
            stroke="#ffa0b8"
            strokeWidth="2"
          />
          {/* 拇指 */}
          <ellipse
            cx="185"
            cy="105"
            rx="8"
            ry="12"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
            transform="rotate(20 185 105)"
          />
          {/* 手指 */}
          <ellipse
            cx="175"
            cy="95"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
          <ellipse
            cx="168"
            cy="92"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
          <ellipse
            cx="162"
            cy="95"
            rx="5"
            ry="14"
            fill="url(#handGradient)"
            stroke="#ffa0b8"
            strokeWidth="1.5"
          />
        </g>

        {/* 动态线条 - 表示准备投掷的动作 */}
        <g className="dice-ready-motion">
          <path
            d="M 120 70 Q 100 55 80 65"
            stroke="url(#diceGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="5 5"
            opacity="0.5"
            filter="url(#glow)"
          />
          <path
            d="M 120 70 Q 140 55 160 65"
            stroke="url(#diceGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="5 5"
            opacity="0.5"
            filter="url(#glow)"
          />
          {/* 小星星装饰 */}
          <circle cx="75" cy="60" r="2" fill="#667eea" opacity="0.6" className="dice-ready-star" />
          <circle cx="165" cy="60" r="2" fill="#764ba2" opacity="0.6" className="dice-ready-star" />
        </g>
      </svg>
    </div>
  );
}

