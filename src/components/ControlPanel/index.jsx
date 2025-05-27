import { Button, Card, Tooltip, Empty } from 'antd';
import { RightOutlined, LeftOutlined, SettingOutlined, ToolOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const ControlPanel = ({ isCollapsed, onToggle }) => {
  return (
    <div className={`${styles.controlPanel} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <ToolOutlined className={styles.icon} />
          <span className={styles.title}>操控面板</span>
        </div>
        <Tooltip title={isCollapsed ? '展开面板' : '折叠面板'}>
          <Button
            type="text"
            icon={isCollapsed ? <LeftOutlined /> : <RightOutlined />}
            onClick={onToggle}
            className={styles.toggleBtn}
          />
        </Tooltip>
      </div>

      {!isCollapsed && (
        <div className={styles.content}>
          {/* 预留的功能区域 */}
          <Card className={styles.functionCard} bodyStyle={{ padding: '16px' }}>
            <div className={styles.comingSoon}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className={styles.emptyDescription}>
                    <p className={styles.emptyTitle}>功能开发中</p>
                    <p className={styles.emptySubtitle}>更多医学影像分析工具即将上线</p>
                  </div>
                }
              />
            </div>
          </Card>

          {/* 快速设置区域 */}
          <Card
            title={
              <div className={styles.cardTitle}>
                <SettingOutlined className={styles.cardIcon} />
                <span>快速设置</span>
              </div>
            }
            className={styles.settingsCard}
            bodyStyle={{ padding: '16px' }}
          >
            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>显示网格</span>
              <Button size="small" type="text" disabled>
                待开发
              </Button>
            </div>

            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>测量工具</span>
              <Button size="small" type="text" disabled>
                待开发
              </Button>
            </div>

            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>标注功能</span>
              <Button size="small" type="text" disabled>
                待开发
              </Button>
            </div>

            <div className={styles.settingItem}>
              <span className={styles.settingLabel}>图像对比</span>
              <Button size="small" type="text" disabled>
                待开发
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
