import React, { useState, useEffect, useRef,message } from 'react';
import { Button, List,Slider,Radio,Modal } from 'antd';
import DicomTagsViewer from '../../components/DicomTagsViewer';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import * as cornerstoneWADOImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';
import UploadModal from '../../components/UploadModal';
import { handleUpload } from '../../utils/uploadHandler';
import styles from './index.module.less';

const {
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollMouseWheelTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { MouseBindings } = csToolsEnums;

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
    async function initCornerstone() {
      await cornerstone.init();

      cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
      cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
      cornerstoneWADOImageLoader.configure({
        useWebWorkers: true,
        decodeConfig: {
          useWebWorkers: true,
        },
      });

      cornerstone.imageLoader.registerImageLoader('wadouri', cornerstoneWADOImageLoader.wadouri.loadImage);

      const element = viewerRef.current;
      const renderingEngineId = 'myRenderingEngine';
      const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;

      const viewportId = 'CT_STACK';
      const viewportInput = {
        viewportId,
        element,
        type: cornerstone.Enums.ViewportType.STACK,
      };

      renderingEngine.enableElement(viewportInput);

      viewportRef.current = renderingEngine.getViewport(viewportId);
      console.log('Viewport 已获取:', viewportRef.current);

      initializeTools(element, viewportId, renderingEngineId);

      setIsInitialized(true);
      console.log('Cornerstone 初始化完成');
    }

    initCornerstone();

    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
      console.log('Cornerstone cleanup');
    };
  }, []);

  useEffect(() => {
    if (isInitialized && images.length > 0) {
      loadAndViewImage(images[currentImageIndex]);
    }
  }, [isInitialized, images, currentImageIndex]);

  const initializeTools = (element, viewportId, renderingEngineId) => {
    cornerstoneTools.init();

    const toolsToAdd = [WindowLevelTool, PanTool, ZoomTool, StackScrollMouseWheelTool];
    toolsToAdd.forEach(tool => {
      try {
        cornerstoneTools.addTool(tool);
      } catch (error) {
        console.warn(`Tool ${tool.toolName} already exists, skipping...`);
      }
    });

    const toolGroupId = 'myToolGroup';
    let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

    if (!toolGroup) {
      toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      toolGroupRef.current = toolGroup;

      toolsToAdd.forEach(tool => {
        toolGroup.addTool(tool.toolName);
      });

      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Auxiliary }],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Secondary }],
      });
      toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

      toolGroup.addViewport(viewportId, renderingEngineId);
    }
  };

  const loadAndViewImage = async (imageId) => {
    if (imageId && viewportRef.current) {
      try {
        console.log('开始加载图像:', imageId);
        await viewportRef.current.setStack([imageId]);
        console.log('图像堆栈设置完成');
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

  const handleToolChange = (e) => {
    const newTool = e.target.value;
    setActiveTool(newTool);
    if (toolGroupRef.current) {
      // 停用所有工具
      [WindowLevelTool.toolName, PanTool.toolName, ZoomTool.toolName].forEach(toolName => {
        toolGroupRef.current.setToolPassive(toolName);
      });

      // 激活选中的工具
      toolGroupRef.current.setToolActive(newTool, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });

      // 滚轮工具始终保持激活状态
      toolGroupRef.current.setToolActive(StackScrollMouseWheelTool.toolName);

      console.log(`已切换到工具: ${newTool}`);
    } else {
      console.warn('工具组未初始化');
    }
  };

  const showDicomTags = async () => {
    if (images.length === 0 || currentImageIndex === -1) {
      message.warning('请先上传 DICOM 文件');
      return;
    }
  
    try {
      const imageId = images[currentImageIndex];
      const image = await cornerstone.imageLoader.loadAndCacheImage(imageId);
      
      // 获取原始的 DICOM 数据
      const arrayBuffer = await fetch(imageId.replace('wadouri:', '')).then(res => res.arrayBuffer());
      const byteArray = new Uint8Array(arrayBuffer);
      
      // 使用 dicom-parser 解析 DICOM 数据
      const dataSet = dicomParser.parseDicom(byteArray);
      
      // 创建一个包含所有 tags 的对象
      const tags = {};
      for (let tag in dataSet.elements) {
        const element = dataSet.elements[tag];
        tags[tag] = {
          vr: element.vr,
          value: dataSet.string(tag)
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

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar}>
        <Button onClick={showModal}>上传DICOM文件</Button>
        <Button onClick={isPlaying ? stopClip : playClip}>
          {isPlaying ? '停止' : '播放'}
        </Button>
        <Slider
          min={1}
          max={100}
          value={framesPerSecond}
          onChange={handleFpsChange}
          style={{ width: 200 }}
          disabled={isPlaying}
        />
        <span>帧率: {framesPerSecond} fps</span>
        <Radio.Group onChange={handleToolChange} value={activeTool}>
          <Radio.Button value={WindowLevelTool.toolName}>窗宽窗位</Radio.Button>
          <Radio.Button value={PanTool.toolName}>平移</Radio.Button>
          <Radio.Button value={ZoomTool.toolName}>缩放</Radio.Button>
        </Radio.Group>
        <Button onClick={showDicomTags} disabled={images.length === 0}>显示 Tags</Button>
      </div>
      <div className={styles.content}>
        <div className={styles.imageList}>
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