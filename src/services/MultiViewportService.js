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
      // 添加对VIEW_TYPES常量的支持
      AXIAL: {
        type: ViewportType.STACK, // 使用STACK类型作为默认的2D视图
        defaultOptions: {},
      },
      SAGITTAL: {
        type: ViewportType.STACK, // 临时使用STACK，直到体积数据支持完善
        defaultOptions: {},
      },
      CORONAL: {
        type: ViewportType.STACK, // 临时使用STACK，直到体积数据支持完善
        defaultOptions: {},
      },
      VR: {
        type: ViewportType.VOLUME_3D,
        defaultOptions: {},
      },
      MPR: {
        type: ViewportType.STACK, // 临时使用STACK，直到MPR支持完善
        defaultOptions: {},
      },
      STACK: {
        type: ViewportType.STACK,
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

      // 验证所有视口配置的元素是否有效
      for (const config of viewportConfigs) {
        if (!config.element) {
          throw new Error(`视口 ${config.viewportId} 的 DOM 元素为空`);
        }
        if (!document.contains(config.element)) {
          throw new Error(`视口 ${config.viewportId} 的 DOM 元素未挂载到文档中`);
        }
        console.log(`验证视口 ${config.viewportId} 的元素:`, config.element);
      }

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

      // 确保图像索引在有效范围内
      const validImageIndex = Math.max(0, Math.min(imageIndex, imageIds.length - 1));

      if (viewport.type === ViewportType.STACK) {
        // 对于堆栈视口，设置图像堆栈
        await viewport.setStack(imageIds, validImageIndex);

        // 设置初始图像
        if (imageIds.length > 0) {
          viewport.setImageIdIndex(validImageIndex);
        }
      } else if (viewport.type === ViewportType.ORTHOGRAPHIC) {
        // 对于正交视口（MPR），需要设置体积数据
        console.log(`正交视口 ${viewportId} 需要体积数据，当前使用堆栈模式`);
        // 临时使用堆栈模式，直到体积数据准备好
        await viewport.setStack?.(imageIds, validImageIndex);
      } else {
        // 对于其他类型的视口
        console.warn(`视口类型 ${viewport.type} 的图像加载方式需要特殊处理`);
        // 尝试作为堆栈处理
        if (viewport.setStack) {
          await viewport.setStack(imageIds, validImageIndex);
        }
      }

      // 渲染视口
      viewport.render();
      console.log(`视口 ${viewportId} 图像加载完成，当前图像索引: ${validImageIndex}`);

      // 图像加载完成后，确保工具组激活
      const toolGroupId = 'multiViewToolGroup';
      if (this.toolGroups[toolGroupId]) {
        // 延迟激活工具，确保视口完全准备好
        setTimeout(() => {
          this.activateTools(toolGroupId);
        }, 100);
      }
    } catch (error) {
      console.error(`视口 ${viewportId} 图像加载失败:`, error);
      throw error;
    }
  }

  // 为所有视口加载相同的图像堆栈
  async loadImageStackToAllViewports(imageIds, imageIndex = 0) {
    if (!imageIds || imageIds.length === 0) {
      console.warn('没有提供图像ID');
      return;
    }

    const viewportIds = Object.keys(this.viewports);
    if (viewportIds.length === 0) {
      console.warn('没有可用的视口');
      return;
    }

    console.log(`开始为 ${viewportIds.length} 个视口加载图像`);

    // 串行加载，避免并发问题
    for (const viewportId of viewportIds) {
      try {
        await this.loadImageStack(viewportId, imageIds, imageIndex);
      } catch (error) {
        console.error(`视口 ${viewportId} 图像加载失败:`, error);
        // 继续加载其他视口，不中断整个过程
      }
    }

    console.log('所有视口图像加载操作完成');
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
