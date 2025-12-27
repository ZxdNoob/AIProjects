# 认证控制器（authController）源码解读

**文件路径**：`src/controllers/authController.ts`  
**创建时间**：2025-12-27 22:49:04  
**更新时间**：2025-12-27 23:02:44

## 📋 文件概述

`authController.ts` 是后端认证模块的核心控制器，负责处理用户注册、登录、个人资料管理等认证相关的业务逻辑。它使用 Express 的控制器模式，通过中间件进行数据验证和错误处理。

## 🔗 依赖关系

- **Express**：Web 框架
- **Mongoose**：MongoDB ODM
- **bcryptjs**：密码加密
- **jsonwebtoken**：JWT Token 生成
- **express-validator**：请求数据验证
- **错误处理**：`src/middleware/errorHandler.ts`
- **数据模型**：`src/models/User.ts`

## 📖 核心功能解读

### 1. 用户注册（register）

```typescript
export const register = asyncHandler(async (req: Request, res: Response) => {
  // 1. 数据验证（由 express-validator 中间件处理）
  const { email, password, name, phone } = req.body;

  // 2. 检查用户是否已存在
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new AppError('用户已存在', 400);
  }

  // 3. 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. 创建用户
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    phone,
    role: UserRole.USER, // 默认角色为普通用户
  });

  // 5. 生成 JWT Token
  const token = jwt.sign(
    { userId: user._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // 6. 返回响应（不返回密码）
  res.status(201).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    },
  });
});
```

**关键点说明**：

1. **asyncHandler 包装**：
   - 统一错误处理，避免每个方法都写 try-catch
   - 自动捕获错误并传递给错误处理中间件

2. **用户存在性检查**：
   - 使用 `$or` 查询邮箱或手机号
   - 防止重复注册

3. **密码加密**：
   - 使用 bcrypt 加密，成本因子为 10
   - 异步加密，不阻塞主线程

4. **Token 生成**：
   - 使用用户 ID 作为 payload
   - 设置过期时间（从配置读取）
   - 使用密钥签名

5. **响应格式**：
   - 统一响应格式：`{ success, data }`
   - 不返回敏感信息（密码）

### 2. 用户登录（login）

```typescript
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. 查找用户（同时查询邮箱和手机号）
  const user = await User.findOne({
    $or: [{ email }, { phone: email }],
  }).select('+password'); // 显式选择密码字段

  // 2. 验证用户是否存在
  if (!user) {
    throw new AppError('邮箱或密码错误', 401);
  }

  // 3. 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('邮箱或密码错误', 401);
  }

  // 4. 生成 Token
  const token = jwt.sign(
    { userId: user._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // 5. 返回响应
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    },
  });
});
```

**关键点说明**：

1. **灵活登录**：
   - 支持邮箱或手机号登录
   - 使用 `$or` 查询

2. **密码字段选择**：
   - 默认 User 模型不返回密码
   - 使用 `.select('+password')` 显式选择

3. **密码验证**：
   - 使用 bcrypt.compare 比较密码
   - 不直接比较明文，防止时序攻击

4. **统一错误提示**：
   - 不区分用户不存在和密码错误
   - 防止用户枚举攻击

### 3. 获取当前用户（getMe）

```typescript
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user 由 authenticate 中间件注入
  const user = await User.findById(req.user!.userId);

  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
});
```

**关键点说明**：

1. **中间件注入**：
   - `authenticate` 中间件验证 Token
   - 将用户 ID 注入到 `req.user`

2. **用户查询**：
   - 根据中间件注入的 ID 查询用户
   - 返回完整用户信息

### 4. 更新个人资料（updateProfile）

```typescript
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, avatar } = req.body;
  const userId = req.user!.userId;

  // 1. 如果更新手机号，检查是否已被使用
  if (phone) {
    const existingUser = await User.findOne({
      phone,
      _id: { $ne: userId }, // 排除当前用户
    });

    if (existingUser) {
      throw new AppError('手机号已被使用', 400);
    }
  }

  // 2. 更新用户信息
  const user = await User.findByIdAndUpdate(
    userId,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: { user },
  });
});
```

**关键点说明**：

1. **手机号唯一性检查**：
   - 更新前检查是否被其他用户使用
   - 使用 `$ne` 排除当前用户

2. **更新选项**：
   - `new: true`：返回更新后的文档
   - `runValidators: true`：运行模型验证器

### 5. 修改密码（changePassword）

```typescript
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;

  // 1. 获取用户（包含密码）
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  // 2. 验证当前密码
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('当前密码错误', 400);
  }

  // 3. 加密新密码
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. 更新密码
  user.password = hashedPassword;
  await user.save();

  res.json({
    success: true,
    message: '密码修改成功',
  });
});
```

**关键点说明**：

1. **密码验证**：
   - 必须提供当前密码
   - 验证通过才能修改

2. **密码更新**：
   - 使用 `user.save()` 触发模型验证
   - 自动触发密码加密钩子（如果定义了）

## 🔑 核心概念

### 1. asyncHandler 模式
- 统一错误处理
- 自动捕获异步错误
- 传递给错误处理中间件

### 2. 密码安全
- 使用 bcrypt 加密
- 成本因子 10（平衡安全性和性能）
- 不存储明文密码

### 3. JWT Token
- 无状态认证
- 包含用户 ID
- 设置过期时间

### 4. 错误处理
- 使用 AppError 抛出业务错误
- 统一错误响应格式
- 不泄露敏感信息

## ⚠️ 注意事项

1. **密码安全**：
   - 永远不返回密码字段
   - 使用 `.select('+password')` 显式选择

2. **用户枚举防护**：
   - 登录错误统一提示
   - 不区分用户不存在和密码错误

3. **数据验证**：
   - 使用 express-validator 验证输入
   - 在路由层进行验证

4. **Token 安全**：
   - 使用强密钥
   - 设置合理的过期时间
   - 考虑 Token 刷新机制

## 🔗 相关文件

- [认证路由](../../src/routes/authRoutes.ts) - 路由定义
- [认证中间件](../../src/middleware/auth.ts) - Token 验证
- [用户模型](../../src/models/User.ts) - 用户数据模型
- [错误处理](../../src/middleware/errorHandler.ts) - 全局错误处理

