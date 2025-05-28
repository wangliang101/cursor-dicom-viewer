import { Button, List, Card, Divider, Badge, Tooltip, Popconfirm } from 'antd';
import { useRef, useEffect } from 'react';
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  FileImageOutlined,
  TagsOutlined,
  DeleteOutlined,
  ClearOutlined,
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
  onDeleteCurrent,
  onDeleteByIndex,
  onClearAll,
}) => {
  const listRef = useRef(null);
  const selectedItemRef = useRef(null);

  // 当currentImageIndex变化时，自动滚动到选中项
  useEffect(() => {
    if (selectedItemRef.current && listRef.current && !isCollapsed) {
      // 使用 scrollIntoView 滚动到选中的元素
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [currentImageIndex, isCollapsed]);

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
                <div className={styles.headerActions}>
                  <span className={styles.imageCount}>
                    {currentImageIndex + 1} / {images.length}
                  </span>
                  <Popconfirm
                    title="确认删除"
                    description="确定要删除当前图像吗？"
                    onConfirm={() => onDeleteCurrent && onDeleteCurrent()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="删除当前图像">
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className={styles.actionButton}
                        danger
                      />
                    </Tooltip>
                  </Popconfirm>
                  <Popconfirm
                    title="确认清空"
                    description="确定要清空所有图像吗？"
                    onConfirm={() => onClearAll && onClearAll()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Tooltip title="清空所有图像">
                      <Button
                        type="text"
                        size="small"
                        icon={<ClearOutlined />}
                        className={styles.actionButton}
                        danger
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              )}
            </div>

            {images.length > 0 ? (
              <List
                ref={listRef}
                className={styles.imageList}
                dataSource={images}
                renderItem={(item, index) => (
                  <List.Item
                    ref={index === currentImageIndex ? selectedItemRef : null}
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
                      <div className={styles.imageActions}>
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
                        {/* 删除按钮 */}
                        <Popconfirm
                          title="确认删除"
                          description={`确定要删除图像 ${index + 1} 吗？`}
                          onConfirm={(e) => {
                            e?.stopPropagation?.();
                            onDeleteByIndex && onDeleteByIndex(index);
                          }}
                          okText="确定"
                          cancelText="取消"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip title="删除此图像">
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              className={styles.deleteButton}
                              danger
                              onClick={(e) => e.stopPropagation()}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </div>
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
