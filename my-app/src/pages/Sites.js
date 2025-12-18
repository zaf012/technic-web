import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Space, Popconfirm} from 'antd';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Sites = () => {
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/sites/get-all`);
            if (response.data && response.data.data) {
                setData(response.data.data.map(item => ({...item, key: item.id})));
            } else {
                setData([]);
            }
        } catch (error) {
            toast.error('Siteler alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const showModal = async (record = null) => {

        setEditingRecord(record);
        setIsModalVisible(true);

        if (record) {
            setTimeout(() => {

                form.setFieldsValue({
                    siteName: record.siteName,
                    description: record.description
                });
            }, 100);
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            const enrichedValues = {...values};

            if (editingRecord) {
                // Güncelleme işlemi (PUT)
                try {
                    await axios.put(`${config.apiUrl}/sites/${editingRecord.id}`, enrichedValues);
                    toast.success('Site başarıyla güncellendi!');
                    fetchSites();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Site güncellenirken hata oluştu!');
                }
            } else {
                // Ekleme işlemi (POST)
                try {
                    await axios.post(`${config.apiUrl}/sites`, enrichedValues);
                    toast.success('Site başarıyla oluşturuldu!');
                    fetchSites();
                } catch (error) {
                    console.log(error);
                    toast.error(error.response?.data?.message || 'Site oluşturulurken hata oluştu!');
                }
            }
            handleCancel();
        });
    };

    const handleDelete = async key => {
        try {
            await axios.delete(`${config.apiUrl}/sites/${key}`);
            toast.success('Site başarıyla silindi!');
            fetchSites();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Site silinirken hata oluştu!');
        }
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        const values = Object.values(item).join(' ').toLowerCase();
        return values.includes(searchText.toLowerCase());
    });

    const columns = [
        {
            title: 'Site Adı',
            dataIndex: 'siteName',
            key: 'siteName',
            sorter: (a, b) => (a.siteName || '').localeCompare(b.siteName || '')
        },
        {
            title: 'Açıklama',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => (a.description || '').localeCompare(b.description || '')
        },
        {
            title: 'Oluşturulma Tarihi',
            dataIndex: 'createdDate',
            key: 'createdDate',
            sorter: (a, b) => (a.createdDate || '').localeCompare(b.createdDate || '')
        },
        {
            title: 'Güncellenme Tarihi',
            dataIndex: 'updatedDate',
            key: 'updatedDate',
            sorter: (a, b) => (a.updatedDate || '').localeCompare(b.updatedDate || '')
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => showModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.key)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button type="link" danger>Sil</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <Button type="primary" onClick={() => showModal()}>Yeni Site Ekle</Button>
                <Input.Search
                    placeholder="Arama yap..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{width: 240}}
                />
            </div>
            <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} scroll={{ x: 'max-content' }}/>
            <Modal
                title={editingRecord ? 'Site Düzenle' : 'Yeni Site Ekle'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="siteName"
                        label="Site Adı"
                        rules={[
                            {required: true, message: 'Site adı zorunludur!'},
                            {min: 2, message: 'En az 2 karakter olmalıdır!'}
                        ]}
                    >
                        <Input placeholder="Örn: DAP Mesa Kartal, TOKİ Mamak Konutları, vb."/>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Açıklama"
                    >
                        <Input.TextArea rows={3} placeholder="Site açıklaması..."/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Sites;
