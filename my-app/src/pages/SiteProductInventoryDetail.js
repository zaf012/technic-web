import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, TreeSelect, Switch, Tag, Select, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    siteProductInventoryService,
    siteService,
    squareService,
    blockService,
    systemService,
    categoryService,
    productInventoryDetailService,
    categoryHelper,
    qrCodeGenerator
} from '../services/SiteProductInventoryService';

const { Option } = Select;

const SiteProductInventoryDetail = () => {
    const [data, setData] = useState([]);
    const [sites, setSites] = useState([]);
    const [squares, setSquares] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [systems, setSystems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [filteredSquares, setFilteredSquares] = useState([]);
    const [filteredBlocks, setFilteredBlocks] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchSiteInventories(),
                fetchSites(),
                fetchSquares(),
                fetchBlocks(),
                fetchSystems(),
                fetchCategories()
            ]);
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSiteInventories = async () => {
        setLoading(true);
        try {
            const response = await siteProductInventoryService.fetchAll();
            const inventories = Array.isArray(response) ? response : (response.content || []);

            setData(inventories.map(item => ({
                ...item,
                key: item.id,
                categoryPath: categoryHelper.buildCategoryPath(item.categoryId, categories)
            })));
        } catch (error) {
            console.error(error);
            toast.error('Site cihaz envanteri alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSites = async () => {
        try {
            const data = await siteService.fetchAll();
            setSites(data);
        } catch (error) {
            console.error(error);
            toast.error('Siteler alınırken hata oluştu!');
        }
    };

    const fetchSquares = async () => {
        try {
            const data = await squareService.fetchAll();
            setSquares(data);
        } catch (error) {
            console.error(error);
            toast.error('Adalar alınırken hata oluştu!');
        }
    };

    const fetchBlocks = async () => {
        try {
            const data = await blockService.fetchAll();
            setBlocks(data);
        } catch (error) {
            console.error(error);
            toast.error('Bloklar alınırken hata oluştu!');
        }
    };

    const fetchSystems = async () => {
        try {
            const data = await systemService.fetchAll();
            // Sadece description NULL olanları filtrele (sistem tanımları)
            const systemDefinitions = data.filter(system =>
                !system.description || system.description.trim() === ''
            );
            setSystems(systemDefinitions);
        } catch (error) {
            console.error(error);
            toast.error('Sistemler alınırken hata oluştu!');
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.fetchAll();
            setCategories(data);
            // Tree data'yı oluştur
            const tree = categoryHelper.buildTreeData(data);
            setTreeData(tree);
        } catch (error) {
            console.error(error);
            toast.error('Kategoriler alınırken hata oluştu!');
        }
    };


    // Site değiştiğinde adaları filtrele
    const handleSiteChange = (siteId) => {
        form.setFieldsValue({ squareId: undefined, blockId: undefined });
        const filtered = squares.filter(s => s.siteId === siteId);
        setFilteredSquares(filtered);
        setFilteredBlocks([]);
    };

    // Ada değiştiğinde blokları filtrele
    const handleSquareChange = (squareId) => {
        form.setFieldsValue({ blockId: undefined });
        const filtered = blocks.filter(b => b.squareId === squareId);
        setFilteredBlocks(filtered);
    };

    // Kategori değiştiğinde ürünleri filtrele
    const handleCategoryChange = async (categoryId) => {
        form.setFieldsValue({ productInventoryDetailId: undefined });
        try {
            const filtered = await productInventoryDetailService.fetchByCategory(categoryId);
            setFilteredProducts(Array.isArray(filtered) ? filtered : (filtered.content || []));
        } catch (error) {
            console.error(error);
            setFilteredProducts([]);
        }
    };

    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);

        if (record) {
            // Düzenleme modu
            form.setFieldsValue({
                siteId: record.siteId,
                squareId: record.squareId,
                blockId: record.blockId,
                floorNumber: record.floorNumber,
                location: record.location,
                systemId: record.systemId,
                categoryId: record.categoryId,
                productInventoryDetailId: record.productInventoryDetailId,
                productPurpose: record.productPurpose,
                qrCode: record.qrCode,
                active: record.active !== false,
            });

            // Filtreleri ayarla
            handleSiteChange(record.siteId);
            handleSquareChange(record.squareId);
            handleCategoryChange(record.categoryId);
        } else {
            // Yeni kayıt modu
            form.resetFields();
            form.setFieldsValue({
                active: true,
                qrCode: qrCodeGenerator.generate() // Otomatik QR kod üret
            });
            setFilteredSquares([]);
            setFilteredBlocks([]);
            setFilteredProducts([]);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        setFilteredSquares([]);
        setFilteredBlocks([]);
        setFilteredProducts([]);
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            try {
                const requestData = {
                    ...values,
                    // Name alanları backend tarafından otomatik set edilecek
                };

                if (editingRecord) {
                    // Güncelleme işlemi
                    await siteProductInventoryService.update(editingRecord.id, requestData);
                    toast.success('Cihaz kaydı başarıyla güncellendi!');
                } else {
                    // Ekleme işlemi
                    await siteProductInventoryService.create(requestData);
                    toast.success('Cihaz kaydı başarıyla oluşturuldu!');
                }

                await fetchSiteInventories();
                handleCancel();
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu!');
            }
        }).catch(error => {
            console.error('Validation error:', error);
        });
    };

    const handleDelete = async (id) => {
        try {
            await siteProductInventoryService.delete(id);
            toast.success('Cihaz kaydı başarıyla silindi!');
            await fetchSiteInventories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu!');
        }
    };

    const handleGenerateQrCode = () => {
        const newQrCode = qrCodeGenerator.generate();
        form.setFieldsValue({ qrCode: newQrCode });
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        if (!searchText) return true;
        const searchLower = searchText.toLowerCase();
        return (
            (item.qrCode || '').toLowerCase().includes(searchLower) ||
            (item.siteName || '').toLowerCase().includes(searchLower) ||
            (item.squareName || '').toLowerCase().includes(searchLower) ||
            (item.blockName || '').toLowerCase().includes(searchLower) ||
            (item.systemName || '').toLowerCase().includes(searchLower) ||
            (item.productPurpose || '').toLowerCase().includes(searchLower) ||
            (item.categoryName || '').toLowerCase().includes(searchLower) ||
            (item.productName || '').toLowerCase().includes(searchLower) ||
            (item.location || '').toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            title: 'QR Kod',
            dataIndex: 'qrCode',
            key: 'qrCode',
            width: 120,
            render: (qrCode) => (
                <Tag color="blue" icon={<QrcodeOutlined />}>
                    {qrCode}
                </Tag>
            ),
        },
        {
            title: 'Cihaz Kategorisi',
            dataIndex: 'categoryName',
            key: 'categoryName',
            width: 250,
            render: (categoryName) => (
                <span style={{ fontSize: '12px' }}>{categoryName || '-'}</span>
            ),
        },
        {
            title: 'Sistem Tanımı',
            dataIndex: 'systemName',
            key: 'systemName',
            width: 150,
        },
        {
            title: 'Cihazın Kullanım Amacı',
            dataIndex: 'productPurpose',
            key: 'productPurpose',
            width: 180,
            render: (productPurpose) => productPurpose || '-',
        },
        {
            title: 'Cihaz',
            dataIndex: 'productName',
            key: 'productName',
            width: 150,
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
        },
        {
            title: 'Site',
            dataIndex: 'siteName',
            key: 'siteName',
            width: 180,
        },
        {
            title: 'Ada',
            dataIndex: 'squareName',
            key: 'squareName',
            width: 100,
        },
        {
            title: 'Blok',
            dataIndex: 'blockName',
            key: 'blockName',
            width: 100,
        },
        {
            title: 'Lokasyon',
            dataIndex: 'location',
            key: 'location',
            width: 150,
            render: (location) => location || '-',
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
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        size="small"
                    />
                    <Popconfirm
                        title="Bu kaydı silmek istediğinizden emin misiniz?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
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
                <h2 style={{ margin: 0 }}>Site Cihaz Envanteri</h2>
                <Space>
                    <Input.Search
                        placeholder="QR Kod, Site, Ada, Blok, Sistem, Cihaz..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 350 }}
                        allowClear
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                    >
                        Yeni Cihaz Ekle
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Toplam ${total} kayıt`,
                }}
                scroll={{ x: 2000 }}
                bordered
                size="small"
            />

            <Modal
                title={editingRecord ? 'Cihaz Kaydı Düzenle' : 'Yeni Cihaz Kaydı Ekle'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={700}
                okText={editingRecord ? 'Kaydet ve Yeniden Ekle' : 'Kaydet ve Listele'}
                cancelText="İptal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="siteId"
                        label="Site"
                        rules={[{ required: true, message: 'Lütfen site seçiniz!' }]}
                    >
                        <Select
                            placeholder="Site seçiniz"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleSiteChange}
                        >
                            {sites.map(site => (
                                <Option key={site.id} value={site.id}>
                                    {site.siteName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="squareId"
                        label="Ada"
                        rules={[{ required: true, message: 'Lütfen ada seçiniz!' }]}
                    >
                        <Select
                            placeholder="Ada seçiniz"
                            showSearch
                            optionFilterProp="children"
                            onChange={handleSquareChange}
                            disabled={filteredSquares.length === 0}
                        >
                            {filteredSquares.map(square => (
                                <Option key={square.id} value={square.id}>
                                    {square.squareName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="blockId"
                        label="Blok"
                        rules={[{ required: true, message: 'Lütfen blok seçiniz!' }]}
                    >
                        <Select
                            placeholder="Blok seçiniz"
                            showSearch
                            optionFilterProp="children"
                            disabled={filteredBlocks.length === 0}
                        >
                            {filteredBlocks.map(block => (
                                <Option key={block.id} value={block.id}>
                                    {block.blockName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="floorNumber"
                        label="Bulunduğu Kat:"
                    >
                        <InputNumber
                            placeholder="-2"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Bulunduğu Lokasyon:"
                    >
                        <Input placeholder="Makine Isı Odası" />
                    </Form.Item>

                    <Form.Item
                        name="systemId"
                        label="Envanter (Sistem) Tanımı"
                        rules={[{ required: true, message: 'Lütfen sistem seçiniz!' }]}
                    >
                        <Select
                            placeholder="Sistem seçiniz"
                            showSearch
                            optionFilterProp="children"
                        >
                            {systems.map(system => (
                                <Option key={system.id} value={system.id}>
                                    {system.systemName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="productPurpose"
                        label="Cihazın Kullanım Amacı"
                        rules={[{ required: true, message: 'Lütfen cihazın kullanım amacını yazınız!'  }]}
                    >
                        <Input placeholder="Cihazın kullanım amacını giriniz" />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Envanter Kategorisi"
                        rules={[{ required: true, message: 'Lütfen kategori seçiniz!' }]}
                    >
                        <TreeSelect
                            showSearch
                            style={{ width: '100%' }}
                            popupMatchSelectWidth={false}
                            placeholder="Kategori seçiniz"
                            allowClear
                            treeDefaultExpandAll
                            treeData={treeData}
                            onChange={handleCategoryChange}
                        />
                    </Form.Item>

                    <Form.Item
                        name="productInventoryDetailId"
                        label="Ürün (cihaz) Seçiniz"
                        rules={[{ required: true, message: 'Lütfen ürün seçiniz!' }]}
                    >
                        <Select
                            placeholder="Ürün seçiniz"
                            showSearch
                            optionFilterProp="children"
                            disabled={filteredProducts.length === 0}
                        >
                            {filteredProducts.map(product => (
                                <Option key={product.id} value={product.id}>
                                    {product.productName} ({product.brandName})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="qrCode"
                        label="QR Kodu"
                        rules={[
                            { required: true, message: 'QR kod zorunludur!' },
                            { len: 12, message: 'QR kod 12 karakter olmalıdır!' }
                        ]}
                    >
                        <Input
                            placeholder="TK-0000055"
                            maxLength={12}
                            disabled={!!editingRecord}
                            addonAfter={
                                !editingRecord && (
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<QrcodeOutlined />}
                                        onClick={handleGenerateQrCode}
                                        style={{ padding: 0 }}
                                    >
                                        Üret
                                    </Button>
                                )
                            }
                        />
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

export default SiteProductInventoryDetail;

