# 多窗格DICOM查看器

## 概述

这是一个功能完整的多窗格DICOM查看器，参考OHIF Viewer的设计理念，支持灵活的窗格布局和丰富的图像操作工具。

## 主要功能

### 1. 灵活的窗格布局

支持多种预定义的布局模式：

- **1x1**: 单窗格布局
- **1x2**: 1行2列布局
- **2x1**: 2行1列布局
- **2x2**: 2行2列布局
- **3x1**: 3行1列布局
- **1x3**: 1行3列布局
- **2x3**: 2行3列布局

### 2. 工具栏布局切换

在DicomToolbar中集成了布局选择器，用户可以：

- 通过下拉菜单选择不同的布局
- 实时预览布局图标
- 快速切换布局模式

### 3. 窗格管理

每个窗格具有以下特性：

- **活动窗格指示**: 当前活动的窗格会有蓝色边框高亮
- **窗格编号**: 每个窗格显示编号标识
- **独立操作**: 每个窗格可以独立显示不同的图像
- **点击切换**: 点击窗格可以设置为活动窗格

## 组件架构

### 核心组件

1. **MultiPaneViewer** (`src/components/MultiPaneViewer/index.jsx`)

   - 主要的多窗格查看器组件
   - 管理布局配置和窗格状态
   - 使用CSS Grid实现灵活布局

2. **ViewportPane** (`src/components/MultiPaneViewer/ViewportPane.jsx`)

   - 单个窗格组件
   - 负责显示DICOM图像
   - 处理窗格交互和状态

3. **LayoutSelector** (`src/components/MultiPaneViewer/LayoutSelector.jsx`)

   - 布局选择器组件
   - 提供布局切换界面
   - 显示布局预览图标

4. **MultiPaneLayout** (`src/components/MultiPaneLayout/index.jsx`)
   - 整体布局组件
   - 集成多窗格查看器和其他面板
   - 管理响应式布局

### 布局配置

布局配置使用对象定义，包含以下属性：

```javascript
const LAYOUT_CONFIGS = {
  '1x1': {
    name: '单窗格',
    rows: 1,
    cols: 1,
    panes: [{ row: 0, col: 0, rowSpan: 1, colSpan: 1 }],
  },
  // ... 其他布局配置
};
```

## 使用方法

### 1. 基本使用

```jsx
import MultiPaneViewer from './components/MultiPaneViewer';

<MultiPaneViewer
  images={images}
  currentImageIndex={currentImageIndex}
  layout="2x2"
  onLayoutChange={handleLayoutChange}
  toolGroupRef={toolGroupRef}
  activeTool={activeTool}
  onToolChange={onToolChange}
/>;
```

### 2. 访问演示页面

启动开发服务器后，访问以下URL查看演示：

- 主页面: `http://localhost:5173/`
- 多窗格演示: `http://localhost:5173/multi-pane`

### 3. 布局切换

在工具栏中找到布局选择器按钮（网格图标），点击后可以：

1. 查看所有可用布局
2. 预览布局结构
3. 选择目标布局进行切换

## 技术特性

### CSS Grid布局

使用CSS Grid实现灵活的窗格布局：

```css
.viewerContainer {
  display: grid;
  grid-template-rows: repeat(${rows}, 1fr);
  grid-template-columns: repeat(${cols}, 1fr);
  gap: 2px;
}
```

### 响应式设计

- 支持移动端和桌面端
- 自适应屏幕尺寸
- 面板折叠功能

### 状态管理

- 活动窗格跟踪
- 布局状态同步
- 图像分配管理

## 扩展功能

### 1. 自定义布局

可以通过修改`LAYOUT_CONFIGS`添加新的布局模式：

```javascript
'custom': {
  name: '自定义布局',
  rows: 2,
  cols: 3,
  panes: [
    { row: 0, col: 0, rowSpan: 2, colSpan: 1 }, // 跨行窗格
    { row: 0, col: 1, rowSpan: 1, colSpan: 2 }, // 跨列窗格
    // ... 更多窗格配置
  ]
}
```

### 2. 窗格同步

可以实现窗格间的同步功能：

- 缩放同步
- 窗宽窗位同步
- 滚动同步

### 3. 工具集成

每个窗格都支持完整的Cornerstone.js工具：

- 窗宽窗位调整
- 缩放和平移
- 测量工具
- ROI分析

## 文件结构

```
src/components/MultiPaneViewer/
├── index.jsx                 # 主组件
├── ViewportPane.jsx          # 窗格组件
├── LayoutSelector.jsx        # 布局选择器
├── index.module.less         # 主样式
├── ViewportPane.module.less  # 窗格样式
└── LayoutSelector.module.less # 选择器样式

src/components/MultiPaneLayout/
├── index.jsx                 # 布局组件
└── index.module.less         # 布局样式

src/pages/MultiPaneViewerDemo/
├── index.jsx                 # 演示页面
└── index.module.less         # 演示样式
```

## 开发说明

### 1. 添加新布局

1. 在`LAYOUT_CONFIGS`中定义新布局
2. 确保窗格配置正确
3. 测试布局在不同屏幕尺寸下的表现

### 2. 集成Cornerstone.js

当前实现使用模拟的viewport对象，实际使用时需要：

1. 初始化Cornerstone.js渲染引擎
2. 为每个窗格创建viewport
3. 配置工具组和工具绑定

### 3. 性能优化

- 使用React.memo优化组件渲染
- 实现虚拟化处理大量窗格
- 优化图像加载和缓存策略

## 未来规划

1. **高级布局**: 支持不规则窗格布局
2. **布局保存**: 用户自定义布局的保存和加载
3. **窗格拖拽**: 支持窗格间的拖拽重排
4. **多屏显示**: 支持多显示器的窗格分布
5. **协作功能**: 多用户同步查看和标注

## 参考资料

- [OHIF Viewer](https://ohif.org/)
- [Cornerstone.js](https://www.cornerstonejs.org/)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
