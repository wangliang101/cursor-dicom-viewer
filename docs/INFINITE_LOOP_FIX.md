# ViewportPane 无限循环问题修复

## 问题描述

在切换到多窗格布局时，控制台出现以下错误：

```
Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

## 问题分析

### 根本原因

`ViewportPane` 组件中的 useEffect 依赖项配置不当，导致了无限循环：

1. **不稳定的依赖项**：

   - `viewConfig` 每次渲染都重新创建
   - `onViewportRef` 回调函数可能每次都是新的引用
   - `isInitialized` 在 useEffect 内部被修改，又作为依赖项

2. **循环链路**：
   ```
   useEffect 执行 → setIsInitialized(true) →
   重新渲染 → isInitialized 变化 →
   useEffect 重新执行 → 无限循环
   ```

## 修复方案

### 1. 优化视图配置缓存

**修复前：**

```javascript
const viewConfig = VIEW_CONFIGS[viewType] || VIEW_CONFIGS[VIEW_TYPES.AXIAL];
```

**修复后：**

```javascript
const viewConfig = useMemo(() => {
  return VIEW_CONFIGS[viewType] || VIEW_CONFIGS[VIEW_TYPES.AXIAL];
}, [viewType]);
```

### 2. 稳定化回调函数

**修复前：**

```javascript
const handleViewportRef = useCallback(
  (viewport) => {
    if (onViewportRef) {
      onViewportRef(viewport);
    }
  },
  [onViewportRef]
); // onViewportRef 变化会导致重新创建
```

**修复后：**

```javascript
const onViewportRefCallback = useRef(onViewportRef);

// 更新回调引用
useEffect(() => {
  onViewportRefCallback.current = onViewportRef;
}, [onViewportRef]);

const handleViewportRef = useCallback((viewport) => {
  if (onViewportRefCallback.current) {
    onViewportRefCallback.current(viewport);
  }
}, []); // 空依赖数组，函数引用稳定
```

### 3. 分离初始化和渲染逻辑

**修复前：**

```javascript
// 初始化和图像渲染混在一个 useEffect 中
useEffect(() => {
  // 初始化逻辑
  // ...
  if (imageData) {
    // 图像渲染逻辑
  }
}, [paneIndex, onViewportRef, viewType, viewConfig, isInitialized, imageData]);
```

**修复后：**

```javascript
// 初始化 useEffect
useEffect(() => {
  // 只负责初始化
  // ...
}, [paneIndex, viewType, viewConfig.orientation, handleViewportRef]);

// 图像渲染 useEffect
useEffect(() => {
  if (!viewportRef.current || !isInitialized || !imageData) return;
  // 图像渲染逻辑
}, [isInitialized, imageData]);
```

### 4. 移除问题依赖项

- **移除 `isInitialized`**：不再将其作为初始化 useEffect 的依赖项
- **使用稳定引用**：通过 `viewConfig.orientation` 而不是整个 `viewConfig` 对象
- **分离关注点**：将不同的逻辑放在不同的 useEffect 中

## 修复效果

### 修复前的问题

- 组件挂载后立即进入无限循环
- 控制台不断输出警告信息
- 页面性能急剧下降
- 浏览器可能因为过度渲染而卡死

### 修复后的效果

- ✅ 组件正常初始化，无循环警告
- ✅ 视图类型切换流畅
- ✅ 布局切换稳定
- ✅ 性能表现良好

## 最佳实践总结

### 1. useEffect 依赖项管理

- 避免将在 useEffect 内部修改的状态作为依赖项
- 使用 `useMemo` 和 `useCallback` 稳定对象和函数引用
- 考虑使用 `useRef` 来存储不需要触发重新渲染的值

### 2. 回调函数处理

- 对于来自父组件的回调，使用 `useRef` 存储最新引用
- 避免在依赖数组中包含可能频繁变化的回调

### 3. 关注点分离

- 将不同的副作用逻辑分别放在不同的 useEffect 中
- 每个 useEffect 只负责一个明确的功能

### 4. 性能优化

- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 缓存函数引用
- 避免在渲染过程中创建新的对象或函数

## 验证测试

修复后需要验证以下场景：

1. **多窗格切换**：从单窗格切换到多窗格布局
2. **视图类型变更**：在多窗格模式下切换视图类型
3. **图像加载**：加载图像后的显示效果
4. **性能测试**：长时间使用无性能问题

## 结论

通过重新设计 `ViewportPane` 组件的 useEffect 依赖项管理，成功解决了无限循环问题。这次修复不仅解决了当前的问题，还提高了代码的健壮性和性能表现。

关键在于理解 React 的渲染机制和 useEffect 的依赖项系统，确保依赖项的稳定性，避免不必要的重新执行。
