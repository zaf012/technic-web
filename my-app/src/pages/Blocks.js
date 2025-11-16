import React, {useState, useEffect} from 'react';
import {Table, Button, Modal, Form, Input, Space, Popconfirm, Select} from 'antd';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Blocks = () => {
    const [data, setData] = useState([]);
    const [squares, setSquares] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            await fetchSquares();
            await fetchBlocks();
        };
        loadData();
    }, []);

    const fetchBlocks = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiUrl}/blocks/get-all`);
            console.log('Blocks API Response:', response.data); // Debug için

            let blocksData = [];
            // Response direkt array olarak geliyor
            if (Array.isArray(response.data)) {
                blocksData = response.data;
            } else if (response.data && response.data.data) {
                blocksData = response.data.data;
            }

            // Adaları al (eğer yoksa)
            if (squares.length === 0) {
                await fetchSquares();
            }

            // Her blok için site adını ekle
            const enrichedData = blocksData.map(item => {
                const square = squares.find(s => s.id === item.squareId);
                return {
                    ...item,
                    key: item.id,
                    siteName: item.siteName || square?.siteName || '-'
                };
            });

            setData(enrichedData);
        } catch (error) {
            toast.error('Bloklar alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSquares = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/squares/get-all`);
            if (Array.isArray(response.data)) {
                setSquares(response.data);
            } else if (response.data && response.data.data) {
                setSquares(response.data.data);
            } else {
                setSquares([]);
            }
        } catch (error) {
            toast.error('Adalar alınırken hata oluştu!');
            setSquares([]);
        }
    };

    const showModal = async (record = null) => {
        if (squares.length === 0) {
            await fetchSquares();
        }

        setEditingRecord(record);
        setIsModalVisible(true);

        if (record) {
            setTimeout(() => {
                let squareId = record.squareId;
                if (!squareId && record.squareName) {
                    const selectedSquare = squares.find(s => s.squareName === record.squareName);
                    squareId = selectedSquare ? selectedSquare.id : null;
                }

                form.setFieldsValue({
                    blockName: record.blockName,
                    squareId: squareId,
                    blockCode: record.blockCode,
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
            const requestBody = {
                blockName: values.blockName,
                squareId: values.squareId,
                blockCode: values.blockCode || null,
                description: values.description || null
            };

            // squareName'i ekle
            if (values.squareId) {
                const selectedSquare = squares.find(s => s.id === values.squareId);
                if (selectedSquare) {
                    requestBody.squareName = selectedSquare.squareName;
                }
            }

            if (editingRecord) {
                try {
                    await axios.put(`${config.apiUrl}/blocks/${editingRecord.id}`, requestBody);
                    toast.success('Blok başarıyla güncellendi!');
                    fetchBlocks();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Blok güncellenirken hata oluştu!');
                }
            } else {
                try {
                    await axios.post(`${config.apiUrl}/blocks`, requestBody);
                    toast.success('Blok başarıyla oluşturuldu!');
                    fetchBlocks();
                } catch (error) {
                    console.log(error);
                    toast.error(error.response?.data?.message || 'Blok oluşturulurken hata oluştu!');
                }
            }
            handleCancel();
        });
    };

    const handleDelete = async key => {
        try {
            await axios.delete(`${config.apiUrl}/blocks/${key}`);
            toast.success('Blok başarıyla silindi!');
            fetchBlocks();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Blok silinirken hata oluştu!');
        }
    };

    const filteredData = data.filter(item => {
        const values = Object.values(item).join(' ').toLowerCase();
        return values.includes(searchText.toLowerCase());
    });

    const columns = [
        {
            title: 'Blok Adı',
            dataIndex: 'blockName',
            key: 'blockName',
            sorter: (a, b) => (a.blockName || '').localeCompare(b.blockName || '')
        },
        {
            title: 'Blok Kodu',
            dataIndex: 'blockCode',
            key: 'blockCode',
            sorter: (a, b) => (a.blockCode || '').localeCompare(b.blockCode || '')
        },
        {
            title: 'Ada Adı',
            dataIndex: 'squareName',
            key: 'squareName',
            sorter: (a, b) => (a.squareName || '').localeCompare(b.squareName || '')
        },
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
                <Button type="primary" onClick={() => showModal()}>Yeni Blok Ekle</Button>
                <Input.Search
                    placeholder="Arama yap..."
                    allowClear
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{width: 240}}
                />
            </div>
            <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} scroll={{ x: 'max-content' }} />
            <Modal
                title={editingRecord ? 'Blok Düzenle' : 'Yeni Blok Ekle'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Kaydet"
                cancelText="İptal"
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="squareId"
                        label="Ada Seçiniz"
                        rules={[
                            {required: true, message: 'Ada seçimi zorunludur!'}
                        ]}
                    >
                        <Select
                            placeholder="Ada seçiniz"
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                        name="blockName"
                        label="Blok Adı"
                        rules={[
                            {required: true, message: 'Blok adı zorunludur!'},
                            {min: 1, message: 'En az 1 karakter olmalıdır!'}
                        ]}
                    >
                        <Input placeholder="Blok için bir isim veriniz."/>
                    </Form.Item>
                    <Form.Item
                        name="blockCode"
                        label="Blok Kodu"
                    >
                        <Input placeholder="Blok için bir kod veriniz."/>
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Açıklama"
                    >
                        <Input.TextArea rows={3} placeholder="Ada ile ilgili notları yazabilirsiniz."/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Blocks;
