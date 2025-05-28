import { useState, useEffect } from 'react';
import Header from '../Header';
import SeriesPanel from '../SeriesPanel';
import ViewerContainer from '../ViewerContainer';
import ControlPanel from '../ControlPanel';
import { DEFAULT_LAYOUT } from '../../constants';
import styles from './index.module.less';

const MainLayout = ({
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
  multiViewLayout,
  onMultiViewLayoutChange,
  currentLayout = DEFAULT_LAYOUT,
  onLayoutChange,

  // SeriesPanel props
  images,
  onImageSelect,
  onUpload,
  framesPerSecond,
  onFpsChange,
  onShowTags,
  onDeleteCurrent,
  onDeleteByIndex,
  onClearAll,
}) => {
  const [isSeriesPanelCollapsed, setIsSeriesPanelCollapsed] = useState(false);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(true); // 默认隐藏

  // 响应式状态管理
  useEffect(() => {
    const handleResize = () => {
      const isMobileScreen = window.innerWidth <= 768;

      // 在移动端，默认折叠两个面板以节省空间
      if (isMobileScreen) {
        // 如果之前没有图片，在小屏幕上默认折叠序列区
        if (!images || images.length === 0) {
          setIsSeriesPanelCollapsed(true);
        }
        // 控制区在小屏幕上默认保持折叠
        setIsControlPanelCollapsed(true);
      } else {
        // 桌面端恢复正常状态
        setIsSeriesPanelCollapsed(false);
        setIsControlPanelCollapsed(true);
      }
    };

    // 初始化检查
    handleResize();

    // 添加窗口尺寸变化监听
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
    console.log('MainLayout 布局变化:', newLayout);
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  return (
    <div className={styles.mainLayout}>
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
        framesPerSecond={framesPerSecond}
        onFpsChange={onFpsChange}
        multiViewLayout={multiViewLayout}
        onMultiViewLayoutChange={onMultiViewLayoutChange}
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
          onDeleteCurrent={onDeleteCurrent}
          onDeleteByIndex={onDeleteByIndex}
          onClearAll={onClearAll}
        />

        {/* 中央查看器 */}
        <ViewerContainer
          ref={viewportRef}
          images={images}
          currentImageIndex={currentImageIndex}
          currentLayout={currentLayout}
          onLayoutChange={handleLayoutChange}
          multiViewLayout={multiViewLayout}
        />

        {/* 右侧操控区 */}
        <ControlPanel isCollapsed={isControlPanelCollapsed} onToggle={handleControlPanelToggle} />
      </div>
    </div>
  );
};

export default MainLayout;
