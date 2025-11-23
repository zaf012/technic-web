import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, TreeSelect, Switch, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { categoryService, productDetailService, categoryHelper } from '../services/ProductInventoryService';

const ProductInventoryDetail = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        fetchProductDetails();
        fetchCategories();
    }, []);

    useEffect(() => {
        // Kategoriler yüklendiğinde veya değiştiğinde kategori yollarını güncelle
        if (categories.length > 0 && data.length > 0) {
            const updatedData = data.map((product) => ({
                ...product,
                categoryPath: categoryHelper.buildCategoryPath(product.categoryId, categories),
            }));
            setData(updatedData);
        }
    }, [categories]);

    const fetchProductDetails = async (page = 0, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await productDetailService.fetchAll(page, pageSize);

            if (response) {
                const products = response.content || response;
                const total = response.totalElements || products.length;

                // Her ürün için kategori yolu oluştur
                const productsWithCategoryPath = products.map((product) => ({
                    ...product,
                    categoryPath: categoryHelper.buildCategoryPath(product.categoryId, categories),
                }));

                setData(productsWithCategoryPath);
                setPagination({
                    current: page + 1,
                    pageSize,
                    total,
                });
            } else {
                setData([]);
            }
        } catch (error) {
            console.log(error);
            toast.error('Ürün detayları alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.fetchAll();
            if (data) {
                setCategories(data);
                // Tree data'yı oluştur
                buildTreeData(data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Kategoriler alınırken hata oluştu!');
        }
    };

    // Tree yapısını oluştur - hiyerarşik kategori dropdown için
    const buildTreeData = (categories) => {
        const tree = categories
            .filter(cat => !cat.parentCategoryId) // Ana kategoriler
            .map(cat => buildTreeNode(cat, categories));
        setTreeData(tree);
    };

    const buildTreeNode = (category, allCategories) => {
        const children = allCategories
            .filter(cat => cat.parentCategoryId === category.id)
            .map(cat => buildTreeNode(cat, allCategories));

        return {
            title: category.categoryName,
            value: category.id,
            key: category.id,
            children: children.length > 0 ? children : undefined,
        };
    };


    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
        if (record) {
            form.setFieldsValue({
                categoryId: record.categoryId,
                categoryName: record.categoryName,
                marketCode: record.marketCode,
                brandName: record.brandName,
                productName: record.productName,
                active: record.active !== false,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                active: true,
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
            try {
                // CategoryName'i categoryId'den al
                const selectedCategory = categories.find(cat => cat.id === values.categoryId);
                const requestData = {
                    ...values,
                    categoryName: selectedCategory ? selectedCategory.categoryName : '',
                };

                if (editingRecord) {
                    // Güncelleme işlemi (PUT)
                    await productDetailService.update(editingRecord.id, requestData);
                    toast.success('Ürün detayı başarıyla güncellendi!');
                } else {
                    // Ekleme işlemi (POST)
                    await productDetailService.create(requestData);
                    toast.success('Ürün detayı başarıyla oluşturuldu!');
                }

                await fetchProductDetails(pagination.current - 1, pagination.pageSize);
                handleCancel();
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu!');
            }
        }).catch(error => {
            console.log('Validation error:', error);
        });
    };

    const handleDelete = async (id) => {
        try {
            await productDetailService.delete(id);
            toast.success('Ürün detayı başarıyla silindi!');
            fetchProductDetails(pagination.current - 1, pagination.pageSize);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu!');
        }
    };

    const handleTableChange = (newPagination) => {
        fetchProductDetails(newPagination.current - 1, newPagination.pageSize);
    };

    const handleSearch = async () => {
        if (!searchText.trim()) {
            fetchProductDetails(0, pagination.pageSize);
            return;
        }

        setLoading(true);
        try {
            const response = await productDetailService.search(searchText);

            if (response) {
                const products = response.content || response;
                const productsWithCategoryPath = products.map((product) => ({
                    ...product,
                    categoryPath: categoryHelper.buildCategoryPath(product.categoryId, categories),
                }));
                setData(productsWithCategoryPath);
            }
        } catch (error) {
            console.log(error);
            toast.error('Arama sırasında hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return (
            (item.marketCode || '').toLowerCase().includes(searchLower) ||
            (item.brandName || '').toLowerCase().includes(searchLower) ||
            (item.productName || '').toLowerCase().includes(searchLower) ||
            (item.categoryPath || '').toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            title: 'Market Kodu',
            dataIndex: 'marketCode',
            key: 'marketCode',
            sorter: (a, b) => (a.marketCode || '').localeCompare(b.marketCode || ''),
            width: 150,
        },
        {
            title: 'Marka',
            dataIndex: 'brandName',
            key: 'brandName',
            sorter: (a, b) => (a.brandName || '').localeCompare(b.brandName || ''),
            width: 150,
        },
        {
            title: 'Model (Ürün Adı)',
            dataIndex: 'productName',
            key: 'productName',
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
            width: 200,
        },
        {
            title: 'Kategori',
            dataIndex: 'categoryPath',
            key: 'categoryPath',
            width: 330,
            render: (categoryPath) => (
                <span style={{ fontSize: '12px' }}>{categoryPath || '-'}</span>
            ),
        },
        {
            title: 'Aktif',
            dataIndex: 'active',
            key: 'active',
            width: 70,
            align: 'center',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Aktif' : 'Pasif'}
                </Tag>
            ),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            width: 140,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        style={{ padding: '4px 8px' }}
                    >
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Bu ürünü silmek istediğinizden emin misiniz?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ padding: '4px 8px' }}
                        >
                            Sil
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ margin: 0 }}>Ürün Envanter Listesi</h2>
                <Space>
                    <Input.Search
                        placeholder="Market Kodu, Marka, Ürün Adı..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Yeni Ürün Ekle
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} kayıt`,
                }}
                onChange={handleTableChange}
                scroll={{ x: 1200 }}
                bordered
            />

            <Modal
                title={editingRecord ? 'Ürün Detayı Düzenle' : 'Yeni Ürün Detayı Ekle'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
                okText={editingRecord ? 'Güncelle' : 'Kaydet'}
                cancelText="İptal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="productDetailForm"
                >
                    <Form.Item
                        name="categoryId"
                        label="Kategori"
                        rules={[{ required: true, message: 'Lütfen kategori seçiniz!' }]}
                    >
                        <TreeSelect
                            style={{ width: '100%' }}
                            popupStyle={{ maxHeight: 400, overflow: 'auto' }}
                            treeData={treeData}
                            placeholder="Kategori seçiniz"
                            treeDefaultExpandAll
                            showSearch
                            treeNodeFilterProp="title"
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item
                        name="marketCode"
                        label="Market Kodu"
                        rules={[
                            { required: true, message: 'Lütfen market kodu giriniz!' },
                            { max: 100, message: 'Market kodu en fazla 100 karakter olabilir!' }
                        ]}
                    >
                        <Input placeholder="Market kodu giriniz" />
                    </Form.Item>

                    <Form.Item
                        name="brandName"
                        label="Marka"
                        rules={[
                            { max: 200, message: 'Marka adı en fazla 200 karakter olabilir!' }
                        ]}
                    >
                        <Input placeholder="Marka adı giriniz" />
                    </Form.Item>

                    <Form.Item
                        name="productName"
                        label="Model (Ürün Adı)"
                        rules={[
                            { max: 500, message: 'Ürün adı en fazla 500 karakter olabilir!' }
                        ]}
                    >
                        <Input placeholder="Ürün adı giriniz" />
                    </Form.Item>

                    <Form.Item
                        name="active"
                        label="Aktif"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductInventoryDetail;

