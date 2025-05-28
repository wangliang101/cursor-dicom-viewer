# DICOM查看器项目流程总结

## 📋 重构概述

本次重构将原本基于本地状态管理的项目转换为使用Zustand全局状态管理的架构，实现了更清晰、可维护的数据流。

## 🎯 核心流程

### 1. 文件上传流程

```
用户操作 → UploadModal → handleUpload → processUploadedFiles → 全局状态更新
```

**详细步骤：**

1. 用户点击上传按钮，打开`UploadModal`
2. 选择DICOM文件后，调用`handleUpload`
3. `handleUpload`调用store中的`processUploadedFiles`
4. 生成图像ID数组并更新全局状态中的`images`
5. 上传成功后自动关闭模态框

### 2. 影像展示流程

```
状态更新 → Layout监听 → loadAndViewImage → Cornerstone渲染
```

**详细步骤：**

1. 全局状态`images`更新触发Layout组件重渲染
2. `useEffect`监听到`images`变化
3. 调用`loadAndViewImage`设置Cornerstone图像堆栈
4. 初始化工具并渲染图像到viewer

### 3. 组件通信

所有组件通过Zustand store进行通信，避免了繁琐的prop传递。

## 🏗️ 状态管理结构

### dicomSlice - DICOM文件管理

- `images[]` - 图像ID数组
- `currentImageIndex` - 当前图像索引
- `totalImages` - 图像总数
- `isPlaying` - 播放状态
- `framesPerSecond` - 播放帧率

### uiSlice - UI状态管理

- `uploadModalVisible` - 上传模态框状态
- `tagsModalVisible` - 标签模态框状态
- `currentTool` - 当前工具

### viewerSlice - 查看器设置

- `viewerSettings` - 窗宽窗位、缩放等设置
- `toolSettings` - 工具相关配置

## 🔧 自定义Hook

### useDicomViewer

封装了所有查看器相关的状态和操作，提供统一接口：

```javascript
const {
  // 状态
  images,
  currentImageIndex,
  isPlaying,
  uploadModalVisible,
  tagsModalVisible,

  // 操作方法
  uploadFiles,
  openUploadModal,
  closeUploadModal,
  selectImage,
  playClip,
  stopClip,
  goToNextFrame,
  goToPrevFrame,
} = useDicomViewer();
```

## ✨ 重构优势

1. **清晰的数据流** - 单向数据流，状态变化可预测
2. **组件解耦** - 通过全局状态避免深层prop传递
3. **易于维护** - 状态集中管理，逻辑清晰
4. **性能优异** - Zustand的精确订阅机制
5. **开发体验** - DevTools支持，状态持久化

## 🚀 使用方式

### 添加新功能

1. 在对应slice中添加状态和操作
2. 在组件中通过hook或直接使用store
3. 保持单向数据流原则

### 调试

- 使用Redux DevTools查看状态变化
- 通过console.log追踪关键操作
- 利用状态持久化功能

## 📝 注意事项

- 保持现有UI布局和样式不变
- 确保组件接口的向后兼容性
- 遵循状态管理最佳实践
- 完善错误处理和用户反馈
