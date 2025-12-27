# FrontendPrepHub 部署指南

## 环境要求

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

## 后端部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `env.example.txt` 并重命名为 `.env`：

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

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 前端地址（用于 CORS 配置）
FRONTEND_URL=http://localhost:5173

# 管理员初始账号
ADMIN_EMAIL=admin@frontendprephub.com
ADMIN_PASSWORD=Admin@123456
```

### 3. 初始化数据库

确保 MongoDB 已启动，然后运行数据库初始化脚本：

```bash
npm run seed
```

这将创建：
- 管理员账号
- 测试用户账号
- 初始知识点数据
- 初始编程题数据
- 初始算法题数据

### 4. 启动服务

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm run build
npm run start
```

服务将运行在 `http://localhost:3001`

## 前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 开发环境

```bash
npm run dev
```

前端将运行在 `http://localhost:5173`

### 3. 生产环境打包

```bash
npm run build
```

打包后的文件在 `dist` 目录，可以部署到任何静态服务器（如 Nginx、Vercel、Netlify 等）。

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker 部署（可选）

### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: frontend_prep_hub

  backend:
    build: ./backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/frontend_prep_hub
      - JWT_SECRET=your-production-secret
      - NODE_ENV=production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## 测试账号

初始化后可用的测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@frontendprephub.com | Admin@123456 |
| 普通用户 | user@test.com | Test@123456 |
| 会员用户 | member@test.com | Test@123456 |

## 常见问题

### 1. MongoDB 连接失败

确保 MongoDB 服务已启动：
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. 端口被占用

修改 `.env` 中的 `PORT` 配置，或停止占用端口的服务。

### 3. CORS 错误

确保 `.env` 中的 `FRONTEND_URL` 配置正确。

### 4. JWT 认证失败

检查 `JWT_SECRET` 配置，确保前后端使用相同的密钥。

## 生产环境安全建议

1. 使用强密码的 `JWT_SECRET`
2. 启用 HTTPS
3. 配置 MongoDB 认证
4. 设置防火墙规则
5. 定期备份数据库
6. 监控日志和性能

