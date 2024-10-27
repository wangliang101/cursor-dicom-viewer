import * as cornerstoneTools from '@cornerstonejs/tools';

const {
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollMouseWheelTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { MouseBindings } = csToolsEnums;

export const initializeTools = (element, viewportId, renderingEngineId) => {
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

  return toolGroup;
};

export const setActiveTool = (toolGroup, toolName) => {
  if (toolGroup) {
    toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
    });
  }
};

export const tools = {
  WindowLevel: WindowLevelTool.toolName,
  Pan: PanTool.toolName,
  Zoom: ZoomTool.toolName,
  StackScroll: StackScrollMouseWheelTool.toolName,
};