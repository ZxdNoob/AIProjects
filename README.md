# AIProjects

这是一个包含多个 AI 相关项目的集合仓库。

## 🌐 在线预览

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-在线预览-blue?style=for-the-badge&logo=github)](https://zxdnoob.github.io/AIProjects/)

| 项目 | 预览地址 |
|------|----------|
| 📚 FrontendPrepHub | [https://zxdnoob.github.io/AIProjects/FrontendPrepHub/](https://zxdnoob.github.io/AIProjects/FrontendPrepHub/) |
| 🎲 一起掷骰子 | [https://zxdnoob.github.io/AIProjects/zhishuaizi/](https://zxdnoob.github.io/AIProjects/zhishuaizi/) |

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

## 🚀 GitHub Pages 部署

本项目使用 **GitHub Actions** 自动部署到 **GitHub Pages**。

### 部署架构

```
https://zxdnoob.github.io/AIProjects/
├── index.html              # 项目导航主页
├── FrontendPrepHub/        # 前端面试备战平台
└── zhishuaizi/             # 一起掷骰子应用
```

### 自动部署流程

1. 推送代码到 `master` 分支
2. GitHub Actions 自动触发构建
3. 分别构建各子项目的前端应用
4. 自动部署到 GitHub Pages

### 首次启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送代码触发首次部署

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
