import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // 部署基础路径：本地开发使用 '/'，GitHub Pages 部署时使用环境变量
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
})
