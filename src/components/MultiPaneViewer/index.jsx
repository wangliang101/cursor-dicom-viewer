import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from 'antd';
import ViewportPane from './ViewportPane';
import { LAYOUT_CONFIGS, DEFAULT_LAYOUT, VIEW_TYPES, MULTI_VIEW_LAYOUTS } from '../../constants';
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
      multiViewLayout = null,
    },
    ref
  ) => {
    const [currentLayout, setCurrentLayout] = useState(layout);
    const [activePane, setActivePane] = useState(0);
    const [paneImages, setPaneImages] = useState({});
    const [paneViewTypes, setPaneViewTypes] = useState({});
    const viewportRefs = useRef({});

    // 获取视图类型分配函数
    const getViewTypesForLayout = (layoutKey, multiViewLayoutKey) => {
      const config = LAYOUT_CONFIGS[layoutKey];
      if (!config) return {};

      const viewTypes = {};

      // 如果指定了多视图布局，检查兼容性并使用特定的视图分配
      if (multiViewLayoutKey && MULTI_VIEW_LAYOUTS[multiViewLayoutKey]) {
        const multiViewConfig = MULTI_VIEW_LAYOUTS[multiViewLayoutKey];

        // 检查视图数量是否超过窗格数量
        if (multiViewConfig.views.length > config.panes.length) {
          console.warn(
            `多视图布局 "${multiViewConfig.name}" 需要 ${multiViewConfig.views.length} 个窗格，` +
              `但当前布局 "${config.name}" 只有 ${config.panes.length} 个窗格。回退到默认单一视图。`
          );
          // 回退到默认的轴位视图
          config.panes.forEach((pane, index) => {
            viewTypes[index] = VIEW_TYPES.AXIAL;
          });
        } else {
          config.panes.forEach((pane, index) => {
            viewTypes[index] = multiViewConfig.views[index] || VIEW_TYPES.AXIAL;
          });
        }
      } else {
        // 默认情况下所有窗格都是轴位视图
        config.panes.forEach((pane, index) => {
          viewTypes[index] = VIEW_TYPES.AXIAL;
        });
      }

      return viewTypes;
    };

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
      const newPaneViewTypes = getViewTypesForLayout(currentLayout, multiViewLayout);

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
      setPaneViewTypes(newPaneViewTypes);

      // 重置活动窗格为第一个窗格，确保多窗格切换时状态正确
      setActivePane(0);

      // 清理旧的viewport引用，强制重新创建
      viewportRefs.current = {};

      // 延迟触发布局变化通知，确保DOM更新完成
      const timeoutId = setTimeout(() => {
        console.log(`Layout switched to: ${currentLayout} with ${config.panes.length} panes`);
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [currentLayout, images, currentImageIndex, multiViewLayout]);

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
                  viewType={paneViewTypes[index]}
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
