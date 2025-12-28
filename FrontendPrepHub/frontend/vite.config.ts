/**
 * Vite 配置文件
 * Vite 是一个现代化的前端构建工具，提供快速的开发服务器和优化的生产构建
 * 官方文档：https://vitejs.dev/config/
 */

// 导入 Vite 配置定义函数
import { defineConfig } from 'vite';
// 导入 React 插件，提供 React 支持（JSX、Fast Refresh 等）
import react from '@vitejs/plugin-react';
// 导入 Node.js 路径模块，用于解析路径
import path from 'path';

/**
 * 导出 Vite 配置
 * 使用 defineConfig 可以获得更好的类型提示
 */
export default defineConfig({
  // ==================== 插件配置 ====================
  /**
   * 使用的 Vite 插件列表
   * react(): 启用 React 支持，包括：
   *   - JSX 转换
   *   - Fast Refresh（热更新）
   *   - 开发时的错误提示优化
   */
  plugins: [react()],
  
  // ==================== 模块解析配置 ====================
  resolve: {
    /**
     * 路径别名配置
     * 允许使用 @ 符号代替 ./src 路径
     * 例如：import { api } from '@/services/api' 
     *       等同于 import { api } from './src/services/api'
     */
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ==================== 开发服务器配置 ====================
  server: {
    /**
     * 开发服务器主机地址
     * 使用 127.0.0.1 避免 DNS 解析问题（如 VPN/代理影响）
     */
    host: '127.0.0.1',
    
    /**
     * 开发服务器端口
     * 默认为 5173
     */
    port: 5173,
    
    /**
     * API 代理配置
     * 解决开发环境下的跨域问题
     * 将 /api 开头的请求代理到后端服务器
     */
    proxy: {
      '/api': {
        // 后端服务器地址
        target: 'http://localhost:3001',
        // 改变请求的 origin 头，使后端认为请求来自同源
        changeOrigin: true,
      },
    },
  },
});
