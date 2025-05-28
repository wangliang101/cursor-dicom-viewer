import { Button, List, Card, Divider, Badge, Tooltip } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  FileImageOutlined,
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
          {/* 图像列表 */}
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
                      {/* 查看Tag按钮 */}
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
            ) : (
              <div className={styles.emptyState}>
                <FileImageOutlined className={styles.emptyIcon} />
                <p className={styles.emptyText}>暂无影像文件</p>
                <p className={styles.emptySubText}>请上传 DICOM 文件开始查看</p>
              </div>
            )}
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 上传区域 */}
          <Card className={styles.uploadCard} styles={{ body: { padding: '16px' } }}>
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
