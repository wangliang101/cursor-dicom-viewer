import { useState, useEffect, useRef } from 'react';
import { Button, List, Slider, Modal, message } from 'antd';
import DicomTagsViewer from '../../components/DicomTagsViewer';
import DicomToolbar from '../../components/toolbar/DicomToolbar';
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
import styles from './index.module.less';

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

console.log('xxxxx', StackScrollTool.name);

const { ViewportType } = Enums;

// 定义常量
const renderingEngineId = 'myRenderingEngine';
const viewportId = 'CT_AXIAL_STACK';

function Viewer() {
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
        // 检查是否已经初始化
        if (isInitialized) {
          console.log('Cornerstone 已经初始化，跳过');
          return;
        }
        // 确保按正确顺序初始化
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

        // // 确保在此之后初始化工具
        // initializeTools(viewportId);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, images]);

  const initializeTools = (viewportId) => {
    const toolGroupId = 'myToolGroup';
    const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
    if (toolGroup) {
      toolGroupRef.current = toolGroup; // 保存toolGroup引用
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
            mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
          },
        ],
      });

      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
      });
      // toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Secondary, // Right Click
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

  const showModal = () => {
    setIsModalVisible(true);
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

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const playClip = () => {
    if (images.length > 1) {
      setIsPlaying(true);
      timerRef.current = setInterval(nextImage, 1000 / framesPerSecond);
    }
  };

  const stopClip = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFpsChange = (value) => {
    setFramesPerSecond(value);
    if (isPlaying) {
      stopClip();
      playClip();
    }
  };

  const showDicomTags = async () => {
    if (images.length === 0 || currentImageIndex === -1) {
      message.warning('请先上传 DICOM 文件');
      return;
    }

    try {
      const imageId = images[currentImageIndex];
      // const image = await cornerstone.imageLoader.loadAndCacheImage(imageId);

      // 获取原始的 DICOM 数据
      const arrayBuffer = await fetch(imageId.replace('wadouri:', '')).then((res) =>
        res.arrayBuffer()
      );
      const byteArray = new Uint8Array(arrayBuffer);

      // 使用 dicom-parser 解析 DICOM 数据
      const dataSet = dicomParser.parseDicom(byteArray);

      // 创建一个包含所有 tags 的对象
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

  useEffect(() => {
    if (images.length > 0 && isPlaying) {
      viewportRef.current.setImageIdIndex(currentImageIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageIndex]);

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
    <div className={styles.viewer}>
      <DicomToolbar
        toolGroupRef={toolGroupRef}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        viewportRef={viewportRef}
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
        onShowInfo={showDicomTags}
        onShowSettings={handleShowSettings}
      />

      <div className={styles.content}>
        <div className={styles.imageList}>
          <div className={styles.uploadSection}>
            <Button onClick={showModal} block>
              上传DICOM文件
            </Button>
          </div>
          <List
            size="small"
            bordered
            dataSource={images}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => handleImageSelect(index)}
                className={index === currentImageIndex ? styles.selectedImage : ''}
              >
                图像 {index + 1}
              </List.Item>
            )}
          />
          {images.length > 1 && (
            <div className={styles.playbackControls}>
              <div className={styles.fpsControl}>
                <label>帧率: {framesPerSecond} fps</label>
                <Slider
                  min={1}
                  max={100}
                  value={framesPerSecond}
                  onChange={handleFpsChange}
                  disabled={isPlaying}
                />
              </div>
            </div>
          )}
        </div>
        <div ref={viewerRef} className={styles.viewerContainer} />
      </div>
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
    </div>
  );
}

export default Viewer;
