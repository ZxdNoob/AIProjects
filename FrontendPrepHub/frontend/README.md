# FrontendPrepHub 前端项目

前端面试备战平台的前端应用，基于 React 18 + TypeScript + Vite 构建的现代化单页应用（SPA）。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [API 集成](#api-集成)
- [路由配置](#路由配置)
- [状态管理](#状态管理)
- [样式方案](#样式方案)
- [构建部署](#构建部署)

## 🚀 技术栈

### 核心框架
- **React 18.2+** - 用于构建用户界面的 JavaScript 库
- **TypeScript 5.2+** - 提供类型安全的 JavaScript 超集
- **Vite 5.0+** - 下一代前端构建工具，提供极速的开发体验

### 路由与导航
- **React Router v6** - 声明式路由管理，支持嵌套路由和路由守卫

### 状态管理
- **Zustand 4.4+** - 轻量级状态管理库，API 简洁易用

### UI 与样式
- **Tailwind CSS 3.3+** - 实用优先的 CSS 框架，快速构建现代化 UI
- **Lucide React** - 现代化的图标库，提供丰富的 SVG 图标

### 代码编辑与展示
- **Monaco Editor** - VS Code 同款代码编辑器，支持语法高亮、自动补全、多文件编辑
- **react-markdown** - Markdown 内容渲染
- **react-syntax-highlighter** - 代码语法高亮显示

### 网络请求
- **Axios 1.6+** - 基于 Promise 的 HTTP 客户端，支持请求/响应拦截器

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源目录
│   └── vite.svg           # 网站图标
├── src/
│   ├── layouts/           # 布局组件
│   │   ├── MainLayout.tsx      # 主布局（导航栏、侧边栏）
│   │   ├── AuthLayout.tsx      # 认证布局（登录/注册页）
│   │   └── AdminLayout.tsx     # 管理员布局（管理后台）
│   ├── pages/             # 页面组件
│   │   ├── HomePage.tsx        # 首页
│   │   ├── auth/               # 认证相关页面
│   │   │   ├── LoginPage.tsx       # 登录页
│   │   │   └── RegisterPage.tsx   # 注册页
│   │   ├── knowledge/          # 知识点相关页面
│   │   │   ├── KnowledgePage.tsx      # 知识点列表页
│   │   │   └── KnowledgeDetailPage.tsx # 知识点详情页
│   │   ├── problems/           # 编程题相关页面
│   │   │   ├── ProblemsPage.tsx      # 编程题列表页
│   │   │   └── ProblemDetailPage.tsx # 编程题详情页
│   │   ├── algorithms/         # 算法题相关页面
│   │   │   ├── AlgorithmsPage.tsx      # 算法题列表页
│   │   │   └── AlgorithmDetailPage.tsx # 算法题详情页
│   │   ├── ide/                # 在线 IDE 页面
│   │   │   └── IDEPage.tsx         # 在线代码编辑器
│   │   ├── user/               # 用户中心页面
│   │   │   ├── ProfilePage.tsx      # 个人资料页
│   │   │   ├── LearningPage.tsx     # 学习进度页
│   │   │   └── WrongRecordsPage.tsx # 错题记录页
│   │   ├── admin/              # 管理后台页面
│   │   │   ├── AdminDashboard.tsx   # 管理后台首页
│   │   │   ├── AdminUsers.tsx       # 用户管理页
│   │   │   └── AdminContent.tsx     # 内容管理页
│   │   ├── NotFoundPage.tsx   # 404 页面
│   │   └── ForbiddenPage.tsx   # 403 禁止访问页
│   ├── router/            # 路由配置
│   │   └── index.tsx          # 路由定义和权限守卫
│   ├── services/         # API 服务
│   │   └── api.ts             # 封装所有后端 API 请求
│   ├── store/            # 状态管理
│   │   └── authStore.ts       # 认证状态管理（Zustand）
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts          # 全局类型定义
│   ├── styles/           # 全局样式
│   │   └── index.css         # Tailwind CSS 入口和自定义样式
│   ├── App.tsx           # 根组件
│   └── main.tsx          # 应用入口文件
├── index.html            # HTML 模板
├── package.json          # 项目依赖和脚本
├── tsconfig.json         # TypeScript 配置
├── tsconfig.node.json    # Node.js 环境 TypeScript 配置
├── vite.config.ts        # Vite 构建配置
├── tailwind.config.js    # Tailwind CSS 配置
└── postcss.config.js     # PostCSS 配置
```

## 🎯 功能模块

### 1. 用户认证系统
- **登录/注册**：支持邮箱和手机号注册登录
- **JWT 认证**：使用 Token 进行身份验证
- **权限控制**：基于角色的访问控制（RBAC）
- **自动登录**：Token 持久化存储，刷新页面自动恢复登录状态

### 2. 知识点学习模块
- **分级知识点**：基础层、进阶层、原理层知识点展示
- **Markdown 渲染**：支持丰富的 Markdown 格式内容
- **代码高亮**：代码块语法高亮显示
- **收藏与标记**：知识点收藏和已读标记功能

### 3. 编程题练习模块
- **题目列表**：分页展示编程题目，支持筛选和搜索
- **题目详情**：题目描述、示例、提示信息展示
- **在线编码**：集成 Monaco Editor，支持多文件编辑
- **代码提交**：提交代码到后端进行评测
- **提交记录**：查看历史提交记录和评测结果

### 4. 算法题可视化模块
- **算法列表**：展示所有算法题目
- **动画演示**：Canvas API 实现的算法执行动画
- **步骤控制**：支持暂停、播放、回放、倍速控制
- **代码可视化**：算法代码执行过程可视化

### 5. 在线 IDE 模块
- **多文件编辑**：支持创建、编辑、删除多个文件
- **代码高亮**：支持多种编程语言的语法高亮
- **实时预览**：支持 React/Vue 等框架的实时预览
- **代码保存**：代码自动保存到云端

### 6. 个人学习中心
- **个人资料**：查看和编辑个人信息
- **学习进度**：跟踪学习进度和完成情况
- **错题本**：自动收集错题，支持复习和标记
- **学习统计**：学习时长、完成题目数等统计数据

### 7. 管理员后台
- **用户管理**：用户列表、角色管理、状态控制
- **内容管理**：知识点、题目、算法题的管理
- **数据统计**：平台数据统计和报表
- **系统配置**：系统参数配置

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 安装依赖

```bash
cd frontend
npm install
```

### 开发环境启动

```bash
npm run dev
```

启动后，应用将在 `http://localhost:5173` 运行（Vite 默认端口）。

### 生产环境构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 📖 开发指南

### 环境变量配置

前端项目通过 Vite 的环境变量系统管理配置。创建 `.env` 文件：

```env
# API 基础路径（开发环境通常使用代理，生产环境使用完整 URL）
VITE_API_BASE_URL=http://localhost:3001/api

# 应用标题
VITE_APP_TITLE=FrontendPrepHub
```

### 路径别名配置

项目使用 `@` 作为 `src` 目录的别名，在 `tsconfig.json` 和 `vite.config.ts` 中已配置：

```typescript
// 使用别名导入
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
```

### 开发代理配置

在 `vite.config.ts` 中配置开发代理，将 API 请求代理到后端服务器：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## 🔌 API 集成

### API 服务封装

所有后端 API 请求都封装在 `src/services/api.ts` 中，使用 Axios 实例统一管理：

```typescript
import { api } from '@/services/api';

// 使用示例
const response = await api.get('/knowledge');
const user = await api.post('/auth/login', { email, password });
```

### 请求拦截器

- **自动添加 Token**：所有请求自动在请求头中添加 `Authorization: Bearer <token>`
- **统一错误处理**：捕获 401 错误自动跳转到登录页
- **请求日志**：开发环境输出请求日志

### 响应拦截器

- **统一响应格式**：处理后端返回的 `{ success, data, message }` 格式
- **错误处理**：统一处理错误响应，显示错误提示

## 🛣️ 路由配置

### 路由结构

路由配置在 `src/router/index.tsx` 中定义，采用 React Router v6 的声明式路由：

- **公开路由**：首页、知识点、题目列表等，所有用户可访问
- **认证路由**：登录、注册页面
- **受保护路由**：需要登录才能访问（如个人中心）
- **会员路由**：需要会员权限才能访问
- **管理员路由**：仅管理员可访问（如管理后台）

### 路由守卫

使用 `ProtectedRoute` 组件实现路由权限控制：

```typescript
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

### 角色权限路由

使用 `ProtectedRoute` 的 `requiredRole` 属性指定所需角色：

```typescript
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

## 🗄️ 状态管理

### Zustand Store

使用 Zustand 进行状态管理，当前主要管理认证状态：

**authStore** (`src/store/authStore.ts`)：
- `user`: 当前用户信息
- `token`: JWT Token
- `isAuthenticated()`: 检查是否已登录
- `isMember()`: 检查是否为会员
- `hasAccess(role)`: 检查是否有指定角色权限
- `login()`: 登录方法
- `logout()`: 登出方法

### 使用示例

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <div>请先登录</div>;
  }
  
  return (
    <div>
      <p>欢迎，{user?.name}</p>
      <button onClick={logout}>登出</button>
    </div>
  );
}
```

## 🎨 样式方案

### Tailwind CSS

项目使用 Tailwind CSS 作为主要样式方案，采用实用优先的设计理念：

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800">标题</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    按钮
  </button>
</div>
```

### 自定义样式

全局自定义样式定义在 `src/styles/index.css` 中，包括：
- Tailwind CSS 指令
- 自定义 CSS 变量
- 全局样式重置
- 自定义工具类

### 响应式设计

使用 Tailwind 的响应式断点：
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 响应式网格布局 */}
</div>
```

## 📦 构建部署

### 构建命令

```bash
npm run build
```

构建产物：
- `dist/index.html` - HTML 入口文件
- `dist/assets/` - 打包后的 JS、CSS 等静态资源

### 部署到生产环境

1. **构建项目**：
   ```bash
   npm run build
   ```

2. **部署到静态服务器**：
   - 将 `dist/` 目录部署到 Nginx、Apache 等静态服务器
   - 或部署到 Vercel、Netlify 等静态托管平台

3. **配置反向代理**：
   - 配置 Nginx 将 `/api` 请求代理到后端服务器
   - 或使用环境变量配置后端 API 地址

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/frontend/dist;
    index index.html;

    # 前端路由（SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 开发工具

### VS Code 推荐插件

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind 类名提示
- **TypeScript Vue Plugin** - TypeScript 支持

### 浏览器扩展

- **React Developer Tools** - React 组件调试
- **Redux DevTools** - 状态管理调试（Zustand 兼容）

## 📝 代码规范

### TypeScript 规范

- 所有组件和函数必须添加类型注解
- 使用接口（Interface）定义对象类型
- 使用枚举（Enum）定义常量集合
- 避免使用 `any` 类型

### 组件规范

- 使用函数式组件和 Hooks
- 组件文件使用 PascalCase 命名
- 组件必须添加 TypeScript 类型定义
- 复杂组件需要添加注释说明

### 命名规范

- **组件**：PascalCase（如 `UserProfile.tsx`）
- **函数/变量**：camelCase（如 `getUserById`）
- **常量**：UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- **类型/接口**：PascalCase（如 `IUser`）

## 🐛 常见问题

### 1. 端口被占用

如果 5173 端口被占用，Vite 会自动尝试下一个可用端口，或手动指定：

```bash
npm run dev -- --port 3000
```

### 2. API 请求跨域

开发环境通过 Vite 代理解决，确保 `vite.config.ts` 中配置了代理。

### 3. 构建后路由 404

SPA 应用需要配置服务器将所有路由指向 `index.html`，参考上面的 Nginx 配置。

## 📚 相关文档

- [项目根目录 README](../README.md) - 项目整体介绍
- [后端 README](../backend/README.md) - 后端 API 文档
- [部署指南](../docs/DEPLOYMENT.md) - 详细部署说明
- [踩坑文档](./docs/troubleshooting/README.md) - 开发过程中遇到的问题及解决方案

## 📄 License

MIT License

