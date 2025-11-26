# 🎲 一起掷骰子

一个现代化的在线掷骰子应用，具有精美的 3D 动画效果和统计功能。

## ✨ 功能特色

### 🎯 核心功能
- **3D 骰子动画**：真实的 3D 骰子旋转效果，支持 1-6 点数显示
- **智能加权随机算法**：采用业界标准的累积分布函数（CDF）方法，实现非均匀概率分布
  - 1、2、5、6 点：各 10% 概率（低概率）
  - 3、4 点：各 30% 概率（高概率）
- **统计分析**：记录每个点数的出现次数，支持数据持久化
- **散点图统计**：可视化展示每次掷骰子的时间分布，X轴为时间（年月日时分秒），Y轴为点数
- **版本历史管理**：数据库管理的版本更新历史，支持风琴展示、分页和模式切换
- **产品路线图**：看板式需求管理，支持规划中、进行中、已完成三种状态，可添加、编辑、删除需求
- **响应式设计**：适配不同屏幕尺寸，提供优秀的用户体验

### 🎨 界面设计
- **顶级 Logo 设计**：3D CSS 立体骰子 Logo，紫蓝渐变配色，支持动画和悬停效果
- **现代化 UI**：采用渐变色彩和圆角设计
- **精美按钮**：无边框设计，渐变背景，悬浮动画效果
- **流畅动画**：骰子旋转、按钮交互、页面切换动画
- **统一风格**：整体设计语言一致，视觉效果协调

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **ECharts** - 强大的数据可视化图表库
- **echarts-for-react** - ECharts 的 React 封装
- **Less** - CSS 预处理器
- **Vite** - 快速构建工具
- **React Router** - 单页应用路由

### 后端
- **Node.js** - JavaScript 运行环境
- **Express** - Web 应用框架
- **SQLite3** - 轻量级数据库
- **CORS** - 跨域资源共享

## 📦 项目结构

```
一起掷骰子/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   │   ├── DiceLogo.tsx  # 3D Logo 组件
│   │   │   ├── DiceLogo.less # Logo 样式
│   │   │   ├── HomeButton.tsx # 返回首页按钮组件
│   │   │   ├── HomeButton.less # 首页按钮样式
│   │   │   ├── EllipsisTooltip/ # 文本省略号 Tooltip 组件
│   │   │   │   ├── EllipsisTooltip.tsx
│   │   │   │   ├── EllipsisTooltip.less
│   │   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── DicePage/     # 掷骰子页面
│   │   │   │   ├── components/
│   │   │   │   │   ├── Dice3D.tsx      # 3D骰子组件
│   │   │   │   │   └── Dice3D.less     # 骰子样式
│   │   │   │   ├── DicePage.tsx        # 主页面组件
│   │   │   │   └── DicePage.less       # 页面样式
│   │   │   └── StatsPage/    # 统计页面
│   │   │       ├── StatsPage.tsx       # 统计页面组件
│   │   │       └── StatsPage.less      # 统计页面样式
│   │   │   ├── VersionHistoryPage/     # 版本历史页面
│   │   │   │   ├── VersionHistoryPage.tsx  # 版本历史页面组件
│   │   │   │   └── VersionHistoryPage.less # 版本历史页面样式
│   │   │   └── RoadmapPage/            # 产品路线图页面
│   │   │       ├── RoadmapPage.tsx     # 路线图页面组件
│   │   │       └── RoadmapPage.less    # 路线图页面样式
│   │   ├── App.tsx           # 应用根组件
│   │   └── main.tsx          # 应用入口
│   ├── public/
│   │   └── dice-logo.svg     # SVG favicon
│   ├── package.json          # 前端依赖配置
│   └── vite.config.ts        # Vite 配置
├── backend/                  # 后端应用
│   ├── index.js              # 服务器入口
│   ├── db.js                 # 数据库操作
│   ├── init-version-history.js  # 版本历史初始化脚本
│   ├── add-version.js        # 添加单个版本历史记录脚本
│   ├── dice_stats.db         # SQLite 数据库文件（包含统计表、历史记录表、版本历史表和路线图表）
│   └── package.json          # 后端依赖配置
└── README.md                 # 项目说明文档
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd 一起掷骰子
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. **启动应用**

**启动后端服务器**：
```bash
cd backend
node index.js
```
后端服务将在 `http://localhost:3001` 启动

**启动前端开发服务器**：
```bash
cd frontend
npm run dev
```
前端应用将在 `http://localhost:5173` 启动

4. **访问应用**
打开浏览器访问 `http://localhost:5173`

## 🎮 使用指南

### 掷骰子
1. 在主页面点击"掷骰子"按钮
2. 观看 3D 骰子旋转动画
3. 查看掷出的点数结果

### 查看统计
1. 点击右上角"统计"按钮
2. 查看统计页面：
   - **左侧**：散点图展示每次掷骰子的时间分布
     - X轴：时间（年月日时分秒）
     - Y轴：点数（1-6）
     - 鼠标悬停可查看详细信息
   - **右侧**：统计表格显示每个点数的出现次数
3. 点击刷新按钮可手动更新数据
4. 点击"返回掷骰子"返回主页面

### 查看版本历史
1. 在首页点击"版本历史"按钮
2. 查看版本历史页面：
   - 风琴方式展示所有版本更新记录
   - 支持单个/多个展开模式切换
   - 支持分页浏览和自定义每页显示数量
   - 点击版本条目展开查看详细更新说明
