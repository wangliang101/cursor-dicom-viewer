/**
 * 视图类型常量定义
 * 包括轴位、MPR和VR视图类型
 */

// 视图类型枚举
export const VIEW_TYPES = {
  AXIAL: 'AXIAL',
  SAGITTAL: 'SAGITTAL',
  CORONAL: 'CORONAL',
  VR: 'VR',
  MPR: 'MPR',
  STACK: 'STACK',
};

// 视图配置
export const VIEW_CONFIGS = {
  [VIEW_TYPES.AXIAL]: {
    name: '轴位',
    description: '横断面视图（从头顶向下看）',
    color: '#52c41a',
    orientation: 'axial',
    icon: '⊥',
  },
  [VIEW_TYPES.SAGITTAL]: {
    name: '矢状位',
    description: '矢状面视图（从侧面看）',
    color: '#1890ff',
    orientation: 'sagittal',
    icon: '⊢',
  },
  [VIEW_TYPES.CORONAL]: {
    name: '冠状位',
    description: '冠状面视图（从前面看）',
    color: '#722ed1',
    orientation: 'coronal',
    icon: '⊡',
  },
  [VIEW_TYPES.VR]: {
    name: '体绘制',
    description: '3D体积渲染',
    color: '#fa541c',
    orientation: 'volume',
    icon: '◊',
  },
  [VIEW_TYPES.MPR]: {
    name: 'MPR',
    description: '多平面重建',
    color: '#13c2c2',
    orientation: 'mpr',
    icon: '⧈',
  },
  [VIEW_TYPES.STACK]: {
    name: '堆栈',
    description: '2D图像堆栈视图',
    color: '#666666',
    orientation: 'stack',
    icon: '≡',
  },
};

// 多视图布局配置
export const MULTI_VIEW_LAYOUTS = {
  singleView: {
    name: '单一视图',
    description: '所有窗格显示轴位视图',
    views: [VIEW_TYPES.AXIAL],
    minPanes: 1,
  },
  threeView: {
    name: '三平面视图',
    description: '轴位、矢状位、冠状位',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL],
    minPanes: 3,
  },
  fourView: {
    name: '四视图+VR',
    description: '三平面视图 + 体绘制',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL, VIEW_TYPES.VR],
    minPanes: 4,
  },
  mprFourView: {
    name: 'MPR四视图',
    description: '多平面重建四视图',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL, VIEW_TYPES.MPR],
    minPanes: 4,
  },
  vrComparison: {
    name: 'VR对比视图',
    description: '轴位视图与体绘制对比',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.VR],
    minPanes: 2,
  },
  mprSixView: {
    name: 'MPR六视图',
    description: '完整的多平面重建视图',
    views: [
      VIEW_TYPES.AXIAL,
      VIEW_TYPES.SAGITTAL,
      VIEW_TYPES.CORONAL,
      VIEW_TYPES.VR,
      VIEW_TYPES.MPR,
      VIEW_TYPES.STACK,
    ],
    minPanes: 6,
  },
};

// 默认视图类型
export const DEFAULT_VIEW_TYPE = VIEW_TYPES.AXIAL;

/**
 * 获取视图配置
 */
export const getViewConfig = (viewType) => {
  return VIEW_CONFIGS[viewType] || VIEW_CONFIGS[VIEW_TYPES.AXIAL];
};

/**
 * 获取兼容的多视图布局
 */
export const getCompatibleMultiViewLayouts = (paneCount) => {
  return Object.entries(MULTI_VIEW_LAYOUTS).filter(([, config]) => {
    return config.views.length <= paneCount;
  });
};
