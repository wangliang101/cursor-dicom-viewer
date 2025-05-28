/**
 * 视图类型常量定义
 * 包括轴位、MPR和VR视图类型
 */

// 视图类型枚举
export const VIEW_TYPES = {
  AXIAL: 'axial',
  SAGITTAL: 'sagittal',
  CORONAL: 'coronal',
  MPR: 'mpr',
  VR: 'vr',
  OBLIQUE: 'oblique',
};

// 视图配置
export const VIEW_CONFIGS = {
  [VIEW_TYPES.AXIAL]: {
    name: '轴位视图',
    description: '水平横断面视图',
    orientation: 'axial',
    icon: 'axial',
    color: '#1890ff',
  },
  [VIEW_TYPES.SAGITTAL]: {
    name: '矢状位视图',
    description: '左右矢状面视图',
    orientation: 'sagittal',
    icon: 'sagittal',
    color: '#52c41a',
  },
  [VIEW_TYPES.CORONAL]: {
    name: '冠状位视图',
    description: '前后冠状面视图',
    orientation: 'coronal',
    icon: 'coronal',
    color: '#faad14',
  },
  [VIEW_TYPES.MPR]: {
    name: 'MPR视图',
    description: '多平面重建视图',
    orientation: 'mpr',
    icon: 'mpr',
    color: '#722ed1',
  },
  [VIEW_TYPES.VR]: {
    name: 'VR视图',
    description: '体绘制视图',
    orientation: 'vr',
    icon: 'vr',
    color: '#f5222d',
  },
  [VIEW_TYPES.OBLIQUE]: {
    name: '斜切视图',
    description: '任意角度切面视图',
    orientation: 'oblique',
    icon: 'oblique',
    color: '#13c2c2',
  },
};

// 多视图布局配置
export const MULTI_VIEW_LAYOUTS = {
  triplanar: {
    name: '三平面视图',
    description: '轴位、矢状位、冠状位同时显示',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL],
    layout: '1x3',
  },
  quad_with_vr: {
    name: '四视图+VR',
    description: '三平面视图加体绘制',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL, VIEW_TYPES.VR],
    layout: '2x2',
  },
  mpr_quad: {
    name: 'MPR四视图',
    description: '多平面重建四视图',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.SAGITTAL, VIEW_TYPES.CORONAL, VIEW_TYPES.MPR],
    layout: '2x2',
  },
  vr_comparison: {
    name: 'VR对比视图',
    description: '轴位视图与VR对比',
    views: [VIEW_TYPES.AXIAL, VIEW_TYPES.VR],
    layout: '1x2',
  },
};

// 默认视图类型
export const DEFAULT_VIEW_TYPE = VIEW_TYPES.AXIAL;
