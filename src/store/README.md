# DICOM Viewer 状态管理系统

基于 Zustand 构建的全局状态管理系统，专为 DICOM 查看器应用设计。

## 📁 目录结构

```
src/store/
├── index.js                 # 主 store 文件
├── slices/                  # 状态切片
│   ├── dicomSlice.js       # DICOM文件管理
│   ├── viewerSlice.js      # 查看器设置
│   └── uiSlice.js          # UI状态管理
├── hooks/                   # 自定义 hooks
│   ├── useDicom.js         # DICOM相关hooks
│   ├── useViewer.js        # 查看器hooks
│   └── useUI.js            # UI相关hooks
└── examples/               # 使用示例
    └── StoreUsageExample.jsx
```

## 🚀 主要功能

### 1. DICOM 文件管理

- 文件加载和管理
- 当前文件选择
- 文件元数据存储
- 文件列表操作

### 2. 查看器设置

- 窗宽窗位调整
- 缩放、平移、旋转
- 图像效果（反色、亮度、对比度）
- 预设窗宽窗位
- 工具选择

### 3. UI 状态管理

- 加载状态
- 错误处理
- 通知系统
- 侧边栏控制
- 全屏模式
- 主题切换

## 📖 使用指南

### 基础用法

```jsx
import useDicomStore from './store';

// 在组件中直接使用 store
function MyComponent() {
  const dicomFiles = useDicomStore((state) => state.dicomFiles);
  const setCurrentDicomFile = useDicomStore((state) => state.setCurrentDicomFile);

  return <div>{/* 组件内容 */}</div>;
}
```

### 使用自定义 Hooks

#### DICOM 文件管理

```jsx
import { useDicomFiles, useCurrentDicom, useDicomList } from './store/hooks/useDicom';

function DicomManager() {
  // 文件管理
  const { dicomFiles, hasFiles, fileCount, loadDicomFile } = useDicomFiles();

  // 当前文件
  const { currentFile, metadata, selectFile } = useCurrentDicom();

  // 文件列表操作
  const { selectNext, selectPrevious, hasNext, hasPrevious } = useDicomList();

  const handleFileUpload = async (file) => {
    try {
      await loadDicomFile(file);
    } catch (error) {
      console.error('文件加载失败:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      <p>已加载 {fileCount} 个文件</p>
      {currentFile && <p>当前文件: {currentFile.name}</p>}
      <button onClick={selectPrevious} disabled={!hasPrevious}>
        上一个
      </button>
      <button onClick={selectNext} disabled={!hasNext}>
        下一个
      </button>
    </div>
  );
}
```

#### 查看器控制

```jsx
import { useWindowLevel, useViewportTransform, useImageEffects } from './store/hooks/useViewer';

function ViewerControls() {
  // 窗宽窗位
  const { windowWidth, windowCenter, setWindowLevel, presets } = useWindowLevel();

  // 视口变换
  const { zoom, zoomIn, zoomOut, resetTransform, canZoomIn, canZoomOut } = useViewportTransform();

  // 图像效果
  const { invert, toggleInvert, setBrightness, setContrast } = useImageEffects();

  return (
    <div>
      {/* 窗宽窗位控制 */}
      <div>
        <label>窗宽: {windowWidth}</label>
        <input
          type="range"
          min="1"
          max="2000"
          value={windowWidth}
          onChange={(e) => setWindowLevel(Number(e.target.value), windowCenter)}
        />
      </div>

      {/* 缩放控制 */}
      <div>
        <button onClick={zoomIn} disabled={!canZoomIn}>
          放大
        </button>
        <button onClick={zoomOut} disabled={!canZoomOut}>
          缩小
        </button>
        <span>缩放: {zoom.toFixed(2)}x</span>
      </div>

      {/* 预设按钮 */}
      <div>
        <button onClick={presets.chest}>胸部</button>
        <button onClick={presets.abdomen}>腹部</button>
        <button onClick={presets.bone}>骨骼</button>
      </div>

      {/* 图像效果 */}
      <div>
        <button onClick={toggleInvert}>{invert ? '取消反色' : '反色'}</button>
      </div>

      <button onClick={resetTransform}>重置所有变换</button>
    </div>
  );
}
```

#### UI 状态管理

