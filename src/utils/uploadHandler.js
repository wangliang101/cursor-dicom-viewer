import { message } from 'antd';

export const handleUpload = async (fileList, setImages) => {
  if (fileList.length > 0) {
    try {
      const imageIds = fileList.map((file) => `wadouri:${URL.createObjectURL(file.originFileObj)}`);
      console.log('生成的 Image IDs:', imageIds);
      setImages(imageIds);
      console.log('Images 已设置');
      message.success(`成功加载 ${imageIds.length} 个 DICOM 文件`);
      return true;
    } catch (error) {
      console.error('加载 DICOM 文件失败:', error);
      message.error('加载 DICOM 文件失败，请确保上传了有效的 DICOM 文件');
      return false;
    }
  }
  return false;
};
