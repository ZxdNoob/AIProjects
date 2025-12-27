# FrontendPrepHub 后端项目

前端面试备战平台的后端服务，基于 Express.js + TypeScript + MongoDB 构建的 RESTful API 服务。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [功能模块](#功能模块)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [数据模型](#数据模型)
- [认证授权](#认证授权)
- [中间件](#中间件)
- [部署指南](#部署指南)

## 🚀 技术栈

### 核心框架
- **Node.js 18+** - JavaScript 运行时环境
- **Express.js 4.18+** - 快速、极简的 Web 框架
- **TypeScript 5.3+** - 提供类型安全的 JavaScript 超集

### 数据库
- **MongoDB 6.0+** - NoSQL 文档数据库
- **Mongoose 8.0+** - MongoDB 对象建模工具

### 认证与安全
- **JWT (jsonwebtoken)** - JSON Web Token 身份认证
- **bcryptjs** - 密码加密哈希库
- **Helmet** - 安全 HTTP 响应头设置
- **CORS** - 跨域资源共享支持

### 数据验证
- **express-validator** - 请求数据验证中间件

### 工具库
- **dotenv** - 环境变量管理
- **morgan** - HTTP 请求日志记录
- **multer** - 文件上传处理
- **uuid** - 唯一标识符生成

## 📁 项目结构

```
backend/
├── src/
│   ├── config/            # 配置文件
│   │   ├── index.ts            # 应用配置（端口、数据库、JWT 等）
│   │   └── database.ts         # MongoDB 数据库连接
│   ├── controllers/       # 控制器（业务逻辑）
│   │   ├── authController.ts       # 认证控制器
│   │   ├── knowledgeController.ts  # 知识点控制器
│   │   ├── problemController.ts    # 编程题控制器
│   │   ├── algorithmController.ts  # 算法题控制器
│   │   ├── userCodeController.ts   # 用户代码控制器
│   │   ├── learningController.ts   # 学习管理控制器
│   │   ├── adminController.ts      # 管理员控制器
│   │   └── index.ts               # 控制器导出
│   ├── models/            # 数据模型（Mongoose Schema）
│   │   ├── User.ts              # 用户模型
│   │   ├── Knowledge.ts         # 知识点模型
│   │   ├── Problem.ts           # 编程题模型
│   │   ├── Algorithm.ts          # 算法题模型
│   │   ├── Submission.ts         # 提交记录模型
│   │   ├── UserCode.ts          # 用户代码模型
│   │   ├── WrongRecord.ts       # 错题记录模型
│   │   └── index.ts             # 模型导出
│   ├── routes/            # 路由定义
│   │   ├── authRoutes.ts        # 认证路由
│   │   ├── knowledgeRoutes.ts    # 知识点路由
│   │   ├── problemRoutes.ts      # 编程题路由
│   │   ├── algorithmRoutes.ts    # 算法题路由
│   │   ├── userCodeRoutes.ts     # 用户代码路由
│   │   ├── learningRoutes.ts     # 学习管理路由
│   │   ├── adminRoutes.ts        # 管理员路由
│   │   └── index.ts             # 路由聚合
│   ├── middleware/        # 中间件
│   │   ├── auth.ts              # 认证中间件（JWT 验证）
│   │   ├── errorHandler.ts      # 错误处理中间件
│   │   ├── validator.ts          # 数据验证中间件
│   │   └── index.ts             # 中间件导出
│   ├── scripts/           # 脚本工具
│   │   └── seed.ts              # 数据库种子脚本（初始化数据）
│   └── index.ts          # 应用入口文件
├── .env                   # 环境变量文件（不提交到 Git）
├── env.example.txt        # 环境变量示例文件
├── package.json          # 项目依赖和脚本
└── tsconfig.json         # TypeScript 配置
```

## 🎯 功能模块

### 1. 用户认证模块
- **用户注册**：支持邮箱和手机号注册
- **用户登录**：邮箱/手机号 + 密码登录，返回 JWT Token
- **Token 验证**：JWT Token 自动验证和刷新
- **密码加密**：使用 bcrypt 加密存储密码
- **个人资料**：用户信息查看和更新
- **密码修改**：支持修改登录密码

### 2. 知识点管理模块
- **知识点列表**：分页查询知识点，支持筛选和搜索
- **知识点详情**：获取知识点完整信息
- **知识点收藏**：用户收藏/取消收藏知识点
- **学习标记**：标记知识点为已读/未读
- **权限控制**：根据用户角色控制知识点访问权限

### 3. 编程题模块
- **题目列表**：分页查询编程题，支持难度筛选
- **题目详情**：获取题目完整信息（描述、示例、提示等）
- **代码提交**：提交代码进行评测
- **提交记录**：查询用户的提交历史
- **题目收藏**：收藏/取消收藏编程题
- **权限控制**：普通用户免费 15 道，会员全部题目

### 4. 算法题模块
- **算法列表**：分页查询算法题
- **算法详情**：获取算法题完整信息
- **动画数据**：获取算法执行动画的步骤数据
- **代码提交**：提交算法题代码
- **权限控制**：普通用户免费 10 道，会员全部算法题

### 5. 在线 IDE 模块
- **代码保存**：保存用户编写的代码项目
- **代码列表**：查询用户的所有代码项目
- **代码详情**：获取代码项目完整信息
- **代码更新**：更新代码项目内容
- **代码删除**：删除代码项目

### 6. 学习管理模块
- **学习进度**：跟踪用户的学习进度
- **错题本**：自动收集和查询错题记录
- **学习统计**：统计用户的学习数据（完成题目数、学习时长等）
- **学习计划**：创建和管理学习计划

### 7. 管理员后台模块
- **用户管理**：用户列表查询、角色修改、状态控制
- **内容管理**：知识点、题目、算法题的增删改查
- **数据统计**：平台数据统计（用户数、题目数、访问量等）
- **系统配置**：系统参数配置和管理

## 🚀 快速开始

### 环境要求
- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **npm** >= 9.0.0

### 安装依赖

```bash
cd backend
npm install
```

### 环境变量配置

复制环境变量示例文件并配置：

```bash
cp env.example.txt .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/frontend_prep_hub

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS 配置
FRONTEND_URL=http://localhost:5173

# 管理员初始账号
ADMIN_EMAIL=admin@frontendprephub.com
ADMIN_PASSWORD=Admin@123456
```

### 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 初始化数据库

运行种子脚本初始化数据库（创建管理员账号和示例数据）：

```bash
npm run seed
```

### 开发环境启动

```bash
npm run dev
```

启动后，API 服务将在 `http://localhost:3001` 运行。

### 生产环境构建

```bash
npm run build
npm start
```

## 📖 开发指南

### 项目架构

后端采用 MVC（Model-View-Controller）架构模式：

- **Model**：`src/models/` - 数据模型层，定义 MongoDB 集合结构
- **Controller**：`src/controllers/` - 控制器层，处理业务逻辑
- **Route**：`src/routes/` - 路由层，定义 API 端点
- **Middleware**：`src/middleware/` - 中间件层，处理认证、验证、错误处理

### 代码组织规范

1. **控制器方法**：使用 `asyncHandler` 包装，统一错误处理
2. **错误处理**：使用 `AppError` 类抛出业务错误
3. **API 响应**：统一响应格式 `{ success: boolean, message?: string, data?: T }`
4. **路由验证**：使用 express-validator 中间件验证请求数据
5. **认证中间件**：敏感操作使用 `authenticate` 中间件验证 Token
6. **权限中间件**：会员内容使用 `requireMember` 中间件验证权限

### 添加新功能模块

1. **创建数据模型**：在 `src/models/` 中定义 Mongoose Schema
2. **创建控制器**：在 `src/controllers/` 中实现业务逻辑
3. **创建路由**：在 `src/routes/` 中定义 API 路由
4. **注册路由**：在 `src/routes/index.ts` 中注册新路由

### 环境变量说明

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `PORT` | 服务器端口 | `3001` | 否 |
| `NODE_ENV` | 运行环境 | `development` | 否 |
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb://localhost:27017/frontend_prep_hub` | 是 |
| `JWT_SECRET` | JWT 签名密钥 | - | 是（生产环境） |
| `JWT_EXPIRES_IN` | Token 过期时间 | `7d` | 否 |
| `FRONTEND_URL` | 前端地址（CORS） | `http://localhost:5173` | 否 |
| `ADMIN_EMAIL` | 初始管理员邮箱 | `admin@frontendprephub.com` | 否 |
| `ADMIN_PASSWORD` | 初始管理员密码 | `Admin@123456` | 否 |

## 📚 API 文档

### API 基础信息

- **Base URL**：`http://localhost:3001/api`
- **Content-Type**：`application/json`
- **认证方式**：Bearer Token（JWT）

### 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "email",
      "message": "邮箱格式错误"
    }
  ]
}
```

#### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### API 端点列表

#### 认证相关 (`/api/auth`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | 否 |
| POST | `/auth/login` | 用户登录 | 否 |
| GET | `/auth/me` | 获取当前用户信息 | 是 |
| PUT | `/auth/profile` | 更新个人资料 | 是 |
| PUT | `/auth/password` | 修改密码 | 是 |

#### 知识点相关 (`/api/knowledge`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/knowledge` | 获取知识点列表 | 否 |
| GET | `/knowledge/:id` | 获取知识点详情 | 否 |
| POST | `/knowledge/:id/favorite` | 收藏知识点 | 是 |
| DELETE | `/knowledge/:id/favorite` | 取消收藏 | 是 |
| PUT | `/knowledge/:id/mark` | 标记已读/未读 | 是 |

#### 编程题相关 (`/api/problems`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/problems` | 获取编程题列表 | 否 |
| GET | `/problems/:id` | 获取编程题详情 | 否 |
| POST | `/problems/:id/submit` | 提交代码 | 是 |
| GET | `/problems/:id/submissions` | 获取提交记录 | 是 |
| POST | `/problems/:id/favorite` | 收藏题目 | 是 |

#### 算法题相关 (`/api/algorithms`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/algorithms` | 获取算法题列表 | 否 |
| GET | `/algorithms/:id` | 获取算法题详情 | 否 |
| GET | `/algorithms/:id/animation` | 获取动画数据 | 否 |
| POST | `/algorithms/:id/submit` | 提交代码 | 是 |

#### 用户代码相关 (`/api/user-codes`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/user-codes` | 获取代码列表 | 是 |
| GET | `/user-codes/:id` | 获取代码详情 | 是 |
| POST | `/user-codes` | 创建代码项目 | 是 |
| PUT | `/user-codes/:id` | 更新代码项目 | 是 |
| DELETE | `/user-codes/:id` | 删除代码项目 | 是 |

#### 学习管理相关 (`/api/learning`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/learning/progress` | 获取学习进度 | 是 |
| GET | `/learning/wrong-records` | 获取错题记录 | 是 |
| GET | `/learning/statistics` | 获取学习统计 | 是 |

#### 管理员相关 (`/api/admin`)

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/admin/users` | 获取用户列表 | 管理员 |
| PUT | `/admin/users/:id` | 更新用户信息 | 管理员 |
| GET | `/admin/statistics` | 获取平台统计 | 管理员 |
| POST | `/admin/knowledge` | 创建知识点 | 管理员 |
| PUT | `/admin/knowledge/:id` | 更新知识点 | 管理员 |
| DELETE | `/admin/knowledge/:id` | 删除知识点 | 管理员 |

#### 健康检查

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/health` | 健康检查 | 否 |

## 🗄️ 数据模型

### 用户模型 (User)

```typescript
{
  _id: ObjectId,
  email: string,           // 邮箱（唯一）
  phone?: string,          // 手机号（可选，唯一）
  password: string,        // 加密后的密码
  name: string,           // 用户名
  role: 'user' | 'member' | 'admin',  // 用户角色
  avatar?: string,        // 头像 URL
  createdAt: Date,       // 创建时间
  updatedAt: Date         // 更新时间
}
```

### 知识点模型 (Knowledge)

```typescript
{
  _id: ObjectId,
  title: string,          // 标题
  content: string,        // Markdown 内容
  level: 'basic' | 'intermediate' | 'advanced',  // 难度层级
  tags: string[],         // 标签
  isFree: boolean,        // 是否免费
  viewCount: number,      // 浏览次数
  createdAt: Date,
  updatedAt: Date
}
```

### 编程题模型 (Problem)

```typescript
{
  _id: ObjectId,
  title: string,          // 题目标题
  description: string,    // 题目描述
  difficulty: 'easy' | 'medium' | 'hard',  // 难度
  examples: Array<{      // 示例
    input: string,
    output: string,
    explanation?: string
  }>,
  testCases: Array<{     // 测试用例
    input: string,
    expectedOutput: string
  }>,
  hints: string[],       // 提示
  isFree: boolean,       // 是否免费
  createdAt: Date,
  updatedAt: Date
}
```

### 算法题模型 (Algorithm)

```typescript
{
  _id: ObjectId,
  title: string,         // 算法标题
  description: string,   // 算法描述
  category: 'basic' | 'intermediate' | 'advanced',  // 分类
  code: string,         // 算法代码
  animationData: Object, // 动画数据
  timeComplexity: string, // 时间复杂度
  spaceComplexity: string, // 空间复杂度
  isFree: boolean,      // 是否免费
  createdAt: Date,
  updatedAt: Date
}
```

### 提交记录模型 (Submission)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // 用户 ID
  problemId: ObjectId,   // 题目 ID
  code: string,         // 提交的代码
  language: string,     // 编程语言
  status: 'pending' | 'accepted' | 'rejected',  // 状态
  result?: {            // 评测结果
    passed: number,     // 通过用例数
    total: number,      // 总用例数
    error?: string      // 错误信息
  },
  submittedAt: Date     // 提交时间
}
```

### 用户代码模型 (UserCode)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // 用户 ID
  title: string,        // 项目标题
  files: Array<{        // 文件列表
    name: string,       // 文件名
    content: string,    // 文件内容
    language: string    // 编程语言
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

### 错题记录模型 (WrongRecord)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,      // 用户 ID
  problemId: ObjectId,   // 题目 ID
  submissionId: ObjectId, // 提交记录 ID
  wrongAnswer: string,   // 错误答案
  correctAnswer: string, // 正确答案
  notes?: string,        // 用户笔记
  reviewed: boolean,     // 是否已复习
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 认证授权

### JWT 认证流程

1. **用户登录**：客户端发送邮箱/密码到 `/api/auth/login`
2. **服务器验证**：验证用户凭据，生成 JWT Token
3. **返回 Token**：服务器返回 Token 给客户端
4. **客户端存储**：客户端将 Token 存储到 localStorage
5. **请求携带**：后续请求在请求头中携带 `Authorization: Bearer <token>`
6. **服务器验证**：中间件验证 Token 有效性，提取用户信息

### 认证中间件

使用 `authenticate` 中间件验证 Token：

```typescript
import { authenticate } from '@/middleware/auth';

