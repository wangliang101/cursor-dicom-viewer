import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from 'antd';
import ViewportPane from './ViewportPane';
import { LAYOUT_CONFIGS, DEFAULT_LAYOUT } from '../../constants';
import styles from './index.module.less';

const MultiPaneViewer = forwardRef(
  (
    {
      images = [],
      currentImageIndex = 0,
      layout = DEFAULT_LAYOUT,
      onLayoutChange,
      toolGroupRef,
      activeTool,
      onToolChange,
    },
    ref
  ) => {
    const [currentLayout, setCurrentLayout] = useState(layout);
    const [activePane, setActivePane] = useState(0);
    const [paneImages, setPaneImages] = useState({});
    const viewportRefs = useRef({});

    // 暴露给父组件的方法
    useImperativeHandle(
      ref,
      () => ({
        getActiveViewport: () => viewportRefs.current[activePane],
        getAllViewports: () => viewportRefs.current,
        setLayout: (newLayout) => {
          setCurrentLayout(newLayout);
          onLayoutChange?.(newLayout);
        },
        setActivePane: (paneIndex) => setActivePane(paneIndex),
        getActivePane: () => activePane,
        resetAllViewports: () => {
          Object.values(viewportRefs.current).forEach((viewport) => {
            if (viewport?.resetCamera) {
              viewport.resetCamera();
              viewport.render();
            }
          });
        },
      }),
      [activePane, onLayoutChange]
    );

    // 当布局改变时，重新分配图像
    useEffect(() => {
      const config = LAYOUT_CONFIGS[currentLayout];
      if (!config) return;

      const newPaneImages = {};
      config.panes.forEach((pane, index) => {
        // 为每个窗格分配图像，可以是同一图像或不同图像
        if (images.length > 0) {
          // 默认情况下，所有窗格显示当前选中的图像
          // 后续可以扩展为每个窗格显示不同的图像
          newPaneImages[index] = {
            imageData: images[currentImageIndex] || images[0],
            imageIndex: currentImageIndex < images.length ? currentImageIndex : 0,
          };
        }
      });

      setPaneImages(newPaneImages);

      // 重置活动窗格为第一个窗格，确保多窗格切换时状态正确
      setActivePane(0);

      // 清理旧的viewport引用，强制重新创建
      viewportRefs.current = {};

      // 延迟触发布局变化通知，确保DOM更新完成
      const timeoutId = setTimeout(() => {
        console.log(`Layout switched to: ${currentLayout} with ${config.panes.length} panes`);
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [currentLayout, images, currentImageIndex]);

    // 监听layout prop的变化，确保外部布局变化能正确同步
    useEffect(() => {
      if (layout !== currentLayout) {
        setCurrentLayout(layout);
      }
    }, [layout, currentLayout]);

    // 处理窗格点击，设置为活动窗格
    const handlePaneClick = (paneIndex) => {
      setActivePane(paneIndex);
    };

    // 处理窗格的viewport引用
    const handleViewportRef = (paneIndex, viewport) => {
      if (viewport) {
        viewportRefs.current[paneIndex] = viewport;
      } else {
        delete viewportRefs.current[paneIndex];
      }
    };

    const config = LAYOUT_CONFIGS[currentLayout];
    if (!config) {
      console.warn(`Unknown layout: ${currentLayout}`);
      return null;
    }

    // 生成CSS Grid样式
    const gridStyle = {
      display: 'grid',
      gridTemplateRows: `repeat(${config.rows}, 1fr)`,
      gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
      gap: '2px',
      height: '100%',
      width: '100%',
    };

    return (
      <div className={styles.multiPaneViewer}>
        <Card className={styles.viewerCard} styles={{ body: { padding: 0 } }}>
          <div className={styles.viewerContainer} style={gridStyle}>
            {config.panes.map((pane, index) => {
              const paneStyle = {
                gridRow: `${pane.row + 1} / span ${pane.rowSpan}`,
                gridColumn: `${pane.col + 1} / span ${pane.colSpan}`,
              };

              return (
                <ViewportPane
                  key={`${currentLayout}-${index}`}
                  paneIndex={index}
                  isActive={activePane === index}
                  onClick={() => handlePaneClick(index)}
                  onViewportRef={(viewport) => handleViewportRef(index, viewport)}
                  imageData={paneImages[index]?.imageData}
                  imageIndex={paneImages[index]?.imageIndex}
                  images={images}
                  style={paneStyle}
                  toolGroupRef={toolGroupRef}
                  activeTool={activeTool}
                  onToolChange={onToolChange}
                />
              );
            })}
          </div>

          {/* 显示当前布局信息 */}
          <div className={styles.layoutInfo}>
            <div className={styles.layoutStatus}>
              <span className={styles.statusDot}></span>
              {config.name}
              {images.length > 0 && (
                <span>
                  {' '}
                  | {currentImageIndex + 1} / {images.length}
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

MultiPaneViewer.displayName = 'MultiPaneViewer';

export default MultiPaneViewer;
