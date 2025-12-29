import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, TreeSelect, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const ProductInventoryCategories = () => {
    const [data, setData] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTreeModalVisible, setIsTreeModalVisible] = useState(false);
    const [categoryTree, setCategoryTree] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/product-inventory-categories`);
            if (response.data) {
                setData(response.data);
                buildTreeData(response.data);
            } else {
                setData([]);
                setTreeData([]);
            }
        } catch (error) {
            console.log(error);
            toast.error('Kategoriler alınırken hata oluştu!');
            setData([]);
            setTreeData([]);
        } finally {
            setLoading(false);
        }
    };

    // Tree yapısını oluştur
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
                categoryName: record.categoryName,
                categoryDescription: record.categoryDescription,
                parentCategoryId: record.parentCategoryId || undefined,
                displayOrder: record.displayOrder || 0,
                isActive: record.isActive !== false, // Default true
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                parentCategoryId: undefined,
                displayOrder: 0,
                isActive: true,
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
            const requestData = {
                ...values,
                parentCategoryId: values.parentCategoryId || null,
            };

            try {
                if (editingRecord) {
                    // Güncelleme işlemi (PUT)
                    await axios.put(
                        `${config.apiUrl}/product-inventory-categories/${editingRecord.id}`,
                        requestData
                    );
                    toast.success('Kategori başarıyla güncellendi!');
                } else {
                    // Ekleme işlemi (POST)
                    await axios.post(`${config.apiUrl}/product-inventory-categories`, requestData);
                    toast.success('Kategori başarıyla oluşturuldu!');
                }

                await fetchCategories();
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
            await axios.delete(`${config.apiUrl}/product-inventory-categories/${id}`);
            toast.success('Kategori başarıyla silindi!');
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu!');
        }
    };

    // Tree modal fonksiyonları
    const showTreeModal = async () => {
        setIsTreeModalVisible(true);
        try {
            const response = await axios.get(`${config.apiUrl}/product-inventory-categories/tree`);
            setCategoryTree(response.data || []);
        } catch (error) {
            console.log(error);
            toast.error('Kategori ağacı alınırken hata oluştu!');
            setCategoryTree([]);
        }
    };

    const handleTreeModalClose = () => {
        setIsTreeModalVisible(false);
        setCategoryTree([]);
    };

    // Tree render fonksiyonu
    const renderTreeNode = (node, level = 0) => {
        // Seviyeye göre farklı renkler
        const levelColors = [
            { bg: '#e6f7ff', border: '#1890ff', text: '#0050b3' },      // Seviye 0 - Mavi
            { bg: '#f6ffed', border: '#52c41a', text: '#237804' },      // Seviye 1 - Yeşil
            { bg: '#fff7e6', border: '#fa8c16', text: '#ad6800' },      // Seviye 2 - Turuncu
            { bg: '#f9f0ff', border: '#722ed1', text: '#531dab' },      // Seviye 3 - Mor
            { bg: '#fff1f0', border: '#f5222d', text: '#a8071a' },      // Seviye 4 - Kırmızı
        ];

        // Ekstra renkler (seviye 5 ve üzeri için)
        const extraColors = [
            { bg: '#fcffe6', border: '#fadb14', text: '#ad8b00' },      // Sarı
            { bg: '#e6fffb', border: '#13c2c2', text: '#006d75' },      // Cyan
            { bg: '#fff0f6', border: '#eb2f96', text: '#9e1068' },      // Pembe
            { bg: '#f0f5ff', border: '#597ef7', text: '#10239e' },      // İndigo
            { bg: '#fff7e6', border: '#ffa940', text: '#ad4e00' },      // Turuncu Koyu
            { bg: '#feffe6', border: '#bae637', text: '#5b8c00' },      // Lime
            { bg: '#f9f0ff', border: '#9254de', text: '#391085' },      // Mor Koyu
            { bg: '#e6f7ff', border: '#40a9ff', text: '#003a8c' },      // Mavi Koyu
            { bg: '#f6ffed', border: '#73d13d', text: '#135200' },      // Yeşil Koyu
            { bg: '#fff1f0', border: '#ff7875', text: '#820014' },      // Kırmızı Koyu
        ];

        let colors;
        if (level < levelColors.length) {
            colors = levelColors[level];
        } else {
            // Seviye 5 ve üzeri için rastgele renk seç
            const randomIndex = (level - levelColors.length) % extraColors.length;
            colors = extraColors[randomIndex];
        }

        // Seviyeye göre simge
        const levelIcons = ['●', '○', '■', '□', '▪'];
        const icon = levelIcons[level] || '▪';

        return (
            <div key={node.id} style={{ marginBottom: '2px' }}>
                <div style={{
                    marginLeft: `${level * 15}px`,
                    padding: '4px 8px',
                    backgroundColor: colors.bg,
                    borderLeft: `2px solid ${colors.border}`,
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.03)'
                }}>
                    <span style={{
                        color: colors.border,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        lineHeight: '1'
                    }}>
                        {icon}
                    </span>
                    <span style={{
                        color: colors.text,
                        fontSize: '11px',
                        fontWeight: level === 0 ? '600' : '500',
                        flex: 1,
                        lineHeight: '1.3'
                    }}>
                        {node.categoryName}
                    </span>
                    {node.subCategories && node.subCategories.length > 0 && (
                        <span style={{
                            fontSize: '9px',
                            color: '#8c8c8c',
                            backgroundColor: 'white',
                            padding: '1px 4px',
                            borderRadius: '6px',
                            fontWeight: '500',
                            whiteSpace: 'nowrap'
                        }}>
                            {node.subCategories.length}
                        </span>
                    )}
                </div>
                {node.subCategories && node.subCategories.length > 0 && (
                    <div style={{ marginTop: '1px' }}>
                        {node.subCategories.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Kategorinin parent bilgisini getir
    const getParentName = (parentId) => {
        if (!parentId) return 'Ana Kategori';
        const parent = data.find(cat => cat.id === parentId);
        return parent ? parent.categoryName : '-';
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            (item.categoryName || '').toLowerCase().includes(searchLower) ||
            (item.categoryDescription || '').toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            title: 'Ana Kategori',
            dataIndex: 'parentCategoryId',
            key: 'parentCategoryId',
            render: (parentId) => getParentName(parentId),
            width: 200,
        },
        {
            title: 'Kategori Adı',
            dataIndex: 'categoryName',
            key: 'categoryName',
            sorter: (a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''),
            width: 200,
        },
        {
            title: 'Seviye',
            dataIndex: 'categoryLevel',
            key: 'categoryLevel',
            sorter: (a, b) => (a.categoryLevel || 0) - (b.categoryLevel || 0),
            width: 80,
            align: 'center',
        },
        {
            title: 'Sıra',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            sorter: (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
            width: 80,
            align: 'center',
        },
        {
            title: 'Aktif',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (isActive ? 'Evet' : 'Hayır'),
            width: 80,
            align: 'center',
        },
        {
            title: 'Açıklama',
            dataIndex: 'categoryDescription',
            key: 'categoryDescription',
            ellipsis: true,
            width: 250,
        },
        {
            title: 'İşlemler',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Silmek istediğinize emin misiniz?"
                        description="Bu kategori silindiğinde alt kategoriler de etkilenebilir."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Sil
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
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
            <h2>Ürün Envanter Kategorileri</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        Yeni Kategori Ekle
                    </Button>
                    <Button type="default" icon={<ApartmentOutlined />} onClick={showTreeModal}>
                        Kategori Yapısını Göster
                    </Button>
                </Space>
                <Input.Search
                    placeholder="Kategori ara..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} kayıt`,
                }}
            />

            {/* Tree Modal */}
            <Modal
                title="Kategori Yapısı"
                open={isTreeModalVisible}
                onCancel={handleTreeModalClose}
                width={1200}
                footer={[
                    <Button key="close" type="primary" onClick={handleTreeModalClose}>
                        Kapat
                    </Button>
                ]}
            >
                <div style={{
                    maxHeight: '700px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px'
                }}>
                    {categoryTree.length > 0 ? (
                        <div style={{
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                            {categoryTree.map(node => renderTreeNode(node, 0))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '30px 15px',
                            color: '#999',
                            backgroundColor: 'white',
                            borderRadius: '8px'
                        }}>
                            <ApartmentOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
                            <div style={{ fontSize: '16px' }}>Kategori bulunamadı</div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                title={editingRecord ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                open={isModalVisible}
                onCancel={handleCancel}
                width={600}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        İptal
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={() => handleOk(false)}
                    >
                        Kaydet
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="parentCategoryId"
                        label="Bu kategorinin altına ekle:"
                    >
                        <TreeSelect
                            showSearch
                            style={{ width: '100%' }}
                            popupMatchSelectWidth={false}
                            popupStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder="Kategori Seçin (Boş bırakılırsa ana kategori olur)"
                            allowClear
                            treeDefaultExpandAll
                            treeData={treeData}
                            filterTreeNode={(input, treeNode) =>
                                treeNode.title.toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>


                    <Form.Item
                        name="categoryName"
                        label="Kategori Adı:"
                        rules={[
                            { required: true, message: 'Bu alanı boş bırakmayın.' },
                            { max: 200, message: 'Kategori adı en fazla 200 karakter olabilir!' },
                        ]}
                    >
                        <Input placeholder="Kategori adını yazınız" />
                    </Form.Item>

                    <Form.Item
                        name="displayOrder"
                        label="Sıra:"
                        rules={[{ required: true, message: 'Sıra bilgisi zorunludur!' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="Görüntüleme sırası"
                        />
                    </Form.Item>

                    <Form.Item
                        name="categoryDescription"
                        label="Açıklama"
                        rules={[
                            { max: 500, message: 'Açıklama en fazla 500 karakter olabilir!' },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Kategori açıklaması (opsiyonel)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Aktif"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductInventoryCategories;

