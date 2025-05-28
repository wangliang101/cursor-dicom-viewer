import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Spin, Tag } from 'antd';
import { VIEW_TYPES, VIEW_CONFIGS } from '../../constants';
import styles from './ViewportPane.module.less';

const ViewportPane = forwardRef(
  (
    {
      paneIndex,
      isActive,
      onClick,
      onViewportRef,
      imageData,
      imageIndex,
      images,
      style,
      viewType = VIEW_TYPES.AXIAL,
      // 暂时注释掉未使用的props
      // toolGroupRef,
      // activeTool,
      // onToolChange
    },
    ref
  ) => {
    const viewportRef = useRef(null);
    const containerRef = useRef(null);
    const isInitialized = useRef(false);

    // 获取视图配置
    const viewConfig = VIEW_CONFIGS[viewType] || VIEW_CONFIGS[VIEW_TYPES.AXIAL];

    // 暴露viewport引用给父组件
    useImperativeHandle(ref, () => viewportRef.current, []);

    // 初始化viewport
    useEffect(() => {
      if (!containerRef.current || isInitialized.current) return;

      const initializeViewport = async () => {
        try {
          // 这里应该初始化Cornerstone viewport
          // 由于需要与现有的Cornerstone集成，这里提供基本结构
          console.log(`Initializing ${viewType} viewport for pane ${paneIndex}`);

          // 模拟viewport对象 - 根据视图类型进行不同的初始化
          const mockViewport = {
            element: containerRef.current,
            paneIndex,
            viewType,
            orientation: viewConfig.orientation,
            render: () => console.log(`Rendering ${viewType} pane ${paneIndex}`),
            resetCamera: () => console.log(`Reset camera for ${viewType} pane ${paneIndex}`),
            setCamera: (camera) =>
              console.log(`Set camera for ${viewType} pane ${paneIndex}`, camera),
            getCamera: () => ({ zoom: 1.0, pan: { x: 0, y: 0 } }),
            setProperties: (props) =>
              console.log(`Set properties for ${viewType} pane ${paneIndex}`, props),
            // 不同视图类型的特殊方法
            ...(viewType === VIEW_TYPES.VR && {
              setVolumeRenderingProperties: (props) =>
                console.log(`Set VR properties for pane ${paneIndex}`, props),
              setTransferFunction: (tf) =>
                console.log(`Set transfer function for pane ${paneIndex}`, tf),
            }),
            ...(viewType === VIEW_TYPES.MPR && {
              setSliceOrientation: (orientation) =>
                console.log(`Set MPR orientation for pane ${paneIndex}`, orientation),
              setSlicePosition: (position) =>
                console.log(`Set MPR position for pane ${paneIndex}`, position),
            }),
          };

          viewportRef.current = mockViewport;
          onViewportRef?.(mockViewport);
          isInitialized.current = true;
        } catch (error) {
          console.error(`Failed to initialize ${viewType} viewport for pane ${paneIndex}:`, error);
        }
      };

      initializeViewport();

      return () => {
        // 清理viewport
        if (viewportRef.current) {
          onViewportRef?.(null);
          viewportRef.current = null;
          isInitialized.current = false;
        }
      };
    }, [paneIndex, onViewportRef, viewType, viewConfig]);

    // 当图像数据改变时更新显示
    useEffect(() => {
      if (!viewportRef.current || !imageData) return;

      const updateImage = async () => {
        try {
          console.log(`Updating image for pane ${paneIndex}`, imageData);
          // 这里应该加载和显示DICOM图像
          // 与现有的图像加载逻辑集成

          if (viewportRef.current.render) {
            viewportRef.current.render();
          }
        } catch (error) {
          console.error(`Failed to update image for pane ${paneIndex}:`, error);
        }
      };

      updateImage();
    }, [imageData, paneIndex]);

    // 处理点击事件
    const handleClick = (e) => {
      e.stopPropagation();
      onClick?.(paneIndex);
    };

    // 渲染占位符内容
    const renderPlaceholder = () => (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.placeholderIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#f1f4f6" />
              <path
                d="M16 24h16M24 16v16"
                stroke="#6b7c93"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="24" cy="24" r="8" stroke="#6b7c93" strokeWidth="1" fill="none" />
            </svg>
          </div>
          <div className={styles.placeholderText}>窗格 {paneIndex + 1}</div>
          {!imageData && <div className={styles.placeholderSubtext}>暂无图像</div>}
        </div>
      </div>
    );

    return (
      <div
        className={`${styles.viewportPane} ${isActive ? styles.active : ''}`}
        style={style}
        onClick={handleClick}
      >
        {/* 窗格标识 */}
        <div className={styles.paneHeader}>
          <div className={styles.paneIndex}>{paneIndex + 1}</div>
          <Tag color={viewConfig.color} className={styles.viewTypeTag}>
            {viewConfig.name}
          </Tag>
        </div>

        {/* 图像显示区域 */}
        <div className={styles.imageContainer}>
          <div ref={containerRef} className={styles.viewport}>
            {!imageData ? (
              renderPlaceholder()
            ) : (
              <div className={styles.imageWrapper}>
                {/* 这里将显示实际的DICOM图像 */}
                <div className={styles.loadingOverlay}>
                  <Spin size="small" />
                  <span>加载中...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 窗格信息 */}
        {imageData && (
          <div className={styles.paneInfo}>
            <div className={styles.imageInfo}>
              图像 {(imageIndex || 0) + 1} / {images?.length || 0}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ViewportPane.displayName = 'ViewportPane';

export default ViewportPane;
