import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Select } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Blocks = () => {
  const [data, setData] = useState([]);
  const [sites, setSites] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlocks();
    fetchSites();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/blocks`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Bloklar alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/sites`);
      if (response.data && response.data.data) {
        setSites(response.data.data);
      } else {
        setSites([]);
      }
    } catch (error) {
      toast.error('Siteler alınırken hata oluştu!');
      setSites([]);
    }
  };

  const showModal = async (record = null) => {
    if (sites.length === 0) {
      await fetchSites();
    }
    
    setEditingRecord(record);
    setIsModalVisible(true);
    
    if (record) {
      setTimeout(() => {
        let siteId = record.siteId;
        if (!siteId && record.siteName) {
          const selectedSite = sites.find(s => s.siteName === record.siteName);
          siteId = selectedSite ? selectedSite.id : null;
        }
        
        form.setFieldsValue({
          blockName: record.blockName,
          siteId: siteId,
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
      const enrichedValues = { ...values };
      if (values.siteId) {
        const selectedSite = sites.find(s => s.id === values.siteId);
        if (selectedSite) {
          enrichedValues.siteName = selectedSite.siteName;
        }
      }

      if (editingRecord) {
        try {
          await axios.put(`${config.apiUrl}/blocks/${editingRecord.id}`, enrichedValues);
          toast.success('Blok başarıyla güncellendi!');
          fetchBlocks();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Blok güncellenirken hata oluştu!');
        }
      } else {
        try {
          await axios.post(`${config.apiUrl}/blocks`, enrichedValues);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button type="primary" onClick={() => showModal()}>Yeni Blok Ekle</Button>
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
            name="siteId" 
            label="Site"
            rules={[
              { required: true, message: 'Site seçimi zorunludur!' }
            ]}
          >
            <Select
              placeholder="Site seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
            name="blockName" 
            label="Blok Adı"
            rules={[
              { required: true, message: 'Blok adı zorunludur!' },
              { min: 1, message: 'En az 1 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: A Blok, 1.Etap, vb." />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Açıklama"
          >
            <Input.TextArea rows={3} placeholder="Blok açıklaması..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Blocks;

