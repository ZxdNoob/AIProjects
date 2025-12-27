# Vite 开发服务器问题

本文档记录 Vite 开发服务器启动和运行过程中遇到的问题。

## 问题：EADDRNOTAVAIL 地址不可用

### 错误信息

```bash
$ npm run dev

error when starting dev server:
Error: listen EADDRNOTAVAIL: address not available 198.18.0.31:5173
    at Server.setupListenHandle [as _listen2] (node:net:1817:21)
    at listenInCluster (node:net:1882:12)
    at doListen (node:net:2031:7)
    at process.processTicksAndRejections (node:internal/process/task_queues:83:21)
```

### 原因分析

Vite 默认会尝试绑定到系统分配的网络地址。在某些 macOS 配置下（如使用 VPN、代理软件或特殊网络设置），系统可能返回一个不可用的 IP 地址（如 `198.18.x.x` 保留地址段）。

这通常发生在：
- 使用 Surge、ClashX 等代理软件时
- VPN 连接处于活动状态时
- 系统网络配置异常时

### 解决方案

在 `vite.config.ts` 中显式指定绑定地址为 `127.0.0.1`：

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // 显式绑定到本地回环地址
    port: 5173,
  },
});
```

### 替代方案

**方案 A：通过环境变量设置**

```bash
HOST=127.0.0.1 npm run dev
```

**方案 B：使用 0.0.0.0（监听所有地址）**

```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
}
```

**注意**：使用 `0.0.0.0` 会使开发服务器对局域网可见，存在安全风险。

### 验证

启动成功后应该看到：

```bash
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://127.0.0.1:5173/
  ➜  Network: use --host to expose
```

### 相关链接

- [Vite Server Options](https://vitejs.dev/config/server-options.html)
- [Node.js net.Server](https://nodejs.org/api/net.html#serverlistenport-host-backlog-callback)

---

**最后更新时间：** 2025-12-28 00:29:37

