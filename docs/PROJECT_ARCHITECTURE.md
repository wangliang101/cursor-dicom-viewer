# DICOM 查看器项目架构文档

## 项目概述

这是一个基于 React + Vite + Cornerstone.js 的 DICOM 医学影像查看器项目。项目采用了现代化的状态管理模式，通过 Zustand 实现全局状态管理，确保组件间的数据流清晰可控。

## 核心流程

### 1. 文件上传流程

用户通过 `UploadModal` 组件上传 DICOM 文件：

- 用户选择文件 → `UploadModal` → `uploadHandler` → `processUploadedFiles` → 更新全局状态

### 2. 影像展示流程

上传完成后自动在查看器中展示：

- 全局状态更新 → `Layout` 组件监听 → `loadAndViewImage` → Cornerstone 渲染

### 3. 组件通信

所有组件通过 Zustand 全局状态管理进行通信，避免了 prop drilling 问题。

## 技术栈

- **前端框架**: React 18 + Vite
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **医学影像**: Cornerstone.js + DICOM Image Loader
- **路由**: React Router v6
- **样式**: Less + CSS Modules

## 项目结构

```
src/
├── pages/           # 页面组件
│   └── Layout/      # 主页面布局
├── components/      # 业务组件
│   ├── UploadModal/       # 文件上传模态框
│   ├── MainLayout/        # 主布局组件
│   ├── DicomTagsViewer/   # DICOM 标签查看器
│   └── ...
├── store/          # 状态管理
│   ├── index.js           # 主store
│   ├── slices/            # 状态切片
│   │   ├── dicomSlice.js  # DICOM文件相关状态
│   │   ├── viewerSlice.js # 查看器设置状态
│   │   └── uiSlice.js     # UI状态
│   └── hooks/             # 自定义hooks
│       └── useDicomViewer.js # DICOM查看器hook
├── utils/          # 工具函数
│   ├── uploadHandler.js   # 文件上传处理
│   └── imageTransforms.js # 图像变换工具
└── routes/         # 路由配置
```

## 状态管理架构

采用 Zustand 作为全局状态管理库，具有以下优势：

- 轻量级，无 boilerplate 代码
- TypeScript 友好
- 支持中间件（devtools, persist）
- 性能优异

### 状态切片

#### 1. dicomSlice.js - DICOM 文件管理

```javascript
{
  // DICOM 文件相关
  currentDicomFile: null,
  dicomFiles: [],
  dicomMetadata: {},

  // 图像相关
  images: [],           // 图像ID数组
  currentImageIndex: 0, // 当前图像索引
  totalImages: 0,       // 总图像数
  isPlaying: false,     // 是否播放中
  framesPerSecond: 24,  // 播放帧率
}
```

#### 2. viewerSlice.js - 查看器设置

```javascript
{
  viewerSettings: {
    windowWidth: 400,    // 窗宽
    windowCenter: 200,   // 窗位
    zoom: 1,            // 缩放
    pan: { x: 0, y: 0 }, // 平移
    rotation: 0,        // 旋转
    invert: false,      // 反色
  },
  toolSettings: { ... } // 工具设置
}
```

#### 3. uiSlice.js - UI 状态

```javascript
{
  ui: {
    uploadModalVisible: false,  // 上传模态框可见性
    tagsModalVisible: false,    // 标签模态框可见性
    currentTool: 'WindowLevel', // 当前工具
    // ...其他UI状态
  },
  error: null,         // 错误信息
  notifications: [],   // 通知消息
}
```

## 自定义 Hook

### useDicomViewer.js

封装了 DICOM 查看器的核心逻辑，提供统一的接口：

```javascript
const {
  // 状态
  uploadModalVisible,
  currentTool,
  images,
  currentImageIndex,

  // 方法
  uploadFiles,
  openUploadModal,
  selectImage,
  playClip,
  stopClip,
} = useDicomViewer();
```

## 核心功能模块

### 1. 文件上传 (uploadHandler.js)

- 处理 DICOM 文件上传
- 生成图像 ID
- 更新全局状态
- 错误处理和用户反馈

### 2. 图像渲染 (Layout/index.jsx)

- Cornerstone.js 初始化
- 工具组管理
- 图像堆栈设置
- 渲染控制

### 3. 图像变换 (imageTransforms.js)

- 重置、翻转、旋转、反色
- 窗宽窗位调整
- 缩放和平移

## 数据流

```
用户操作 → UI 组件 → Store Actions → State 更新 → 组件重渲染 → Cornerstone 更新
```

### 上传流程数据流

```
UploadModal → handleUpload → processUploadedFiles → setImages → Layout(useEffect) → loadAndViewImage
```

### 图像操作数据流

```
工具栏操作 → Store Action → 状态更新 → Cornerstone Viewport 更新
```

## 优势特点

1. **清晰的数据流**: 单向数据流，状态可预测
2. **组件解耦**: 通过全局状态管理避免深层 prop 传递
3. **易于维护**: 状态集中管理，业务逻辑清晰
4. **性能优异**: Zustand 的精确订阅机制
5. **开发体验**: DevTools 支持，状态持久化

## 开发指南

### 添加新功能

1. 如需新状态，在对应 slice 中添加
2. 如需新操作，在 slice 中添加 action
3. 在组件中通过 hook 或直接使用 store

### 调试

- 使用 Redux DevTools 查看状态变化
- 状态持久化到 localStorage
- Console 日志记录关键操作

## 注意事项

1. **保持现有布局**: 仅重构数据流逻辑，不修改UI样式
2. **向后兼容**: 确保现有组件接口不变
3. **性能考虑**: 避免不必要的重渲染
4. **错误处理**: 完善的错误边界和用户反馈
