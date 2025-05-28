# 多视图布局切换修复总结

## 问题描述

用户发现多视图切换功能不能正常工作，分析后发现问题出现在Layout组件的Cornerstone视口初始化逻辑中。原来的代码只在初始化时创建了一个视口，但当用户切换到多窗格布局时，没有正确地重新配置视口来适应新的布局结构。

## 根本原因

在 `src/pages/Layout/index.jsx` 的第106行附近：

```javascript
if (!element) {
  console.error('视图元素不存在');
  throw new Error('视图元素不存在');
}

const viewportInput = {
  viewportId,
  element,
  type: ViewportType.STACK,
};

renderingEngine.enableElement(viewportInput);
```

这段代码只在组件初始化时执行一次，当布局从单窗格(1x1)切换到多窗格(如2x2)时，没有重新创建和配置相应数量的视口。

## 修复方案

### 1. 重构Layout组件的视口管理

- **分离初始化逻辑**：将Cornerstone的一次性初始化与视口配置分离
- **添加布局监听**：监听 `currentLayout` 状态变化，在布局切换时重新配置视口
- **支持多视口**：使用 `viewportsRef` 对象来管理多个视口的引用

### 2. 修改的主要文件

#### `src/pages/Layout/index.jsx`

- 添加了 `currentLayout` 状态管理
- 创建了 `setupViewportsForLayout` 函数来处理布局切换
- 改进了视口清理和重建逻辑
- 添加了详细的调试日志

#### `src/components/MainLayout/index.jsx`

- 添加了 `currentLayout` 和 `onLayoutChange` 参数
- 确保布局变化能正确传递到子组件

#### `src/components/ViewerContainer/index.jsx`

- 添加了调试日志来跟踪布局变化
- 改进了多窗格布局的参数传递
- 添加了布局指示器显示当前布局状态

#### `src/components/ViewerContainer/index.module.less`

- 添加了布局指示器的样式

### 3. 修复的核心逻辑

```javascript
// 当布局改变时，重新配置视口
useEffect(() => {
  if (!isInitialized || !renderingEngineRef.current) return;

  const setupViewportsForLayout = async () => {
    try {
      console.log(`重新配置视口以适应布局: ${currentLayout}`);

      // 清理现有视口
      Object.keys(viewportsRef.current).forEach((viewportId) => {
        try {
          renderingEngineRef.current.disableElement(viewportId);
        } catch (error) {
          console.warn(`清理视口 ${viewportId} 时出错:`, error);
        }
      });
      viewportsRef.current = {};

      // 清理现有工具组
      if (toolGroupRef.current) {
        try {
          ToolGroupManager.destroyToolGroup('myToolGroup');
        } catch (error) {
          console.warn('清理工具组时出错:', error);
        }
        toolGroupRef.current = null;
      }

      // 根据布局创建视口
      if (currentLayout === '1x1') {
        // 单窗格布局逻辑
        // ...
      } else {
        // 多窗格布局处理
        console.log('多窗格布局将由MultiPaneViewer组件处理');
      }
    } catch (error) {
      console.error('配置视口时出错:', error);
    }
  };

  setupViewportsForLayout();
}, [currentLayout, isInitialized, images]);
```

## 当前状态

### ✅ 已完成

1. **单窗格布局**：完全支持，包括Cornerstone视口的正确初始化和清理
2. **布局切换检测**：正确监听和响应布局变化
3. **视口清理**：在布局切换时正确清理旧视口和工具组
4. **参数传递**：确保布局参数正确传递到所有相关组件
5. **调试支持**：添加了详细的控制台日志来跟踪布局切换过程

### 🚧 待完成

1. **多窗格Cornerstone集成**：MultiPaneViewer组件还需要与实际的Cornerstone引擎集成
2. **多视图类型支持**：需要为不同的视图类型(轴位、矢状位、冠状位等)配置相应的视口
3. **工具同步**：确保多个视口之间的工具状态正确同步

## 验证方法

1. **启动应用**：`npm start`
2. **打开浏览器控制台**：查看布局切换的调试日志
3. **测试布局切换**：
   - 在DicomToolbar中点击布局选择器(网格图标)
   - 选择不同的布局选项(1x2, 2x1, 2x2等)
   - 观察控制台输出，确认布局切换被正确检测和处理
4. **验证单窗格功能**：确保在1x1布局下，DICOM图像的加载和工具操作正常

## 预期效果

- 布局切换应该能被正确检测
- 控制台会显示详细的切换过程日志
- 单窗格布局应该继续正常工作
- 多窗格布局会显示MultiPaneViewer组件的占位内容

## 下一步计划

1. **完善MultiPaneViewer**：为其添加真实的Cornerstone视口支持
2. **实现多视图类型**：支持三平面视图、MPR、VR等
3. **优化性能**：确保布局切换的流畅性
4. **用户体验**：添加切换动画和加载状态指示
