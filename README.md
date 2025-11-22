# AIProjects

一个现代化的在线掷骰子应用，具有精美的 3D 动画效果和统计功能。

## ✨ 功能特色

### 🎯 核心功能
- **3D 骰子动画**：真实的 3D 骰子旋转效果，支持 1-6 点数显示
- **掷骰子功能**：点击按钮随机生成 1-6 的点数
- **统计分析**：记录每个点数的出现次数，支持数据持久化
- **散点图统计**：可视化展示每次掷骰子的时间分布，X轴为时间（年月日时分秒），Y轴为点数
- **响应式设计**：适配不同屏幕尺寸，提供优秀的用户体验

### 🎨 界面设计
- **顶级 Logo 设计**：3D CSS 立体骰子 Logo，紫蓝渐变配色，支持动画和悬停效果
- **现代化 UI**：采用渐变色彩和圆角设计
- **精美按钮**：无边框设计，渐变背景，悬浮动画效果
- **流畅动画**：骰子旋转、按钮交互、页面切换动画
- **统一风格**：整体设计语言一致，视觉效果协调

### 🎲 [一起掷骰子](./zhishuaizi/)

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的 JavaScript
- **Ant Design** - 企业级 UI 组件库
- **ECharts** - 强大的数据可视化图表库
- **echarts-for-react** - ECharts 的 React 封装
- **Less** - CSS 预处理器
- **Vite** - 快速构建工具
- **React Router** - 单页应用路由

**主要特性：**
- 3D 骰子动画效果
- 智能加权随机算法
- 统计分析功能
- 版本历史管理
- 产品路线图

详见：[zhishuaizi/README.md](./zhishuaizi/README.md)

```
一起掷骰子/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 公共组件
│   │   │   ├── DiceLogo.tsx  # 3D Logo 组件
│   │   │   └── DiceLogo.less # Logo 样式
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
│   │   ├── App.tsx           # 应用根组件
│   │   └── main.tsx          # 应用入口
│   ├── public/
│   │   └── dice-logo.svg     # SVG favicon
│   ├── package.json          # 前端依赖配置
│   └── vite.config.ts        # Vite 配置
├── backend/                  # 后端应用
│   ├── index.js              # 服务器入口
│   ├── db.js                 # 数据库操作
│   ├── dice_stats.db         # SQLite 数据库文件（包含统计表和历史记录表）
│   └── package.json          # 后端依赖配置
└── README.md                 # 项目说明文档
```

## 📝 说明

本仓库使用 `git subtree` 管理子项目，每个子项目都保留完整的 git 历史记录。

### 添加新的子项目

```bash
git subtree add --prefix=<子项目目录名> <子项目仓库URL> master --squash
```

### 更新子项目

```bash
git subtree pull --prefix=<子项目目录名> <子项目仓库URL> master --squash
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

## 📊 API 接口

### 掷骰子
- **URL**: `POST /api/roll`
- **功能**: 随机生成 1-6 的点数并记录到数据库
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
