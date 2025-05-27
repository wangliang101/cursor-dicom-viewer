import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, message } from 'antd';
import DicomTagsViewer from '../../components/DicomTagsViewer';
import MainLayout from '../../components/MainLayout';
import { init as coreInit, RenderingEngine, Enums } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';
import UploadModal from '../../components/UploadModal';
import { handleUpload } from '../../utils/uploadHandler';
import {
  resetImage,
  flipHorizontal,
  flipVertical,
  rotateImage,
  invertImage,
} from '../../utils/imageTransforms';

import {
  init as cornerstoneToolsInit,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
} from '@cornerstonejs/tools';

const { ViewportType } = Enums;

// 定义常量
const renderingEngineId = 'myRenderingEngine';
const viewportId = 'CT_AXIAL_STACK';

function Layout() {
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [dicomTags, setDicomTags] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [framesPerSecond, setFramesPerSecond] = useState(24);
  const [activeTool, setActiveTool] = useState(WindowLevelTool.toolName);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);
  const viewerRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportRef = useRef(null);
  const toolGroupRef = useRef(null);

  useEffect(() => {
    let isInitializing = false;
    async function init() {
      if (isInitializing) return;
      isInitializing = true;
      try {
        console.log('开始初始化 Cornerstone');
        if (isInitialized) {
          console.log('Cornerstone 已经初始化，跳过');
          return;
        }
        await coreInit();
        await dicomImageLoaderInit();
        await cornerstoneToolsInit();

        const renderingEngine = new RenderingEngine(renderingEngineId);
        renderingEngineRef.current = renderingEngine;

        const element = viewerRef.current;

        if (!element) {
          console.error('视图元素不存在');
          throw new Error('视图元素不存在');
        }

        const viewportInput = {
          viewportId,
          element,
          type: ViewportType.STACK,
        };

        renderingEngine.enableElement(viewportInput);
        viewportRef.current = renderingEngine.getViewport(viewportId);

        setIsInitialized(true);
        console.log('Cornerstone 初始化完成');
      } catch (error) {
        console.error('Cornerstone 初始化失败:', error);
        setIsInitialized(false);
      } finally {
        isInitializing = false;
      }
    }

    init();

    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
      console.log('Cornerstone cleanup');
    };
  }, []);

  useEffect(() => {
    if (isInitialized && images.length > 0) {
      loadAndViewImage(images);
    }
  }, [isInitialized, images]);

  const initializeTools = (viewportId) => {
    const toolGroupId = 'myToolGroup';
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
    if (toolGroup) {
      toolGroupRef.current = toolGroup;
      addTool(ZoomTool);
      addTool(PanTool);
      addTool(WindowLevelTool);
      addTool(StackScrollTool);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName);

      toolGroup.addViewport(viewportId);

      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Primary,
          },
        ],
      });

      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
      });

      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Secondary,
          },
        ],
      });
    }
  };

  const loadAndViewImage = async (imageIds) => {
    if (imageIds && viewportRef.current) {
      try {
        console.log('开始加载图像:', imageIds);
        await viewportRef.current.setStack(imageIds);
        console.log('图像堆栈设置完成');
        initializeTools(viewportId);
        viewportRef.current.render();
        console.log('图像渲染完成');
      } catch (error) {
        console.error('加载或显示图像时出错:', error);
      }
    } else {
      console.log('imageId 或 viewportRef.current 不存在');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onUpload = async (fileList) => {
    const success = await handleUpload(fileList, setImages);
    if (success) {
      setIsModalVisible(false);
      setCurrentImageIndex(0);
    }
  };

  const handleImageSelect = (index) => {
    viewportRef.current.setImageIdIndex(index);
    setCurrentImageIndex(index);
  };

  const playClip = useCallback(() => {
    if (images.length <= 1) return;
    setIsPlaying(true);
    const interval = 1000 / framesPerSecond;
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        if (viewportRef.current) {
          viewportRef.current.setImageIdIndex(nextIndex);
        }
        return nextIndex;
      });
    }, interval);
  }, [images.length, framesPerSecond]);

  const stopClip = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const showDicomTagsForImage = async (imageIndex) => {
    if (images.length === 0 || imageIndex < 0 || imageIndex >= images.length) {
      message.warning('无效的图像索引');
      return;
    }

    try {
      const imageId = images[imageIndex];
      const arrayBuffer = await fetch(imageId.replace('wadouri:', '')).then((res) =>
        res.arrayBuffer()
      );
      const byteArray = new Uint8Array(arrayBuffer);

      const dataSet = dicomParser.parseDicom(byteArray);

      const tags = {};
      for (let tag in dataSet.elements) {
        const element = dataSet.elements[tag];
        tags[tag] = {
          vr: element.vr,
          value: dataSet.string(tag),
        };
      }

      setDicomTags(tags);
      setIsTagModalVisible(true);
    } catch (error) {
      console.error('读取 DICOM tags 时出错:', error);
      message.error('读取 DICOM tags 失败');
    }
  };

  const handleTagModalClose = () => {
    setIsTagModalVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 工具栏事件处理函数
  const handleReset = () => {
    if (viewportRef.current) {
      resetImage(viewportRef.current);
    }
  };

  const handleFlipH = () => {
    if (viewportRef.current) {
      flipHorizontal(viewportRef.current);
    }
  };

  const handleFlipV = () => {
    if (viewportRef.current) {
      flipVertical(viewportRef.current);
    }
  };

  const handleRotate = (angle) => {
    if (viewportRef.current) {
      rotateImage(viewportRef.current, angle);
    }
  };

  const handleInvert = () => {
    if (viewportRef.current) {
      invertImage(viewportRef.current);
    }
  };

  const handleNextFrame = () => {
    if (images.length > 0) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
      if (viewportRef.current) {
        viewportRef.current.setImageIdIndex(nextIndex);
      }
    }
  };

  const handlePrevFrame = () => {
    if (images.length > 0) {
      const prevIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      if (viewportRef.current) {
        viewportRef.current.setImageIdIndex(prevIndex);
      }
    }
  };

  const handleShowSettings = () => {
    message.info('设置功能将在后续版本中实现');
  };

  return (
    <>
      <MainLayout
        // Header props
        toolGroupRef={toolGroupRef}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        viewportRef={viewerRef}
        onReset={handleReset}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onRotate={handleRotate}
        onInvert={handleInvert}
        onPlay={playClip}
        onStop={stopClip}
        onNextFrame={handleNextFrame}
        onPrevFrame={handlePrevFrame}
        isPlaying={isPlaying}
        currentImageIndex={currentImageIndex}
        totalImages={images.length}
        onShowSettings={handleShowSettings}
        // SeriesPanel props
        images={images}
        onImageSelect={handleImageSelect}
        onUpload={() => setIsModalVisible(true)}
        framesPerSecond={framesPerSecond}
        onFpsChange={setFramesPerSecond}
        onShowTags={showDicomTagsForImage}
      />

      <UploadModal open={isModalVisible} onCancel={handleCancel} onUpload={onUpload} />
      <Modal
        title="DICOM Tags"
        open={isTagModalVisible}
        onCancel={handleTagModalClose}
        footer={null}
        width={800}
      >
        <DicomTagsViewer tags={dicomTags} />
      </Modal>
    </>
  );
}

export default Layout;
