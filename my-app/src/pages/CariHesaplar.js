import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Radio} from 'antd';
import axios from 'axios';
import config from '../config';

const CariHesaplar = () => {
    const [data, setData] = useState([]);
    const [cariGroups, setCariGroups] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
        fetchGroups();
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
                gsmCountryCode: '+90',
                userStatus: true,  // Yeni kayıt için varsayılan aktif
                isActive: true     // Yeni kayıt için varsayılan aktif
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
            title: 'Firma/Site',
            dataIndex: 'siteName',
            key: 'siteName',
            sorter: (a, b) => (a.siteName || '').localeCompare(b.siteName || '')
        },
        {
            title: 'Adres',
            dataIndex: 'address',
            key: 'address',
            sorter: (a, b) => (a.address || '').localeCompare(b.address || '')
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone, record) => {
                const countryCode = record.phoneCountryCode || '';
                const phoneNumber = phone || '';
                if (!countryCode && !phoneNumber) return '-';
                return `${countryCode} ${phoneNumber}`.trim();
            },
            sorter: (a, b) => {
                const phoneA = `${a.phoneCountryCode || ''} ${a.phone || ''}`.trim();
                const phoneB = `${b.phoneCountryCode || ''} ${b.phone || ''}`.trim();
                return phoneA.localeCompare(phoneB);
            }
        },
        {
            title: 'GSM',
            dataIndex: 'gsm',
            key: 'gsm',
            render: (gsm, record) => {
                const countryCode = record.gsmCountryCode || '';
                const gsmNumber = gsm || '';
                if (!countryCode && !gsmNumber) return '-';
                return `${countryCode} ${gsmNumber}`.trim();
            },
            sorter: (a, b) => {
                const gsmA = `${a.gsmCountryCode || ''} ${a.gsm || ''}`.trim();
                const gsmB = `${b.gsmCountryCode || ''} ${b.gsm || ''}`.trim();
                return gsmA.localeCompare(gsmB);
            }
        },

        {
            title: 'E-posta',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => (a.email || '').localeCompare(b.email || '')
        },
        {
            title: 'Vergi Dairesi',
            dataIndex: 'taxOffice',
            key: 'taxOffice',
            sorter: (a, b) => (a.taxOffice || '').localeCompare(b.taxOffice || '')
        },
        {
            title: 'Vergi No',
            dataIndex: 'taxNumber',
            key: 'taxNumber',
            sorter: (a, b) => (a.taxNumber || '').localeCompare(b.taxNumber || '')
        },
        {
            title: 'TC Kimlik No',
            dataIndex: 'tcIdentityNo',
            key: 'tcIdentityNo',
            sorter: (a, b) => (a.tcIdentityNo || '').localeCompare(b.tcIdentityNo || '')
        },
        {
            title: 'Yetkili Personel',
            dataIndex: 'authorizedPersonnel',
            key: 'authorizedPersonnel',
            sorter: (a, b) => (a.authorizedPersonnel || '').localeCompare(b.authorizedPersonnel || '')
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
            title: 'Kullanıcı Durumu', dataIndex: 'userStatus', key: 'userStatus',
            render: (userStatus) => userStatus ? 'Aktif' : 'Pasif',
            sorter: (a, b) => (a.userStatus === b.userStatus ? 0 : a.userStatus ? 1 : -1)
        },
        {
            title: 'Hesap Durumu', dataIndex: 'isActive', key: 'isActive',
            render: (isActive) => isActive ? 'Aktif' : 'Pasif',
            sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1)
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
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="username"
                        label="Kullanıcı Adı"
                        rules={[{required: true, message: 'Kullanıcı adı zorunludur!'}]}
                    >
                        <Input placeholder="Kullanıcı adı giriniz"/>
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="E-posta"
                        rules={[
                            {required: true, message: 'E-posta zorunludur!'},
                            {type: 'email', message: 'Geçerli bir e-posta adresi giriniz!'}
                        ]}
                    >
                        <Input type="email" placeholder="ornek@email.com"/>
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Şifre"
                        rules={[
                            {required: !editingRecord, message: 'Şifre zorunludur!'},
                            {min: 6, message: 'Şifre en az 6 karakter olmalıdır!'}
                        ]}
                    >
                        <Input.Password
                            placeholder={editingRecord ? "Değiştirmek için yeni şifre giriniz" : "Şifre giriniz"}/>
                    </Form.Item>
                    <Form.Item name="userTypeId" label="Kullanıcı Tipi">
                        <Select
                            placeholder="Kullanıcı tipi seçiniz"
                            showSearch
                            allowClear
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
                            allowClear
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
                    <Form.Item name="siteName" label="Firma & Site Adı">
                        <Input placeholder="Firme veya Site adı giriniz"/>
                    </Form.Item>
                    <Form.Item name="authorizedPersonnel" label="Yetkili Personel">
                        <Input placeholder="Yetkili personel adı giriniz"/>
                    </Form.Item>
                    <Form.Item name="phoneCountryCode" label="Telefon Ülke Kodu">
                        <Input placeholder="+90"/>
                    </Form.Item>
                    <Form.Item name="phone" label="Telefon">
                        <Input placeholder="5XXXXXXXXX"/>
                    </Form.Item>
                    <Form.Item name="gsmCountryCode" label="GSM Ülke Kodu">
                        <Input placeholder="+90"/>
                    </Form.Item>
                    <Form.Item name="gsm" label="GSM">
                        <Input placeholder="5XXXXXXXXX"/>
                    </Form.Item>
                    <Form.Item name="address" label="Adres">
                        <Input.TextArea rows={2} placeholder="Adres giriniz"/>
                    </Form.Item>
                    <Form.Item name="fax" label="Fax">
                        <Input placeholder="Fax numarası"/>
                    </Form.Item>
                    <Form.Item name="postalCode" label="Posta Kodu">
                        <Input placeholder="Posta kodu giriniz"/>
                    </Form.Item>
                    <Form.Item name="taxNumber" label="Vergi Numarası">
                        <Input placeholder="Vergi numarası giriniz"/>
                    </Form.Item>
                    <Form.Item name="taxOffice" label="Vergi Dairesi">
                        <Input placeholder="Vergi dairesi adı giriniz"/>
                    </Form.Item>
                    <Form.Item
                        name="tcIdentityNo"
                        label="TC Kimlik No"
                        rules={[
                            {len: 11, message: 'TC Kimlik No 11 karakter olmalıdır!'},
                            {pattern: /^[0-9]+$/, message: 'Sadece rakam girebilirsiniz!'}
                        ]}
                    >
                        <Input placeholder="XXXXXXXXXXX" maxLength={11}/>
                    </Form.Item>
                    <Form.Item name="iban" label="IBAN">
                        <Input placeholder="TR00....."/>
                    </Form.Item>
                    <Form.Item
                        name="userStatus"
                        label="Kullanıcı Durumu"
                        tooltip="Kullanıcının sisteme giriş yapıp yapamayacağını belirler"
                    >
                        <Radio.Group>
                            <Radio value={true}>Aktif</Radio>
                            <Radio value={false}>Pasif</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="isActive"
                        label="Cari Hesap Durumu"
                        tooltip="Cari hesabın aktif veya pasif olduğunu belirler"
                    >
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
