import { useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const { Dragger } = Upload;

function UploadModal({ open, onCancel, onUpload }) {
  const [fileList, setFileList] = useState([]);

  const props = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file) => {
      // 移除文件类型检查,因为DICOM文件没有后缀
      return false; // 返回false以阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
  };

  const handleOk = () => {
    if (fileList.length > 0) {
      onUpload(fileList);
    } else {
      message.warning('请先选择DICOM文件');
    }
  };

  return (
    <Modal title="上传DICOM文件" open={open} onOk={handleOk} onCancel={onCancel}>
      <Dragger {...props} className={styles.uploader}>
        <p className={styles.uploaderIcon}>
          <InboxOutlined />
        </p>
        <p className={styles.uploaderText}>点击或拖拽文件到此区域上传</p>
        <p className={styles.uploaderHint}>支持上传DICOM文件(无后缀名)</p>
      </Dragger>
    </Modal>
  );
}

export default UploadModal;