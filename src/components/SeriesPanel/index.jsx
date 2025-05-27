import { Button, List, Slider, Card, Divider, Badge, Tooltip } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import styles from './index.module.less';

const SeriesPanel = ({
  isCollapsed,
  onToggle,
  images,
  currentImageIndex,
  onImageSelect,
  onUpload,
  framesPerSecond,
  onFpsChange,
  isPlaying,
  onPlay,
  onStop,
  onShowTags,
}) => {
  return (
    <div className={`${styles.seriesPanel} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <FileImageOutlined className={styles.icon} />
          <span className={styles.title}>影像序列</span>
          <Badge count={images.length} className={styles.badge} />
        </div>
        <Tooltip title={isCollapsed ? '展开面板' : '折叠面板'}>
          <Button
            type="text"
            icon={isCollapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={onToggle}
            className={styles.toggleBtn}
          />
        </Tooltip>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          {/* 图像列表 - 移到上方 */}
          <div className={styles.imageSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>图像列表</span>
              {images.length > 0 && (
                <span className={styles.imageCount}>
                  {currentImageIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {images.length > 0 ? (
              <>
                <List
                  className={styles.imageList}
                  dataSource={images}
                  renderItem={(item, index) => (
                    <List.Item
                      onClick={() => onImageSelect(index)}
                      className={`${styles.imageItem} ${
                        index === currentImageIndex ? styles.selectedImage : ''
                      }`}
                    >
                      <div className={styles.imageItemContent}>
                        <FileImageOutlined className={styles.imageIcon} />
                        <span className={styles.imageName}>图像 {index + 1}</span>
                        <div
                          className={`${styles.currentIndicator} ${
                            index === currentImageIndex ? styles.visible : styles.hidden
                          }`}
                        />
                        {/* 添加查看Tag按钮 */}
                        <Tooltip title="查看 DICOM Tags">
                          <Button
                            type="text"
                            size="small"
                            icon={<TagsOutlined />}
                            className={styles.tagButton}
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡，避免触发图像选择
                              onShowTags && onShowTags(index);
                            }}
                          />
                        </Tooltip>
                      </div>
                    </List.Item>
                  )}
                />

                {/* 播放控制 */}
                {images.length > 1 && (
                  <Card className={styles.playbackCard} bodyStyle={{ padding: '12px' }}>
                    <div className={styles.playbackControls}>
                      <div className={styles.playButton}>
                        <Button
                          type={isPlaying ? 'default' : 'primary'}
                          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                          onClick={isPlaying ? onStop : onPlay}
                          size="small"
                        >
                          {isPlaying ? '暂停' : '播放'}
                        </Button>
                      </div>

                      <div className={styles.fpsControl}>
                        <label className={styles.fpsLabel}>帧率: {framesPerSecond} fps</label>
                        <Slider
                          min={1}
                          max={60}
                          value={framesPerSecond}
                          onChange={onFpsChange}
                          disabled={isPlaying}
                          className={styles.fpsSlider}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <FileImageOutlined className={styles.emptyIcon} />
                <p className={styles.emptyText}>暂无影像文件</p>
                <p className={styles.emptySubText}>请上传 DICOM 文件开始查看</p>
              </div>
            )}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 上传区域 - 移到下方 */}
          <Card className={styles.uploadCard} bodyStyle={{ padding: '16px' }}>
            <div className={styles.uploadSection}>
              <UploadOutlined className={styles.uploadIcon} />
              <Button
                type="primary"
                onClick={onUpload}
                block
                size="large"
                className={styles.uploadBtn}
              >
                上传 DICOM 文件
              </Button>
              <p className={styles.uploadTip}>支持 .dcm 格式的医学影像文件</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SeriesPanel;
