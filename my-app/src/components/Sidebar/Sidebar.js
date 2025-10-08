import React from 'react';
import { Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <Menu mode="inline" defaultSelectedKeys={['/cari-hesaplar']} style={{ height: '100%', borderRight: 0 }}>
    <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="Cari">
      <Menu.Item key="/cari-hesaplar">
        <Link to="/cari-hesaplar">Cari Hesaplar</Link>
      </Menu.Item>
      <Menu.Item key="/cari-grup-tanimlari">
        <Link to="/cari-grup-tanimlari">Cari Grup Tanımları</Link>
      </Menu.Item>
      <Menu.Item key="/teklifler">
        <Link to="/teklifler">Teklifler</Link>
      </Menu.Item>
      <Menu.Item key="/personeller">
        <Link to="/personeller">Personeller</Link>
      </Menu.Item>
      <Menu.Item key="/kullanici-tipleri">
        <Link to="/kullanici-tipleri">Kullanıcı Tipleri</Link>
      </Menu.Item>
      <Menu.Item key="/firmalar">
        <Link to="/firmalar">Firmalar</Link>
      </Menu.Item>
    </Menu.SubMenu>
  </Menu>
);

export default Sidebar; 