router.get('/profile', authenticate, getProfile);
```

### 角色权限

系统支持三种角色：

- **user**：普通用户，免费访问基础内容
- **member**：会员用户，可访问全部内容
- **admin**：管理员，拥有系统管理权限

### 权限中间件

使用 `requireMember` 中间件验证会员权限：

```typescript
import { requireMember } from '@/middleware/auth';

router.get('/premium-content', authenticate, requireMember, getPremiumContent);
```

## 🛠️ 中间件

### 认证中间件 (`auth.ts`)

- `authenticate`：验证 JWT Token，提取用户信息
- `requireMember`：验证用户是否为会员
- `requireAdmin`：验证用户是否为管理员

### 错误处理中间件 (`errorHandler.ts`)

- `notFoundHandler`：处理 404 错误
- `errorHandler`：全局错误处理，统一错误响应格式

### 验证中间件 (`validator.ts`)

- 使用 express-validator 验证请求数据
- 支持自定义验证规则
- 返回详细的验证错误信息

## 🚢 部署指南

### 生产环境配置

1. **设置环境变量**：
   ```env
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb://your-mongodb-uri
   JWT_SECRET=your-strong-secret-key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **构建项目**：
   ```bash
   npm run build
   ```

3. **启动服务**：
   ```bash
   npm start
   ```

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/index.js --name frontend-prep-hub-api

