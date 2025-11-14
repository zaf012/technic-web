import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <Menu mode="inline" defaultSelectedKeys={['/cari-hesaplar']} defaultOpenKeys={['sub1']} style={{ height: '100%', borderRight: 0 }}>
    {/* defaultOpenKeys={['sub1']}  buraya yazdıgın acık oluyor default olarak  */}
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
      <Menu.Item key="/projeler">
        <Link to="/projeler">Projeler</Link>
      </Menu.Item>
      <Menu.Item key="/sistemler">
        <Link to="/sistemler">Sistemler</Link>
      </Menu.Item>
      <Menu.SubMenu key="sub2" icon={<HomeOutlined />} title="Siteler">
        <Menu.Item key="/sites">
          <Link to="/sites">Site</Link>
        </Menu.Item>
        <Menu.Item key="/blocks">
          <Link to="/blocks">Blok</Link>
        </Menu.Item>
        <Menu.Item key="/squares">
          <Link to="/squares">Ada</Link>
        </Menu.Item>
      </Menu.SubMenu>
    </Menu.SubMenu>
  </Menu>
);

export default Sidebar; 