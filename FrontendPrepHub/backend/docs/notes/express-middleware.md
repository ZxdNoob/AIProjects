# Express 中间件学习笔记

**创建时间**：2025-12-27 22:49:04  
**更新时间**：2025-12-27 23:02:52

## 📋 学习目标

- 理解 Express 中间件的概念和工作原理
- 掌握常用中间件的使用方法
- 学习编写自定义中间件
- 了解中间件的执行顺序

## 🎯 核心概念

### 1. 什么是中间件？

中间件是 Express 的核心概念，是在请求和响应之间执行的函数。它可以：
- 执行任何代码
- 修改请求和响应对象
- 结束请求-响应循环
- 调用下一个中间件

### 2. 中间件类型

1. **应用级中间件**：使用 `app.use()` 或 `app.METHOD()` 绑定
2. **路由级中间件**：使用 `router.use()` 绑定
3. **错误处理中间件**：4 个参数 `(err, req, res, next)`
4. **内置中间件**：Express 内置的中间件
5. **第三方中间件**：npm 包提供的中间件

## 📚 常用中间件

### 1. 内置中间件

#### express.json()
解析 JSON 请求体。

```typescript
app.use(express.json({ limit: '10mb' }));
```

#### express.urlencoded()
解析 URL 编码的请求体。

```typescript
app.use(express.urlencoded({ extended: true }));
```

### 2. 第三方中间件

#### Helmet
设置安全相关的 HTTP 响应头。

```typescript
import helmet from 'helmet';
app.use(helmet());
```

#### CORS
处理跨域请求。

```typescript
import cors from 'cors';
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

#### Morgan
HTTP 请求日志记录。

```typescript
import morgan from 'morgan';
app.use(morgan('dev')); // 开发环境
app.use(morgan('combined')); // 生产环境
```

## 🛠️ 自定义中间件

### 1. 认证中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. 获取 Token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证 Token',
      });
    }

    const token = authHeader.substring(7);

    // 2. 验证 Token
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    // 3. 注入用户信息
    req.user = { userId: decoded.userId };

    // 4. 继续执行
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token 无效或已过期',
    });
  }
};
```

### 2. 权限验证中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@/models/User';

export const requireMember = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 假设用户信息已由 authenticate 中间件注入
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录',
    });
  }

  // 查询用户角色
  const user = await User.findById(req.user.userId);
  if (!user || (user.role !== UserRole.MEMBER && user.role !== UserRole.ADMIN)) {
    return res.status(403).json({
      success: false,
      message: '需要会员权限',
    });
  }

  next();
};
```

### 3. 错误处理中间件

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 自定义错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 开发环境显示详细错误
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  // 生产环境隐藏错误详情
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
  });
};
```

## 🔄 中间件执行顺序

中间件的执行顺序很重要：

```typescript
// 1. 安全中间件（最先执行）
app.use(helmet());

// 2. CORS（在路由之前）
app.use(cors());

// 3. 日志记录
app.use(morgan('dev'));

// 4. 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. 路由
app.use('/api', routes);

// 6. 404 处理（在路由之后）
app.use(notFoundHandler);

// 7. 错误处理（最后）
app.use(errorHandler);
```

## 💡 最佳实践

### 1. 中间件顺序
- 安全中间件最先执行
- 错误处理中间件最后执行
- 路由中间件在中间

### 2. 错误处理
- 使用统一的错误处理中间件
- 使用 try-catch 或 asyncHandler
- 返回统一的错误响应格式

### 3. 性能优化
- 避免在中间件中执行耗时操作
- 使用缓存减少重复计算
- 合理使用条件中间件

### 4. 代码组织
- 将中间件放在 `middleware/` 目录
- 按功能分类组织
- 添加详细的注释

## 🔗 在项目中的应用

### 1. 认证流程
```
请求 → CORS → 日志 → 解析 → 认证中间件 → 路由 → 响应
```

### 2. 错误处理流程
```
错误 → asyncHandler 捕获 → 错误处理中间件 → 统一响应
```

### 3. 权限验证流程
```
认证中间件 → 权限验证中间件 → 业务逻辑
```

## 📚 参考资料

- [Express 中间件官方文档](https://expressjs.com/en/guide/using-middleware.html)
- [Express 最佳实践](https://expressjs.com/en/advanced/best-practice-performance.html)
- [中间件模式](https://www.patterns.dev/posts/middleware-pattern/)

