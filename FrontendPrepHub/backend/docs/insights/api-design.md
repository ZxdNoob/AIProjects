# RESTful API 设计经验

**创建时间**：2025-12-27 22:49:04  
**更新时间**：2025-12-27 23:03:00

## 📋 背景说明

在设计前端面试备战平台的后端 API 时，需要遵循 RESTful 设计原则，构建一套清晰、易用、可扩展的 API 体系。本文档记录 API 设计过程中的思考和经验。

## 🎯 核心观点

### 1. RESTful 设计原则

#### 资源导向
API 设计以资源为中心，而不是以操作为中心。

**好的设计**：
```
GET    /api/knowledge          # 获取知识点列表
GET    /api/knowledge/:id      # 获取知识点详情
POST   /api/knowledge          # 创建知识点
PUT    /api/knowledge/:id      # 更新知识点
DELETE /api/knowledge/:id      # 删除知识点
```

**不好的设计**：
```
GET    /api/getKnowledgeList
POST   /api/createKnowledge
POST   /api/updateKnowledge
POST   /api/deleteKnowledge
```

#### HTTP 方法语义
- **GET**：获取资源（幂等、安全）
- **POST**：创建资源（非幂等）
- **PUT**：完整更新资源（幂等）
- **PATCH**：部分更新资源（幂等）
- **DELETE**：删除资源（幂等）

#### 资源命名规范
- 使用名词，不使用动词
- 使用复数形式
- 使用小写字母和连字符
- 保持简洁和一致

### 2. 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功" // 可选
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "code": "ERROR_CODE", // 可选
  "errors": [ // 可选，验证错误
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

**设计理由**：
- 统一格式便于前端处理
- `success` 字段快速判断成功/失败
- `data` 字段包含实际数据
- `message` 字段提供用户友好的提示

### 3. 版本控制策略

#### URL 版本控制
```
/api/v1/knowledge
/api/v2/knowledge
```

**优点**：
- 清晰明确
- 易于理解
- 支持多版本共存

**缺点**：
- URL 较长
- 需要维护多套路由

#### Header 版本控制
```
Accept: application/vnd.api+json;version=1
```

**优点**：
- URL 简洁
- 更符合 RESTful 原则

**缺点**：
- 不够直观
- 需要额外处理

**当前选择**：暂不进行版本控制，未来需要时采用 URL 版本控制。

### 4. 分页设计

#### 查询参数
```
GET /api/knowledge?page=1&limit=10&sort=createdAt&order=desc
```

**参数说明**：
- `page`：页码（从 1 开始）
- `limit`：每页数量
- `sort`：排序字段
- `order`：排序方向（asc/desc）

#### 响应格式
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 5. 过滤和搜索

#### 查询参数设计
```
GET /api/knowledge?level=basic&tags=javascript&search=闭包
```

**设计原则**：
- 使用查询参数进行过滤
- 支持多条件组合
- 使用语义化的参数名

#### 实现示例
```typescript
// 控制器中处理
const { page, limit, level, tags, search } = req.query;

const filter: any = {};
if (level) filter.level = level;
if (tags) filter.tags = { $in: tags.split(',') };
if (search) filter.$text = { $search: search };
```

### 6. 错误处理

#### HTTP 状态码
- **200 OK**：请求成功
- **201 Created**：资源创建成功
- **400 Bad Request**：请求参数错误
- **401 Unauthorized**：未认证
- **403 Forbidden**：无权限
- **404 Not Found**：资源不存在
- **500 Internal Server Error**：服务器错误

#### 错误码设计
```typescript
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

### 7. 认证和授权

#### JWT Token 认证
```
Authorization: Bearer <token>
```

**设计要点**：
- Token 放在请求头中
- 使用 Bearer 方案
- Token 包含用户 ID 和过期时间

#### 权限控制
- **公开接口**：无需认证
- **用户接口**：需要登录（authenticate 中间件）
- **会员接口**：需要会员权限（requireMember 中间件）
- **管理员接口**：需要管理员权限（requireAdmin 中间件）

## 🔍 实践验证

### 1. API 易用性
- ✅ 统一的响应格式，前端处理简单
- ✅ 清晰的资源命名，易于理解
- ✅ 完善的错误提示，便于调试

### 2. 扩展性
- ✅ 资源导向设计，易于扩展新功能
- ✅ 分页和过滤设计，支持复杂查询
- ✅ 中间件机制，便于添加新功能

### 3. 性能
- ✅ 分页查询，避免大量数据返回
- ✅ 索引优化，查询速度快
- ✅ 缓存策略（规划中）

## 💭 总结反思

### 优点
1. **设计规范**：遵循 RESTful 原则，API 清晰易用
2. **统一格式**：响应格式统一，前端处理简单
3. **错误处理**：完善的错误处理机制，便于调试
4. **权限控制**：灵活的权限控制，安全性高

### 待改进
1. **API 文档**：需要完善 API 文档（Swagger/OpenAPI）
2. **版本控制**：未来需要实现 API 版本控制
3. **缓存策略**：需要实现缓存机制提升性能
4. **限流控制**：需要实现 API 限流防止滥用

### 未来规划
1. **API 文档**：使用 Swagger 生成 API 文档
2. **版本控制**：实现 API 版本控制机制
3. **缓存优化**：实现 Redis 缓存提升性能
4. **限流保护**：实现 API 限流和防刷机制
5. **GraphQL**：考虑引入 GraphQL 支持复杂查询

## 🔗 相关文档

- [数据库设计心得](./database-design.md)
- [认证授权设计心得](./auth-design.md)
- [性能优化思路](./performance-optimization.md)

