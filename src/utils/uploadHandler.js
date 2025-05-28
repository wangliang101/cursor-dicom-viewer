import { message } from 'antd';
import useDicomStore from '../store';

export const handleUpload = async (fileList) => {
  const { processUploadedFiles, showSuccess, showError } = useDicomStore.getState();

  if (fileList && fileList.length > 0) {
    try {
      const imageIds = await processUploadedFiles(fileList);
      console.log('生成的 Image IDs:', imageIds);
      showSuccess(`成功加载 ${imageIds.length} 个 DICOM 文件`);
      message.success(`成功加载 ${imageIds.length} 个 DICOM 文件`);
      return true;
    } catch (error) {
      console.error('加载 DICOM 文件失败:', error);
      showError('加载 DICOM 文件失败，请确保上传了有效的 DICOM 文件');
      message.error('加载 DICOM 文件失败，请确保上传了有效的 DICOM 文件');
      return false;
    }
  }
  return false;
};
