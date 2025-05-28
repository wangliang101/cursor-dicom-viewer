/**
 * 多窗格查看器布局配置常量
 */

// 预定义的布局配置
export const LAYOUT_CONFIGS = {
  '1x1': {
    name: '单窗格',
    rows: 1,
    cols: 1,
    panes: [{ row: 0, col: 0, rowSpan: 1, colSpan: 1 }],
  },
  '1x2': {
    name: '1行2列',
    rows: 1,
    cols: 2,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  '2x1': {
    name: '2行1列',
    rows: 2,
    cols: 1,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
    ],
  },
  '2x2': {
    name: '2行2列',
    rows: 2,
    cols: 2,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
  '3x1': {
    name: '3行1列',
    rows: 3,
    cols: 1,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 2, col: 0, rowSpan: 1, colSpan: 1 },
    ],
  },
  '1x3': {
    name: '1行3列',
    rows: 1,
    cols: 3,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  '2x3': {
    name: '2行3列',
    rows: 2,
    cols: 3,
    panes: [
      { row: 0, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 0, col: 2, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 0, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { row: 1, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
};

// 默认布局
export const DEFAULT_LAYOUT = '1x1';

// 布局类型枚举
export const LAYOUT_TYPES = {
  SINGLE: '1x1',
  HORIZONTAL_SPLIT: '1x2',
  VERTICAL_SPLIT: '2x1',
  QUAD: '2x2',
  TRIPLE_VERTICAL: '3x1',
  TRIPLE_HORIZONTAL: '1x3',
  SIX_PANE: '2x3',
};

// 窗格状态常量
export const PANE_STATES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOADING: 'loading',
  ERROR: 'error',
};
