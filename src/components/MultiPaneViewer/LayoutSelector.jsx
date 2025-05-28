import { useState } from 'react';
import { Button, Dropdown, Tooltip } from 'antd';
import { AppstoreOutlined, DownOutlined } from '@ant-design/icons';
import { LAYOUT_CONFIGS, DEFAULT_LAYOUT } from '../../constants';
import styles from './LayoutSelector.module.less';

const LayoutSelector = ({ currentLayout = DEFAULT_LAYOUT, onLayoutChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 生成布局预览图标
  const generateLayoutIcon = (layoutKey) => {
    const config = LAYOUT_CONFIGS[layoutKey];
    if (!config) return null;

    const { rows, cols } = config;
    // 移除未使用的变量
    // const cellSize = 12 / Math.max(rows, cols);

    return (
      <div className={styles.layoutIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24">
          {config.panes.map((pane, index) => {
            const x = (pane.col * 24) / cols;
            const y = (pane.row * 24) / rows;
            const width = (pane.colSpan * 24) / cols - 1;
            const height = (pane.rowSpan * 24) / rows - 1;

            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={currentLayout === layoutKey ? '#1890ff' : '#d9d9d9'}
                stroke="#fff"
                strokeWidth="0.5"
                rx="1"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // 生成下拉菜单项
  const menuItems = Object.entries(LAYOUT_CONFIGS).map(([key, config]) => ({
    key,
    label: (
      <div className={styles.layoutOption}>
        {generateLayoutIcon(key)}
        <span className={styles.layoutName}>{config.name}</span>
        <span className={styles.layoutDesc}>({key})</span>
      </div>
    ),
    onClick: () => handleLayoutSelect(key),
  }));

  const handleLayoutSelect = (layoutKey) => {
    onLayoutChange?.(layoutKey);
    setIsOpen(false);
  };

  const currentConfig = LAYOUT_CONFIGS[currentLayout];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
      placement="bottomLeft"
      overlayClassName={styles.layoutDropdown}
    >
      <Tooltip title="切换窗格布局 (窗格数量和排列方式)" placement="bottom">
        <Button
          type="text"
          icon={<AppstoreOutlined />}
          className={styles.layoutButton}
          disabled={disabled}
        >
          <span className={styles.layoutText}>{currentConfig?.name || '窗格布局'}</span>
          <DownOutlined className={styles.dropdownIcon} />
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

export default LayoutSelector;
