import { useState } from 'react';
import { Button, Dropdown, Tooltip, Tag } from 'antd';
import { BranchesOutlined, DownOutlined } from '@ant-design/icons';
import { MULTI_VIEW_LAYOUTS, VIEW_CONFIGS } from '../../constants';
import styles from './MultiViewLayoutSelector.module.less';

const MultiViewLayoutSelector = ({
  currentMultiViewLayout,
  onMultiViewLayoutChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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
    ...Object.entries(MULTI_VIEW_LAYOUTS).map(([key, config]) => ({
      key,
      label: (
        <div className={styles.layoutOption}>
          {generateMultiViewPreview(key)}
          <div className={styles.layoutInfo}>
            <span className={styles.layoutName}>{config.name}</span>
            <span className={styles.layoutDesc}>{config.description}</span>
          </div>
        </div>
      ),
      onClick: () => handleLayoutSelect(key),
    })),
  ];

  const handleLayoutSelect = (layoutKey) => {
    onMultiViewLayoutChange?.(layoutKey);
    setIsOpen(false);
  };

  const getCurrentDisplayName = () => {
    if (!currentMultiViewLayout) {
      return '单一视图';
    }
    return MULTI_VIEW_LAYOUTS[currentMultiViewLayout]?.name || '多视图';
  };

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      open={isOpen}
      onOpenChange={setIsOpen}
      disabled={disabled}
      placement="bottomLeft"
      overlayClassName={styles.multiViewDropdown}
    >
      <Tooltip title="切换多视图模式" placement="bottom">
        <Button
          type="text"
          icon={<BranchesOutlined />}
          className={styles.multiViewButton}
          disabled={disabled}
        >
          <span className={styles.layoutText}>{getCurrentDisplayName()}</span>
          <DownOutlined className={styles.dropdownIcon} />
        </Button>
      </Tooltip>
    </Dropdown>
  );
};

export default MultiViewLayoutSelector;
