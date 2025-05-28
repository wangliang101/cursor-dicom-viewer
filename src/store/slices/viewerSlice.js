// 查看器设置管理slice
export const createViewerSlice = (set) => ({
  // 查看器设置
  viewerSettings: {
    windowWidth: 400,
    windowCenter: 200,
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
    invert: false,
    interpolation: 'linear',
    brightness: 0,
    contrast: 0,
  },

  // 多视图布局设置
  multiViewLayout: null, // 当前多视图布局类型

  // 工具设置
  toolSettings: {
    windowLevel: {
      sensitivity: 1,
      dragMode: 'both', // 'width', 'center', 'both'
    },
    zoom: {
      sensitivity: 1,
      minZoom: 0.1,
      maxZoom: 10,
    },
    pan: {
      sensitivity: 1,
    },
  },

  // Actions
  updateViewerSettings: (newSettings) =>
    set(
      (state) => ({
        viewerSettings: { ...state.viewerSettings, ...newSettings },
      }),
      false,
      'updateViewerSettings'
    ),

  resetViewerSettings: () =>
    set(
      () => ({
        viewerSettings: {
          windowWidth: 400,
          windowCenter: 200,
          zoom: 1,
          pan: { x: 0, y: 0 },
          rotation: 0,
          invert: false,
          interpolation: 'linear',
          brightness: 0,
          contrast: 0,
        },
      }),
      false,
      'resetViewerSettings'
    ),

  setZoom: (zoom) =>
    set(
      (state) => ({
        viewerSettings: {
          ...state.viewerSettings,
          zoom: Math.max(
            state.toolSettings.zoom.minZoom,
            Math.min(state.toolSettings.zoom.maxZoom, zoom)
          ),
        },
      }),
      false,
      'setZoom'
    ),

  setPan: (pan) =>
    set(
      (state) => ({
        viewerSettings: { ...state.viewerSettings, pan },
      }),
      false,
      'setPan'
    ),

  setWindowLevel: (windowWidth, windowCenter) =>
    set(
      (state) => ({
        viewerSettings: {
          ...state.viewerSettings,
          windowWidth,
          windowCenter,
        },
      }),
      false,
      'setWindowLevel'
    ),

  setRotation: (rotation) =>
    set(
      (state) => ({
        viewerSettings: { ...state.viewerSettings, rotation },
      }),
      false,
      'setRotation'
    ),

  toggleInvert: () =>
    set(
      (state) => ({
        viewerSettings: {
          ...state.viewerSettings,
          invert: !state.viewerSettings.invert,
        },
      }),
      false,
      'toggleInvert'
    ),

  updateToolSettings: (tool, settings) =>
    set(
      (state) => ({
        toolSettings: {
          ...state.toolSettings,
          [tool]: { ...state.toolSettings[tool], ...settings },
        },
      }),
      false,
      'updateToolSettings'
    ),

  // 多视图布局操作
  setMultiViewLayout: (layout) =>
    set(
      () => ({
        multiViewLayout: layout,
      }),
      false,
      'setMultiViewLayout'
    ),

  // 预设操作
  applyPreset: (presetName) => {
    const presets = {
      chest: { windowWidth: 1500, windowCenter: -600 },
      abdomen: { windowWidth: 400, windowCenter: 50 },
      bone: { windowWidth: 1800, windowCenter: 400 },
      brain: { windowWidth: 100, windowCenter: 50 },
      lung: { windowWidth: 1400, windowCenter: -500 },
    };

    const preset = presets[presetName];
    if (preset) {
      set(
        (state) => ({
          viewerSettings: { ...state.viewerSettings, ...preset },
        }),
        false,
        `applyPreset_${presetName}`
      );
    }
  },
});
