import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 部署基础路径：本地开发使用 '/'，GitHub Pages 部署时使用环境变量
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('echarts') || id.includes('zrender')) return 'vendor-echarts';
            if (id.includes('antd')) return 'vendor-antd';
            if (id.includes('react-router')) return 'vendor-router';
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // API 代理配置，解决开发环境跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
