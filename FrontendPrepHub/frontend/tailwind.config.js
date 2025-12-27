/**
 * Tailwind CSS 配置文件
 * 用于自定义 Tailwind 的主题、颜色、动画等
 * 官方文档：https://tailwindcss.com/docs/configuration
 */

/** @type {import('tailwindcss').Config} */
export default {
  // ==================== 内容扫描配置 ====================
  /**
   * 指定 Tailwind 应该扫描哪些文件来生成 CSS
   * 只有在这些文件中使用的类名才会被包含在最终的 CSS 中
   */
  content: [
    "./index.html",                    // HTML 入口文件
    "./src/**/*.{js,ts,jsx,tsx}",     // src 目录下所有 JS/TS/JSX/TSX 文件
  ],
  
  // ==================== 主题配置 ====================
  theme: {
    /**
     * extend: 扩展默认主题而不是完全覆盖
     * 这样可以保留 Tailwind 的默认配置同时添加自定义配置
     */
    extend: {
      // -------------------- 颜色配置 --------------------
      colors: {
        /**
         * 主色调 - 深蓝科技感
         * 用于主要按钮、链接、强调元素等
         * 使用方式：bg-primary-500, text-primary-300 等
         */
        primary: {
          50: '#eff6ff',   // 最浅
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 主色
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',  // 最深
        },
        
        /**
         * 强调色 - 紫色渐变
         * 用于特殊强调、会员标识等
         * 使用方式：bg-accent-500, text-accent-300 等
         */
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',  // 主色
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        
        /**
         * 成功色 - 绿色
         * 用于成功状态、通过提示等
         */
        success: {
          500: '#22c55e',  // 主色
          600: '#16a34a',  // 深色（悬停状态）
        },
        
        /**
         * 警告色 - 橙色
         * 用于警告提示、需要注意的内容等
         */
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        
        /**
         * 错误色 - 红色
         * 用于错误提示、危险操作等
         */
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        
        /**
         * 深色背景色系
         * 用于深色主题的各种背景和文字
         * dark-950 为最深（主背景），dark-100 为最浅（主文字）
         */
        dark: {
          50: '#f8fafc',   // 最浅（浅色主题背景）
          100: '#f1f5f9',  // 主要文字颜色
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',  // 次要文字颜色
          500: '#64748b',  // 辅助文字颜色
          600: '#475569',
          700: '#334155',  // 边框颜色
          800: '#1e293b',  // 卡片背景
          900: '#0f172a',  // 次背景
          950: '#020617',  // 主背景（最深）
        },
      },
      
      // -------------------- 字体配置 --------------------
      fontFamily: {
        /**
         * 无衬线字体栈
         * JetBrains Mono: 代码字体，适合技术内容
         * Noto Sans SC: 思源黑体，中文支持
         */
        sans: ['JetBrains Mono', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        /**
         * 等宽字体栈
         * 用于代码显示
         */
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      // -------------------- 动画配置 --------------------
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',       // 淡入动画
        'slide-up': 'slideUp 0.5s ease-out',     // 上滑淡入
        'slide-down': 'slideDown 0.3s ease-out', // 下滑淡入
        'scale-in': 'scaleIn 0.3s ease-out',     // 缩放进入
        'spin-slow': 'spin 3s linear infinite',  // 慢速旋转
        'pulse-slow': 'pulse 3s ease-in-out infinite', // 慢速脉动
        'gradient': 'gradient 8s ease infinite', // 渐变动画
      },
      
      // -------------------- 关键帧定义 --------------------
      keyframes: {
        /**
         * 淡入动画
         * 从透明到不透明
         */
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        /**
         * 上滑淡入动画
         * 从下方滑入并淡入
         */
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /**
         * 下滑淡入动画
         * 从上方滑入并淡入
         */
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        /**
         * 缩放进入动画
         * 从小到正常大小
         */
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        /**
         * 渐变动画
         * 背景位置从左到右循环
         * 用于文字渐变效果
         */
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      
      // -------------------- 背景图像配置 --------------------
      backgroundImage: {
        // 径向渐变
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        // 圆锥渐变
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        /**
         * 网格图案背景
         * 使用 SVG 数据 URI 创建的装饰性网格图案
         * 用于页面背景装饰
         */
        'mesh-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      },
      
      // -------------------- 阴影配置 --------------------
      boxShadow: {
        // 主色发光阴影
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        // 主色大发光阴影
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        // 强调色发光阴影
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
    },
  },
  
  // ==================== 插件配置 ====================
  /**
   * Tailwind 插件列表
   * 目前未使用任何插件
   */
  plugins: [],
}
