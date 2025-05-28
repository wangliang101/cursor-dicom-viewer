// import React from 'react';
// import { Button, Card, Row, Col, Space, Typography, Switch, Slider } from 'antd';
// import {
//   FileOutlined,
//   ZoomInOutlined,
//   ZoomOutOutlined,
//   RotateLeftOutlined,
//   RotateRightOutlined,
//   FullscreenOutlined,
//   SettingOutlined,
// } from '@ant-design/icons';

// // 导入自定义hooks
// import { useDicomFiles, useCurrentDicom, useDicomList } from '../hooks/useDicom';
// import {
//   useWindowLevel,
//   useViewportTransform,
//   useImageEffects,
//   useViewerTools,
// } from '../hooks/useViewer';
// import {
//   useUI,
//   useLoading,
//   useError,
//   useNotifications,
//   useSidebar,
//   useTheme,
// } from '../hooks/useUI';

// const { Title, Text } = Typography;

// // DICOM文件管理示例组件
// const DicomFilesExample = () => {
//   const { dicomFiles, fileCount, loadDicomFile } = useDicomFiles();
//   const { currentFile, selectFile } = useCurrentDicom();
//   const { selectNext, selectPrevious, hasNext, hasPrevious } = useDicomList();

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       loadDicomFile(file);
//     }
//   };

//   return (
//     <Card title="DICOM文件管理" size="small">
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <input
//           type="file"
//           accept=".dcm,.dicom"
//           onChange={handleFileSelect}
//           style={{ marginBottom: 8 }}
//         />

//         <div>
//           <Text>已加载文件: {fileCount}</Text>
//           {currentFile && <Text> | 当前: {currentFile.name}</Text>}
//         </div>

//         <Space>
//           <Button
//             size="small"
//             disabled={!hasPrevious}
//             onClick={selectPrevious}
//             icon={<FileOutlined />}
//           >
//             上一个
//           </Button>
//           <Button size="small" disabled={!hasNext} onClick={selectNext} icon={<FileOutlined />}>
//             下一个
//           </Button>
//         </Space>

//         <div style={{ maxHeight: 150, overflow: 'auto' }}>
//           {dicomFiles.map((file, index) => (
//             <div
//               key={file.id}
//               style={{
//                 padding: 4,
//                 cursor: 'pointer',
//                 backgroundColor: currentFile?.id === file.id ? '#e6f7ff' : 'transparent',
//               }}
//               onClick={() => selectFile(file)}
//             >
//               {index + 1}. {file.name}
//             </div>
//           ))}
//         </div>
//       </Space>
//     </Card>
//   );
// };

// // 窗宽窗位控制示例组件
// const WindowLevelExample = () => {
//   const { windowWidth, windowCenter, setWindowLevel, presets } = useWindowLevel();

//   return (
//     <Card title="窗宽窗位控制" size="small">
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <div>
//           <Text>窗宽: {windowWidth}</Text>
//           <Slider
//             min={1}
//             max={2000}
//             value={windowWidth}
//             onChange={(value) => setWindowLevel(value, windowCenter)}
//           />
//         </div>

//         <div>
//           <Text>窗位: {windowCenter}</Text>
//           <Slider
//             min={-1000}
//             max={1000}
//             value={windowCenter}
//             onChange={(value) => setWindowLevel(windowWidth, value)}
//           />
//         </div>

//         <div>
//           <Text>预设:</Text>
//           <Space wrap>
//             <Button size="small" onClick={presets.chest}>
//               胸部
//             </Button>
//             <Button size="small" onClick={presets.abdomen}>
//               腹部
//             </Button>
//             <Button size="small" onClick={presets.bone}>
//               骨骼
//             </Button>
//             <Button size="small" onClick={presets.brain}>
//               脑部
//             </Button>
//             <Button size="small" onClick={presets.lung}>
//               肺部
//             </Button>
//           </Space>
//         </div>
//       </Space>
//     </Card>
//   );
// };

// // 视口变换控制示例组件
// const ViewportTransformExample = () => {
//   const {
//     zoom,
//     pan,
//     rotation,
//     zoomIn,
//     zoomOut,
//     resetZoom,
//     resetPan,
//     resetTransform,
//     rotateBy,
//     canZoomIn,
//     canZoomOut,
//   } = useViewportTransform();

//   const { invert, toggleInvert } = useImageEffects();

//   return (
//     <Card title="视口变换控制" size="small">
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <Row gutter={8}>
//           <Col span={12}>
//             <Text>缩放: {zoom.toFixed(2)}x</Text>
//           </Col>
//           <Col span={12}>
//             <Text>旋转: {rotation}°</Text>
//           </Col>
//         </Row>

