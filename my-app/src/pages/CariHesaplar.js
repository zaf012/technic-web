import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Radio} from 'antd';
import axios from 'axios';
import config from '../config';

const CariHesaplar = () => {
    const [data, setData] = useState([]);
    const [cariGroups, setCariGroups] = useState([]);
    const [sites, setSites] = useState([]);
    const [firms, setFirms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
        fetchGroups();
        fetchSites();
        fetchFirms();
        fetchProjects();
        fetchUserTypes();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/instant-groups/get-all-groups`);
            if (response.data && response.data.data) {
                setCariGroups(response.data.data);
            } else {
                setCariGroups([]);
            }
        } catch (error) {
            message.error('Gruplar alınırken hata oluştu!');
            setCariGroups([]);
        }
    };

    const fetchSites = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/sites/get-all`);
            if (response.data && response.data.data) {
                setSites(response.data.data);
            } else {
                setSites([]);
            }
        } catch (error) {
            message.error('Siteler alınırken hata oluştu!');
            setSites([]);
        }
    };

    const fetchFirms = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/firms/get-all`);
            if (response.data && response.data.data) {
                setFirms(response.data.data);
            } else {
                setFirms([]);
            }
        } catch (error) {
            message.error('Firmalar alınırken hata oluştu!');
            setFirms([]);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/projects/get-all`);
            if (response.data && response.data.data) {
                setProjects(response.data.data);
            } else {
                setProjects([]);
            }
        } catch (error) {
            message.error('Projeler alınırken hata oluştu!');
            setProjects([]);
        }
    };

    const fetchUserTypes = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/user-types/get-all`);
            if (response.data && response.data.data) {
                setUserTypes(response.data.data);
            } else {
                setUserTypes([]);
            }
        } catch (error) {
            message.error('Kullanıcı tipleri alınırken hata oluştu!');
            setUserTypes([]);
        }
    };

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/instant-accounts/active`);
            if (response.data && response.data.data) {
                // API'den dönen id veya uygun bir alanı key olarak kullan
                setData(response.data.data.map(item => ({...item, key: item.id || item.key || item.email})));
            } else {
                setData([]);
            }
        } catch (error) {
            message.error('Hesaplar alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
        if (record) {
            form.setFieldsValue(record);
        } else {
            form.resetFields();
            form.setFieldsValue({
                phoneCountryCode: '+90',
                gsmCountryCode: '+90'
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            // ID'lere karşılık gelen name'leri ekle
            const enrichedValues = {...values};

            // userTypeId için userTypeName ekle
            if (values.userTypeId) {
                const selectedUserType = userTypes.find(ut => ut.id === values.userTypeId);
                if (selectedUserType) {
                    enrichedValues.userTypeName = selectedUserType.userTypeName;
                }
            }

            // accountGroupId için accountGroupName ekle
            if (values.accountGroupId) {
                const selectedGroup = cariGroups.find(g => g.id === values.accountGroupId);
                if (selectedGroup) {
                    enrichedValues.accountGroupName = selectedGroup.groupName;
                }
            }

            // siteId için siteName ekle
            if (values.siteId) {
                const selectedSite = sites.find(s => s.id === values.siteId);
                if (selectedSite) {
                    enrichedValues.siteName = selectedSite.siteName;
                }
            }

            // firmId için firmName ekle
            if (values.firmId) {
                const selectedFirm = firms.find(f => f.id === values.firmId);
                if (selectedFirm) {
                    enrichedValues.firmName = selectedFirm.firmName;
                }
            }

            // projectId için projectName ekle
            if (values.projectId) {
                const selectedProject = projects.find(p => p.id === values.projectId);
                if (selectedProject) {
                    enrichedValues.projectName = selectedProject.projectName;
                }
            }

            if (editingRecord) {
                // Güncelleme işlemi (PUT)
                try {
                    await axios.put(`${config.apiUrl}/instant-accounts/${editingRecord.key}`, enrichedValues);
                    message.success('Hesap başarıyla güncellendi!');
                    fetchAccounts();
                } catch (error) {
                    message.error('Güncelleme işlemi başarısız!');
                }
            } else {
                // Ekleme işlemi (POST)
                try {
                    await axios.post(`${config.apiUrl}/instant-accounts`, enrichedValues);
                    message.success('Hesap başarıyla eklendi!');
                    fetchAccounts();
                } catch (error) {
                    message.error('Ekleme işlemi başarısız!');
                }
            }
            handleCancel();
        });
    };

    const handleDelete = async key => {
        try {
            await axios.delete(`${config.apiUrl}/instant-accounts/${key}`);
            message.success('Hesap başarıyla silindi!');
            fetchAccounts();
        } catch (error) {
            message.error('Silme işlemi başarısız!');
        }
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        const values = Object.values(item).join(' ').toLowerCase();
        return values.includes(searchText.toLowerCase());
    });

    const columns = [
        {
            title: 'Kullanıcı Adı',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || '')
        },
        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => (a.email || '').localeCompare(b.email || '')
        },
        {
            title: 'Kullanıcı Tipi',
            dataIndex: 'userTypeName',
            key: 'userTypeName',
            sorter: (a, b) => (a.userTypeName || '').localeCompare(b.userTypeName || '')
        },
        {
            title: 'Cari Grup',
            dataIndex: 'accountGroupName',
            key: 'accountGroupName',
            sorter: (a, b) => (a.accountGroupName || '').localeCompare(b.accountGroupName || '')
        },
        {
            title: 'Site',
            dataIndex: 'siteName',
            key: 'siteName',
            sorter: (a, b) => (a.siteName || '').localeCompare(b.siteName || '')
        },
        {
            title: 'Firma',
            dataIndex: 'firmName',
            key: 'firmName',
            sorter: (a, b) => (a.firmName || '').localeCompare(b.firmName || '')
        },
        {
            title: 'Firma Kısa Adı',
            dataIndex: 'companyShortName',
            key: 'companyShortName',
            sorter: (a, b) => (a.companyShortName || '').localeCompare(b.companyShortName || '')
        },
        {
            title: 'Proje',
            dataIndex: 'projectName',
            key: 'projectName',
            sorter: (a, b) => (a.projectName || '').localeCompare(b.projectName || '')
        },
        {
            title: 'Yetkili Personel',
            dataIndex: 'authorizedPersonnel',
            key: 'authorizedPersonnel',
            sorter: (a, b) => (a.authorizedPersonnel || '').localeCompare(b.authorizedPersonnel || '')
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            key: 'phone',
            sorter: (a, b) => (a.phone || '').localeCompare(b.phone || '')
        },
        {title: 'GSM', dataIndex: 'gsm', key: 'gsm', sorter: (a, b) => (a.gsm || '').localeCompare(b.gsm || '')},
        {
            title: 'Adres',
            dataIndex: 'address',
            key: 'address',
            sorter: (a, b) => (a.address || '').localeCompare(b.address || '')
        },
        {
            title: 'Vergi No',
            dataIndex: 'taxNumber',
            key: 'taxNumber',
            sorter: (a, b) => (a.taxNumber || '').localeCompare(b.taxNumber || '')
        },
        {
            title: 'Vergi Dairesi',
            dataIndex: 'taxOffice',
            key: 'taxOffice',
            sorter: (a, b) => (a.taxOffice || '').localeCompare(b.taxOffice || '')
        },
        {
            title: 'TC Kimlik No',
            dataIndex: 'tcIdentityNo',
            key: 'tcIdentityNo',
            sorter: (a, b) => (a.tcIdentityNo || '').localeCompare(b.tcIdentityNo || '')
        },
        {
            title: 'Kullanıcı Durumu', dataIndex: 'userStatus', key: 'userStatus',
            render: (userStatus) => userStatus ? 'Aktif' : 'Pasif',
            sorter: (a, b) => (a.userStatus === b.userStatus ? 0 : a.userStatus ? 1 : -1)
        },
        {
            title: 'Hesap Durumu', dataIndex: 'active', key: 'active',
            render: (active) => active ? 'Aktif' : 'Pasif',
            sorter: (a, b) => (a.active === b.active ? 0 : a.active ? 1 : -1)
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => showModal(record)}>Düzenle</Button>
                    <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.key)}
                                okText="Evet" cancelText="Hayır">
                        <Button type="link" danger>Sil</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <Button type="primary" onClick={() => showModal()}>Ekle</Button>
                <Input.Search
                    placeholder="Arama yap..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{width: 240}}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                loading={loading}
                scroll={{x: 'max-content'}}
                pagination={{
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
            />
            <Modal
                title={editingRecord ? 'Düzenle' : 'Ekle'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="username" label="Kullanıcı Adı">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="email" label="E-posta">
                        <Input type="email"/>
                    </Form.Item>
                    <Form.Item name="password" label="Şifre">
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item name="userTypeId" label="Kullanıcı Tipi">
                        <Select
                            placeholder="Kullanıcı tipi seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {userTypes.map(userType => (
                                <Select.Option key={userType.id} value={userType.id}>
                                    {userType.userTypeName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="accountGroupId" label="Cari Grup">
                        <Select
                            placeholder="Cari Grup seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {cariGroups.map(group => (
                                <Select.Option key={group.id} value={group.id}>
                                    {group.groupName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="siteId" label="Site">
                        <Select
                            placeholder="Site seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {sites.map(site => (
                                <Select.Option key={site.id} value={site.id}>
                                    {site.siteName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="firmId" label="Firma">
                        <Select
                            placeholder="Firma seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {firms.map(firm => (
                                <Select.Option key={firm.id} value={firm.id}>
                                    {firm.firmName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="companyShortName" label="Firma Kısa Adı">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="projectId" label="Proje">
                        <Select
                            placeholder="Proje seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {projects.map(project => (
                                <Select.Option key={project.id} value={project.id}>
                                    {project.projectName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="authorizedPersonnel" label="Yetkili Personel">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="phoneCountryCode" label="Telefon Ülke Kodu">
                        <Input placeholder="+90"/>
                    </Form.Item>
                    <Form.Item name="phone" label="Telefon">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="gsmCountryCode" label="GSM Ülke Kodu">
                        <Input placeholder="+90"/>
                    </Form.Item>
                    <Form.Item name="gsm" label="GSM">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="address" label="Adres">
                        <Input.TextArea rows={2}/>
                    </Form.Item>
                    <Form.Item name="fax" label="Fax">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="pttBox" label="PTT Kutusu">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="postalCode" label="Posta Kodu">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="taxNumber" label="Vergi Numarası">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="taxOffice" label="Vergi Dairesi">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="tcIdentityNo" label="TC Kimlik No">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="bankAddress" label="Banka Adresi">
                        <Input/>
                    </Form.Item>
                    <Form.Item name="userStatus" label="Kullanıcı Durumu">
                        <Radio.Group>
                            <Radio value={true}>Aktif</Radio>
                            <Radio value={false}>Pasif</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="active" label="Cari Hesap Durumu">
                        <Radio.Group>
                            <Radio value={true}>Aktif</Radio>
                            <Radio value={false}>Pasif</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CariHesaplar;
