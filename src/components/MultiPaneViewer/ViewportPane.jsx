import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { Spin, Tag } from 'antd';
import { VIEW_TYPES, VIEW_CONFIGS } from '../../constants';
import { getMultiViewportService } from '../../services/MultiViewportService';
import styles from './ViewportPane.module.less';

const ViewportPane = forwardRef(
  (
    {
      paneIndex,
      isActive,
      onClick,
      onViewportRef,
      imageIndex,
      images,
      style,
      viewType = VIEW_TYPES.AXIAL,
      renderingEngineId = 'multiViewRenderingEngine',
    },
    ref
  ) => {
    const viewportRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState(null);
    const isInitializingRef = useRef(false);

    // 获取多视口服务实例（稳定化）
    const multiViewportService = useMemo(() => {
      return getMultiViewportService(renderingEngineId);
    }, [renderingEngineId]);

    // 生成唯一的视口ID（稳定化）
    const viewportId = useMemo(() => {
      return `viewport_pane_${paneIndex}_${viewType}`;
    }, [paneIndex, viewType]);

    // 使用useMemo缓存视图配置
    const viewConfig = useMemo(() => {
      return VIEW_CONFIGS[viewType] || VIEW_CONFIGS[VIEW_TYPES.AXIAL];
    }, [viewType]);

    // 暴露viewport引用给父组件
    useImperativeHandle(ref, () => viewportRef.current, []);

    // 稳定化的viewport引用回调
    const handleViewportRef = useCallback(
      (viewport) => {
        if (onViewportRef) {
          onViewportRef(viewport);
        }
      },
      [onViewportRef]
    );

    // 当视图类型改变时重新初始化
    useEffect(() => {
      if (isInitialized) {
        // 直接调用清理逻辑，而不依赖cleanupViewport函数
        const cleanup = async () => {
          if (viewportRef.current) {
            try {
              await multiViewportService.disableViewport(viewportId);
              handleViewportRef(null);
              viewportRef.current = null;
            } catch (error) {
              console.warn(`清理视口 ${viewportId} 时出错:`, error);
            }
          }
          setIsInitialized(false);
          setError(null);
          isInitializingRef.current = false;
        };
        cleanup();
      }
    }, [viewType, multiViewportService, viewportId, handleViewportRef]);

    // 初始化viewport
    useEffect(() => {
      if (!containerRef.current || isInitialized || isInitializingRef.current) return;

      const initializeViewport = async () => {
        if (isInitializingRef.current) return; // 防止重复初始化

        try {
          isInitializingRef.current = true;
          setIsLoading(true);
          setError(null);
          console.log(`正在初始化 ${viewType} 视口，窗格 ${paneIndex}`);

          // 确保多视口服务已初始化
          await multiViewportService.initialize();

          // 创建视口配置
          const viewportConfig = {
            element: containerRef.current,
            viewportId,
            viewType: viewType === VIEW_TYPES.VR ? 'vr' : 'stack',
            paneIndex,
          };

          // 创建视口
          const viewports = await multiViewportService.setViewports([viewportConfig]);
          const viewport = viewports[viewportId]?.viewport;

          if (!viewport) {
            throw new Error(`无法创建视口 ${viewportId}`);
          }

          viewportRef.current = viewport;
          handleViewportRef(viewport);
          setIsInitialized(true);

          console.log(`视口 ${viewportId} 初始化完成`);
        } catch (error) {
          console.error(`视口 ${viewportId} 初始化失败:`, error);
          setError(error.message);
        } finally {
          setIsLoading(false);
          isInitializingRef.current = false;
        }
      };

      initializeViewport();

      return () => {
        // cleanup函数也要避免循环调用
        if (viewportRef.current) {
          multiViewportService.disableViewport(viewportId).catch(console.warn);
          viewportRef.current = null;
        }
        isInitializingRef.current = false;
      };
    }, [
      paneIndex,
      viewType,
      viewportId,
      multiViewportService,
      handleViewportRef,
      // 移除isInitialized依赖，避免循环
    ]);

    // 当图像数据改变时更新显示
    useEffect(() => {
      if (!viewportRef.current || !images || images.length === 0 || !isInitialized) return;

      const updateImage = async () => {
        try {
          setIsLoading(true);
          console.log(`更新视口 ${viewportId} 的图像，索引: ${imageIndex}`);

          // 使用多视口服务加载图像堆栈
          await multiViewportService.loadImageStack(viewportId, images, imageIndex || 0);

          console.log(`视口 ${viewportId} 图像更新完成`);
        } catch (error) {
          console.error(`视口 ${viewportId} 图像更新失败:`, error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      updateImage();
    }, [images, imageIndex, viewportId, multiViewportService, isInitialized]);

    // 处理点击事件
    const handleClick = (e) => {
      e.stopPropagation();
      onClick?.(paneIndex);

      // 设置为活动视口
      if (viewportRef.current) {
        multiViewportService.setActiveViewport(viewportId);
      }
    };

    // 渲染错误状态
    const renderError = () => (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.placeholderIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="8" fill="#ff4d4f" opacity="0.1" />
              <path d="M24 16v16M24 36h0" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.placeholderText}>初始化失败</div>
          <div className={styles.placeholderSubtext}>{error}</div>
        </div>
      </div>
    );

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
          <div className={styles.placeholderText}>
            {viewConfig.name} - 窗格 {paneIndex + 1}
          </div>
          {!images || images.length === 0 ? (
            <div className={styles.placeholderSubtext}>暂无图像</div>
          ) : (
            <div className={styles.placeholderSubtext}>准备就绪</div>
          )}
        </div>
      </div>
    );

    return (
      <div
        className={`${styles.viewportPane} ${isActive ? styles.active : ''}`}
        style={style}
        onClick={handleClick}
      >
        {/* 视口标签 */}
        <div className={styles.viewportHeader}>
          <Tag color={isActive ? 'blue' : 'default'} className={styles.viewportTag}>
            {viewConfig.name} #{paneIndex + 1}
          </Tag>
          {isLoading && <Spin size="small" />}
        </div>

        {/* 视口容器 */}
        <div ref={containerRef} className={styles.viewportContainer}>
          {error && renderError()}
          {!error && !isInitialized && renderPlaceholder()}
          {/* Cornerstone的canvas会自动渲染到这个div中 */}
        </div>

        {/* 视口信息 */}
        {isInitialized && images && images.length > 0 && (
          <div className={styles.viewportInfo}>
            <span className={styles.imageCounter}>
              {(imageIndex || 0) + 1} / {images.length}
            </span>
          </div>
        )}
      </div>
    );
  }
);

ViewportPane.displayName = 'ViewportPane';

export default ViewportPane;
