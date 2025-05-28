import { RenderingEngine, Enums, getRenderingEngine } from '@cornerstonejs/core';
import {
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  PanTool,
  StackScrollTool,
  Enums as csToolsEnums,
  addTool,
} from '@cornerstonejs/tools';

const { ViewportType, OrientationAxis } = Enums;

class MultiViewportService {
  constructor(renderingEngineId = 'multiViewRenderingEngine') {
    this.renderingEngineId = renderingEngineId;
    this.renderingEngine = null;
    this.viewports = {};
    this.toolGroups = {};
    this.isInitialized = false;
  }

  // 初始化渲染引擎
  async initialize() {
    try {
      // 检查现有引擎是否还有效
      if (this.renderingEngine && this.isInitialized) {
        try {
          // 尝试调用一个简单的方法来验证引擎是否仍然有效
          this.renderingEngine.getViewports();
          console.log('使用现有的有效渲染引擎');
          return this.renderingEngine;
        } catch (error) {
          console.warn('现有渲染引擎无效，将创建新实例:', error.message);
          this.renderingEngine = null;
          this.isInitialized = false;
        }
      }

      // 尝试获取现有的渲染引擎
      try {
        this.renderingEngine = getRenderingEngine(this.renderingEngineId);
        if (this.renderingEngine) {
          // 验证获取到的引擎是否有效
          this.renderingEngine.getViewports();
          console.log('获取到现有的有效渲染引擎');
        }
      } catch (error) {
        console.warn('获取现有渲染引擎失败或无效:', error.message);
        this.renderingEngine = null;
      }

      // 如果没有有效的引擎，创建新的
      if (!this.renderingEngine) {
        console.log('创建新的渲染引擎:', this.renderingEngineId);
        this.renderingEngine = new RenderingEngine(this.renderingEngineId);
      }

      this.isInitialized = true;
      console.log('MultiViewportService 初始化完成');
      return this.renderingEngine;
    } catch (error) {
      console.error('MultiViewportService 初始化失败:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  // 创建视口配置
  createViewportInput(element, viewportId, viewType = 'axial') {
    const viewportTypes = {
      axial: {
        type: ViewportType.ORTHOGRAPHIC,
        defaultOptions: {
          orientation: OrientationAxis.AXIAL,
        },
      },
      sagittal: {
        type: ViewportType.ORTHOGRAPHIC,
        defaultOptions: {
          orientation: OrientationAxis.SAGITTAL,
        },
      },
      coronal: {
        type: ViewportType.ORTHOGRAPHIC,
        defaultOptions: {
          orientation: OrientationAxis.CORONAL,
        },
      },
      stack: {
        type: ViewportType.STACK,
        defaultOptions: {},
      },
      vr: {
        type: ViewportType.VOLUME_3D,
        defaultOptions: {},
      },
    };

    const config = viewportTypes[viewType] || viewportTypes.stack;

    return {
      viewportId,
      type: config.type,
      element,
      defaultOptions: config.defaultOptions,
    };
  }

  // 设置多个视口
  async setViewports(viewportConfigs) {
    if (!this.renderingEngine) {
      await this.initialize();
    }

    try {
      // 清理现有视口
      await this.clearAllViewports();

      // 创建视口输入配置
      const viewportInputs = viewportConfigs.map((config) =>
        this.createViewportInput(config.element, config.viewportId, config.viewType)
      );

      // 使用Cornerstone的setViewports API一次性创建所有视口
      this.renderingEngine.setViewports(viewportInputs);

      // 存储视口引用
      viewportConfigs.forEach((config) => {
        const viewport = this.renderingEngine.getViewport(config.viewportId);
        this.viewports[config.viewportId] = {
          viewport,
          element: config.element,
          viewType: config.viewType,
          paneIndex: config.paneIndex,
        };
      });

      console.log(`创建了 ${viewportConfigs.length} 个视口:`, Object.keys(this.viewports));
      return this.viewports;
    } catch (error) {
      console.error('创建视口失败:', error);
      throw error;
    }
  }

  // 为视口组创建工具组
  async createToolGroup(viewportIds, toolGroupId = 'multiViewToolGroup', activateTools = false) {
    try {
      // 清理现有工具组
      if (this.toolGroups[toolGroupId]) {
        ToolGroupManager.destroyToolGroup(toolGroupId);
        delete this.toolGroups[toolGroupId];
      }

      // 创建新工具组
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        throw new Error('Failed to create tool group');
      }

      // 添加工具
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
        if (this.viewports[viewportId]) {
          toolGroup.addViewport(viewportId, this.renderingEngineId);
        }
      });

      // 只有在指定激活工具时才设置工具激活状态
      if (activateTools) {
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
        });

        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
        });

        toolGroup.setToolActive(StackScrollTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
        });

        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
        });

        console.log(`工具组 ${toolGroupId} 工具已激活`);
      } else {
        console.log(`工具组 ${toolGroupId} 已创建，但工具未激活`);
      }

      this.toolGroups[toolGroupId] = toolGroup;
      console.log(`工具组 ${toolGroupId} 创建完成，包含 ${viewportIds.length} 个视口`);
      return toolGroup;
    } catch (error) {
      console.error('创建工具组失败:', error);
      throw error;
    }
  }

  // 激活工具组中的工具
  activateTools(toolGroupId = 'multiViewToolGroup') {
    const toolGroup = this.toolGroups[toolGroupId];
    if (!toolGroup) {
      console.warn(`工具组 ${toolGroupId} 不存在`);
      return;
    }

    try {
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });

      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
      });

      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
      });

      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
      });

      console.log(`工具组 ${toolGroupId} 工具已激活`);
    } catch (error) {
      console.error(`激活工具组 ${toolGroupId} 失败:`, error);
    }
  }

  // 为视口加载图像堆栈
  async loadImageStack(viewportId, imageIds, imageIndex = 0) {
    const viewportInfo = this.viewports[viewportId];
    if (!viewportInfo || !viewportInfo.viewport) {
      console.warn(`视口 ${viewportId} 不存在`);
      return;
    }

    try {
      const { viewport } = viewportInfo;

      if (viewport.type === ViewportType.STACK) {
        await viewport.setStack(imageIds, imageIndex);
      } else {
        // 对于体积视口，需要不同的加载方式
        console.warn(`视口类型 ${viewport.type} 的图像加载尚未实现`);
      }

      viewport.render();
      console.log(`视口 ${viewportId} 图像加载完成`);

      // 图像加载完成后，激活工具（如果还没有激活的话）
      const toolGroupId = 'multiViewToolGroup';
      if (this.toolGroups[toolGroupId]) {
        this.activateTools(toolGroupId);
      }
    } catch (error) {
      console.error(`视口 ${viewportId} 图像加载失败:`, error);
      throw error;
    }
  }

  // 为所有视口加载相同的图像堆栈
  async loadImageStackToAllViewports(imageIds, imageIndex = 0) {
    const loadPromises = Object.keys(this.viewports).map((viewportId) =>
      this.loadImageStack(viewportId, imageIds, imageIndex)
    );

    try {
      await Promise.allSettled(loadPromises);
      console.log('所有视口图像加载完成');
    } catch (error) {
      console.error('部分视口图像加载失败:', error);
    }
  }

  // 获取视口引用
  getViewport(viewportId) {
    return this.viewports[viewportId]?.viewport;
  }

  // 获取所有视口
  getAllViewports() {
    return Object.keys(this.viewports).reduce((acc, id) => {
      acc[id] = this.viewports[id].viewport;
      return acc;
    }, {});
  }

  // 清理指定视口
  async disableViewport(viewportId) {
    if (this.viewports[viewportId]) {
      try {
        // 检查渲染引擎是否仍然有效
        if (this.renderingEngine) {
          try {
            this.renderingEngine.disableElement(viewportId);
          } catch (error) {
            // 如果引擎已经被销毁，只记录警告但继续清理内部状态
            console.warn(`视口 ${viewportId} 无法从渲染引擎中移除:`, error.message);
          }
        }

        delete this.viewports[viewportId];
        console.log(`视口 ${viewportId} 已清理`);
      } catch (error) {
        console.warn(`清理视口 ${viewportId} 时出错:`, error);
      }
    }
  }

  // 清理所有视口
  async clearAllViewports() {
    const viewportIds = Object.keys(this.viewports);

    // 如果有视口需要清理
    if (viewportIds.length > 0) {
      for (const viewportId of viewportIds) {
        await this.disableViewport(viewportId);
      }
    }

    // 清理所有工具组
    Object.keys(this.toolGroups).forEach((toolGroupId) => {
      try {
        ToolGroupManager.destroyToolGroup(toolGroupId);
      } catch (error) {
        console.warn(`清理工具组 ${toolGroupId} 时出错:`, error);
      }
    });
    this.toolGroups = {};

    console.log('所有视口和工具组已清理');
  }

  // 销毁服务
  async destroy() {
    await this.clearAllViewports();

    if (this.renderingEngine) {
      try {
        this.renderingEngine.destroy();
      } catch (error) {
        console.warn('销毁渲染引擎时出错:', error);
      }
      this.renderingEngine = null;
    }

    this.isInitialized = false;
    console.log('MultiViewportService 已销毁');
  }

  // 重置所有视口的相机
  resetAllCameras() {
    Object.values(this.viewports).forEach(({ viewport }) => {
      if (viewport && viewport.resetCamera) {
        viewport.resetCamera();
        viewport.render();
      }
    });
    console.log('所有视口相机已重置');
  }

  // 设置活动视口（用于工具同步）
  setActiveViewport(viewportId) {
    // 这里可以实现视口激活逻辑
    console.log(`设置活动视口: ${viewportId}`);
  }
}

// 多个服务实例，按渲染引擎ID区分
const multiViewportServices = new Map();

export const getMultiViewportService = (renderingEngineId = 'multiViewRenderingEngine') => {
  if (!multiViewportServices.has(renderingEngineId)) {
    multiViewportServices.set(renderingEngineId, new MultiViewportService(renderingEngineId));
  }
  return multiViewportServices.get(renderingEngineId);
};

export default MultiViewportService;
