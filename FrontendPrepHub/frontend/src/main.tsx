/**
 * 应用入口文件
 * React 应用的启动点
 */

// 导入 React 核心库
import React from 'react';
// 导入 ReactDOM，用于将 React 组件渲染到 DOM
import ReactDOM from 'react-dom/client';
// 导入 React Router 的 BrowserRouter 组件，用于支持前端路由
import { BrowserRouter } from 'react-router-dom';
// 导入根组件
import App from './App';
// 导入全局样式文件
import './styles/index.css';

/**
 * 获取路由基础路径
 * 本地开发时使用 '/'，GitHub Pages 部署时使用 '/AIProjects/FrontendPrepHub/'
 */
const basename = import.meta.env.BASE_URL || '/';

/**
 * 创建 React 根节点并渲染应用
 * 
 * document.getElementById('root')! - 获取 HTML 中 id 为 'root' 的元素作为挂载点
 * ! 表示断言该元素一定存在
 * 
 * React.StrictMode - 严格模式组件，帮助检测潜在问题：
 *   - 识别不安全的生命周期
 *   - 检测意外的副作用
 *   - 检测废弃的 API 使用
 * 
 * BrowserRouter - 使用 HTML5 history API 实现客户端路由
 *   - 支持前端页面跳转而不刷新页面
 *   - 使 URL 看起来像传统的多页面应用
 *   - basename 设置为 Vite 的 base 路径，确保子目录部署正常工作
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  // 启用严格模式，帮助发现潜在问题
  <React.StrictMode>
    {/* 包装 BrowserRouter 提供路由功能，设置 basename 支持子目录部署 */}
    <BrowserRouter basename={basename}>
      {/* 渲染应用根组件 */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
