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
      // 先更新状态
      setCurrentImageIndex(index);
      // 再更新viewport并渲染
      if (viewport) {
        viewport.setImageIdIndex(index);
        viewport.render();
      }
    },
    [setCurrentImageIndex]
  );

  const playClip = useCallback(
    (viewport) => {
      if (totalImages <= 1) {
        return;
      }
      setIsPlaying(true);

      // 立即执行一次帧切换，避免第一圈延迟
      // 直接在当前上下文中计算下一帧，不依赖异步状态获取
      const nextIndex = (currentImageIndex + 1) % totalImages;

      // 先更新viewport，再更新状态
      if (viewport && viewport.setImageIdIndex) {
        try {
          viewport.setImageIdIndex(nextIndex);
          viewport.render();

          // viewport更新成功后，再更新状态
          setCurrentImageIndex(nextIndex);
        } catch (error) {
          console.error('立即更新viewport失败:', error);
        }
      } else {
        console.warn('viewport不存在或缺少setImageIdIndex方法！');
        // 如果viewport不存在，仍然更新状态
        setCurrentImageIndex(nextIndex);
      }

      return setInterval(async () => {
        // 获取当前状态
        const currentState = useDicomStore.getState();
        // 计算下一帧索引
        const nextIndex = (currentState.currentImageIndex + 1) % currentState.totalImages;

        // 先更新viewport，再更新状态
        if (viewport && viewport.setImageIdIndex) {
          try {
            await viewport.setImageIdIndex(nextIndex);
            viewport.render();

            // viewport更新成功后，再更新状态
            setCurrentImageIndex(nextIndex);
          } catch (error) {
            console.error('更新viewport失败:', error);
          }
        } else {
          console.warn('viewport不存在或缺少setImageIdIndex方法！');
          // 如果viewport不存在，仍然更新状态
          setCurrentImageIndex(nextIndex);
        }
      }, 1000 / framesPerSecond);
    },
    [totalImages, framesPerSecond, currentImageIndex, setCurrentImageIndex, setIsPlaying]
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
        // 获取当前状态并计算下一帧索引
        const currentState = useDicomStore.getState();
        const nextIndex = (currentState.currentImageIndex + 1) % currentState.totalImages;

        // 直接设置下一帧索引
        setCurrentImageIndex(nextIndex);

        // 更新viewport并渲染
        if (viewport) {
          viewport.setImageIdIndex(nextIndex);
          viewport.render(); // 添加render调用
        } else {
          console.warn('手动切换：viewport不存在！');
        }
      }
    },
    [totalImages, setCurrentImageIndex]
  );

  const goToPrevFrame = useCallback(
    (viewport) => {
      if (totalImages > 0) {
        // 获取当前状态并计算上一帧索引
        const currentState = useDicomStore.getState();
        const prevIndex =
          currentState.currentImageIndex === 0
            ? currentState.totalImages - 1
            : currentState.currentImageIndex - 1;

        // 直接设置上一帧索引
        setCurrentImageIndex(prevIndex);

        // 更新viewport并渲染
        if (viewport) {
          viewport.setImageIdIndex(prevIndex);
          viewport.render();
        }
      }
    },
    [totalImages, setCurrentImageIndex]
  );

  // 删除相关的方法
  const deleteCurrentImage = useCallback(
    (viewport) => {
      if (totalImages > 0) {
        // 执行删除操作
        removeCurrentImage();
        showSuccess('当前图像已删除');

        // 如果还有图像，更新viewport
        if (totalImages > 1 && viewport) {
          // 重新获取删除后的状态
          const newState = useDicomStore.getState();
          if (newState.totalImages > 0) {
            viewport.setImageIdIndex(newState.currentImageIndex);
            viewport.render();
          }
        }
      }
    },
    [totalImages, removeCurrentImage, showSuccess]
  );

  const deleteImageByIndex = useCallback(
    (index, viewport) => {
      if (index >= 0 && index < totalImages) {
        // 执行删除操作
        removeImageByIndex(index);
        showSuccess(`图像 ${index + 1} 已删除`);

        // 如果还有图像，更新viewport
        if (viewport) {
          // 获取删除后的状态
          const newState = useDicomStore.getState();
          if (newState.totalImages > 0) {
            viewport.setImageIdIndex(newState.currentImageIndex);
            viewport.render();
          }
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
