/**
 * 项目模板组件
 * 提供预设的项目模板，快速创建新项目
 */

import { useState } from 'react';
import {
  Layout,
  Layers,
  Palette,
  Zap,
  Code2,
  Globe,
  Sparkles,
  Box,
  X,
} from 'lucide-react';
import { FileNode, getLanguageFromFilename } from './FileTree';

// ============================================================
// 类型定义
// ============================================================

export interface ProjectTemplate {
  /** 模板ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板图标 */
  icon: typeof Layout;
  /** 图标颜色 */
  color: string;
  /** 文件列表 */
  files: FileNode[];
  /** 入口文件ID */
  entryFileId: string;
}

interface ProjectTemplatesProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 选择模板回调 */
  onSelectTemplate: (template: ProjectTemplate) => void;
}

// ============================================================
// 生成唯一ID
// ============================================================

const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ============================================================
// 项目模板数据
// ============================================================

const templates: ProjectTemplate[] = [
  {
    id: 'blank',
    name: '空白项目',
    description: '从零开始，自由发挥',
    icon: Box,
    color: 'from-gray-500 to-gray-600',
    entryFileId: 'blank-html',
    files: [
      {
        id: 'blank-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的项目</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, World!</h1>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'blank-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `/* 在这里编写你的样式 */
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #333;
}`,
      },
      {
        id: 'blank-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// 在这里编写你的 JavaScript 代码
console.log('Hello, FrontendPrepHub!');`,
      },
    ],
  },
  {
    id: 'landing-page',
    name: '现代着陆页',
    description: '精美的产品展示页面，包含导航、Hero、特性展示',
    icon: Layout,
    color: 'from-blue-500 to-cyan-500',
    entryFileId: 'landing-html',
    files: [
      {
        id: 'landing-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>产品着陆页</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- 导航栏 -->
  <nav class="navbar">
    <div class="nav-brand">
      <span class="logo">🚀</span>
      <span class="brand-name">TechStart</span>
    </div>
    <div class="nav-links">
      <a href="#features">特性</a>
      <a href="#pricing">价格</a>
      <a href="#contact">联系我们</a>
      <button class="btn-primary">开始使用</button>
    </div>
  </nav>

  <!-- Hero 区域 -->
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">
        构建 <span class="gradient-text">未来</span> 的产品
      </h1>
      <p class="hero-desc">
        使用我们的平台，快速构建、部署和扩展您的应用程序。
        简单、强大、可靠。
      </p>
      <div class="hero-buttons">
        <button class="btn-primary btn-lg">免费试用</button>
        <button class="btn-secondary btn-lg">了解更多</button>
      </div>
    </div>
    <div class="hero-visual">
      <div class="floating-card card-1">📊</div>
      <div class="floating-card card-2">⚡</div>
      <div class="floating-card card-3">🎯</div>
    </div>
  </section>

  <!-- 特性区域 -->
  <section id="features" class="features">
    <h2 class="section-title">核心特性</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>极速性能</h3>
        <p>优化的架构确保毫秒级响应时间</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>安全可靠</h3>
        <p>企业级安全保护您的数据</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <h3>无限扩展</h3>
        <p>随业务增长轻松扩展</p>
      </div>
    </div>
  </section>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'landing-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  color: #fff;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  position: fixed;
  width: 100%;
  top: 0;
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo {
  font-size: 2rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  color: #a0a0c0;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #fff;
}

/* 按钮 */
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Hero 区域 */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 0 5%;
  padding-top: 80px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #6366f1, #ec4899, #6366f1);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.hero-desc {
  font-size: 1.25rem;
  color: #a0a0c0;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.hero-visual {
  flex: 1;
  position: relative;
  height: 400px;
}

.floating-card {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  animation: float 6s ease-in-out infinite;
  backdrop-filter: blur(10px);
}

.card-1 { top: 20%; left: 20%; animation-delay: 0s; }
.card-2 { top: 40%; right: 30%; animation-delay: 2s; }
.card-3 { bottom: 20%; left: 40%; animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 特性区域 */
.features {
  padding: 100px 5%;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #a0a0c0;
}`,
      },
      {
        id: 'landing-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 导航栏滚动效果
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > lastScroll && currentScroll > 100) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
});

console.log('🚀 Landing Page Loaded!');`,
      },
    ],
  },
  {
    id: 'dashboard',
    name: '数据仪表盘',
    description: '现代化的数据可视化仪表盘界面',
    icon: Layers,
    color: 'from-purple-500 to-pink-500',
    entryFileId: 'dashboard-html',
    files: [
      {
        id: 'dashboard-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>数据仪表盘</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">📊 Dashboard</div>
      <nav class="nav-menu">
        <a href="#" class="nav-item active">
          <span class="icon">🏠</span>
          <span>概览</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">📈</span>
          <span>分析</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">👥</span>
          <span>用户</span>
        </a>
        <a href="#" class="nav-item">
          <span class="icon">⚙️</span>
          <span>设置</span>
        </a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>数据概览</h1>
        <div class="header-right">
          <input type="search" placeholder="搜索..." class="search-input">
          <div class="avatar">👤</div>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">📊</div>
          <div class="stat-info">
            <span class="stat-value">12,345</span>
            <span class="stat-label">总访问量</span>
          </div>
          <span class="stat-change positive">+12%</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">💰</div>
          <div class="stat-info">
            <span class="stat-value">¥89,012</span>
            <span class="stat-label">总收入</span>
          </div>
          <span class="stat-change positive">+8%</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">👥</div>
          <div class="stat-info">
            <span class="stat-value">3,456</span>
            <span class="stat-label">新用户</span>
          </div>
          <span class="stat-change positive">+23%</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">⭐</div>
          <div class="stat-info">
            <span class="stat-value">98.5%</span>
            <span class="stat-label">满意度</span>
          </div>
          <span class="stat-change negative">-2%</span>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card large">
          <h3>访问趋势</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 80%"></div>
              <div class="bar" style="height: 45%"></div>
              <div class="bar" style="height: 90%"></div>
              <div class="bar" style="height: 70%"></div>
              <div class="bar" style="height: 85%"></div>
              <div class="bar" style="height: 75%"></div>
            </div>
          </div>
        </div>
        <div class="chart-card">
          <h3>用户分布</h3>
          <div class="donut-chart">
            <div class="donut-segment"></div>
            <div class="donut-center">68%</div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'dashboard-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #0f0f1a;
  color: #fff;
  min-height: 100vh;
}

.dashboard {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: #1a1a2e;
  padding: 1.5rem;
  border-right: 1px solid rgba(255,255,255,0.1);
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 1rem;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #888;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.nav-item:hover, .nav-item.active {
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
}

.nav-item .icon {
  font-size: 1.25rem;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 1.75rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #fff;
  outline: none;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.blue { background: rgba(59, 130, 246, 0.2); }
.stat-icon.green { background: rgba(34, 197, 94, 0.2); }
.stat-icon.purple { background: rgba(168, 85, 247, 0.2); }
.stat-icon.orange { background: rgba(249, 115, 22, 0.2); }

.stat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-label {
  color: #888;
  font-size: 0.875rem;
}

.stat-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-change.positive { color: #22c55e; }
.stat-change.negative { color: #ef4444; }

/* 图表区域 */
.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  background: #1a1a2e;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.05);
}

.chart-card h3 {
  margin-bottom: 1rem;
  font-size: 1rem;
  color: #888;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  width: 100%;
  height: 100%;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #6366f1, #8b5cf6);
  border-radius: 8px 8px 0 0;
  animation: grow 1s ease-out;
}

@keyframes grow {
  from { height: 0 !important; }
}

.donut-chart {
  width: 150px;
  height: 150px;
  margin: 0 auto;
  position: relative;
}

.donut-segment {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#6366f1 0% 68%, #2a2a4a 68% 100%);
  mask: radial-gradient(transparent 60%, black 60%);
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem;
  font-weight: bold;
}`,
      },
      {
        id: 'dashboard-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// 导航项点击效果
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.nav-item.active')?.classList.remove('active');
    item.classList.add('active');
  });
});

