import React from 'react';
import { Layout, Input, Avatar, Dropdown } from 'antd';
import Sidebar from './components/Sidebar/Sidebar';
import { UserOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const userMenu = (
  <div>
    <div style={{ padding: 8 }}>Profil</div>
    <div style={{ padding: 8 }}>Çıkış Yap</div>
  </div>
);

const AppLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <Sider width={300} style={{ background: '#fff' }}>
      <div style={{ height: 64, margin: 16, textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>
        ataylar
      </div>
      <Sidebar />
    </Sider>
    <Layout>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Input.Search placeholder="Search" style={{ width: 200 }} />
        </div>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        </Dropdown>
      </Header>
      <Content style={{ margin: '24px 16px 0', background: '#fff', minHeight: 280 }}>
        {children}
      </Content>
    </Layout>
  </Layout>
);

export default AppLayout;
