import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from 'antd';
import ViewportPane from './ViewportPane';
import { LAYOUT_CONFIGS, DEFAULT_LAYOUT, VIEW_TYPES, MULTI_VIEW_LAYOUTS } from '../../constants';
import { getMultiViewportService } from '../../services/MultiViewportService';
import styles from './index.module.less';

const MultiPaneViewer = forwardRef(
  (
    {
      images = [],
      currentImageIndex = 0,
      layout = DEFAULT_LAYOUT,
      onLayoutChange,
      multiViewLayout = null,
      renderingEngineId = 'multiViewRenderingEngine',
    },
    ref
  ) => {
    const [currentLayout, setCurrentLayout] = useState(layout);
    const [activePane, setActivePane] = useState(0);
    const [paneImages, setPaneImages] = useState({});
    const [paneViewTypes, setPaneViewTypes] = useState({});
    const [isInitializing, setIsInitializing] = useState(false);
    const viewportRefs = useRef({});
    const multiViewportService = getMultiViewportService(renderingEngineId);

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
        getActiveViewport: () => {
          const activeViewportId = `viewport_pane_${activePane}_${paneViewTypes[activePane]}`;
          return multiViewportService.getViewport(activeViewportId);
        },
        getAllViewports: () => multiViewportService.getAllViewports(),
        setLayout: (newLayout) => {
          setCurrentLayout(newLayout);
          onLayoutChange?.(newLayout);
        },
        setActivePane: (paneIndex) => setActivePane(paneIndex),
        getActivePane: () => activePane,
        resetAllViewports: () => {
          multiViewportService.resetAllCameras();
        },
        // 新增方法
        loadImages: async (imageIds, imageIndex = 0) => {
          await multiViewportService.loadImageStackToAllViewports(imageIds, imageIndex);
        },
        createToolGroup: async (viewportIds) => {
          await multiViewportService.createToolGroup(viewportIds, 'multiViewToolGroup', false);
        },
      }),
      [activePane, onLayoutChange, paneViewTypes, multiViewportService]
    );

    // 当布局改变时，重新分配图像和配置视口
    useEffect(() => {
      const setupLayout = async () => {
        setIsInitializing(true);

        try {
          const config = LAYOUT_CONFIGS[currentLayout];
          if (!config) return;

          const newPaneImages = {};
          const newPaneViewTypes = getViewTypesForLayout(currentLayout, multiViewLayout);

          config.panes.forEach((pane, index) => {
            // 为每个窗格分配图像
            if (images.length > 0) {
              // 确保第一个窗格优先显示当前图像
              if (index === 0) {
                newPaneImages[index] = {
                  imageIndex: currentImageIndex < images.length ? currentImageIndex : 0,
                };
              } else {
                // 其他窗格也显示同一图像，后续可以扩展为不同图像
                newPaneImages[index] = {
                  imageIndex: currentImageIndex < images.length ? currentImageIndex : 0,
                };
              }
            }
          });

          setPaneImages(newPaneImages);
          setPaneViewTypes(newPaneViewTypes);

          // 重置活动窗格为第一个窗格
          setActivePane(0);

          // 清理旧的viewport引用
          viewportRefs.current = {};

          console.log(`多视口布局切换到: ${currentLayout}，包含 ${config.panes.length} 个窗格`);
          console.log('窗格图像分配:', newPaneImages);
        } catch (error) {
          console.error('设置布局失败:', error);
        } finally {
          setIsInitializing(false);
        }
      };

      setupLayout();
    }, [currentLayout, images, currentImageIndex, multiViewLayout]);

    // 监听layout prop的变化
    useEffect(() => {
      if (layout !== currentLayout) {
        setCurrentLayout(layout);
      }
    }, [layout, currentLayout]);

    // 当所有视口初始化完成后，创建工具组
    useEffect(() => {
      if (!isInitializing && Object.keys(paneViewTypes).length > 0) {
        // 延迟初始化工具组，确保所有视口都已创建
        const timer = setTimeout(async () => {
          try {
            const config = LAYOUT_CONFIGS[currentLayout];
            if (!config) return;

            // 为所有窗格创建视口ID列表
            const viewportIds = config.panes.map((pane, index) => {
              const viewType = paneViewTypes[index] || VIEW_TYPES.AXIAL;
              return `viewport_pane_${index}_${viewType}`;
            });

            // 创建工具组
            await multiViewportService.createToolGroup(viewportIds, 'multiViewToolGroup', false);
            console.log('多视口工具组创建完成');
          } catch (error) {
            console.error('创建工具组失败:', error);
          }
        }, 1000); // 增加延迟时间确保所有视口初始化完成

        return () => clearTimeout(timer);
      }
    }, [isInitializing, paneViewTypes, currentLayout, multiViewportService]);

    // 处理窗格点击，设置为活动窗格
    const handlePaneClick = (paneIndex) => {
      console.log(`窗格点击: ${paneIndex + 1}`);
      setActivePane(paneIndex);
    };

    // 处理窗格的viewport引用
    const handleViewportRef = (paneIndex, viewport) => {
      if (viewport) {
        viewportRefs.current[paneIndex] = viewport;
        console.log(`窗格 ${paneIndex + 1} 视口引用已设置`);
      } else {
        delete viewportRefs.current[paneIndex];
        console.log(`窗格 ${paneIndex + 1} 视口引用已清理`);
      }
    };

    const config = LAYOUT_CONFIGS[currentLayout];
    if (!config) {
      console.warn(`未知布局: ${currentLayout}`);
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
                  key={`${currentLayout}-${index}-${Date.now()}`} // 添加时间戳确保完全重新渲染
                  paneIndex={index}
                  isActive={activePane === index}
                  onClick={() => handlePaneClick(index)}
                  onViewportRef={(viewport) => handleViewportRef(index, viewport)}
                  imageIndex={paneImages[index]?.imageIndex}
                  images={images}
                  style={paneStyle}
                  viewType={paneViewTypes[index]}
                  renderingEngineId={renderingEngineId}
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
              <span className={styles.activePane}>| 活动窗格: {activePane + 1}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }
);

MultiPaneViewer.displayName = 'MultiPaneViewer';

export default MultiPaneViewer;
