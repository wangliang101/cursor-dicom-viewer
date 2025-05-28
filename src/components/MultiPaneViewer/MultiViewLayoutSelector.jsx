import { useState, useMemo } from 'react';
import { Button, Dropdown, Tooltip, Tag } from 'antd';
import { BranchesOutlined, DownOutlined } from '@ant-design/icons';
import { MULTI_VIEW_LAYOUTS, VIEW_CONFIGS, LAYOUT_CONFIGS } from '../../constants';
import styles from './MultiViewLayoutSelector.module.less';

const MultiViewLayoutSelector = ({
  currentMultiViewLayout,
  onMultiViewLayoutChange,
  disabled = false,
  currentLayout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 计算与当前布局兼容的多视图选项
  const compatibleLayouts = useMemo(() => {
    if (!currentLayout || !LAYOUT_CONFIGS[currentLayout]) {
      return [];
    }

    const currentLayoutConfig = LAYOUT_CONFIGS[currentLayout];
    const currentPaneCount = currentLayoutConfig.panes.length;

    return Object.entries(MULTI_VIEW_LAYOUTS).filter(([, config]) => {
      // 检查视图数量是否匹配窗格数量
      return config.views.length <= currentPaneCount;
    });
  }, [currentLayout]);

  // 生成多视图预览
  const generateMultiViewPreview = (layoutKey) => {
    const config = MULTI_VIEW_LAYOUTS[layoutKey];
    if (!config) return null;

    return (
      <div className={styles.multiViewPreview}>
        {config.views.map((viewType, index) => {
          const viewConfig = VIEW_CONFIGS[viewType];
          return (
            <Tag key={index} color={viewConfig.color} size="small" className={styles.viewTag}>
              {viewConfig.name.slice(0, 2)}
            </Tag>
          );
        })}
      </div>
    );
  };

  // 生成下拉菜单项
  const menuItems = [
    {
      key: 'none',
      label: (
        <div className={styles.layoutOption}>
          <div className={styles.multiViewPreview}>
            <Tag size="small" color="default">
              默认
            </Tag>
          </div>
          <div className={styles.layoutInfo}>
            <span className={styles.layoutName}>单一视图</span>
            <span className={styles.layoutDesc}>所有窗格显示轴位视图</span>
          </div>
        </div>
      ),
      onClick: () => handleLayoutSelect(null),
    },
    ...compatibleLayouts.map(([key, config]) => ({
      key,
      label: (
        <div className={styles.layoutOption}>
          {generateMultiViewPreview(key)}
          <div className={styles.layoutInfo}>
            <span className={styles.layoutName}>{config.name}</span>
            <span className={styles.layoutDesc}>
              {config.description} (需要 {config.views.length} 个窗格)
            </span>
          </div>
        </div>
      ),
      onClick: () => handleLayoutSelect(key),
    })),
  ];

  const handleLayoutSelect = (layoutKey) => {
    // 验证布局兼容性
    if (layoutKey && currentLayout) {
      const config = MULTI_VIEW_LAYOUTS[layoutKey];
      const layoutConfig = LAYOUT_CONFIGS[currentLayout];

      if (config && layoutConfig && config.views.length > layoutConfig.panes.length) {
        console.warn(
          `视图类型 "${config.name}" 需要 ${config.views.length} 个窗格，但当前布局 "${currentLayout}" 只有 ${layoutConfig.panes.length} 个窗格`
        );
        return;
      }
    }

    onMultiViewLayoutChange?.(layoutKey);
    setIsOpen(false);
  };

  const getCurrentDisplayName = () => {
    if (!currentMultiViewLayout) {
      return '单一视图';
    }
    return MULTI_VIEW_LAYOUTS[currentMultiViewLayout]?.name || '多视图';
  };

  // 如果没有兼容的布局选项，禁用组件
  const isDisabled = disabled || compatibleLayouts.length === 0;

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={isDisabled}
      placement="bottomLeft"
      overlayClassName={styles.multiViewDropdown}
    >
      <Tooltip
        title={
          isDisabled && compatibleLayouts.length === 0
            ? '当前布局没有可用的多视图选项'
            : '切换视图类型模式 (轴位、矢状位、冠状位等)'
        }
        placement="bottom"
      >
        <Button
          type="text"
          icon={<BranchesOutlined />}
          className={styles.multiViewButton}
          disabled={isDisabled}
        >
          <span className={styles.layoutText}>{getCurrentDisplayName()}</span>
          <DownOutlined className={styles.dropdownIcon} />
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

export default MultiViewLayoutSelector;
