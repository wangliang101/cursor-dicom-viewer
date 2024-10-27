import { Outlet } from 'react-router-dom';
import { Layout as AntdLayout } from 'antd';
import styles from './index.module.less';

const { Header, Content } = AntdLayout;

function Layout() {
  return (
    <AntdLayout className={styles.layout}>
      <Header className={styles.header}>DICOM阅片系统</Header>
      <Content className={styles.content}>
        <Outlet />
      </Content>
    </AntdLayout>
  );
}

export default Layout;