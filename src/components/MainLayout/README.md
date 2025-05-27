# MainLayout 布局修复说明

## 修复的问题

### 1. 序列区和控制区隐藏时的展示问题

**问题描述：**

- 当序列区（SeriesPanel）或控制区（ControlPanel）隐藏时，中央查看器（ViewerContainer）没有正确适应宽度变化
- 面板收缩过程中出现布局闪烁和不流畅的过渡效果
- 隐藏状态下的标题和图标可能重叠或显示不当

**修复内容：**

### 2. MainLayout 布局优化

- **添加了正确的 flex 布局约束**：

  - 中央查看器使用 `flex: 1` 和 `min-width: 0` 确保能够正确填充可用空间
  - 所有面板添加了 `position: relative` 进行正确定位

- **优化了过渡动画**：
  - 将 `transition: all` 改为具体的属性过渡，避免不必要的动画
  - 添加了 `will-change: width` 优化性能
  - 使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数提供更自然的动画效果

### 3. SeriesPanel 序列区修复

- **折叠状态优化**：

  - 添加了 `min-width: 48px` 确保最小宽度
  - 使用 `flex-shrink: 0` 防止被意外压缩
  - 标题和徽章在折叠时使用淡出和移动动画

- **内容溢出处理**：
  - 添加了 `overflow: hidden` 和 `text-overflow: ellipsis` 防止文本溢出
  - 图标和按钮使用 `flex-shrink: 0` 保持固定大小

### 4. ControlPanel 控制区修复

- **与序列区保持一致的行为**：
  - 相同的折叠动画和尺寸约束
  - 标题向右移动（因为是右侧面板）
  - 相同的过渡时间和缓动函数

### 5. ViewerContainer 查看器优化

- **宽度适应性**：

  - 添加了 `min-width: 0` 和 `min-height: 0` 允许容器收缩
  - 使用 `contain: layout` 优化重排性能
  - 添加了平滑的过渡效果

- **响应式改进**：
  - 占位符内容在不同屏幕尺寸下使用适当的缩放
  - 在极小屏幕上隐藏特性列表以节省空间

## 使用效果

修复后的布局具有以下特点：

1. **流畅的动画**：面板展开/收缩时动画更加自然流畅
2. **正确的空间利用**：中央查看器能够正确填充侧边栏收缩后的空间
3. **良好的视觉反馈**：折叠状态下的图标和按钮提供清晰的视觉指示
4. **响应式兼容**：在不同屏幕尺寸下都能正常工作
5. **性能优化**：减少了不必要的重排和重绘

## 技术细节

### CSS 过渡优化

```css
// 之前：可能导致性能问题
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

// 现在：只对需要的属性进行过渡
transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.2s ease,
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
will-change: width;
```

### Flex 布局约束

```css
// 确保中央查看器能够正确填充空间
.contentArea > :nth-child(2) {
  flex: 1;
  min-width: 0; // 关键：允许收缩到最小宽度
  position: relative;
}
```

### 折叠状态处理

```css
&.collapsed {
  width: 48px;
  min-width: 48px; // 防止进一步收缩

  .headerContent {
    .title, .badge {
      opacity: 0;
      visibility: hidden;
      transform: translateX(-10px); // 平滑的移出动画
    }
  }
}
```
