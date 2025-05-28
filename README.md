# DICOM 查看器

一个基于 React + Vite 的现代 DICOM 文件查看器，支持医学影像的显示、操作和分析。

## ✨ 主要功能

- 📁 **批量文件上传** - 支持单文件和整个文件夹的 DICOM 文件上传
- 🔄 **智能排序** - 基于 DICOM 标签的自动排序，确保图像序列的正确顺序
- 🎬 **序列播放** - 支持自动播放和手动浏览 DICOM 图像序列
- 🔧 **图像操作** - 窗宽窗位调整、缩放、平移、旋转、翻转等操作
- 🏷️ **标签查看** - 完整的 DICOM 标签信息查看
- 🗑️ **序列管理** - 支持删除单个图像或清空整个序列
- 📱 **响应式设计** - 适配不同屏幕尺寸的现代化界面

## 🆕 最新功能

### DICOM 文件智能排序

解决了上传文件夹后图像顺序不连续的问题：

- **多级排序算法**：基于 Series Number、Instance Number、Slice Location 等 DICOM 标签
- **用户选择**：支持 DICOM 标签排序和文件名排序两种模式
- **容错处理**：标签缺失时自动降级到其他可用的排序方式
- **性能优化**：异步并行处理，不影响用户体验

详细信息请查看：[DICOM 排序功能文档](docs/DICOM_SORTING_FEATURE.md)

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **图像处理**: Cornerstone.js
- **DICOM 解析**: dicom-parser
- **样式处理**: Less

## 📖 相关文档

- [项目架构文档](docs/PROJECT_ARCHITECTURE.md)
- [功能实现总结](IMPLEMENTATION_SUMMARY.md)
- [DICOM 排序功能](docs/DICOM_SORTING_FEATURE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## �� 许可证

MIT License
