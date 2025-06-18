import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';

const initialData = Array.from({ length: 100 }, (_, i) => ({
  key: (i + 1).toString(),
  email: `user${i + 1}@example.com`,
  group: i % 2 === 0 ? 'Müşteri/Tedarikçi' : 'Müşteri',
  type: 'Ana Kullanıcı',
  name: `Ad${i + 1}`,
  surname: `Soyad${i + 1}`,
  company: `Firma ${i + 1}`,
  manager: `Yetkili ${i + 1}`,
  phone: `5${String(300000000 + i).padStart(9, '0')}`,
  gsm: `5${String(300000000 + i).padStart(9, '0')}`,
  active: '1',
}));

const CariHesaplar = () => {
  const [data, setData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

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
    { title: 'Kullanıcı Adı', dataIndex: 'email', key: 'email' },
    { title: 'Cari Grup', dataIndex: 'group', key: 'group' },
    { title: 'Tip', dataIndex: 'type', key: 'type' },
    { title: 'Adı', dataIndex: 'name', key: 'name' },
    { title: 'Soyadı', dataIndex: 'surname', key: 'surname' },
    { title: 'Firma', dataIndex: 'company', key: 'company' },
    { title: 'Yetkili', dataIndex: 'manager', key: 'manager' },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone' },
    { title: 'GSM', dataIndex: 'gsm', key: 'gsm' },
    { title: 'Aktif', dataIndex: 'active', key: 'active' },
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
      <Table columns={columns} dataSource={filteredData} rowKey="key" />
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