import { useState } from 'react';
import Header from '../Header';
import SeriesPanel from '../SeriesPanel';
import ViewerContainer from '../ViewerContainer';
import ControlPanel from '../ControlPanel';
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

  // SeriesPanel props
  images,
  onImageSelect,
  onUpload,
  framesPerSecond,
  onFpsChange,
  onShowTags,
}) => {
  const [isSeriesPanelCollapsed, setIsSeriesPanelCollapsed] = useState(false);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(true); // 默认隐藏

  const handleSeriesPanelToggle = () => {
    setIsSeriesPanelCollapsed(!isSeriesPanelCollapsed);
  };

  const handleControlPanelToggle = () => {
    setIsControlPanelCollapsed(!isControlPanelCollapsed);
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

        {/* 中央查看器 */}
        <ViewerContainer ref={viewportRef} images={images} currentImageIndex={currentImageIndex} />

        {/* 右侧操控区 */}
        <ControlPanel isCollapsed={isControlPanelCollapsed} onToggle={handleControlPanelToggle} />
      </div>
    </div>
  );
};

export default MainLayout;
