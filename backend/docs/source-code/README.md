# 后端源码逐行解读

本目录包含后端项目源码的详细解读文档。

## 📋 源码解读列表

### 核心模块

| 模块 | 文件路径 | 说明 | 文档 |
|------|---------|------|------|
| 应用入口 | `src/index.ts` | Express 应用主入口 | - |
| 配置管理 | `src/config/index.ts` | 应用配置管理 | - |
| 数据库 | `src/config/database.ts` | MongoDB 数据库连接 | - |

### 控制器

| 控制器 | 文件路径 | 说明 | 文档 |
|------|---------|------|------|
| 认证控制器 | `src/controllers/authController.ts` | 用户认证逻辑 | [查看详情](./authController.md) |
| 知识点控制器 | `src/controllers/knowledgeController.ts` | 知识点管理逻辑 | - |
| 编程题控制器 | `src/controllers/problemController.ts` | 编程题管理逻辑 | - |

### 数据模型

| 模型 | 文件路径 | 说明 | 文档 |
|------|---------|------|------|
| 用户模型 | `src/models/User.ts` | 用户数据模型 | - |
| 知识点模型 | `src/models/Knowledge.ts` | 知识点数据模型 | - |
| 编程题模型 | `src/models/Problem.ts` | 编程题数据模型 | - |

### 中间件

| 中间件 | 文件路径 | 说明 | 文档 |
|--------|---------|------|------|
| 认证中间件 | `src/middleware/auth.ts` | JWT 认证中间件 | - |
| 错误处理 | `src/middleware/errorHandler.ts` | 全局错误处理 | - |
| 数据验证 | `src/middleware/validator.ts` | 请求数据验证 | - |

### 路由

| 路由 | 文件路径 | 说明 | 文档 |
|------|---------|------|------|
| 认证路由 | `src/routes/authRoutes.ts` | 认证相关路由 | - |
| 知识点路由 | `src/routes/knowledgeRoutes.ts` | 知识点相关路由 | - |

## 📝 文档格式

每个源码解读文档应包含以下内容：

1. **文件概述**
   - 文件路径
   - 文件用途
   - 依赖关系

2. **逐行解读**
   - 代码片段
   - 详细注释
   - 实现原理

3. **关键概念**
   - 核心算法
   - 设计模式
   - 最佳实践

4. **使用示例**
   - 代码示例
   - 使用场景
   - 注意事项

## 🔗 相关链接

- [后端文档首页](../README.md)
- [学习笔记](../notes/README.md)

