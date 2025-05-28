# 多窗格DICOM查看器文档

本目录包含多窗格DICOM查看器的相关文档。

## 文档列表

### 技术文档

- [**MULTI_PANE_VIEWER_README.md**](./MULTI_PANE_VIEWER_README.md) - 多窗格查看器技术文档
  - 组件架构说明
  - API接口文档
  - 开发指南
  - 扩展方法

### 功能演示

- [**FEATURES_DEMO.md**](./FEATURES_DEMO.md) - 功能演示和使用指南
  - 快速开始指南
  - 功能特性演示
  - 使用方法说明
  - 故障排除

### 项目管理

- [**PROJECT_STRUCTURE.md**](./PROJECT_STRUCTURE.md) - 项目结构说明
  - 目录结构详解
  - 代码组织方式
  - 重构说明
  - 最佳实践

## 快速导航

### 开发者文档

如果您是开发者，建议从以下文档开始：

1. [项目结构](./PROJECT_STRUCTURE.md) - 了解项目组织结构
2. [技术架构](./MULTI_PANE_VIEWER_README.md#组件架构) - 了解组件设计
3. [布局配置](./MULTI_PANE_VIEWER_README.md#布局配置) - 了解布局系统
4. [扩展功能](./MULTI_PANE_VIEWER_README.md#扩展功能) - 了解扩展方法

### 用户文档

如果您是用户，建议从以下文档开始：

1. [快速开始](./FEATURES_DEMO.md#快速开始) - 快速上手
2. [功能演示](./FEATURES_DEMO.md#功能演示) - 了解功能特性
3. [布局切换](./FEATURES_DEMO.md#布局切换演示) - 学习基本操作

## 项目特性

- ✨ **多窗格布局**: 支持7种预定义布局，灵活切换
- 🛠️ **丰富工具**: 完整的DICOM查看和测量工具
- 📱 **响应式设计**: 支持桌面端和移动端
- 🎨 **现代UI**: 参考OHIF设计，美观易用
- 🔧 **高度可扩展**: 模块化设计，易于扩展和定制

## 技术栈

- **前端框架**: React 18 + Hooks
- **构建工具**: Vite
- **UI组件**: Ant Design
- **样式方案**: Less + CSS Modules
- **DICOM处理**: Cornerstone.js
- **布局系统**: CSS Grid

## 文档维护

文档维护原则：

- 保持文档与代码同步
- 及时更新API变更
- 添加新功能的使用说明
- 补充常见问题解答

## 贡献指南

欢迎贡献代码和文档：

1. Fork 项目并创建功能分支
2. 提交代码变更和相关文档更新
3. 确保所有测试通过
4. 提交 Pull Request
