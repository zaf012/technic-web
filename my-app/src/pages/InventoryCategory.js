import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Space, Popconfirm, Radio, Select} from 'antd';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const InventoryCategory = () => {
    const [data, setData] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInventoryCategories();
        fetchMainCategories();
    }, []);

    const fetchInventoryCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/inventory-categories`);
            if (response.data) {
                setData(response.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.log(error);
            toast.error('Kategoriler alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMainCategories = async () => {
        try {
            // Tüm kategorileri getir (herhangi bir kategori üst kategori olabilir)
            const response = await axios.get(`${config.apiUrl}/inventory-categories`);
            if (response.data) {
                setMainCategories(response.data);
            } else {
                setMainCategories([]);
            }
        } catch (error) {
            console.log(error);
            setMainCategories([]);
        }
    };

    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
        if (record) {
            form.setFieldsValue({
                categoryName: record.categoryName,
                mainCategoryId: record.mainCategoryId || null,
                isMainCategory: !record.mainCategoryId, // mainCategoryId null ise ana kategori
                marketCode: record.marketCode,
                productName: record.productName,
                brandName: record.brandName,
                isActive: record.isActive
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                mainCategoryId: null,
                isMainCategory: true, // Default olarak ana kategori
                isActive: true
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
            // Ana kategori ise mainCategoryId'yi null yap
            const requestData = {
                ...values,
                mainCategoryId: values.isMainCategory ? null : values.mainCategoryId
            };

            if (editingRecord) {
                // Güncelleme işlemi (PUT)
                const updateData = {
                    id: editingRecord.id,
                    ...requestData
                };
                try {
                    await axios.put(`${config.apiUrl}/inventory-categories/${editingRecord.id}`, updateData);
                    toast.success('Kategori başarıyla güncellendi!');
                    fetchInventoryCategories();
                    fetchMainCategories();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Güncelleme sırasında hata oluştu!');
                }
            } else {
                // Ekleme işlemi (POST)
                try {
                    await axios.post(`${config.apiUrl}/inventory-categories`, requestData);
                    toast.success('Kategori başarıyla oluşturuldu!');
                    fetchInventoryCategories();
                    fetchMainCategories();
                } catch (error) {
                    console.log(error);
                    toast.error(error.response?.data?.message || 'Ekleme sırasında hata oluştu!');
                }
            }
            handleCancel();
        });
    };

    const handleDelete = async key => {
        try {
            await axios.delete(`${config.apiUrl}/inventory-categories/${key}`);
            toast.success('Kategori başarıyla silindi!');
            fetchInventoryCategories();
            fetchMainCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu!');
        }
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            (item.marketCode || '').toLowerCase().includes(searchLower) ||
            (item.productName || '').toLowerCase().includes(searchLower) ||
            (item.brandName || '').toLowerCase().includes(searchLower) ||
            (item.categoryName || '').toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            title: 'Market Kodu',
            dataIndex: 'marketCode',
            key: 'marketCode',
            render: (marketCode) => marketCode || '-',
            sorter: (a, b) => (a.marketCode || '').localeCompare(b.marketCode || ''),
            width: 150
        },
        {
            title: 'Marka',
            dataIndex: 'brandName',
            key: 'brandName',
            render: (brandName) => brandName || '-',
            sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''),
            width: 150
        },
        {
            title: 'Model (Ürün Adı)',
            dataIndex: 'productName',
            key: 'productName',
            render: (productName) => productName || '-',
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
            width: 200
        },
        {
            title: 'Kategori',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (categoryName) => categoryName || '-',
            sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''),
            width: 500
        },
        {
            title: 'Aktif',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => isActive === null ? '-' : (isActive ? 'Evet' : 'Hayır'),
            sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
            width: 80
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => showModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.id)}
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
            <h2>Ürün Envanter Listesi</h2>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16}}>
                <Button type="primary" onClick={() => showModal()}>Yeni Kategori Ekle</Button>
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
                rowKey="id"
                loading={loading}
                scroll={{x: 'max-content'}}
            />
            <Modal
                title={editingRecord ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="isMainCategory"
                        label="Ana Kategori mi?"
                        rules={[
                            {required: true, message: 'Bu alan zorunludur!'}
                        ]}
                    >
                        <Radio.Group>
                            <Radio value={true}>Evet</Radio>
                            <Radio value={false}>Hayır</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.isMainCategory !== currentValues.isMainCategory}
                    >
                        {({getFieldValue}) =>
                            !getFieldValue('isMainCategory') ? (
                                <Form.Item
                                    name="mainCategoryId"
                                    label="Üst Kategori Seç"
                                    rules={[
                                        {required: true, message: 'Üst kategori seçimi zorunludur!'}
                                    ]}
                                >
                                    <Select
                                        placeholder="Üst kategori seçiniz"
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {mainCategories
                                            .filter(cat => !editingRecord || cat.id !== editingRecord.id) // Kendi kendine parent olamaz
                                            .map(cat => (
                                                <Select.Option key={cat.id} value={cat.id}>
                                                    {cat.categoryName}
                                                </Select.Option>
                                            ))}
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                    </Form.Item>

                    <Form.Item
                        name="categoryName"
                        label="Kategori Adı"
                        rules={[
                            {required: true, message: 'Kategori adı zorunludur!'}
                        ]}
                    >
                        <Input placeholder="Kategori adını giriniz"/>
                    </Form.Item>

                    <Form.Item
                        name="brandName"
                        label="Marka"
                    >
                        <Input placeholder="Marka adını giriniz"/>
                    </Form.Item>

                    <Form.Item
                        name="marketCode"
                        label="Market Kodu"
                    >
                        <Input placeholder="Market kodunu giriniz"/>
                    </Form.Item>

                    <Form.Item
                        name="productName"
                        label="Model (Ürün Adı)"
                        rules={[
                            {required: true, message: 'Ürün adı zorunludur!'}
                        ]}
                    >
                        <Input placeholder="Ürün adını giriniz"/>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Aktif mi?"
                        rules={[
                            {required: true, message: 'Bu alan zorunludur!'}
                        ]}
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

export default InventoryCategory;
