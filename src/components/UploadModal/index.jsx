import { useState } from 'react';
import { Modal, Upload, message, Tabs, List, Button, Radio, Space } from 'antd';
import { InboxOutlined, FolderOpenOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const { Dragger } = Upload;

function UploadModal({ open, onCancel, onUpload }) {
  const [fileList, setFileList] = useState([]);
  const [activeTab, setActiveTab] = useState('file');
  const [sortMethod, setSortMethod] = useState('dicom'); // 'dicom' 或 'filename'

  // 统一的文件处理配置
  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: [],
    showUploadList: false, // 隐藏默认的上传列表，使用自定义列表
    beforeUpload: () => {
      // 移除文件类型检查,因为DICOM文件没有后缀
      return false; // 返回false以阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
  };

  // 文件夹上传的props
  const folderUploadProps = {
    ...uploadProps,
    directory: true, // 启用文件夹上传
    webkitdirectory: true, // 兼容性属性
  };

  const handleOk = () => {
    if (fileList.length > 0) {
      onUpload(fileList, sortMethod);
      setFileList([]); // 清空文件列表
    } else {
      message.warning('请先选择DICOM文件或文件夹');
    }
  };

  const handleCancel = () => {
    setFileList([]); // 关闭时清空文件列表
    setActiveTab('file'); // 重置到文件上传tab
    setSortMethod('dicom'); // 重置排序方式
    onCancel();
  };

  const removeFile = (fileToRemove) => {
    setFileList(fileList.filter((file) => file.uid !== fileToRemove.uid));
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tabItems = [
    {
      key: 'file',
      label: (
        <span>
          <FileOutlined />
          单文件上传
        </span>
      ),
      children: (
        <div className={styles.uploadContent}>
          <Dragger {...uploadProps} className={styles.uploader}>
            <p className={styles.uploaderIcon}>
              <InboxOutlined />
            </p>
            <p className={styles.uploaderText}>点击或拖拽文件到此区域上传</p>
            <p className={styles.uploaderHint}>支持上传DICOM文件(无后缀名)</p>
          </Dragger>
        </div>
      ),
    },
    {
      key: 'folder',
      label: (
        <span>
          <FolderOpenOutlined />
          文件夹上传
        </span>
      ),
      children: (
        <div className={styles.uploadContent}>
          <Dragger {...folderUploadProps} className={styles.uploader}>
            <p className={styles.uploaderIcon}>
              <FolderOpenOutlined />
            </p>
            <p className={styles.uploaderText}>点击选择文件夹或拖拽文件夹到此区域</p>
            <p className={styles.uploaderHint}>支持批量上传整个DICOM文件夹</p>
          </Dragger>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="上传DICOM文件"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
      className={styles.uploadModal}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className={styles.uploadTabs}
      />

      {fileList.length > 0 && (
        <div className={styles.fileListContainer}>
          <div className={styles.fileListHeader}>
            <span className={styles.fileCount}>已选择 {fileList.length} 个文件</span>
            <Button
              type="link"
              size="small"
              onClick={() => setFileList([])}
              className={styles.clearButton}
            >
              清空列表
            </Button>
          </div>

          {/* 添加排序选项 */}
          <div className={styles.sortOptions}>
            <Space>
              <span>排序方式:</span>
              <Radio.Group value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                <Radio value="dicom">DICOM标签排序</Radio>
                <Radio value="filename">文件名排序</Radio>
              </Radio.Group>
            </Space>
          </div>

          <div className={styles.fileListWrapper}>
            <List
              size="small"
              dataSource={fileList}
              className={styles.fileList}
              pagination={
                fileList.length > 20
                  ? {
                      pageSize: 20,
                      size: 'small',
                      showSizeChanger: false,
                      showQuickJumper: fileList.length > 100,
                      showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                    }
                  : false
              }
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(file)}
                      className={styles.deleteButton}
                    />,
                  ]}
                >
                  <div className={styles.fileItem}>
                    <FileOutlined className={styles.fileIcon} />
                    <span className={styles.fileName} title={file.name}>
                      {file.name}
                    </span>
                    <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default UploadModal;
