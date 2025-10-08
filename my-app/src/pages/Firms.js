import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from 'antd';
import axios from 'axios';

const Firms = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/firms/get-all');
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      message.error('Firmalar alınırken hata oluştu!');
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
          await axios.put(`http://localhost:8080/api/firms/update/${editingRecord.id}`, values);
          message.success('Firma başarıyla güncellendi!');
          fetchFirms();
        } catch (error) {
          message.error('Güncelleme işlemi başarısız!');
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post('http://localhost:8080/api/firms/create', values);
          message.success('Firma başarıyla oluşturuldu!');
          fetchFirms();
        } catch (error) {
          message.error('Oluşturma işlemi başarısız!');
        }
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`http://localhost:8080/api/firms/delete/${key}`);
      message.success('Firma başarıyla silindi!');
      fetchFirms();
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
      title: 'Firma Adı', 
      dataIndex: 'firmName', 
      key: 'firmName', 
      sorter: (a, b) => (a.firmName || '').localeCompare(b.firmName || '') 
    },
    { 
      title: 'Oluşturulma Tarihi', 
      dataIndex: 'createdDate', 
      key: 'createdDate',
      sorter: (a, b) => (a.createdDate || '').localeCompare(b.createdDate || '')
    },
    { 
      title: 'Oluşturan', 
      dataIndex: 'createdBy', 
      key: 'createdBy',
      sorter: (a, b) => (a.createdBy || '').localeCompare(b.createdBy || '')
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
        <Button type="primary" onClick={() => showModal()}>Yeni Firma Ekle</Button>
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
        title={editingRecord ? 'Firma Düzenle' : 'Yeni Firma Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="firmName" 
            label="Firma Adı"
            rules={[
              { required: true, message: 'Firma adı zorunludur!' },
              { min: 2, message: 'En az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: Akfen İnşaat, DAP Yapı, vb." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Firms;
