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
    const imageLoadedRef = useRef(false);

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

    // 图像加载函数 - 必须在initializeViewport之前定义
    const loadImageForViewport = useCallback(
      async (imageList, imgIndex) => {
        if (
          !viewportRef.current ||
          !imageList ||
          imageList.length === 0 ||
          imageLoadedRef.current
        ) {
          return;
        }

        try {
          setIsLoading(true);
          imageLoadedRef.current = true;

          console.log(`更新视口 ${viewportId} 的图像，索引: ${imgIndex}`);

          // 使用多视口服务加载图像堆栈
          await multiViewportService.loadImageStack(viewportId, imageList, imgIndex || 0);

          console.log(`视口 ${viewportId} 图像更新完成`);
        } catch (error) {
          console.error(`视口 ${viewportId} 图像更新失败:`, error);
          setError(error.message);
          imageLoadedRef.current = false;
        } finally {
          setIsLoading(false);
        }
      },
      [viewportId, multiViewportService]
    );

    // 初始化视口函数 - 在loadImageForViewport之后定义
    const initializeViewport = useCallback(async () => {
      if (isInitializingRef.current || !containerRef.current) return;

      try {
        isInitializingRef.current = true;
        setIsLoading(true);
        setError(null);
        imageLoadedRef.current = false;

        console.log(`正在初始化 ${viewType} 视口，窗格 ${paneIndex}`);

        // 确保多视口服务已初始化
        await multiViewportService.initialize();

        console.log(`DOM 元素已准备好，容器:`, containerRef.current);

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
        if (onViewportRef) {
          onViewportRef(viewport);
        }
        setIsInitialized(true);

        console.log(`视口 ${viewportId} 初始化完成`);

        // 如果有图像数据，立即加载
        if (images && images.length > 0 && !imageLoadedRef.current) {
          await loadImageForViewport(images, imageIndex || 0);
        }
      } catch (error) {
        console.error(`视口 ${viewportId} 初始化失败:`, error);
        setError(error.message);
      } finally {
        setIsLoading(false);
        isInitializingRef.current = false;
      }
    }, [
      viewportId,
      paneIndex,
      viewType,
      multiViewportService,
      onViewportRef,
      images,
      imageIndex,
      loadImageForViewport,
    ]);

    // 容器 ref 回调函数，当元素挂载时自动初始化
    const containerRefCallback = useCallback(
      (element) => {
        containerRef.current = element;

        if (element && !isInitializingRef.current) {
          // 元素已挂载，延迟初始化以避免React严格模式的双重调用
          setTimeout(() => {
            if (containerRef.current === element && !isInitializingRef.current) {
              console.log(`容器元素已挂载，开始初始化视口 ${viewportId}`);
              initializeViewport();
            }
          }, 10); // 短暂延迟
        }
      },
      [viewportId, initializeViewport]
    ); // 现在initializeViewport已经定义，可以安全引用

    // 当图像数据改变时更新显示
    useEffect(() => {
      if (!isInitialized) return;

      // 重置图像加载状态，允许重新加载
      imageLoadedRef.current = false;

      if (images && images.length > 0) {
        loadImageForViewport(images, imageIndex || 0);
      }
    }, [images, imageIndex, isInitialized]);

    // 处理点击事件
    const handleClick = useCallback(
      (e) => {
        e.stopPropagation();

        // 只在窗格已初始化时才设置为活动窗格
        if (isInitialized) {
          onClick?.(paneIndex);

          // 设置为活动视口
          if (viewportRef.current) {
            multiViewportService.setActiveViewport(viewportId);
          }
        } else {
          // 未初始化的窗格被点击时，仍然可以设置为活动窗格，但不执行视口操作
          console.log(`窗格 ${paneIndex + 1} 尚未初始化，仅设置为活动窗格`);
          onClick?.(paneIndex);
        }
      },
      [onClick, paneIndex, isInitialized, viewportRef, multiViewportService, viewportId]
    );

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
            <div className={styles.placeholderSubtext}>正在加载...</div>
          )}
        </div>
      </div>
    );

    // 清理效果
    useEffect(() => {
      return () => {
        // cleanup函数
        if (viewportRef.current) {
          multiViewportService.disableViewport(viewportId).catch(console.warn);
          viewportRef.current = null;
        }
        if (onViewportRef) {
          onViewportRef(null);
        }
        isInitializingRef.current = false;
        imageLoadedRef.current = false;
      };
    }, [viewportId]); // 只依赖viewportId

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
        <div ref={containerRefCallback} className={styles.viewportContainer}>
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
