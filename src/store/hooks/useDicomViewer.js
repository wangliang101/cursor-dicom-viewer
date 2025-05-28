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

    // 查看器状态
    resetViewerSettings,

    // 错误处理
    showSuccess,
    showError,
  } = store;

  // 封装的方法
  const uploadFiles = useCallback(
    async (fileList) => {
      const success = await handleUpload(fileList);
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

    // 基本操作
    setCurrentTool,
    setFramesPerSecond,
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

    // 消息方法
    showSuccess,
    showError,
  };
};
