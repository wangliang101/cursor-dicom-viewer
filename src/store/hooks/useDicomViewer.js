import { useCallback } from 'react';
import useDicomStore from '../index';
import { handleUpload } from '../../utils/uploadHandler';

/**
 * DICOM查看器自定义Hook
 * 封装了查看器相关的状态和操作
 */
export const useDicomViewer = () => {
  const store = useDicomStore();

  // 解构store中的状态和方法
  const {
    // UI状态
    ui: { uploadModalVisible, tagsModalVisible, currentTool },
    setUploadModalVisible,
    setTagsModalVisible,
    setCurrentTool,

    // DICOM状态
    images,
    currentImageIndex,
    totalImages,
    isPlaying,
    framesPerSecond,
    setCurrentImageIndex,
    nextImage,
    prevImage,
    setIsPlaying,
    setFramesPerSecond,
    removeCurrentImage,
    removeImageByIndex,
    clearAllImages,

    // 查看器状态
    resetViewerSettings,
    multiViewLayout,
    setMultiViewLayout,

    // 错误处理
    showSuccess,
    showError,
  } = store;

  // 封装的方法
  const uploadFiles = useCallback(
    async (fileList, sortMethod) => {
      const success = await handleUpload(fileList, sortMethod);
      if (success) {
        setUploadModalVisible(false);
      }
      return success;
    },
    [setUploadModalVisible]
  );

  const openUploadModal = useCallback(() => {
    setUploadModalVisible(true);
  }, [setUploadModalVisible]);

  const closeUploadModal = useCallback(() => {
    setUploadModalVisible(false);
  }, [setUploadModalVisible]);

  const openTagsModal = useCallback(() => {
    setTagsModalVisible(true);
  }, [setTagsModalVisible]);

  const closeTagsModal = useCallback(() => {
    setTagsModalVisible(false);
  }, [setTagsModalVisible]);

  const selectImage = useCallback(
    (index, viewport) => {
      if (viewport) {
        viewport.setImageIdIndex(index);
      }
      setCurrentImageIndex(index);
    },
    [setCurrentImageIndex]
  );

  const playClip = useCallback(
    (viewport) => {
      if (totalImages <= 1) return;
      setIsPlaying(true);
      return setInterval(() => {
        nextImage();
        if (viewport) {
          const state = useDicomStore.getState();
          viewport.setImageIdIndex(state.currentImageIndex);
        }
      }, 1000 / framesPerSecond);
    },
    [totalImages, framesPerSecond, nextImage, setIsPlaying]
  );

  const stopClip = useCallback(
    (timerRef) => {
      setIsPlaying(false);
      if (timerRef && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    [setIsPlaying]
  );

  const goToNextFrame = useCallback(
    (viewport) => {
      if (totalImages > 0) {
        nextImage();
        if (viewport) {
          const state = useDicomStore.getState();
          viewport.setImageIdIndex(state.currentImageIndex);
        }
      }
    },
    [totalImages, nextImage]
  );

  const goToPrevFrame = useCallback(
    (viewport) => {
      if (totalImages > 0) {
        prevImage();
        if (viewport) {
          const state = useDicomStore.getState();
          viewport.setImageIdIndex(state.currentImageIndex);
        }
      }
    },
    [totalImages, prevImage]
  );

  // 删除相关的方法
  const deleteCurrentImage = useCallback(
    (viewport) => {
      if (totalImages > 0) {
        removeCurrentImage();
        showSuccess('当前图像已删除');
        // 如果还有图像，更新viewport
        if (totalImages > 1 && viewport) {
          const state = useDicomStore.getState();
          if (state.totalImages > 0) {
            viewport.setImageIdIndex(state.currentImageIndex);
          }
        }
      }
    },
    [totalImages, removeCurrentImage, showSuccess]
  );

  const deleteImageByIndex = useCallback(
    (index, viewport) => {
      if (index >= 0 && index < totalImages) {
        removeImageByIndex(index);
        showSuccess(`图像 ${index + 1} 已删除`);
        // 如果还有图像，更新viewport
        const state = useDicomStore.getState();
        if (state.totalImages > 0 && viewport) {
          viewport.setImageIdIndex(state.currentImageIndex);
        }
      }
    },
    [totalImages, removeImageByIndex, showSuccess]
  );

  const clearAllImagesList = useCallback(
    (viewport) => {
      clearAllImages();
      showSuccess('所有图像已清空');
      // 清空viewport
      if (viewport) {
        try {
          viewport.setStack([]);
        } catch (error) {
          console.warn('清空viewport失败:', error);
        }
      }
    },
    [clearAllImages, showSuccess]
  );

  return {
    // 状态
    uploadModalVisible,
    tagsModalVisible,
    currentTool,
    images,
    currentImageIndex,
    totalImages,
    isPlaying,
    framesPerSecond,
    multiViewLayout,

    // 基本操作
    setCurrentTool,
    setFramesPerSecond,
    setMultiViewLayout,
    resetViewerSettings,

    // 封装的方法
    uploadFiles,
    openUploadModal,
    closeUploadModal,
    openTagsModal,
    closeTagsModal,
    selectImage,
    playClip,
    stopClip,
    goToNextFrame,
    goToPrevFrame,

    // 删除功能
    deleteCurrentImage,
    deleteImageByIndex,
    clearAllImagesList,

    // 消息方法
    showSuccess,
    showError,
  };
};