```jsx
import { useLoading, useError, useNotifications, useSidebar, useTheme } from './store/hooks/useUI';

function UIControls() {
  // 加载状态
  const { isLoading, setLoading, withLoading } = useLoading();

  // 错误处理
  const { error, hasError, clearError, handleError } = useError();

  // 通知系统
  const { showSuccess, showError, showWarning } = useNotifications();

  // 侧边栏
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();

  // 主题
  const { theme, isDark, toggleTheme } = useTheme();

  const handleAsyncOperation = async () => {
    await withLoading(async () => {
      // 执行异步操作
      await someAsyncFunction();
      showSuccess('操作完成!');
    });
  };

  return (
    <div>
      {isLoading && <div>加载中...</div>}

      {hasError && (
        <div style={{ color: 'red' }}>
          错误: {error}
          <button onClick={clearError}>清除</button>
        </div>
      )}

      <button onClick={toggleSidebar}>{sidebarOpen ? '关闭' : '打开'}侧边栏</button>

      <button onClick={toggleTheme}>切换到{isDark ? '亮色' : '暗色'}主题</button>

      <button onClick={() => showSuccess('成功消息')}>显示成功消息</button>
      <button onClick={() => showError('错误消息')}>显示错误消息</button>
    </div>
  );
}
```

## 🎛️ Store 配置

### 持久化存储

状态会自动保存到 localStorage，包括：

- 查看器设置
- 工具设置
- UI 偏好设置（侧边栏状态、工具栏可见性、主题等）

### 开发工具

在开发环境中，可以使用 Redux DevTools 来调试状态变化：

```javascript
// 每个 action 都有明确的名称和类型
// 可以在 DevTools 中看到完整的状态变化历史
```

## 🔧 自定义扩展

### 添加新的状态

1. 在相应的 slice 中添加新状态：

```javascript
// src/store/slices/viewerSlice.js
export const createViewerSlice = (set) => ({
  // 现有状态...

  // 新增状态
  newFeature: {
    enabled: false,
    settings: {},
  },

  // 新增操作
  toggleNewFeature: () =>
    set(
      (state) => ({
        newFeature: {
          ...state.newFeature,
          enabled: !state.newFeature.enabled,
        },
      }),
      false,
      'toggleNewFeature'
    ),
});
```

2. 创建对应的 hook：

```javascript
// src/store/hooks/useViewer.js
export const useNewFeature = () => {
  const newFeature = useDicomStore((state) => state.newFeature);
  const toggleNewFeature = useDicomStore((state) => state.toggleNewFeature);

  return {
    ...newFeature,
    toggle: toggleNewFeature,
  };
};
```

### 添加中间件

```javascript
// src/store/index.js
import { subscribeWithSelector } from 'zustand/middleware';

const useDicomStore = create(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // store 内容
      }))
      // persist 配置
    )
    // devtools 配置
  )
);

// 添加订阅者
useDicomStore.subscribe(
  (state) => state.currentDicomFile,
  (currentFile) => {
    console.log('当前文件变更:', currentFile);
  }
);
```

## 🧪 测试

使用示例组件来测试状态管理功能：

```jsx
import StoreUsageExample from './store/examples/StoreUsageExample';

function App() {
  return (
    <div>
      <StoreUsageExample />
    </div>
  );
}
```

## 📝 最佳实践

1. **使用 hooks 而不是直接访问 store**

   - 优先使用提供的自定义 hooks
   - 这样可以获得更好的类型安全和代码复用

2. **状态更新的粒度**

   - 将相关的状态组织在一起
   - 避免过度细分导致性能问题

3. **错误处理**

   - 使用 `useError` hook 进行统一的错误处理
   - 异步操作使用 `handleAsyncError` 包装

4. **通知反馈**

   - 重要操作完成后给用户适当的反馈
   - 使用通知系统提供用户体验

5. **性能优化**
   - 使用选择器函数只订阅需要的状态
   - 避免在组件中创建内联对象和函数

## 🔍 调试技巧

1. 使用 Redux DevTools 查看状态变化
2. 每个 action 都有明确的命名，便于追踪
3. 在开发环境中启用了详细的日志记录
4. 使用 `getViewerState()` 和 `getUIState()` 获取格式化的状态快照

## 🚨 注意事项

1. 文件数据不会被持久化（避免占用过多存储空间）
2. 错误状态和通知不会被持久化
3. 加载状态在页面刷新后会重置
4. 大文件处理时注意内存管理
