import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import axios from 'axios';
import config from '../config';

const UserTypes = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/user-types/get-all`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      message.error('Kullanıcı tipleri alınırken hata oluştu!');
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
    form.validateFields().then(async values => {
      if (editingRecord) {
        
        // Güncelleme işlemi (PUT)
        try {
          await axios.put(`${config.apiUrl}/user-types/update/${editingRecord.id}`, values);
          message.success('Kullanıcı tipi başarıyla güncellendi!');
          fetchUserTypes();
        } catch (error) {
          message.error('Güncelleme işlemi başarısız!');
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post(`${config.apiUrl}/user-types/create`, values);
          message.success('Kullanıcı tipi başarıyla oluşturuldu!');
          fetchUserTypes();
        } catch (error) {
          message.error('Oluşturma işlemi başarısız!');
        }
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`${config.apiUrl}/user-types/delete/${key}`);
      message.success('Kullanıcı tipi başarıyla silindi!');
      fetchUserTypes();
    } catch (error) {
      message.error('Silme işlemi başarısız!');
    }
  };

  // Filtrelenmiş veri
  const filteredData = data.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(searchText.toLowerCase());
  });

  const columns = [
    { 
      title: 'Kullanıcı Tipi Adı', 
      dataIndex: 'userTypeName', 
      key: 'userTypeName', 
      sorter: (a, b) => (a.userTypeName || '').localeCompare(b.userTypeName || '') 
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>Yeni Kullanıcı Tipi Ekle</Button>
        <Input.Search
          placeholder="Arama yap..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
      <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} scroll={{ x: 'max-content' }} />
      <Modal
        title={editingRecord ? 'Kullanıcı Tipi Düzenle' : 'Yeni Kullanıcı Tipi Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="userTypeName" 
            label="Kullanıcı Tipi Adı"
            rules={[
              { required: true, message: 'Kullanıcı tipi adı zorunludur!' },
              { min: 2, message: 'En az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: Site Sakini, Yönetici, vb." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserTypes;
