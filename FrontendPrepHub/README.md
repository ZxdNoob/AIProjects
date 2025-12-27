# FrontendPrepHub - 前端面试备战平台

一个功能完善的全栈前端面试备战平台，具备「用户角色权限 + 知识学习 + 在线编码调试 + 算法动画可视化」核心能力。

## 🚀 技术栈

### 前端
- **核心框架**: React 18 + TypeScript
- **在线 IDE**: Monaco Editor (VS Code 同款)
- **状态管理**: Zustand
- **路由管理**: React Router v6
- **网络请求**: Axios
- **样式方案**: Tailwind CSS
- **算法动画**: Canvas API

### 后端
- **框架**: Express.js + TypeScript
- **数据库**: MongoDB + Mongoose
- **身份认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **文件上传**: multer
- **数据校验**: express-validator
- **权限控制**: RBAC (基于角色的访问控制)

## 📁 项目结构

```
FrontendPrepHub/
├── frontend/                 # React 前端项目
│   ├── src/
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   ├── layouts/         # 布局组件
│   │   ├── store/           # Zustand 状态管理
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── services/        # API 服务
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # TypeScript 类型
│   │   └── router/          # 路由配置
│   └── ...
├── backend/                  # Node.js 后端项目
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 数据模型
│   │   ├── routes/          # 路由
│   │   ├── middleware/      # 中间件
│   │   ├── services/        # 业务逻辑
│   │   ├── utils/           # 工具函数
│   │   └── config/          # 配置文件
│   └── ...
└── docs/                     # 文档
```

## 🔧 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### 后端启动

```bash
cd backend
npm install
cp .env.example .env  # 配置环境变量
npm run dev           # 开发环境
npm run start         # 生产环境
```

### 前端启动

```bash
cd frontend
npm install
npm run dev           # 开发环境
npm run build         # 生产环境打包
```

## 👥 用户角色

| 角色 | 权限说明 |
|------|---------|
| 普通用户 | 基础知识点学习、免费编程题(15道)、基础算法动画(10道) |
| 会员用户 | 全部知识点、所有编程题/算法题、高级功能 |
| 超级管理员 | 全平台权限、用户管理、内容管理、数据统计 |

## 🎯 核心功能

### 1. 多角色用户系统
- 手机号/邮箱注册登录
- JWT Token 认证
- 角色权限管控
- 云端数据同步

### 2. 分级知识模块
- 基础层/进阶层/原理层知识点
- 80+ 高频面试考点
- 真题题库(50+道)
- 知识点收藏与标记

### 3. 在线编码调试
- Monaco Editor 多文件编辑
- 实时预览(支持 React/Vue)
- 断点调试与调用栈查看
- 50道高频手写题

### 4. 算法动画可视化
- 30道算法动画演示
- 步骤控制(暂停/回放/倍速)
- 代码执行可视化
- 时间复杂度标注

### 5. 个人学习管理
- 学习进度跟踪
- 自动错题收集
- 个性化学习计划
- 面试备战报告

### 6. 管理员后台
- 用户管理(CRUD)
- 内容管理(知识点/题目)
- 数据统计与报表
- 系统配置

## 📋 文档

- [部署指南](./docs/DEPLOYMENT.md) - 详细的部署和配置说明
- [开发路线图](./docs/ROADMAP.md) - 后续功能规划和扩展方向

## 🧪 测试账号

初始化数据库后可用的测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@frontendprephub.com | Admin@123456 |
| 普通用户 | user@test.com | Test@123456 |
| 会员用户 | member@test.com | Test@123456 |

## 📝 License

MIT License

