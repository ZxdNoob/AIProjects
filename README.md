# AIProjects

这是一个包含多个 AI 相关项目的集合仓库。

## 🌐 在线预览

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线预览-blue?style=for-the-badge&logo=github)](https://zxdnoob.github.io/AIProjects/)

| 项目 | 预览地址 | 模式 |
|------|----------|------|
| 📚 FrontendPrepHub | [GitHub Pages](https://zxdnoob.github.io/AIProjects/FrontendPrepHub/) | Mock 数据 |
| 🎲 一起掷骰子 | [GitHub Pages](https://zxdnoob.github.io/AIProjects/zhishuaizi/) | Mock 数据 |

> 💡 **关于 Mock 模式**: GitHub Pages 上的预览使用模拟数据，可以体验完整的 UI 和交互功能。如需持久化数据，请部署后端服务。

## 📦 子项目列表

### 📚 [FrontendPrepHub - 前端面试备战平台](./FrontendPrepHub/)

一个功能完善的全栈前端面试备战平台，具备「用户角色权限 + 知识学习 + 在线编码调试 + 算法动画可视化」核心能力。

**技术栈：**
- **前端**: React 18 + TypeScript + Monaco Editor + Zustand + Tailwind CSS
- **后端**: Express.js + TypeScript + MongoDB + JWT

**主要特性：**
- 🔐 多角色用户系统（普通用户/会员/管理员）
- 📖 分级知识模块（80+ 高频面试考点）
- 💻 在线编码调试（Monaco Editor 多文件编辑）
- 🎬 算法动画可视化（30道算法动画演示）
- 📊 个人学习管理（进度跟踪、错题收集）
- ⚙️ 管理员后台（用户管理、内容管理、数据统计）

详见：[FrontendPrepHub/README.md](./FrontendPrepHub/README.md)

---

### 🎲 [一起掷骰子](./zhishuaizi/)

一个现代化的在线掷骰子应用，具有精美的 3D 动画效果和统计功能。

**主要特性：**
- 3D 骰子动画效果
- 智能加权随机算法
- 统计分析功能
- 版本历史管理
- 产品路线图

详见：[zhishuaizi/README.md](./zhishuaizi/README.md)

---

## 🚀 部署方案

本项目采用**前后端分离**部署架构：

| 组件 | 托管服务 | 说明 |
|------|----------|------|
| 前端 | GitHub Pages | 静态资源，自动部署 |
| 后端 | Render | Node.js 服务 |
| 数据库 | MongoDB Atlas / SQLite | 数据持久化 |

### 部署架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Pages (前端)                        │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ FrontendPrepHub │  │   zhishuaizi    │                   │
│  │   (React App)   │  │   (React App)   │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            │   Mock 模式自动降级  │
            │   (后端不可用时)     │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Render (后端)                           │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ frontendprephub │  │  zhishuaizi-api │                   │
│  │      -api       │  │    (Node.js)    │                   │
│  │  (Express.js)   │  │                 │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────┐  ┌───────────────────┐
│   MongoDB Atlas   │  │      SQLite       │
│   (云数据库)       │  │   (文件数据库)    │
└───────────────────┘  └───────────────────┘
```

---

## 📋 部署指南

### 1️⃣ GitHub Pages 部署（前端）

前端会自动部署，只需：

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 **"GitHub Actions"**
3. 推送代码即可触发自动部署

### 2️⃣ Render 部署（后端）

#### 方式一：使用 Blueprint（推荐）

1. 注册 [Render](https://render.com) 账号
2. 点击 **New** → **Blueprint**
3. 连接此 GitHub 仓库
4. Render 会自动读取 `render.yaml` 配置并部署

#### 方式二：手动创建服务

**部署 FrontendPrepHub 后端：**

1. 创建 **Web Service**
2. 连接仓库，设置：
   - **Root Directory**: `FrontendPrepHub/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. 添加环境变量：
   - `MONGODB_URI`: MongoDB Atlas 连接字符串
   - `JWT_SECRET`: 自定义密钥

**部署 zhishuaizi 后端：**

1. 创建 **Web Service**
2. 连接仓库，设置：
   - **Root Directory**: `zhishuaizi/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
3. 添加 **Disk** 用于 SQLite 持久化

### 3️⃣ 配置前端 API 地址

部署后端后，需要在前端配置 API 地址：

**FrontendPrepHub:**

修改 `FrontendPrepHub/frontend/src/services/api.ts` 中的 `baseURL`，或设置环境变量 `VITE_API_URL`。

**zhishuaizi:**

修改 `zhishuaizi/frontend/src/services/api.ts` 中的 `API_BASE_URL`，或设置环境变量 `VITE_API_URL`。

---

## 🔄 Mock 模式

前端内置了 Mock 模式，在以下情况自动启用：

1. **GitHub Pages 环境** - 自动检测并启用
2. **后端服务不可用** - 自动降级到 Mock 数据
3. **手动启用** - 在浏览器控制台执行：

```javascript
// 启用 Mock 模式
localStorage.setItem('MOCK_MODE', 'true');
location.reload();

// 禁用 Mock 模式
localStorage.removeItem('MOCK_MODE');
location.reload();
```

Mock 模式下可以体验完整的 UI 和交互，但数据不会持久化。

---

## 📝 说明

本仓库使用 `git subtree` 管理子项目，每个子项目都保留完整的 git 历史记录。

### 添加新的子项目

```bash
git subtree add --prefix=<子项目目录名> <子项目仓库URL> master --squash
```

### 更新子项目

```bash
git subtree pull --prefix=<子项目目录名> <子项目仓库URL> master --squash
```

---

## 📄 License

MIT License
