import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import axios from 'axios';

const CariGrupTanimlari = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/instant-groups/get-all-groups');
      if (response.data && response.data.data) {
        // API'den dönen id'yi key olarak kullan
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      message.error('Gruplar alınırken hata oluştu!');
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

  const handleDelete = async key => {
    try {
      await axios.delete(`http://localhost:8080/api/instant-groups/delete-group/${key}`);
      message.success('Grup başarıyla silindi!');
      fetchGroups(); // Tabloyu güncelle
    } catch (error) {
      message.error('Silme işlemi başarısız!');
    }
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
      <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} pagination={{ pageSize: 10 }} />
      <Modal
        title={editingRecord ? 'Düzenle' : 'Ekle'}
        open={isModalVisible}
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