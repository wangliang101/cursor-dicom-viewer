import { useState, useEffect, useRef } from 'react';
import Header from '../Header';
import SeriesPanel from '../SeriesPanel';
import MultiPaneViewer from '../MultiPaneViewer';
import ControlPanel from '../ControlPanel';
import { DEFAULT_LAYOUT } from '../../constants';
import styles from './index.module.less';

const MultiPaneLayout = ({
  // Header props
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
  onShowSettings,

  // SeriesPanel props
  images,
  onImageSelect,
  onUpload,
  framesPerSecond,
  onFpsChange,
  onShowTags,
}) => {
  const [isSeriesPanelCollapsed, setIsSeriesPanelCollapsed] = useState(false);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(true);
  const [currentLayout, setCurrentLayout] = useState(DEFAULT_LAYOUT);
  const multiPaneViewerRef = useRef(null);

  // 响应式状态管理
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth <= 768;

      if (isMobileScreen) {
        if (!images || images.length === 0) {
          setIsSeriesPanelCollapsed(true);
        }
        setIsControlPanelCollapsed(true);
      } else {
        setIsSeriesPanelCollapsed(false);
        setIsControlPanelCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [images]);

  const handleSeriesPanelToggle = () => {
    setIsSeriesPanelCollapsed(!isSeriesPanelCollapsed);
  };

  const handleControlPanelToggle = () => {
    setIsControlPanelCollapsed(!isControlPanelCollapsed);
  };

  const handleLayoutChange = (newLayout) => {
    setCurrentLayout(newLayout);
    console.log('布局已切换到:', newLayout);
  };

  // 暂时注释掉未使用的函数
  // const handleViewportRef = (viewport) => {
  //   if (viewportRef && typeof viewportRef === 'function') {
  //     viewportRef(viewport);
  //   } else if (viewportRef && typeof viewportRef === 'object') {
  //     viewportRef.current = viewport;
  //   }
  // };

  return (
    <div className={styles.multiPaneLayout}>
      {/* 顶部Header */}
      <Header
        toolGroupRef={toolGroupRef}
        activeTool={activeTool}
        onToolChange={onToolChange}
        viewportRef={viewportRef}
        onReset={onReset}
        onFlipH={onFlipH}
        onFlipV={onFlipV}
        onRotate={onRotate}
        onInvert={onInvert}
        onPlay={onPlay}
        onStop={onStop}
        onNextFrame={onNextFrame}
        onPrevFrame={onPrevFrame}
        isPlaying={isPlaying}
        currentImageIndex={currentImageIndex}
        totalImages={totalImages}
        onShowSettings={onShowSettings}
        currentLayout={currentLayout}
        onLayoutChange={handleLayoutChange}
      />

      {/* 主体内容区域 */}
      <div className={styles.contentArea}>
        {/* 左侧序列区 */}
        <SeriesPanel
          isCollapsed={isSeriesPanelCollapsed}
          onToggle={handleSeriesPanelToggle}
          images={images}
          currentImageIndex={currentImageIndex}
          onImageSelect={onImageSelect}
          onUpload={onUpload}
          framesPerSecond={framesPerSecond}
          onFpsChange={onFpsChange}
          isPlaying={isPlaying}
          onPlay={onPlay}
          onStop={onStop}
          onShowTags={onShowTags}
        />

        {/* 中央多窗格查看器 */}
        <MultiPaneViewer
          ref={multiPaneViewerRef}
          images={images}
          currentImageIndex={currentImageIndex}
          layout={currentLayout}
          onLayoutChange={handleLayoutChange}
          toolGroupRef={toolGroupRef}
          activeTool={activeTool}
          onToolChange={onToolChange}
        />

        {/* 右侧操控区 */}
        <ControlPanel isCollapsed={isControlPanelCollapsed} onToggle={handleControlPanelToggle} />
      </div>
    </div>
  );
};

export default MultiPaneLayout;