# 查看状态
pm2 status

# 查看日志
pm2 logs frontend-prep-hub-api

# 重启应用
pm2 restart frontend-prep-hub-api

# 停止应用
pm2 stop frontend-prep-hub-api
```

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t frontend-prep-hub-api .
docker run -p 3001:3001 --env-file .env frontend-prep-hub-api
```

## 🧪 测试

### 运行测试

```bash
npm test
```

### 测试账号

初始化数据库后，可以使用以下测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@frontendprephub.com | Admin@123456 |
| 普通用户 | user@test.com | Test@123456 |
| 会员用户 | member@test.com | Test@123456 |

## 📝 代码规范

### TypeScript 规范

- 所有代码必须使用 TypeScript，启用严格模式
- 使用接口（Interface）定义对象类型
- 使用枚举（Enum）定义常量集合
- 避免使用 `any` 类型

### 命名规范

- **文件/类**：PascalCase（如 `UserController.ts`）
- **函数/变量**：camelCase（如 `getUserById`）
- **常量**：UPPER_SNAKE_CASE（如 `MAX_RETRY_COUNT`）
- **接口/类型**：PascalCase（如 `IUser`）

### 注释规范

所有代码必须添加详细的中文注释，包括：
- 文件头注释
- 函数/方法注释
- 复杂逻辑注释

## 🐛 常见问题

### 1. MongoDB 连接失败

检查 MongoDB 服务是否运行，连接字符串是否正确：

```bash
# 检查 MongoDB 服务
brew services list  # macOS
sudo systemctl status mongod  # Linux
```

### 2. JWT Token 验证失败

确保：
- Token 未过期
- JWT_SECRET 配置正确
- 请求头格式正确：`Authorization: Bearer <token>`

### 3. CORS 跨域问题

检查 `FRONTEND_URL` 环境变量是否配置正确，确保前端地址在 CORS 白名单中。

## 📚 相关文档

- [项目根目录 README](../README.md) - 项目整体介绍
- [前端 README](../frontend/README.md) - 前端项目文档
- [部署指南](../docs/DEPLOYMENT.md) - 详细部署说明
- [踩坑文档](./docs/troubleshooting/README.md) - 开发过程中遇到的问题及解决方案

## 📄 License

MIT License

