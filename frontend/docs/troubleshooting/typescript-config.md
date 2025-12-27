# TypeScript 配置问题

本文档记录前端 TypeScript 配置相关的问题及解决方案。

## 问题 1：Cannot find module 'path'

### 错误信息

```bash
Cannot find module 'path' or its corresponding type declarations.ts(2307)
```

### 原因分析

Vite 配置文件 `vite.config.ts` 使用 Node.js 内置模块 `path`，但 TypeScript 编译器找不到对应的类型声明。

### 解决方案

**步骤 1：安装 @types/node**

```bash
npm install --save-dev @types/node
```

**步骤 2：更新 tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "types": ["@types/node"]  // 添加此行
  },
  "include": ["vite.config.ts"]
}
```

**步骤 3：使用 node: 前缀导入**

```typescript
// vite.config.ts
import path from 'node:path';  // 推荐：使用 node: 前缀
```

---

## 问题 2：__dirname 未定义（ESM 模块）

### 错误信息

```bash
ReferenceError: __dirname is not defined in ES module scope
```

### 原因分析

在 ES Module 环境下，CommonJS 的全局变量 `__dirname` 和 `__filename` 不可用。Vite 配置文件使用 ESM 格式（`"type": "module"`），因此无法直接使用这些变量。

### 解决方案

使用 `import.meta.url` 和 `fileURLToPath` 手动构造路径：

```typescript
// vite.config.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 构造 __dirname 等价物
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // 现在可以正常使用
    },
  },
});
```

### 完整示例

```typescript
// vite.config.ts - 完整配置
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});
```

### 相关知识

| 变量 | CommonJS | ESM 等价物 |
|------|----------|-----------|
| `__dirname` | 内置 | `path.dirname(fileURLToPath(import.meta.url))` |
| `__filename` | 内置 | `fileURLToPath(import.meta.url)` |
| `require` | 内置 | `createRequire(import.meta.url)` |

### 相关链接

- [Node.js ESM 文档](https://nodejs.org/api/esm.html)
- [import.meta.url](https://nodejs.org/api/esm.html#importmetaurl)
- [Vite 配置指南](https://vitejs.dev/config/)

---

**最后更新时间：** 2025-12-28 00:29:56