3. 点击刷新按钮可手动更新数据
4. 点击"返回掷骰子"返回主页面

### 产品路线图
1. 在首页点击"产品路线图"按钮
2. 查看路线图页面：
   - 看板式布局，分为"规划中"、"进行中"、"已完成"三列
   - 每个需求卡片显示标题、描述、优先级、状态、创建时间、更新时间和预计完成时间
   - 支持添加、编辑、删除需求
   - 支持设置需求状态、优先级和预计完成时间
   - 标题支持两行显示，超出部分显示省略号，悬停查看完整内容
3. 点击"新增需求"按钮添加新需求
4. 点击需求卡片上的编辑或删除图标进行相应操作
5. 点击刷新按钮可手动更新数据
6. 点击"返回首页"返回主页面

## 📊 API 接口

### 掷骰子
- **URL**: `POST /api/roll`
- **功能**: 使用加权随机算法生成 1-6 的点数并记录到数据库
- **算法**: 累积分布函数（CDF）方法，实现非均匀概率分布
- **概率分布**: 1、2、5、6 点各 10%，3、4 点各 30%
- **返回**: `{ "point": number }`

### 获取统计
- **URL**: `GET /api/stats`
- **功能**: 获取所有点数的统计数据
- **返回**: `{ "stats": [{ "point": number, "count": number }] }`

### 获取历史记录
- **URL**: `GET /api/history`
- **功能**: 获取所有掷骰子的历史记录（包含点数和时间戳）
- **返回**: `{ "history": [{ "point": number, "timestamp": string }] }`
- **说明**: 时间戳格式为 `YYYY-MM-DD HH:MM:SS`

### 添加版本历史
- **URL**: `POST /api/version-history`
- **功能**: 添加版本历史记录
- **请求体**: `{ "version": string, "description": string, "changeType": "major" | "minor" | "patch" }`
- **返回**: `{ "success": boolean, "id": number }`

### 获取版本历史
- **URL**: `GET /api/version-history`
- **功能**: 获取所有版本历史记录
- **返回**: `{ "history": [{ "version": string, "description": string, "change_type": string, "release_date": string }] }`

### 路线图相关接口

#### 获取路线图需求列表
- **URL**: `GET /api/roadmap`
- **功能**: 获取所有路线图需求
- **返回**: `{ "items": [{ "id": number, "title": string, "description": string, "status": string, "priority": string, "created_at": string, "updated_at": string, "target_date": string | null }] }`

#### 添加路线图需求
- **URL**: `POST /api/roadmap`
- **功能**: 添加新的路线图需求
- **请求体**: `{ "title": string, "description": string, "status": "planned" | "in-progress" | "completed", "priority": "high" | "medium" | "low", "targetDate": string | null }`
- **返回**: `{ "success": boolean, "id": number }`

#### 更新路线图需求
- **URL**: `PUT /api/roadmap/:id`
- **功能**: 更新指定的路线图需求
- **请求体**: `{ "title": string, "description": string, "status": "planned" | "in-progress" | "completed", "priority": "high" | "medium" | "low", "targetDate": string | null }`
- **返回**: `{ "success": boolean }`

#### 删除路线图需求
- **URL**: `DELETE /api/roadmap/:id`
- **功能**: 删除指定的路线图需求
- **返回**: `{ "success": boolean }`

## 🔄 版本更新流程

当项目版本号发生变化时，需要同步更新数据库中的版本历史记录：

### 方法一：使用脚本（推荐）

使用 `add-version.js` 脚本添加新版本：

```bash
cd backend
node add-version.js <version> <changeType> <description>
```

**参数说明：**
- `version`: 版本号，格式为 `x.y.z`（例如：`1.8.0`）
- `changeType`: 变更类型，可选值：
  - `major`: 重大更新（主版本号变化）
  - `minor`: 功能更新（次版本号变化）
  - `patch`: 修复更新（补丁版本号变化）
- `description`: 更新说明（用引号包裹）

**示例：**
```bash
# 添加功能更新
node add-version.js 1.8.0 minor "新增功能描述"

# 添加修复更新
node add-version.js 1.7.1 patch "修复bug描述"

# 添加重大更新
node add-version.js 2.0.0 major "重大更新描述"
```

### 方法二：使用 API

通过 API 接口添加版本历史：

```bash
curl -X POST http://localhost:3001/api/version-history \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.8.0",
    "description": "更新说明",
    "changeType": "minor"
  }'
```

### 方法三：更新初始化脚本

编辑 `backend/init-version-history.js`，在 `versionHistory` 数组的开头添加新版本记录，然后运行：

```bash
cd backend
node init-version-history.js
```

**注意：** 初始化脚本会更新所有版本记录，如果版本已存在，只会更新描述和变更类型，不会更新发布日期。

### 版本号规范

遵循语义化版本号（SemVer）规范：
- **Patch（补丁版本）** - 小改动、bug 修复：只增大 `z`（例如：`1.7.0` → `1.7.1`）
- **Minor（次版本）** - 新功能、向后兼容的改动：增大 `y`，`z` 归零（例如：`1.7.0` → `1.8.0`）
- **Major（主版本）** - 重大改动、不兼容的变更：增大 `x`，`y` 和 `z` 归零（例如：`1.7.0` → `2.0.0`）

## 📝 更新日志

详细的版本更新历史请查看 [CHANGELOG.md](./CHANGELOG.md) 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 提交前请确保代码通过所有检查

### 提交格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型说明：
- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 样式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**享受掷骰子的乐趣！** 🎲✨
