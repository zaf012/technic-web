import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Select } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Projects = () => {
  const [data, setData] = useState([]);
  const [firms, setFirms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchFirms();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/projects/get-all`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Projeler alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/firms/get-all`);
      if (response.data && response.data.data) {
        setFirms(response.data.data);
      } else {
        setFirms([]);
      }
    } catch (error) {
      toast.error('Firmalar alınırken hata oluştu!');
      setFirms([]);
    }
  };

  const showModal = async (record = null) => {
    // Eğer firms listesi boşsa, önce firmaları yükle
    if (firms.length === 0) {
      await fetchFirms();
    }
    
    setEditingRecord(record);
    setIsModalVisible(true);
    
    if (record) {
      // Kısa bir süre bekle ki firms state güncellensin
      setTimeout(() => {
        // firmId'yi belirle - önce record'daki firmId'ye bak, yoksa firmName'den bul
        let firmId = record.firmId;
        if (!firmId && record.firmName) {
          const selectedFirm = firms.find(f => f.firmName === record.firmName);
          firmId = selectedFirm ? selectedFirm.id : null;
        }
        
        form.setFieldsValue({
          projectName: record.projectName,
          firmId: firmId
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
      // firmId için firmName ekle
      const enrichedValues = { ...values };
      if (values.firmId) {
        const selectedFirm = firms.find(f => f.id === values.firmId);
        if (selectedFirm) {
          enrichedValues.firmName = selectedFirm.firmName;
        }
      }

      if (editingRecord) {
        // Güncelleme işlemi (PUT)
        try {
          await axios.put(`${config.apiUrl}/projects/update/${editingRecord.id}`, enrichedValues);
          toast.success('Proje başarıyla güncellendi!');
          fetchProjects();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post(`${config.apiUrl}/projects/create`, enrichedValues);
          toast.success('Proje başarıyla oluşturuldu!');
          fetchProjects();
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
      await axios.delete(`${config.apiUrl}/projects/delete/${key}`);
      toast.success('Proje başarıyla silindi!');
      fetchProjects();
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
      title: 'Proje Adı', 
      dataIndex: 'projectName', 
      key: 'projectName', 
      sorter: (a, b) => (a.projectName || '').localeCompare(b.projectName || '') 
    },
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
        <Button type="primary" onClick={() => showModal()}>Yeni Proje Ekle</Button>
        <Input.Search
          placeholder="Arama yap..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
      <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} scroll={{ x: 'max-content' }}/>
      <Modal
        title={editingRecord ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={form} layout="vertical">
        <Form.Item 
            name="firmId" 
            label="Firma"
            rules={[
              { required: true, message: 'Firma seçimi zorunludur!' }
            ]}
          >
            <Select
              placeholder="Firma seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {firms.map(firm => (
                <Select.Option key={firm.id} value={firm.id}>
                  {firm.firmName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="projectName" 
            label="Proje Adı"
            rules={[
              { required: true, message: 'Proje adı zorunludur!' },
              { min: 2, message: 'En az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: DAP Yapı Royal, Nurol Tower, vb." />
          </Form.Item>
         
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;
