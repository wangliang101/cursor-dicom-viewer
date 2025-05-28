# 项目结构说明

本文档描述了多窗格DICOM查看器项目的目录结构和组织方式。

## 整体项目结构

```
cursor-dicom-viewer/
├── docs/                          # 文档目录
│   ├── README.md                   # 文档索引
│   ├── FEATURES_DEMO.md           # 功能演示说明
│   ├── MULTI_PANE_VIEWER_README.md # 技术文档
│   └── PROJECT_STRUCTURE.md       # 项目结构说明
├── src/                           # 源代码
│   ├── components/                # 组件目录
│   │   ├── MultiPaneViewer/       # 多窗格查看器组件
│   │   ├── MultiPaneLayout/       # 多窗格布局组件
│   │   ├── DicomToolbar/          # DICOM工具栏组件
│   │   ├── Header/                # 头部组件
│   │   ├── SeriesPanel/           # 序列面板组件
│   │   ├── ControlPanel/          # 控制面板组件
│   │   └── ViewerContainer/       # 查看器容器组件
│   ├── constants/                 # 常量定义
│   │   ├── index.js              # 常量统一导出
│   │   ├── layouts.js            # 布局配置常量
│   │   └── dicom.js              # DICOM相关常量
│   ├── pages/                     # 页面组件
│   │   ├── Layout/               # 主布局页面
│   │   └── errorPage/            # 错误页面
│   └── routes/                    # 路由配置
└── dist/                          # 构建输出目录
```

## 目录详细说明

### `/docs` - 文档目录

统一管理所有项目文档，包括：

- **README.md**: 文档导航和索引
- **FEATURES_DEMO.md**: 功能演示和使用指南
- **MULTI_PANE_VIEWER_README.md**: 技术架构文档
- **PROJECT_STRUCTURE.md**: 本文件，项目结构说明

### `/src/constants` - 常量定义目录

集中管理所有常量定义，提高代码维护性：

#### `layouts.js` - 布局配置常量

```javascript
export const LAYOUT_CONFIGS = {
  '1x1': { name: '单窗格', rows: 1, cols: 1, panes: [...] },
  '1x2': { name: '1行2列', rows: 1, cols: 2, panes: [...] },
  // ... 其他布局配置
};

export const DEFAULT_LAYOUT = '1x1';
export const LAYOUT_TYPES = { ... };
export const PANE_STATES = { ... };
```

#### `dicom.js` - DICOM相关常量

```javascript
export const WINDOW_PRESETS = {
  lung: { width: 1500, center: -600, name: '肺窗' },
  brain: { width: 80, center: 40, name: '脑窗' },
  // ... 其他窗口预设
};

export const TOOL_NAMES = { ... };
export const DEFAULT_SETTINGS = { ... };
```

#### `index.js` - 统一导出

```javascript
// 从各个常量文件中重新导出，提供统一的导入接口
export { LAYOUT_CONFIGS, DEFAULT_LAYOUT } from './layouts';
export { WINDOW_PRESETS, TOOL_NAMES } from './dicom';
```

### `/src/components` - 组件目录

#### `MultiPaneViewer/` - 多窗格查看器

核心的多窗格查看器组件，包含：

- `index.jsx`: 主组件文件
- `ViewportPane.jsx`: 单个窗格组件
- `LayoutSelector.jsx`: 布局选择器
- 对应的样式文件（.module.less）

#### `MultiPaneLayout/` - 多窗格布局

整体布局管理组件，集成多窗格查看器和其他面板

#### `DicomToolbar/` - DICOM工具栏

功能完整的DICOM查看器工具栏

### `/src/pages` - 页面组件

- `Layout/`: 主要的应用布局页面
- `errorPage/`: 错误处理页面

## 重构说明

### 1. 演示代码清理

- **删除**: `src/pages/MultiPaneViewerDemo/` 演示页面目录
- **更新**: `src/routes/index.jsx` 移除演示页面路由

### 2. 文档整理

- **创建**: `docs/` 目录集中管理文档
- **移动**: 将技术文档从根目录移动到 `docs/` 目录
- **创建**: 文档索引和项目结构说明

### 3. 常量提取

- **创建**: `src/constants/` 目录
- **提取**: 布局配置、DICOM预设等常量
- **统一**: 通过 `index.js` 提供统一导出接口

### 4. 代码重构

- **更新**: 所有相关组件使用新的常量导入路径
- **优化**: 代码结构和导入方式
- **清理**: 移除重复的常量定义

## 导入方式

### 常量导入

```javascript
// 推荐：从统一入口导入
import { LAYOUT_CONFIGS, DEFAULT_LAYOUT, WINDOW_PRESETS } from '../../constants';

// 或者：从具体文件导入
import { LAYOUT_CONFIGS } from '../../constants/layouts';
import { WINDOW_PRESETS } from '../../constants/dicom';
```

### 组件导入

```javascript
// 多窗格查看器
import MultiPaneViewer from '../MultiPaneViewer';

// 布局选择器
import LayoutSelector from '../MultiPaneViewer/LayoutSelector';
```

## 最佳实践

1. **常量定义**: 所有常量应在 `constants/` 目录中定义
2. **文档维护**: 新功能开发时同步更新相关文档
3. **导入路径**: 使用相对路径导入，保持路径简洁
4. **代码组织**: 按功能模块组织代码，保持单一职责
5. **命名规范**: 使用语义化的命名，便于理解和维护

## 构建验证

项目重构后通过以下验证：

```bash
# 构建测试
npm run build

# 开发服务器
npm run dev
```

所有重构均已通过构建测试，确保代码正常运行。