//         <Row gutter={8}>
//           <Col span={12}>
//             <Text>
//               平移: ({pan.x}, {pan.y})
//             </Text>
//           </Col>
//           <Col span={12}>
//             <Switch
//               checked={invert}
//               onChange={toggleInvert}
//               checkedChildren="反色开"
//               unCheckedChildren="反色关"
//             />
//           </Col>
//         </Row>

//         <Space wrap>
//           <Button size="small" icon={<ZoomInOutlined />} disabled={!canZoomIn} onClick={zoomIn}>
//             放大
//           </Button>
//           <Button size="small" icon={<ZoomOutOutlined />} disabled={!canZoomOut} onClick={zoomOut}>
//             缩小
//           </Button>
//           <Button size="small" onClick={resetZoom}>
//             重置缩放
//           </Button>
//         </Space>

//         <Space wrap>
//           <Button size="small" icon={<RotateLeftOutlined />} onClick={() => rotateBy(-90)}>
//             左转
//           </Button>
//           <Button size="small" icon={<RotateRightOutlined />} onClick={() => rotateBy(90)}>
//             右转
//           </Button>
//           <Button size="small" onClick={resetPan}>
//             重置平移
//           </Button>
//         </Space>

//         <Button onClick={resetTransform} type="primary" size="small">
//           重置所有变换
//         </Button>
//       </Space>
//     </Card>
//   );
// };

// // 工具栏示例组件
// const ToolbarExample = () => {
//   const { currentTool, tools, selectTool, isToolActive } = useViewerTools();

//   return (
//     <Card title="工具栏" size="small">
//       <Space wrap>
//         {tools.map((tool) => (
//           <Button
//             key={tool.id}
//             size="small"
//             type={isToolActive(tool.id) ? 'primary' : 'default'}
//             onClick={() => selectTool(tool.id)}
//           >
//             {tool.name}
//           </Button>
//         ))}
//       </Space>
//       <div style={{ marginTop: 8 }}>
//         <Text>当前工具: {currentTool}</Text>
//       </div>
//     </Card>
//   );
// };

// // UI控制示例组件
// const UIControlExample = () => {
//   const { isLoading, setLoading } = useLoading();
//   const { error, handleError, clearError } = useError();
//   const { showSuccess, showError, showWarning, showInfo } = useNotifications();
//   const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
//   const { theme, toggleTheme, isDark } = useTheme();

//   return (
//     <Card title="UI控制" size="small">
//       <Space direction="vertical" style={{ width: '100%' }}>
//         <Row gutter={8}>
//           <Col span={12}>
//             <Switch
//               checked={isLoading}
//               onChange={setLoading}
//               checkedChildren="加载中"
//               unCheckedChildren="空闲"
//             />
//           </Col>
//           <Col span={12}>
//             <Switch
//               checked={sidebarOpen}
//               onChange={toggleSidebar}
//               checkedChildren="侧边栏开"
//               unCheckedChildren="侧边栏关"
//             />
//           </Col>
//         </Row>

//         <Row gutter={8}>
//           <Col span={12}>
//             <Switch
//               checked={isDark}
//               onChange={toggleTheme}
//               checkedChildren="暗色主题"
//               unCheckedChildren="亮色主题"
//             />
//           </Col>
//           <Col span={12}>
//             <Text>主题: {theme}</Text>
//           </Col>
//         </Row>

//         {error && (
//           <div style={{ color: 'red', fontSize: 12 }}>
//             错误: {error}
//             <Button size="small" onClick={clearError} style={{ marginLeft: 8 }}>
//               清除
//             </Button>
//           </div>
//         )}

//         <Space wrap>
//           <Button size="small" onClick={() => showSuccess('操作成功!')}>
//             成功通知
//           </Button>
//           <Button size="small" onClick={() => showError('发生错误!')}>
//             错误通知
//           </Button>
//           <Button size="small" onClick={() => showWarning('警告信息!')}>
//             警告通知
//           </Button>
//           <Button size="small" onClick={() => showInfo('提示信息!')}>
//             信息通知
//           </Button>
//         </Space>

//         <Button size="small" onClick={() => handleError('这是一个测试错误')}>
//           测试错误处理
//         </Button>
//       </Space>
//     </Card>
//   );
// };

// // 主示例组件
// const StoreUsageExample = () => {
//   return (
//     <div style={{ padding: 16 }}>
//       <Title level={3}>Zustand Store 使用示例</Title>

//       <Row gutter={16}>
//         <Col span={12}>
//           <Space direction="vertical" style={{ width: '100%' }}>
//             <DicomFilesExample />
//             <WindowLevelExample />
//             <ToolbarExample />
//           </Space>
//         </Col>

//         <Col span={12}>
//           <Space direction="vertical" style={{ width: '100%' }}>
//             <ViewportTransformExample />
//             <UIControlExample />
//           </Space>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default StoreUsageExample;
