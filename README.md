# AIProjects

这是一个包含多个 AI 相关项目的集合仓库。

## 📦 子项目列表

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
