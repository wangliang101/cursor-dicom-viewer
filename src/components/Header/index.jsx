import { Typography } from 'antd';
import DicomToolbar from '../DicomToolbar';
import styles from './index.module.less';

const { Title } = Typography;

const Header = ({
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
  currentLayout,
  onLayoutChange,
  framesPerSecond,
  onFpsChange,
  multiViewLayout,
  onMultiViewLayoutChange,
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2e7d8a" />
                <path d="M8 16h16M16 8v16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="16" r="6" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <Title level={3} className={styles.title}>
              医学影像查看器
            </Title>
          </div>
        </div>

        <div className={styles.toolbarSection}>
          <DicomToolbar
            className="header-toolbar"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              boxShadow: 'none',
              borderBottom: 'none',
            }}
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
            onLayoutChange={onLayoutChange}
            framesPerSecond={framesPerSecond}
            onFpsChange={onFpsChange}
            currentMultiViewLayout={multiViewLayout}
            onMultiViewLayoutChange={onMultiViewLayoutChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
