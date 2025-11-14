import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Select } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Squares = () => {
  const [data, setData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSquares();
    fetchBlocks();
  }, []);

  const fetchSquares = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/squares`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Adalar alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/blocks`);
      if (response.data && response.data.data) {
        setBlocks(response.data.data);
      } else {
        setBlocks([]);
      }
    } catch (error) {
      toast.error('Bloklar alınırken hata oluştu!');
      setBlocks([]);
    }
  };

  const showModal = async (record = null) => {
    if (blocks.length === 0) {
      await fetchBlocks();
    }
    
    setEditingRecord(record);
    setIsModalVisible(true);
    
    if (record) {
      setTimeout(() => {
        let blockId = record.blockId;
        if (!blockId && record.blockName) {
          const selectedBlock = blocks.find(b => b.blockName === record.blockName);
          blockId = selectedBlock ? selectedBlock.id : null;
        }
        
        form.setFieldsValue({
          squareName: record.squareName,
          blockId: blockId,
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
      if (values.blockId) {
        const selectedBlock = blocks.find(b => b.id === values.blockId);
        if (selectedBlock) {
          enrichedValues.blockName = selectedBlock.blockName;
        }
      }

      if (editingRecord) {
        try {
          await axios.put(`${config.apiUrl}/squares/${editingRecord.id}`, enrichedValues);
          toast.success('Ada başarıyla güncellendi!');
          fetchSquares();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Ada güncellenirken hata oluştu!');
        }
      } else {
        try {
          await axios.post(`${config.apiUrl}/squares`, enrichedValues);
          toast.success('Ada başarıyla oluşturuldu!');
          fetchSquares();
        } catch (error) {
          console.log(error);
          toast.error(error.response?.data?.message || 'Ada oluşturulurken hata oluştu!');
        }
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`${config.apiUrl}/squares/${key}`);
      toast.success('Ada başarıyla silindi!');
      fetchSquares();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ada silinirken hata oluştu!');
    }
  };

  const filteredData = data.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(searchText.toLowerCase());
  });

  const columns = [
    { 
      title: 'Ada Adı', 
      dataIndex: 'squareName', 
      key: 'squareName', 
      sorter: (a, b) => (a.squareName || '').localeCompare(b.squareName || '') 
    },
    { 
      title: 'Blok Adı', 
      dataIndex: 'blockName', 
      key: 'blockName', 
      sorter: (a, b) => (a.blockName || '').localeCompare(b.blockName || '') 
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
        <Button type="primary" onClick={() => showModal()}>Yeni Ada Ekle</Button>
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
        title={editingRecord ? 'Ada Düzenle' : 'Yeni Ada Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="blockId" 
            label="Blok"
            rules={[
              { required: true, message: 'Blok seçimi zorunludur!' }
            ]}
          >
            <Select
              placeholder="Blok seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {blocks.map(block => (
                <Select.Option key={block.id} value={block.id}>
                  {block.blockName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="squareName" 
            label="Ada Adı"
            rules={[
              { required: true, message: 'Ada adı zorunludur!' },
              { min: 1, message: 'En az 1 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: Ada 4, Ada 10, vb." />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Açıklama"
          >
            <Input.TextArea rows={3} placeholder="Ada açıklaması..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Squares;

