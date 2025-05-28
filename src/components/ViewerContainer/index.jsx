import { forwardRef } from 'react';
import { Card } from 'antd';
import MultiPaneViewer from '../MultiPaneViewer';
import { DEFAULT_LAYOUT } from '../../constants';
import styles from './index.module.less';

const ViewerContainer = forwardRef(
  (
    { images, currentImageIndex, currentLayout = DEFAULT_LAYOUT, onLayoutChange, multiViewLayout },
    ref
  ) => {
    console.log('ViewerContainer 渲染 - 当前布局:', currentLayout);

    // 如果不是单窗格布局，使用MultiPaneViewer
    if (currentLayout !== '1x1') {
      return (
        <div className={styles.viewerWrapper}>
          <MultiPaneViewer
            images={images}
            currentImageIndex={currentImageIndex}
            layout={currentLayout}
            onLayoutChange={onLayoutChange}
            multiViewLayout={multiViewLayout}
          />
        </div>
      );
    }

    // 单窗格布局使用原有的简单显示
    return (
      <div className={styles.viewerWrapper}>
        <Card className={styles.viewerCard} styles={{ body: { padding: 0 } }}>
          <div ref={ref} className={styles.viewerContainer}>
            {images.length === 0 ? (
              <div className={styles.placeholder}>
                <div className={styles.placeholderContent}>
                  <div className={styles.placeholderIcon}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect width="64" height="64" rx="12" fill="#f1f4f6" />
                      <path
                        d="M20 32h24M32 20v24"
                        stroke="#6b7c93"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="12"
                        stroke="#6b7c93"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <h3 className={styles.placeholderTitle}>DICOM 影像查看器</h3>
                  <p className={styles.placeholderDescription}>
                    请从左侧序列区上传 DICOM 文件开始使用
                  </p>
                  <div className={styles.placeholderFeatures}>
                    <div className={styles.feature}>
                      <span className={styles.featureDot}></span>
                      支持标准 DICOM 格式
                    </div>
                    <div className={styles.feature}>
                      <span className={styles.featureDot}></span>
                      多种影像操作工具
                    </div>
                    <div className={styles.feature}>
                      <span className={styles.featureDot}></span>
                      序列播放功能
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {/* 当有图像时，Cornerstone的canvas会自动渲染到这个div中 */}
          </div>

          {images.length > 0 && (
            <div className={styles.imageInfo}>
              <div className={styles.imageStatus}>
                <span className={styles.statusDot}></span>
                当前图像: {currentImageIndex + 1} / {images.length}
                <span className={styles.layoutIndicator}>| 布局: {currentLayout}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }
);

ViewerContainer.displayName = 'ViewerContainer';

export default ViewerContainer;
