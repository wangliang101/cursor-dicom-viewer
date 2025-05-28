import useDicomStore from '../index';
import { useCallback } from 'react';

// 查看器设置hook
export const useViewerSettings = () => {
  const viewerSettings = useDicomStore((state) => state.viewerSettings);
  const toolSettings = useDicomStore((state) => state.toolSettings);

  const updateViewerSettings = useDicomStore((state) => state.updateViewerSettings);
  const resetViewerSettings = useDicomStore((state) => state.resetViewerSettings);
  const updateToolSettings = useDicomStore((state) => state.updateToolSettings);

  return {
    settings: viewerSettings,
    toolSettings,
    updateSettings: updateViewerSettings,
    resetSettings: resetViewerSettings,
    updateToolSettings,
  };
};

// 窗宽窗位hook
export const useWindowLevel = () => {
  const { windowWidth, windowCenter } = useDicomStore((state) => state.viewerSettings);
  const setWindowLevel = useDicomStore((state) => state.setWindowLevel);
  const applyPreset = useDicomStore((state) => state.applyPreset);

  const adjustWindowLevel = useCallback(
    (deltaWidth, deltaCenter) => {
      setWindowLevel(windowWidth + deltaWidth, windowCenter + deltaCenter);
    },
    [windowWidth, windowCenter, setWindowLevel]
  );

  return {
    windowWidth,
    windowCenter,
    setWindowLevel,
    adjustWindowLevel,
    applyPreset,

    // 常用预设
    presets: {
      chest: () => applyPreset('chest'),
      abdomen: () => applyPreset('abdomen'),
      bone: () => applyPreset('bone'),
      brain: () => applyPreset('brain'),
      lung: () => applyPreset('lung'),
    },
  };
};

// 缩放和平移hook
export const useViewportTransform = () => {
  const { zoom, pan, rotation } = useDicomStore((state) => state.viewerSettings);
  const { zoom: zoomSettings } = useDicomStore((state) => state.toolSettings);

  const setZoom = useDicomStore((state) => state.setZoom);
  const setPan = useDicomStore((state) => state.setPan);
  const setRotation = useDicomStore((state) => state.setRotation);

  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoomSettings.maxZoom, zoom * 1.2);
    setZoom(newZoom);
  }, [zoom, zoomSettings.maxZoom, setZoom]);

  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoomSettings.minZoom, zoom / 1.2);
    setZoom(newZoom);
  }, [zoom, zoomSettings.minZoom, setZoom]);

  const resetZoom = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  const resetPan = useCallback(() => {
    setPan({ x: 0, y: 0 });
  }, [setPan]);

  const resetRotation = useCallback(() => {
    setRotation(0);
  }, [setRotation]);

  const resetTransform = useCallback(() => {
    resetZoom();
    resetPan();
    resetRotation();
  }, [resetZoom, resetPan, resetRotation]);

  const panBy = useCallback(
    (deltaX, deltaY) => {
      setPan({ x: pan.x + deltaX, y: pan.y + deltaY });
    },
    [pan, setPan]
  );

  const rotateBy = useCallback(
    (deltaRotation) => {
      setRotation((rotation + deltaRotation) % 360);
    },
    [rotation, setRotation]
  );

  return {
    // 状态
    zoom,
    pan,
    rotation,
    zoomSettings,

    // 基础操作
    setZoom,
    setPan,
    setRotation,

    // 便捷操作
    zoomIn,
    zoomOut,
    resetZoom,
    resetPan,
    resetRotation,
    resetTransform,
    panBy,
    rotateBy,

    // 计算属性
    canZoomIn: zoom < zoomSettings.maxZoom,
    canZoomOut: zoom > zoomSettings.minZoom,
    isDefaultZoom: zoom === 1,
    isDefaultPan: pan.x === 0 && pan.y === 0,
    isDefaultRotation: rotation === 0,
  };
};

// 图像效果hook
export const useImageEffects = () => {
  const { invert, brightness, contrast, interpolation } = useDicomStore(
    (state) => state.viewerSettings
  );
  const updateViewerSettings = useDicomStore((state) => state.updateViewerSettings);
  const toggleInvert = useDicomStore((state) => state.toggleInvert);

  const setBrightness = useCallback(
    (brightness) => {
      updateViewerSettings({ brightness });
    },
    [updateViewerSettings]
  );

  const setContrast = useCallback(
    (contrast) => {
      updateViewerSettings({ contrast });
    },
    [updateViewerSettings]
  );

  const setInterpolation = useCallback(
    (interpolation) => {
      updateViewerSettings({ interpolation });
    },
    [updateViewerSettings]
  );

  const resetEffects = useCallback(() => {
    updateViewerSettings({
      invert: false,
      brightness: 0,
      contrast: 0,
      interpolation: 'linear',
    });
  }, [updateViewerSettings]);

  return {
    // 状态
    invert,
    brightness,
    contrast,
    interpolation,

    // 操作
    toggleInvert,
    setBrightness,
    setContrast,
    setInterpolation,
    resetEffects,

    // 计算属性
    hasEffects: invert || brightness !== 0 || contrast !== 0 || interpolation !== 'linear',
  };
};

// 查看器工具hook
export const useViewerTools = () => {
  const currentTool = useDicomStore((state) => state.ui.currentTool);
  const setCurrentTool = useDicomStore((state) => state.setCurrentTool);

  const tools = [
    { id: 'windowLevel', name: '窗宽窗位', icon: 'contrast' },
    { id: 'zoom', name: '缩放', icon: 'zoom-in' },
    { id: 'pan', name: '平移', icon: 'move' },
    { id: 'rotate', name: '旋转', icon: 'rotate-right' },
    { id: 'measure', name: '测量', icon: 'ruler' },
    { id: 'annotate', name: '标注', icon: 'edit' },
  ];

  const selectTool = useCallback(
    (toolId) => {
      setCurrentTool(toolId);
    },
    [setCurrentTool]
  );

  return {
    currentTool,
    tools,
    selectTool,
    isToolActive: (toolId) => currentTool === toolId,
  };
};
