import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import axios from 'axios';

const CariHesaplar = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/instant-accounts/active');
      if (response.data && response.data.data) {
        // API'den dönen id veya uygun bir alanı key olarak kullan
        setData(response.data.data.map(item => ({ ...item, key: item.id || item.key || item.email })));
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
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingRecord) {
        setData(data.map(item => (item.key === editingRecord.key ? { ...editingRecord, ...values } : item)));
      } else {
        setData([...data, { ...values, key: Date.now().toString() }]);
      }
      handleCancel();
    });
  };

  const handleDelete = key => {
    setData(data.filter(item => item.key !== key));
  };

  // Filtrelenmiş veri
  const filteredData = data.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(searchText.toLowerCase());
  });

  const columns = [
    { title: 'Kullanıcı Adı', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: 'Cari Grup', dataIndex: 'group', key: 'group', sorter: (a, b) => a.group.localeCompare(b.group) },
    { title: 'Tip', dataIndex: 'type', key: 'type', sorter: (a, b) => a.type.localeCompare(b.type) },
    { title: 'Adı', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Soyadı', dataIndex: 'surname', key: 'surname', sorter: (a, b) => a.surname.localeCompare(b.surname) },
    { title: 'Firma', dataIndex: 'company', key: 'company', sorter: (a, b) => a.company.localeCompare(b.company) },
    { title: 'Yetkili', dataIndex: 'manager', key: 'manager', sorter: (a, b) => a.manager.localeCompare(b.manager) },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone', sorter: (a, b) => a.phone.localeCompare(b.phone) },
    { title: 'GSM', dataIndex: 'gsm', key: 'gsm', sorter: (a, b) => a.gsm.localeCompare(b.gsm) },
    { title: 'Aktif', dataIndex: 'active', key: 'active', sorter: (a, b) => a.active.localeCompare(b.active) },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)}>Düzenle</Button>
          <Popconfirm title="Silmek istediğinize emin misiniz?" onConfirm={() => handleDelete(record.key)} okText="Evet" cancelText="Hayır">
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>Ekle</Button>
        <Input.Search
          placeholder="Arama yap..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
      <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} />
      <Modal
        title={editingRecord ? 'Düzenle' : 'Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="email" label="Kullanıcı Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="group" label="Cari Grup" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Tip" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Soyadı" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Firma" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="manager" label="Yetkili" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gsm" label="GSM" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="active" label="Aktif" rules={[{ required: true, message: 'Zorunlu alan' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CariHesaplar; 