import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, message } from 'antd';
import DicomTagsViewer from '../../components/DicomTagsViewer';
import MainLayout from '../../components/MainLayout';
import { init as coreInit, RenderingEngine, Enums } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';
import UploadModal from '../../components/UploadModal';
import { useDicomViewer } from '../../store/hooks/useDicomViewer';
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

function Layout() {
  // 使用自定义hook获取状态和方法
  const {
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

    // 方法
    setCurrentTool,
    setFramesPerSecond,
    setMultiViewLayout,
    resetViewerSettings,
    uploadFiles,
    closeUploadModal,
    openUploadModal,
    closeTagsModal: originalCloseTagsModal,
    openTagsModal,
    selectImage,
    playClip,
    stopClip,
    goToNextFrame,
    goToPrevFrame,

    // 删除功能
    deleteCurrentImage,
    deleteImageByIndex,
    clearAllImagesList,
  } = useDicomViewer();

  // 本地状态
  const [dicomTags, setDicomTags] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('1x1');
  const timerRef = useRef(null);
  const viewerRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportsRef = useRef({}); // 存储多个视口的引用
  const toolGroupRef = useRef(null);

  // 封装closeTagsModal以清空dicomTags
  const closeTagsModal = () => {
    setDicomTags(null); // 清空tags数据
    originalCloseTagsModal();
  };

  // 初始化Cornerstone（只需要一次）
  useEffect(() => {
    let isInitializing = false;
    async function initCornerstone() {
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

        setIsInitialized(true);
        console.log('Cornerstone 初始化完成');
      } catch (error) {
        console.error('Cornerstone 初始化失败:', error);
        setIsInitialized(false);
      } finally {
        isInitializing = false;
      }
    }

    initCornerstone();

    return () => {
      if (renderingEngineRef.current) {
        renderingEngineRef.current.destroy();
      }
      console.log('Cornerstone cleanup');
    };
  }, []);

  // 当布局改变时，重新配置视口
  useEffect(() => {
    if (!isInitialized) return;

    const setupViewportsForLayout = async () => {
      try {
        console.log(`重新配置视口以适应布局: ${currentLayout}`);

        // 根据布局类型决定处理方式
        if (currentLayout === '1x1') {
          // 单窗格布局 - 确保有渲染引擎实例
          if (!renderingEngineRef.current) {
            renderingEngineRef.current = new RenderingEngine(renderingEngineId);
          }

          // 清理现有视口
          Object.keys(viewportsRef.current).forEach((viewportId) => {
            try {
              renderingEngineRef.current.disableElement(viewportId);
            } catch (error) {
              console.warn(`清理视口 ${viewportId} 时出错:`, error);
            }
          });
          viewportsRef.current = {};

          // 清理现有工具组
          if (toolGroupRef.current) {
            try {
              ToolGroupManager.destroyToolGroup('myToolGroup');
            } catch (error) {
              console.warn('清理工具组时出错:', error);
            }
            toolGroupRef.current = null;
          }

          // 创建单视口
          const element = viewerRef.current;
          if (element) {
            const viewportId = 'CT_AXIAL_STACK';
            const viewportInput = {
              viewportId,
              element,
              type: ViewportType.STACK,
            };

            renderingEngineRef.current.enableElement(viewportInput);
            viewportsRef.current[viewportId] = renderingEngineRef.current.getViewport(viewportId);

            // 初始化工具
            initializeTools([viewportId]);

            // 如果有图像，加载它们
            if (images.length > 0) {
              await loadAndViewImage(images, viewportId);
            }
          }
        } else {
          // 多窗格布局 - 清理单视口资源，MultiPaneViewer将创建自己的引擎
          if (renderingEngineRef.current) {
            // 清理现有单视口
            Object.keys(viewportsRef.current).forEach((viewportId) => {
              try {
                renderingEngineRef.current.disableElement(viewportId);
              } catch (error) {
                console.warn(`清理单视口 ${viewportId} 时出错:`, error);
              }
            });
            viewportsRef.current = {};

            // 清理工具组
            if (toolGroupRef.current) {
              try {
                ToolGroupManager.destroyToolGroup('myToolGroup');
              } catch (error) {
                console.warn('清理单视口工具组时出错:', error);
              }
              toolGroupRef.current = null;
            }

            // 不销毁引擎，只是清理引用，让MultiPaneViewer使用自己的引擎
            console.log('单视口资源已清理，多窗格布局将使用独立的渲染引擎');
          }
        }

        console.log(`视口配置完成，当前布局: ${currentLayout}`);
      } catch (error) {
        console.error('配置视口时出错:', error);
      }
    };

    setupViewportsForLayout();
  }, [currentLayout, isInitialized, images]);

  const initializeTools = (viewportIds) => {
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

      // 为所有视口添加工具组
      viewportIds.forEach((viewportId) => {
        toolGroup.addViewport(viewportId);
      });

      // 只有在有图像时才激活工具，避免在空视口上激活工具
      if (images.length > 0) {
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
      } else {
        // 没有图像时，设置工具为被动状态
        console.log('没有图像，暂不激活工具');
      }
    }
  };

  const loadAndViewImage = async (imageIds, viewportId = 'CT_AXIAL_STACK') => {
    if (imageIds && viewportsRef.current[viewportId]) {
      try {
        console.log('开始加载图像:', imageIds);
        await viewportsRef.current[viewportId].setStack(imageIds);
        console.log('图像堆栈设置完成');
        viewportsRef.current[viewportId].render();
        console.log('图像渲染完成');

        // 图像加载完成后，激活工具
        if (toolGroupRef.current && currentLayout === '1x1') {
          console.log('图像加载完成，激活工具');
          toolGroupRef.current.setToolActive(WindowLevelTool.toolName, {
            bindings: [
              {
                mouseButton: csToolsEnums.MouseBindings.Primary,
              },
            ],
          });

          toolGroupRef.current.setToolActive(PanTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
          });
          toolGroupRef.current.setToolActive(StackScrollTool.toolName, {
            bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
          });

          toolGroupRef.current.setToolActive(ZoomTool.toolName, {
            bindings: [
              {
                mouseButton: csToolsEnums.MouseBindings.Secondary,
              },
            ],
          });
        }
      } catch (error) {
        console.error('加载或显示图像时出错:', error);
      }
    } else {
      console.log('imageId 或 viewport 不存在');
    }
  };

  const handleImageSelect = (index) => {
    // 为单窗格布局选择图像
    if (currentLayout === '1x1') {
      selectImage(index, viewportsRef.current['CT_AXIAL_STACK']);
    } else {
      // 多窗格布局的图像选择将由MultiPaneViewer处理
      selectImage(index, null);
    }
  };

  const handlePlayClip = useCallback(() => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    timerRef.current = playClip(activeViewport);
  }, [playClip, currentLayout]);

  const handleStopClip = useCallback(() => {
    stopClip(timerRef);
  }, [stopClip]);

  const showDicomTagsForImage = async (imageIndex) => {
    if (totalImages === 0 || imageIndex < 0 || imageIndex >= totalImages) {
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
      openTagsModal();
    } catch (error) {
      console.error('读取 DICOM tags 时出错:', error);
      message.error('读取 DICOM tags 失败');
    }
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
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    if (activeViewport) {
      resetImage(activeViewport);
      resetViewerSettings();
    }
  };

  const handleFlipH = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    if (activeViewport) {
      flipHorizontal(activeViewport);
    }
  };

  const handleFlipV = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    if (activeViewport) {
      flipVertical(activeViewport);
    }
  };

  const handleRotate = (angle) => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    if (activeViewport) {
      rotateImage(activeViewport, angle);
    }
  };

  const handleInvert = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    if (activeViewport) {
      invertImage(activeViewport);
    }
  };

  const handleNextFrame = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    goToNextFrame(activeViewport);
  };

  const handlePrevFrame = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    goToPrevFrame(activeViewport);
  };

  const handleDeleteCurrent = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    deleteCurrentImage(activeViewport);
  };

  const handleDeleteByIndex = (index) => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    deleteImageByIndex(index, activeViewport);
  };

  const handleClearAll = () => {
    const activeViewport = currentLayout === '1x1' ? viewportsRef.current['CT_AXIAL_STACK'] : null;
    clearAllImagesList(activeViewport);
  };

  const handleShowSettings = () => {
    message.info('设置功能将在后续版本中实现');
  };

  const handleLayoutChange = (newLayout) => {
    console.log(`布局切换: ${currentLayout} -> ${newLayout}`);
    setCurrentLayout(newLayout);

    // 强制触发视口重新配置
    setTimeout(() => {
      console.log(`布局切换已完成，当前布局: ${newLayout}`);
    }, 100);
  };

  return (
    <>
      <MainLayout
        // Header props
        toolGroupRef={toolGroupRef}
        activeTool={currentTool}
        onToolChange={setCurrentTool}
        viewportRef={viewerRef}
        onReset={handleReset}
        onFlipH={handleFlipH}
        onFlipV={handleFlipV}
        onRotate={handleRotate}
        onInvert={handleInvert}
        onPlay={handlePlayClip}
        onStop={handleStopClip}
        onNextFrame={handleNextFrame}
        onPrevFrame={handlePrevFrame}
        isPlaying={isPlaying}
        currentImageIndex={currentImageIndex}
        totalImages={totalImages}
        onShowSettings={handleShowSettings}
        multiViewLayout={multiViewLayout}
        onMultiViewLayoutChange={setMultiViewLayout}
        currentLayout={currentLayout}
        onLayoutChange={handleLayoutChange}
        // SeriesPanel props
        images={images}
        onImageSelect={handleImageSelect}
        onUpload={openUploadModal}
        framesPerSecond={framesPerSecond}
        onFpsChange={setFramesPerSecond}
        onShowTags={showDicomTagsForImage}
        onDeleteCurrent={handleDeleteCurrent}
        onDeleteByIndex={handleDeleteByIndex}
        onClearAll={handleClearAll}
      />

      <UploadModal open={uploadModalVisible} onCancel={closeUploadModal} onUpload={uploadFiles} />
      <Modal
        title="DICOM Tags"
        open={tagsModalVisible}
        onCancel={closeTagsModal}
        footer={null}
        width={800}
      >
        <DicomTagsViewer tags={dicomTags} />
      </Modal>
    </>
  );
}

export default Layout;
