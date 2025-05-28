/**
 * DICOM查看器相关常量
 */

// 预设窗宽窗位值
export const WINDOW_PRESETS = {
  lung: { width: 1500, center: -600, name: '肺窗' },
  abdomen: { width: 400, center: 50, name: '腹部窗' },
  brain: { width: 80, center: 40, name: '脑窗' },
  bone: { width: 2000, center: 300, name: '骨窗' },
  mediastinum: { width: 350, center: 50, name: '纵隔窗' },
  liver: { width: 150, center: 30, name: '肝脏窗' },
  custom: { width: 400, center: 40, name: '自定义' },
};

// 工具名称常量
export const TOOL_NAMES = {
  WINDOW_LEVEL: 'WindowLevel',
  ZOOM: 'Zoom',
  PAN: 'Pan',
  STACK_SCROLL: 'StackScroll',
  LENGTH: 'Length',
  ANGLE: 'Angle',
  RECTANGLE_ROI: 'RectangleROI',
  CIRCLE_ROI: 'CircleROI',
  ELLIPTICAL_ROI: 'EllipticalROI',
  BIDIRECTIONAL: 'Bidirectional',
  PROBE: 'Probe',
  CROSSHAIRS: 'Crosshairs',
};

// 默认设置
export const DEFAULT_SETTINGS = {
  FRAMES_PER_SECOND: 10,
  ZOOM_FACTOR: 1.2,
  WINDOW_WIDTH: 400,
  WINDOW_CENTER: 40,
};

// 图像变换类型
export const TRANSFORM_TYPES = {
  FLIP_HORIZONTAL: 'flipH',
  FLIP_VERTICAL: 'flipV',
  ROTATE_90: 90,
  ROTATE_270: -90,
  INVERT: 'invert',
  RESET: 'reset',
};

// 播放状态
export const PLAYBACK_STATES = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
};
