import React from 'react';
import {Menu} from 'antd';
import {
    UserOutlined,
    HomeOutlined,
    ToolOutlined,
    TeamOutlined,
    TagsOutlined,
    FileTextOutlined,
    IdcardOutlined,
    SafetyOutlined,
    BankOutlined,
    ProjectOutlined,
    ApartmentOutlined,
    AppstoreOutlined,
    SettingOutlined
} from '@ant-design/icons';
import {Link} from 'react-router-dom';

const Sidebar = () => (
    <Menu mode="inline" defaultSelectedKeys={['/cari-hesaplar']} defaultOpenKeys={['sub1']}
          style={{height: '100%', borderRight: 0}}>
        {/* defaultOpenKeys={['sub1']}  buraya yazdıgın acık oluyor default olarak  */}
        <Menu.SubMenu key="sub1" icon={<UserOutlined/>} title="Cari">
            <Menu.Item key="/cari-hesaplar" icon={<TeamOutlined/>}>
                <Link to="/cari-hesaplar">Cari Hesaplar</Link>
            </Menu.Item>
            <Menu.Item key="/cari-grup-tanimlari" icon={<TagsOutlined/>}>
                <Link to="/cari-grup-tanimlari">Cari Grup Tanımları</Link>
            </Menu.Item>
            <Menu.Item key="/teklifler" icon={<FileTextOutlined/>}>
                <Link to="/teklifler">Teklifler</Link>
            </Menu.Item>
            <Menu.Item key="/personeller" icon={<IdcardOutlined/>}>
                <Link to="/personeller">Personeller</Link>
            </Menu.Item>
            <Menu.Item key="/kullanici-tipleri" icon={<SafetyOutlined/>}>
                <Link to="/kullanici-tipleri">Kullanıcı Tipleri</Link>
            </Menu.Item>
            <Menu.Item key="/firmalar" icon={<BankOutlined/>}>
                <Link to="/firmalar">Firmalar</Link>
            </Menu.Item>
            <Menu.Item key="/projeler" icon={<ProjectOutlined/>}>
                <Link to="/projeler">Projeler</Link>
            </Menu.Item>
            <Menu.SubMenu key="sub2" icon={<HomeOutlined/>} title="Site Yönetimi">
                <Menu.Item key="/sites" icon={<BankOutlined/>}>
                    <Link to="/sites">Site</Link>
                </Menu.Item>
                <Menu.Item key="/squares" icon={<AppstoreOutlined/>}>
                    <Link to="/squares">Ada</Link>
                </Menu.Item>
                <Menu.Item key="/blocks" icon={<ApartmentOutlined/>}>
                    <Link to="/blocks">Blok</Link>
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="sub3" icon={<ToolOutlined/>} title="Teknik Servis">
                <Menu.Item key="/sistemler" icon={<SettingOutlined/>}>
                    <Link to="/sistemler">Sistemler</Link>
                </Menu.Item>
                <Menu.Item key="/urun-envanter-kategoriler" icon={<AppstoreOutlined/>}>
                    <Link to="/urun-envanter-kategoriler">Ürün Envanter Kategorileri</Link>
                </Menu.Item>
                <Menu.Item key="/urun-envanter-listesi" icon={<TagsOutlined/>}>
                    <Link to="/urun-envanter-listesi">Ürün Envanter Listesi</Link>
                </Menu.Item>
                <Menu.Item key="/site-cihaz-envanteri" icon={<ApartmentOutlined/>}>
                    <Link to="/site-cihaz-envanteri">Site Cihaz Envanteri</Link>
                </Menu.Item>
            </Menu.SubMenu>
        </Menu.SubMenu>

    </Menu>
);

export default Sidebar;
