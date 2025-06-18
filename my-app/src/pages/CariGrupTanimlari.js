import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';

const initialData = [
  { key: '1', groupName: 'Muhasebe / Finans' },
  { key: '2', groupName: 'Personel' },
  { key: '3', groupName: 'Teknik Müdür Yardımcısı' },
  { key: '4', groupName: 'Teknik Müdür' },
  { key: '5', groupName: 'Genel Kordinatör' },
  { key: '6', groupName: 'Araçlar' },
  { key: '7', groupName: 'Personeller' },
  { key: '8', groupName: 'Kat Sakinleri' },
  { key: '9', groupName: 'Müşteri/Tedarikçi' },
  { key: '10', groupName: 'Tedarikçi' },
];

const CariGrupTanimlari = () => {
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

  const filteredData = data.filter(item =>
    item.groupName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'Cari Grup Adı', dataIndex: 'groupName', key: 'groupName', sorter: (a, b) => a.groupName.localeCompare(b.groupName) },
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
      <Table columns={columns} dataSource={filteredData} rowKey="key" pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? 'Düzenle' : 'Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="groupName" label="Cari Grup Adı" rules={[{ required: true, message: 'Zorunlu alan' }]}> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CariGrupTanimlari; 