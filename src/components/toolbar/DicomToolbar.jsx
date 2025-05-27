import { useState, useEffect } from 'react';
import {
  Button,
  Tooltip,
  Divider,
  Space,
  Select,
  InputNumber,
  Popover,
  Slider,
  Row,
  Col,
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  ReloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  BorderOutlined,
  RadiusSettingOutlined,
  ColumnHeightOutlined,
  BgColorsOutlined,
  EyeOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  InfoCircleOutlined,
  CompressOutlined,
  AimOutlined,
  LineOutlined,
} from '@ant-design/icons';
import {
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  LengthTool,
  AngleTool,
  RectangleROITool,
  CircleROITool,
  EllipticalROITool,
  BidirectionalTool,
  ProbeTool,
  CrosshairsTool,
  Enums as csToolsEnums,
  addTool,
} from '@cornerstonejs/tools';
import styles from './DicomToolbar.module.less';

const { Option } = Select;

// 预设窗宽窗位值
const WINDOW_PRESETS = {
  lung: { width: 1500, center: -600, name: '肺窗' },
  abdomen: { width: 400, center: 50, name: '腹部窗' },
  brain: { width: 80, center: 40, name: '脑窗' },
  bone: { width: 2000, center: 300, name: '骨窗' },
  mediastinum: { width: 350, center: 50, name: '纵隔窗' },
  liver: { width: 150, center: 30, name: '肝脏窗' },
  custom: { width: 400, center: 40, name: '自定义' },
};

