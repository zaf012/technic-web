import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

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
      const response = await axios.get(`${config.apiUrl}/firms/get-all`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Firmalar alınırken hata oluştu!');
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
          await axios.put(`${config.apiUrl}/firms/update/${editingRecord.id}`, values);
          toast.success('Firma başarıyla güncellendi!');
          fetchFirms();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post(`${config.apiUrl}/firms/create`, values);
          toast.success('Firma başarıyla oluşturuldu!');
          fetchFirms();
        } catch (error) {
          console.log(error);
          toast.error(error.response.data.message);
        }
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`${config.apiUrl}/firms/delete/${key}`);
      toast.success('Firma başarıyla silindi!');
      fetchFirms();
    } catch (error) {
      toast.error(error.response.data.message);
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