// 模拟数据加载动画
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    card.style.transition = 'all 0.5s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, index * 100);
});

console.log('📊 Dashboard initialized!');`,
      },
    ],
  },
  {
    id: 'animation',
    name: 'CSS 动画库',
    description: '精美的 CSS 动画效果合集',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-500',
    entryFileId: 'animation-html',
    files: [
      {
        id: 'animation-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS 动画展示</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1 class="title">CSS 动画展示</h1>
    
    <div class="animation-grid">
      <!-- 脉冲动画 -->
      <div class="demo-card">
        <div class="demo-box pulse"></div>
        <span class="demo-label">Pulse</span>
      </div>
      
      <!-- 弹跳动画 -->
      <div class="demo-card">
        <div class="demo-box bounce"></div>
        <span class="demo-label">Bounce</span>
      </div>
      
      <!-- 旋转动画 -->
      <div class="demo-card">
        <div class="demo-box spin"></div>
        <span class="demo-label">Spin</span>
      </div>
      
      <!-- 摇晃动画 -->
      <div class="demo-card">
        <div class="demo-box shake"></div>
        <span class="demo-label">Shake</span>
      </div>
      
      <!-- 淡入淡出 -->
      <div class="demo-card">
        <div class="demo-box fade"></div>
        <span class="demo-label">Fade</span>
      </div>
      
      <!-- 缩放动画 -->
      <div class="demo-card">
        <div class="demo-box scale"></div>
        <span class="demo-label">Scale</span>
      </div>
    </div>

    <!-- 加载动画展示 -->
    <h2 class="subtitle">加载动画</h2>
    <div class="loader-grid">
      <div class="loader spinner"></div>
      <div class="loader dots">
        <span></span><span></span><span></span>
      </div>
      <div class="loader bars">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>

    <!-- 按钮悬停效果 -->
    <h2 class="subtitle">按钮效果</h2>
    <div class="button-grid">
      <button class="btn glow">Glow</button>
      <button class="btn slide">Slide</button>
      <button class="btn ripple">Ripple</button>
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'animation-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  margin: 3rem 0 2rem;
  color: #888;
}

/* 动画网格 */
.animation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.demo-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
}

.demo-box {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.demo-label {
  color: #888;
  font-size: 0.875rem;
}

/* 脉冲动画 */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 弹跳动画 */
.bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 旋转动画 */
.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 摇晃动画 */
.shake {
  animation: shake 0.5s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

/* 淡入淡出 */
.fade {
  animation: fade 2s infinite;
}

@keyframes fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 缩放动画 */
.scale {
  animation: scale 1s infinite alternate;
}

@keyframes scale {
  from { transform: scale(0.8); }
  to { transform: scale(1.2); }
}

/* 加载动画 */
.loader-grid {
  display: flex;
  justify-content: center;
  gap: 4rem;
}

.loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.dots span {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: #6366f1;
  border-radius: 50%;
  margin: 0 4px;
  animation: dots 1.4s infinite ease-in-out;
}

.dots span:nth-child(1) { animation-delay: 0s; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dots {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.bars span {
  display: inline-block;
  width: 6px;
  height: 30px;
  background: #6366f1;
  margin: 0 2px;
  animation: bars 1s infinite ease-in-out;
}

.bars span:nth-child(1) { animation-delay: 0s; }
.bars span:nth-child(2) { animation-delay: 0.1s; }
.bars span:nth-child(3) { animation-delay: 0.2s; }
.bars span:nth-child(4) { animation-delay: 0.3s; }
.bars span:nth-child(5) { animation-delay: 0.4s; }

@keyframes bars {
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
}

/* 按钮效果 */
.button-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.btn.glow {
  background: #6366f1;
  color: white;
}

.btn.glow:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
}

.btn.slide {
  background: transparent;
  border: 2px solid #6366f1;
  color: #6366f1;
}

.btn.slide::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: #6366f1;
  transition: left 0.3s;
  z-index: -1;
}

.btn.slide:hover {
  color: white;
}

.btn.slide:hover::before {
  left: 0;
}

.btn.ripple {
  background: #6366f1;
  color: white;
}

.btn.ripple:active {
  transform: scale(0.95);
}`,
      },
      {
        id: 'animation-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// 涟漪效果
document.querySelector('.btn.ripple').addEventListener('click', function(e) {
  const ripple = document.createElement('span');
  const rect = this.getBoundingClientRect();
  
  ripple.style.cssText = \`
    position: absolute;
    width: 100px;
    height: 100px;
    background: rgba(255,255,255,0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple-effect 0.6s ease-out;
    pointer-events: none;
    left: \${e.clientX - rect.left}px;
    top: \${e.clientY - rect.top}px;
  \`;
  
  this.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
});

// 添加涟漪动画
const style = document.createElement('style');
style.textContent = \`
  @keyframes ripple-effect {
    to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
  }
\`;
document.head.appendChild(style);

console.log('✨ Animation Gallery loaded!');`,
      },
    ],
  },
  {
    id: 'todo-app',
    name: 'Todo 应用',
    description: '功能完整的待办事项应用，包含增删改查',
    icon: Code2,
    color: 'from-emerald-500 to-teal-500',
    entryFileId: 'todo-html',
    files: [
      {
        id: 'todo-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo 应用</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app">
    <header class="header">
      <h1>📝 我的待办</h1>
      <p class="date" id="date"></p>
    </header>

    <div class="input-section">
      <input type="text" id="todoInput" placeholder="添加新任务..." autocomplete="off">
      <button id="addBtn">添加</button>
    </div>

    <div class="filters">
      <button class="filter-btn active" data-filter="all">全部</button>
      <button class="filter-btn" data-filter="active">未完成</button>
      <button class="filter-btn" data-filter="completed">已完成</button>
    </div>

    <ul class="todo-list" id="todoList"></ul>

    <footer class="footer">
      <span id="counter">0 个任务</span>
      <button id="clearCompleted">清除已完成</button>
    </footer>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'todo-css',
        name: 'style.css',
        type: 'file',
        language: 'css',
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.app {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
}

.header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.date {
  opacity: 0.8;
  font-size: 0.875rem;
}

.input-section {
  display: flex;
  padding: 1.5rem;
  gap: 0.75rem;
  border-bottom: 1px solid #eee;
}

.input-section input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
  outline: none;
}

.input-section input:focus {
  border-color: #667eea;
}

.input-section button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.input-section button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.filters {
  display: flex;
  padding: 1rem 1.5rem;
  gap: 0.5rem;
  border-bottom: 1px solid #eee;
}

.filter-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.filter-btn.active {
  background: #667eea;
  color: white;
}

.todo-list {
  list-style: none;
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
}

.todo-item.completed .todo-text {
  text-decoration: line-through;
  color: #999;
}

.todo-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ddd;
  border-radius: 50%;
  margin-right: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.todo-item.completed .todo-checkbox {
  background: #667eea;
  border-color: #667eea;
}

.todo-checkbox::after {
  content: '✓';
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.todo-item.completed .todo-checkbox::after {
  opacity: 1;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 1.25rem;
}

.todo-item:hover .delete-btn {
  opacity: 1;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  color: #666;
  font-size: 0.875rem;
}

.footer button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.footer button:hover {
  color: #ff6b6b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.empty-state span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}`,
      },
      {
        id: 'todo-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `// 待办事项应用
class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || [];
    this.filter = 'all';
    
    // DOM 元素
    this.input = document.getElementById('todoInput');
    this.addBtn = document.getElementById('addBtn');
    this.list = document.getElementById('todoList');
    this.counter = document.getElementById('counter');
    this.clearBtn = document.getElementById('clearCompleted');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    
    // 初始化
    this.bindEvents();
    this.render();
    this.updateDate();
  }
  
  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    this.clearBtn.addEventListener('click', () => this.clearCompleted());
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
    });
  }
  
  addTodo() {
    const text = this.input.value.trim();
    if (!text) return;
    
    this.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
    
    this.input.value = '';
    this.save();
    this.render();
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save();
      this.render();
    }
  }
  
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
    this.render();
  }
  
  clearCompleted() {
    this.todos = this.todos.filter(t => !t.completed);
    this.save();
    this.render();
  }
  
  setFilter(filter) {
    this.filter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }
  
  getFilteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }
  
  save() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
  
  updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date').textContent = new Date().toLocaleDateString('zh-CN', options);
  }
  
  render() {
    const filtered = this.getFilteredTodos();
    
    if (filtered.length === 0) {
      this.list.innerHTML = \`
        <li class="empty-state">
          <span>📋</span>
          暂无任务
        </li>
      \`;
    } else {
      this.list.innerHTML = filtered.map(todo => \`
        <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
          <div class="todo-checkbox" onclick="app.toggleTodo(\${todo.id})"></div>
          <span class="todo-text">\${todo.text}</span>
          <button class="delete-btn" onclick="app.deleteTodo(\${todo.id})">×</button>
        </li>
      \`).join('');
    }
    
    const activeCount = this.todos.filter(t => !t.completed).length;
    this.counter.textContent = \`\${activeCount} 个任务\`;
  }
}

const app = new TodoApp();
console.log('✅ Todo App initialized!');`,
      },
    ],
  },
];

