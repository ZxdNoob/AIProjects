# MongoDB 安装与连接问题

本文档记录 MongoDB 在 macOS 环境下的安装和连接问题。

## 问题 1：MongoDB 安装失败（Homebrew）

### 错误信息

```bash
$ brew install mongodb-community
Error: Your Command Line Tools are too outdated.
Update them from Software Update in System Preferences.
```

### 原因分析

macOS 的 Command Line Tools (CLT) 版本过旧，Homebrew 需要更新版本的 CLT 才能正常工作。

### 解决方案

**方案 A：更新 Command Line Tools（推荐）**

```bash
# 删除旧版本
sudo rm -rf /Library/Developer/CommandLineTools

# 重新安装
xcode-select --install
```

**方案 B：手动下载安装 MongoDB（本项目采用）**

1. 访问 [MongoDB 官网下载页面](https://www.mongodb.com/try/download/community)
2. 下载对应系统架构的版本（x86_64 或 arm64）
3. 解压到用户目录：

```bash
# 创建目录
mkdir -p ~/mongodb ~/mongodb-data

# 解压（以 x86_64 版本为例）
tar -xzf mongodb-macos-x86_64-8.0.4.tgz
mv mongodb-macos-x86_64-8.0.4/* ~/mongodb/
```

4. 添加到 PATH（可选）：

```bash
echo 'export PATH="$HOME/mongodb/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 相关链接

- [MongoDB 官方安装文档](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
- [Homebrew 故障排除](https://docs.brew.sh/Troubleshooting)

---

## 问题 2：MongoDB 连接失败 localhost 解析

### 错误信息

```bash
MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
```

### 原因分析

在某些系统配置下，`localhost` 会被解析为 IPv6 地址 `::1`，而 MongoDB 默认只监听 IPv4 地址 `127.0.0.1`。

### 解决方案

修改 `.env` 文件，将 `localhost` 改为 `127.0.0.1`：

```bash
# 修改前
MONGODB_URI=mongodb://localhost:27017/frontend_prep_hub

# 修改后
MONGODB_URI=mongodb://127.0.0.1:27017/frontend_prep_hub
```

### 验证

```bash
# 确认 MongoDB 监听地址
netstat -an | grep 27017

# 应该看到类似输出
tcp4       0      0  127.0.0.1.27017        *.*                    LISTEN
```

---

## 问题 3：MongoDB --fork 参数不兼容 macOS

### 错误信息

```bash
$ mongod --fork --logpath ~/mongodb-data/mongod.log --dbpath ~/mongodb-data
Error: --fork option is not supported on macOS
```

### 原因分析

从 MongoDB 4.4 开始，macOS 版本不再支持 `--fork` 参数来后台运行 mongod 进程。

### 解决方案

使用 shell 的后台运行方式：

```bash
# 后台启动 MongoDB
~/mongodb/bin/mongod --dbpath ~/mongodb-data > ~/mongodb-data/mongod.log 2>&1 &

# 验证是否启动成功
pgrep -l mongod

# 停止 MongoDB
pkill mongod
```

### 替代方案

**使用 launchctl（推荐用于长期运行）**

创建 `~/Library/LaunchAgents/org.mongodb.mongod.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.mongodb.mongod</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/你的用户名/mongodb/bin/mongod</string>
        <string>--dbpath</string>
        <string>/Users/你的用户名/mongodb-data</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

然后加载服务：

```bash
launchctl load ~/Library/LaunchAgents/org.mongodb.mongod.plist
```

---

## 其他备选方案

### 使用 Docker 运行 MongoDB

```bash
docker run -d --name mongodb -p 27017:27017 -v ~/mongodb-data:/data/db mongo:latest
```

### 使用 MongoDB Atlas（云服务）

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串并更新 `.env`

### 使用 mongodb-memory-server（仅开发测试）

```bash
npm install --save-dev mongodb-memory-server
```

适用于单元测试或临时开发环境。

---

**最后更新时间：** 2025-12-28 00:28:39

