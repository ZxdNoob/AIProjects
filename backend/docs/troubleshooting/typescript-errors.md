# TypeScript 编译错误

本文档记录后端 TypeScript 编译过程中遇到的错误及解决方案。

## 问题：delete 操作符类型错误

### 错误信息

```bash
TSError: ⨯ Unable to compile TypeScript:
src/models/User.ts(295,16): error TS2790: The operand of a 'delete' operator must be optional.
```

### 错误代码

```typescript
// src/models/User.ts - toJSON transform
transform: (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  delete ret.password;  // ❌ 报错：password 不是可选属性
  delete ret.__v;       // ❌ 报错：__v 不是可选属性
  return ret;
}
```

### 原因分析

TypeScript 严格模式下，`delete` 操作符只能用于可选属性（即声明时带有 `?` 的属性）。`password` 和 `__v` 在 Mongoose 文档类型中不是可选属性，因此 TypeScript 编译器报错。

这是 TypeScript 4.0+ 引入的更严格类型检查，旨在防止意外删除必需属性。

### 解决方案

将 `delete` 操作改为赋值 `undefined`：

```typescript
// src/models/User.ts - 修复后
transform: (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  ret.password = undefined;  // ✅ 正确：赋值为 undefined
  ret.__v = undefined;       // ✅ 正确：赋值为 undefined
  return ret;
}
```

### 效果对比

| 方式 | JSON 序列化结果 | 说明 |
|------|----------------|------|
| `delete ret.password` | `{ id: "...", name: "..." }` | 属性完全移除 |
| `ret.password = undefined` | `{ id: "...", name: "...", password: undefined }` | 属性存在但值为 undefined |

**注意**：在 JSON 序列化时，值为 `undefined` 的属性会被自动忽略，因此最终效果相同：

```javascript
JSON.stringify({ a: 1, b: undefined })  // 输出: '{"a":1}'
```

### 替代方案

**方案 A：使用类型断言（不推荐）**

```typescript
delete (ret as any).password;
```

缺点：绕过类型检查，可能引入其他问题。

**方案 B：定义可选类型（复杂）**

```typescript
interface UserJSON {
  id: string;
  name: string;
  password?: string;  // 声明为可选
  // ...
}
```

缺点：需要维护额外的类型定义。

### 相关知识

- [TypeScript 4.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)
- [Mongoose toJSON Transform](https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON())

---

**最后更新时间：** 2025-12-28 00:29:05