// ============================================================
// 主组件
// ============================================================

const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedTemplate) {
      // 为每个文件生成新的唯一ID
      const filesWithNewIds = selectedTemplate.files.map(file => ({
        ...file,
        id: generateId(),
      }));
      
      // 更新入口文件ID
      const newTemplate = {
        ...selectedTemplate,
        files: filesWithNewIds,
        entryFileId: filesWithNewIds[0].id,
      };
      
      onSelectTemplate(newTemplate);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">选择项目模板</h2>
            <p className="text-sm text-dark-400 mt-1">
              选择一个模板快速开始你的项目
            </p>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 模板列表 */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <button
                  key={template.id}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isSelected
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 hover:border-dark-500 bg-dark-800/50 hover:bg-dark-800'
                    }
                  `}
                  onClick={() => setSelectedTemplate(template)}
                >
                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {/* 图标 */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* 标题 */}
                  <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                  
                  {/* 描述 */}
                  <p className="text-sm text-dark-400 line-clamp-2">{template.description}</p>
                  
                  {/* 文件数量 */}
                  <div className="flex items-center mt-3 text-xs text-dark-500">
                    <Code2 className="w-3.5 h-3.5 mr-1" />
                    <span>{template.files.length} 个文件</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700 bg-dark-850">
          <button
            className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className={`
              px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200
              ${selectedTemplate
                ? 'bg-primary-500 text-white hover:bg-primary-400'
                : 'bg-dark-700 text-dark-400 cursor-not-allowed'
              }
            `}
            onClick={handleConfirm}
            disabled={!selectedTemplate}
          >
            创建项目
          </button>
        </div>
      </div>
    </div>
  );
};

// 导出给外部使用的 Check 图标
const Check: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default ProjectTemplates;
export { templates };