const DicomToolbar = ({
  toolGroupRef,
  activeTool,
  onToolChange,
  viewportRef,
  onReset,
  onFlipH,
  onFlipV,
  onRotate,
  onInvert,
  onPlay,
  onStop,
  onNextFrame,
  onPrevFrame,
  isPlaying,
  currentImageIndex,
  totalImages,
  onShowInfo,
  onShowSettings,
}) => {
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(40);
  const [selectedPreset, setSelectedPreset] = useState('custom');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [showWindowControl, setShowWindowControl] = useState(false);

  // 初始化所有工具
  useEffect(() => {
    const initializeAllTools = () => {
      const tools = [
        WindowLevelTool,
        ZoomTool,
        PanTool,
        StackScrollTool,
        LengthTool,
        AngleTool,
        RectangleROITool,
        CircleROITool,
        EllipticalROITool,
        BidirectionalTool,
        ProbeTool,
        CrosshairsTool,
      ];

      tools.forEach((tool) => {
        try {
          addTool(tool);
        } catch (error) {
          console.warn(`Tool ${tool.toolName} already exists:`, error);
        }
      });
    };

    initializeAllTools();
  }, []);

  // 窗宽窗位控制
  const handleWindowPresetChange = (presetKey) => {
    const preset = WINDOW_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    setWindowWidth(preset.width);
    setWindowCenter(preset.center);

    if (viewportRef?.current) {
      try {
        viewportRef.current.setProperties({
          voiRange: {
            lower: preset.center - preset.width / 2,
            upper: preset.center + preset.width / 2,
          },
        });
        viewportRef.current.render();
      } catch (error) {
        console.warn('设置窗宽窗位失败:', error);
      }
    }
  };

  const handleWindowWidthChange = (value) => {
    setWindowWidth(value);
    setSelectedPreset('custom');
    applyWindowLevel(value, windowCenter);
  };

  const handleWindowCenterChange = (value) => {
    setWindowCenter(value);
    setSelectedPreset('custom');
    applyWindowLevel(windowWidth, value);
  };

  const applyWindowLevel = (width, center) => {
    if (viewportRef?.current) {
      try {
        viewportRef.current.setProperties({
          voiRange: {
            lower: center - width / 2,
            upper: center + width / 2,
          },
        });
        viewportRef.current.render();
      } catch (error) {
        console.warn('应用窗宽窗位失败:', error);
      }
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    if (viewportRef?.current) {
      const camera = viewportRef.current.getCamera();
      const newZoom = camera.zoom * 1.2;
      setZoomLevel(newZoom);
      viewportRef.current.setCamera({ zoom: newZoom });
      viewportRef.current.render();
    }
  };

  const handleZoomOut = () => {
    if (viewportRef?.current) {
      const camera = viewportRef.current.getCamera();
      const newZoom = camera.zoom / 1.2;
      setZoomLevel(newZoom);
      viewportRef.current.setCamera({ zoom: newZoom });
      viewportRef.current.render();
    }
  };

  const handleFitToWindow = () => {
    if (viewportRef?.current) {
      viewportRef.current.resetCamera();
      viewportRef.current.render();
      setZoomLevel(1.0);
    }
  };

  // 工具切换
  const handleToolSelect = (toolName) => {
    if (toolGroupRef?.current) {
      // 停用所有工具
      const allTools = [
        WindowLevelTool.toolName,
        ZoomTool.toolName,
        PanTool.toolName,
        LengthTool.toolName,
        AngleTool.toolName,
        RectangleROITool.toolName,
        CircleROITool.toolName,
        EllipticalROITool.toolName,
        BidirectionalTool.toolName,
        ProbeTool.toolName,
        CrosshairsTool.toolName,
      ];

      allTools.forEach((tool) => {
        try {
          toolGroupRef.current.setToolPassive(tool);
        } catch (error) {
          console.warn(`停用工具失败: ${tool}`, error);
        }
      });

      // 激活选中的工具
      try {
        toolGroupRef.current.setToolActive(toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
        });

        // 滚轮工具始终保持激活状态
        toolGroupRef.current.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
        });

        console.log(`已切换到工具: ${toolName}`);
      } catch (error) {
        console.warn(`激活工具失败: ${toolName}`, error);
      }
    }

    if (onToolChange) {
      onToolChange(toolName);
    }
  };

  // 窗宽窗位控制面板
  const windowControlContent = (
    <div style={{ width: 300, padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <label>预设窗口:</label>
          <Select
            value={selectedPreset}
            onChange={handleWindowPresetChange}
            style={{ width: '100%' }}
          >
            {Object.entries(WINDOW_PRESETS).map(([key, preset]) => (
              <Option key={key} value={key}>
                {preset.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <label>窗宽:</label>
          <InputNumber
            value={windowWidth}
            onChange={handleWindowWidthChange}
            min={1}
            max={4000}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={12}>
          <label>窗位:</label>
          <InputNumber
            value={windowCenter}
            onChange={handleWindowCenterChange}
            min={-1000}
            max={3000}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={24}>
          <label>窗宽: {windowWidth}</label>
          <Slider min={1} max={4000} value={windowWidth} onChange={handleWindowWidthChange} />
        </Col>
        <Col span={24}>
          <label>窗位: {windowCenter}</label>
          <Slider min={-1000} max={3000} value={windowCenter} onChange={handleWindowCenterChange} />
        </Col>
      </Row>
    </div>
  );

  return (
    <div className={styles.toolbar}>
      {/* 基础工具组 */}
      <Space size="small">
        <Tooltip title="窗宽窗位">
          <Button
            type={activeTool === WindowLevelTool.toolName ? 'primary' : 'default'}
            icon={<BgColorsOutlined />}
            onClick={() => handleToolSelect(WindowLevelTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="平移">
          <Button
            type={activeTool === PanTool.toolName ? 'primary' : 'default'}
            icon={<DragOutlined />}
            onClick={() => handleToolSelect(PanTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="缩放">
          <Button
            type={activeTool === ZoomTool.toolName ? 'primary' : 'default'}
            icon={<ZoomInOutlined />}
            onClick={() => handleToolSelect(ZoomTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="十字线">
          <Button
            type={activeTool === CrosshairsTool.toolName ? 'primary' : 'default'}
            icon={<AimOutlined />}
            onClick={() => handleToolSelect(CrosshairsTool.toolName)}
          />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* 缩放控制组 */}
      <Space size="small">
        <Tooltip title="放大">
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Tooltip>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <Tooltip title="适应窗口">
          <Button icon={<CompressOutlined />} onClick={handleFitToWindow} />
        </Tooltip>
        <span className={styles.zoomDisplay}>{Math.round(zoomLevel * 100)}%</span>
      </Space>

      <Divider type="vertical" />

      {/* 图像变换组 */}
      <Space size="small">
        <Tooltip title="重置">
          <Button icon={<ReloadOutlined />} onClick={onReset} />
        </Tooltip>
        <Tooltip title="逆时针旋转">
          <Button icon={<RotateLeftOutlined />} onClick={() => onRotate && onRotate(-90)} />
        </Tooltip>
        <Tooltip title="顺时针旋转">
          <Button icon={<RotateRightOutlined />} onClick={() => onRotate && onRotate(90)} />
        </Tooltip>
        <Tooltip title="水平翻转">
          <Button icon={<SwapOutlined />} onClick={onFlipH} />
        </Tooltip>
        <Tooltip title="垂直翻转">
          <Button
            icon={<SwapOutlined style={{ transform: 'rotate(90deg)' }} />}
            onClick={onFlipV}
          />
        </Tooltip>
        <Tooltip title="反色">
          <Button icon={<EyeOutlined />} onClick={onInvert} />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* 测量工具组 */}
      <Space size="small">
        <Tooltip title="长度测量">
          <Button
            type={activeTool === LengthTool.toolName ? 'primary' : 'default'}
            icon={<LineOutlined />}
            onClick={() => handleToolSelect(LengthTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="角度测量">
          <Button
            type={activeTool === AngleTool.toolName ? 'primary' : 'default'}
            icon={<RadiusSettingOutlined />}
            onClick={() => handleToolSelect(AngleTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="矩形ROI">
          <Button
            type={activeTool === RectangleROITool.toolName ? 'primary' : 'default'}
            icon={<BorderOutlined />}
            onClick={() => handleToolSelect(RectangleROITool.toolName)}
          />
        </Tooltip>
        <Tooltip title="圆形ROI">
          <Button
            type={activeTool === CircleROITool.toolName ? 'primary' : 'default'}
            icon={<RadiusSettingOutlined />}
            onClick={() => handleToolSelect(CircleROITool.toolName)}
          />
        </Tooltip>
        <Tooltip title="双向测量">
          <Button
            type={activeTool === BidirectionalTool.toolName ? 'primary' : 'default'}
            icon={<ColumnHeightOutlined />}
            onClick={() => handleToolSelect(BidirectionalTool.toolName)}
          />
        </Tooltip>
        <Tooltip title="像素探针">
          <Button
            type={activeTool === ProbeTool.toolName ? 'primary' : 'default'}
            icon={<AimOutlined />}
            onClick={() => handleToolSelect(ProbeTool.toolName)}
          />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* 序列播放控制组 */}
      <Space size="small">
        <Tooltip title="上一帧">
          <Button icon={<StepBackwardOutlined />} onClick={onPrevFrame} />
        </Tooltip>
        <Tooltip title={isPlaying ? '暂停' : '播放'}>
          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={isPlaying ? onStop : onPlay}
          />
        </Tooltip>
        <Tooltip title="下一帧">
          <Button icon={<StepForwardOutlined />} onClick={onNextFrame} />
        </Tooltip>
        {totalImages > 0 && (
          <span className={styles.frameInfo}>
            {currentImageIndex + 1} / {totalImages}
          </span>
        )}
      </Space>

      <Divider type="vertical" />

      {/* 窗宽窗位控制 */}
      <Popover
        content={windowControlContent}
        title="窗宽窗位设置"
        trigger="click"
        open={showWindowControl}
        onOpenChange={setShowWindowControl}
        placement="bottom"
      >
        <Tooltip title="窗宽窗位设置">
          <Button icon={<SettingOutlined />} />
        </Tooltip>
      </Popover>

      <Divider type="vertical" />

      {/* 其他功能组 */}
      <Space size="small">
        <Tooltip title="图像信息">
          <Button icon={<InfoCircleOutlined />} onClick={onShowInfo} />
        </Tooltip>
        <Tooltip title="设置">
          <Button icon={<SettingOutlined />} onClick={onShowSettings} />
        </Tooltip>
      </Space>
    </div>
  );
};

export default DicomToolbar;
