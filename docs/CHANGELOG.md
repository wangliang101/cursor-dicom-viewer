# 更新日志

## [2024-01-XX] - Ant Design 兼容性修复

### 🐛 问题修复

#### 修复 Ant Design Card 组件 `bodyStyle` 弃用警告

**问题描述**:

```
Warning: [antd: Card] `bodyStyle` is deprecated. Please use `styles.body` instead.
```

**修复内容**:
将所有使用 `bodyStyle` 属性的 Card 组件更新为使用新的 `styles.body` 属性。

**受影响文件**:

- `src/components/MultiPaneViewer/index.jsx`
- `src/components/ViewerContainer/index.jsx`
- `src/components/SeriesPanel/index.jsx`
- `src/components/ControlPanel/index.jsx`

**修复前**:

```jsx
<Card bodyStyle={{ padding: 0 }}>
```

**修复后**:

```jsx
<Card styles={{ body: { padding: 0 } }}>
```

**额外修复**:

- 修复了 `ControlPanel` 组件中 `Title` 组件的导入问题
- 将 `import { Title } from 'antd'` 改为 `import { Typography } from 'antd'; const { Title } = Typography;`

### ✅ 验证结果

- ✅ 项目构建成功: `npm run build`
- ✅ 开发服务器正常运行: `npm run dev`
- ✅ 所有 Ant Design 弃用警告已消除
- ✅ 组件功能正常

### 📝 注意事项

此更新确保了与 Ant Design 最新版本的兼容性，建议开发者在使用 Card 组件时遵循新的 API 规范：

```jsx
// 推荐写法
<Card styles={{ body: { padding: '16px' } }}>
  {/* 内容 */}
</Card>

// 其他样式配置
<Card styles={{
  body: { padding: '16px' },
  header: { borderBottom: 'none' }
}}>
  {/* 内容 */}
</Card>
```

这种写法提供了更好的类型安全性和更清晰的样式配置结构。
