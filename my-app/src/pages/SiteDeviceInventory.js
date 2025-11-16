import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Radio, Select, InputNumber } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const SiteDeviceInventory = () => {
    const [data, setData] = useState([]);
    const [sites, setSites] = useState([]);
    const [squares, setSquares] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [systems, setSystems] = useState([]);
    const [inventoryCategories, setInventoryCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedSiteId, setSelectedSiteId] = useState(null);
    const [selectedSquareId, setSelectedSquareId] = useState(null);

    useEffect(() => {
        fetchDevices();
        fetchSites();
        fetchSystems();
        fetchInventoryCategories();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/site-device-inventory/list`);
            if (response.data) {
                setData(response.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.log(error);
            toast.error('Cihaz envanteri alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSites = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/sites/get-all`);
            if (response.data && response.data.data) {
                setSites(response.data.data);
            } else {
                setSites([]);
            }
        } catch (error) {
            console.log(error);
            toast.error('Site listesi alınırken hata oluştu!');
            setSites([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSquaresBySite = async (siteId) => {
        try {
            const response = await axios.get(`${config.apiUrl}/squares/by-site/${siteId}`);

            // Response array veya object olabilir
            if (Array.isArray(response.data)) {
                setSquares(response.data);
            } else if (response.data && response.data.data) {
                setSquares(response.data.data);
            } else {
                setSquares([]);
            }
        } catch (error) {
            console.log(error);
            setSquares([]);
        }
    };

    const fetchBlocksBySquare = async (squareId) => {
        try {
            const response = await axios.get(`${config.apiUrl}/blocks/by-square/${squareId}`);

            // Response array veya object olabilir
            if (Array.isArray(response.data)) {
                setBlocks(response.data);
            } else if (response.data && response.data.data) {
                setBlocks(response.data.data);
            } else {
                setBlocks([]);
            }
        } catch (error) {
            console.log(error);
            setBlocks([]);
        }
    };

    const fetchSystems = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/system-info/get-all-systems`);
            if (response.data) {
                setSystems(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchInventoryCategories = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/inventory-categories`);
            if (response.data) {
                setInventoryCategories(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const generateQRCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const showModal = (record = null) => {
        setEditingRecord(record);
        setIsModalVisible(true);
        if (record) {
            form.setFieldsValue({
                siteId: record.siteId,
                squareId: record.squareId,
                blockId: record.blockId,
                doorNo: record.doorNo,
                floor: record.floor,
                location: record.location,
                systemId: record.systemId,
                inventoryCategoryId: record.inventoryCategoryId,
                qrCode: record.qrCode,
                isActive: record.isActive
            });
            setSelectedSiteId(record.siteId);
            setSelectedSquareId(record.squareId);
            fetchSquaresBySite(record.siteId);
            fetchBlocksBySquare(record.squareId);
        } else {
            form.resetFields();
            form.setFieldsValue({
                qrCode: generateQRCode(),
                isActive: true
            });
            setSelectedSiteId(null);
            setSelectedSquareId(null);
            setSquares([]);
            setBlocks([]);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRecord(null);
        form.resetFields();
        setSelectedSiteId(null);
        setSelectedSquareId(null);
        setSquares([]);
        setBlocks([]);
    };

    const handleSiteChange = (siteId) => {
        setSelectedSiteId(siteId);
        setSelectedSquareId(null);
        form.setFieldsValue({ squareId: undefined, blockId: undefined });
        setBlocks([]);
        if (siteId) {
            fetchSquaresBySite(siteId);
        } else {
            setSquares([]);
        }
    };

    const handleSquareChange = (squareId) => {
        setSelectedSquareId(squareId);
        form.setFieldsValue({ blockId: undefined });
        if (squareId) {
            fetchBlocksBySquare(squareId);
        } else {
            setBlocks([]);
        }
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            // Site, Square, Block için name değerlerini bul
            const selectedSite = sites.find(s => s.id === values.siteId);
            const selectedSquare = squares.find(s => s.id === values.squareId);
            const selectedBlock = blocks.find(b => b.id === values.blockId);
            const selectedSystem = systems.find(s => s.id === values.systemId);
            const selectedCategory = inventoryCategories.find(c => c.id === values.inventoryCategoryId);

            const requestData = {
                ...values,
                siteName: selectedSite?.siteName || '',
                squareName: selectedSquare?.squareName || '',
                blockName: selectedBlock?.blockName || '',
                systemName: selectedSystem?.systemName || '',
                inventoryCategoryName: selectedCategory?.categoryName || '',
                productName: selectedCategory?.productName || ''
            };

            if (editingRecord) {
                // Güncelleme işlemi (PUT)
                const updateData = {
                    id: editingRecord.id,
                    ...requestData
                };
                try {
                    await axios.put(`${config.apiUrl}/site-device-inventory/update/${editingRecord.id}`, updateData);
                    toast.success('Cihaz envanteri başarıyla güncellendi!');
                    fetchDevices();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Güncelleme sırasında hata oluştu!');
                }
            } else {
                // Ekleme işlemi (POST)
                try {
                    await axios.post(`${config.apiUrl}/site-device-inventory/create`, requestData);
                    toast.success('Cihaz envanteri başarıyla oluşturuldu!');
                    fetchDevices();
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
            await axios.delete(`${config.apiUrl}/site-device-inventory/delete/${key}`);
            toast.success('Cihaz envanteri başarıyla silindi!');
            fetchDevices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu!');
        }
    };

    // Filtrelenmiş veri
    const filteredData = data.filter(item => {
        const searchLower = searchText.toLowerCase();
        return (
            (item.qrCode || '').toLowerCase().includes(searchLower) ||
            (item.siteName || '').toLowerCase().includes(searchLower) ||
            (item.systemName || '').toLowerCase().includes(searchLower) ||
            (item.productName || '').toLowerCase().includes(searchLower) ||
            (item.inventoryCategoryName || '').toLowerCase().includes(searchLower) ||
            (item.location || '').toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            title: 'Cihaz',
            dataIndex: 'productName',
            key: 'productName',
            render: (productName) => productName || '-',
            sorter: (a, b) => (a.productName || '').localeCompare(b.productName || ''),
            width: 150
        },
        {
            title: 'QR Kod',
            dataIndex: 'qrCode',
            key: 'qrCode',
            render: (qrCode) => qrCode || '-',
            sorter: (a, b) => (a.qrCode || '').localeCompare(b.qrCode || ''),
            width: 130
        },
        {
            title: 'Sistem Tanımı',
            dataIndex: 'systemName',
            key: 'systemName',
            render: (systemName) => systemName || '-',
            sorter: (a, b) => (a.systemName || '').localeCompare(b.systemName || ''),
            width: 200
        },
        {
            title: 'Cihaz Kategorisi',
            dataIndex: 'inventoryCategoryName',
            key: 'inventoryCategoryName',
            render: (inventoryCategoryName) => inventoryCategoryName || '-',
            sorter: (a, b) => (a.inventoryCategoryName || '').localeCompare(b.inventoryCategoryName || ''),
            width: 300
        },
        {
            title: 'Ürün (cihaz) Seçiniz',
            dataIndex: 'productName',
            key: 'productName2',
            render: (productName) => productName || '-',
            width: 150
        },
        {
            title: 'Site',
            dataIndex: 'siteName',
            key: 'siteName',
            render: (siteName) => siteName || '-',
            sorter: (a, b) => (a.siteName || '').localeCompare(b.siteName || ''),
            width: 200
        },
        {
            title: 'Ada',
            dataIndex: 'squareName',
            key: 'squareName',
            render: (squareName) => squareName || '-',
            width: 100
        },
        {
            title: 'Blok',
            dataIndex: 'blockName',
            key: 'blockName',
            render: (blockName) => blockName || '-',
            width: 100
        },
        {
            title: 'Daire No',
            dataIndex: 'doorNo',
            key: 'doorNo',
            render: (doorNo) => doorNo || '-',
            width: 100
        },
        {
            title: 'Lokasyon',
            dataIndex: 'location',
            key: 'location',
            render: (location) => location || '-',
            width: 150
        },
        {
            title: 'Aktif',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => isActive === null ? '-' : (isActive ? 'Aktif' : 'Pasif'),
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
            <h2>Site Cihaz Envanteri</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Button type="primary" onClick={() => showModal()}>Yeni Cihaz Ekle</Button>
                <Input.Search
                    placeholder="Arama yap..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 240 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
            />
            <Modal
                title={editingRecord ? 'Cihaz Düzenle' : 'Yeni Cihaz Ekle'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="siteId"
                        label="Site"
                        rules={[{ required: true, message: 'Site seçimi zorunludur!' }]}
                    >
                        <Select
                            placeholder="Site Seçiniz ..."
                            showSearch
                            allowClear
                            onChange={handleSiteChange}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {sites.map(site => (
                                <Select.Option key={site.id} value={site.id}>
                                    {site.siteName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="squareId"
                        label="Ada"
                        rules={[{ required: true, message: 'Ada seçimi zorunludur!' }]}
                    >
                        <Select
                            placeholder="Önce üstten 'Site' Seçiniz ..."
                            showSearch
                            allowClear
                            onChange={handleSquareChange}
                            disabled={!selectedSiteId}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {squares.map(square => (
                                <Select.Option key={square.id} value={square.id}>
                                    {square.squareName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="blockId"
                        label="Blok"
                        rules={[{ required: true, message: 'Blok seçimi zorunludur!' }]}
                    >
                        <Select
                            placeholder="Önce üstten 'Ada' Seçiniz ..."
                            showSearch
                            allowClear
                            disabled={!selectedSquareId}
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {blocks.map(block => (
                                <Select.Option key={block.id} value={block.id}>
                                    {block.blockName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="doorNo"
                        label="Daire (Opsiyonel)"
                    >
                        <Input placeholder="Önce üstten 'Blok' Seçiniz ..." />
                    </Form.Item>

                    <Form.Item
                        name="floor"
                        label="Bulunduğu Kat:"
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="-1" />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Bulunduğu Lokasyon:"
                    >
                        <Input placeholder="Lokasyon giriniz" />
                    </Form.Item>

                    <Form.Item
                        name="systemId"
                        label="Envanter (Sistem) Tanımı"
                        rules={[{ required: true, message: 'Sistem seçimi zorunludur!' }]}
                    >
                        <Select
                            placeholder="Seçiniz ..."
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {systems.map(system => (
                                <Select.Option key={system.id} value={system.id}>
                                    {system.systemName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="inventoryCategoryId"
                        label="Envanter Kategorisi"
                        rules={[{ required: true, message: 'Kategori seçimi zorunludur!' }]}
                    >
                        <Select
                            placeholder="Ürün Kategorisi Seçiniz ..."
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {inventoryCategories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.categoryName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="qrCode"
                        label="QR Kodu"
                        rules={[{ required: true, message: 'QR Kod zorunludur!' }]}
                    >
                        <Input placeholder="QR Kodu" maxLength={12} />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Aktif mi?"
                        rules={[{ required: true, message: 'Bu alan zorunludur!' }]}
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

export default SiteDeviceInventory;
