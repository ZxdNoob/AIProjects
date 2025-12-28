# AIProjects

这是一个包含多个 AI 相关项目的集合仓库。

## 📦 子项目列表

### 📚 [FrontendPrepHub - 前端面试备战平台](./FrontendPrepHub/)

一个功能完善的全栈前端面试备战平台，具备「用户角色权限 + 知识学习 + 在线编码调试 + 算法动画可视化」核心能力。

**技术栈：**
- **前端**: React 18 + TypeScript + Monaco Editor + Zustand + Tailwind CSS
- **后端**: Express.js + TypeScript + MongoDB + JWT

**主要特性：**
- 🔐 多角色用户系统（普通用户/会员/管理员）
- 📖 分级知识模块（80+ 高频面试考点）
- 💻 在线编码调试（Monaco Editor 多文件编辑）
- 🎬 算法动画可视化（30道算法动画演示）
- 📊 个人学习管理（进度跟踪、错题收集）
- ⚙️ 管理员后台（用户管理、内容管理、数据统计）

详见：[FrontendPrepHub/README.md](./FrontendPrepHub/README.md)

---

### 🎲 [一起掷骰子](./zhishuaizi/)

一个现代化的在线掷骰子应用，具有精美的 3D 动画效果和统计功能。

**主要特性：**
- 3D 骰子动画效果
- 智能加权随机算法
- 统计分析功能
- 版本历史管理
- 产品路线图

详见：[zhishuaizi/README.md](./zhishuaizi/README.md)

---

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
