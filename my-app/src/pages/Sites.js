import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Select } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Sites = () => {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchProjects();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/sites/get-all`);
      if (response.data && response.data.data) {
        setData(response.data.data.map(item => ({ ...item, key: item.id })));
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error('Siteler alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/projects/get-all`);
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      toast.error('Projeler alınırken hata oluştu!');
      setProjects([]);
    }
  };

  const showModal = async (record = null) => {
    // Eğer projects listesi boşsa, önce projeleri yükle
    if (projects.length === 0) {
      await fetchProjects();
    }
    
    setEditingRecord(record);
    setIsModalVisible(true);
    
    if (record) {
      // Kısa bir süre bekle ki projects state güncellensin
      setTimeout(() => {
        // projectId'yi belirle - önce record'daki projectId'ye bak, yoksa projectName'den bul
        let projectId = record.projectId;
        if (!projectId && record.projectName) {
          const selectedProject = projects.find(p => p.projectName === record.projectName);
          projectId = selectedProject ? selectedProject.id : null;
        }
        
        form.setFieldsValue({
          siteName: record.siteName,
          projectId: projectId,
          description: record.description,
          square: record.square,
          blockName: record.blockName
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
      // projectId için projectName ekle
      const enrichedValues = { ...values };
      if (values.projectId) {
        const selectedProject = projects.find(p => p.id === values.projectId);
        if (selectedProject) {
          enrichedValues.projectName = selectedProject.projectName;
        }
      }

      if (editingRecord) {
        // Güncelleme işlemi (PUT)
        try {
          await axios.put(`${config.apiUrl}/sites/update/${editingRecord.id}`, enrichedValues);
          toast.success('Site başarıyla güncellendi!');
          fetchSites();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post(`${config.apiUrl}/sites/create`, enrichedValues);
          toast.success('Site başarıyla oluşturuldu!');
          fetchSites();
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
      await axios.delete(`${config.apiUrl}/sites/delete/${key}`);
      toast.success('Site başarıyla silindi!');
      fetchSites();
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
      title: 'Site Adı', 
      dataIndex: 'siteName', 
      key: 'siteName', 
      sorter: (a, b) => (a.siteName || '').localeCompare(b.siteName || '') 
    },
    { 
      title: 'Proje Adı', 
      dataIndex: 'projectName', 
      key: 'projectName', 
      sorter: (a, b) => (a.projectName || '').localeCompare(b.projectName || '') 
    },
    { 
      title: 'Blok Adı', 
      dataIndex: 'blockName', 
      key: 'blockName', 
      sorter: (a, b) => (a.blockName || '').localeCompare(b.blockName || '') 
    },
    { 
      title: 'Ada', 
      dataIndex: 'square', 
      key: 'square', 
      sorter: (a, b) => (a.square || '').localeCompare(b.square || '') 
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
        <Button type="primary" onClick={() => showModal()}>Yeni Site Ekle</Button>
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
        title={editingRecord ? 'Site Düzenle' : 'Yeni Site Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="projectId" 
            label="Proje"
            rules={[
              { required: true, message: 'Proje seçimi zorunludur!' }
            ]}
          >
            <Select
              placeholder="Proje seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {projects.map(project => (
                <Select.Option key={project.id} value={project.id}>
                  {project.projectName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item 
            name="siteName" 
            label="Site Adı"
            rules={[
              { required: true, message: 'Site adı zorunludur!' },
              { min: 2, message: 'En az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Örn: DAP Mesa Kartal, TOKİ Mamak Konutları, vb." />
          </Form.Item>
          <Form.Item 
            name="blockName" 
            label="Blok Adı"
            rules={[
              { required: true, message: 'Blok adı zorunludur!' }
            ]}
          >
            <Input placeholder="Örn: A Blok, 1.Etap, vb." />
          </Form.Item>
          <Form.Item 
            name="square" 
            label="Ada"
            rules={[
              { required: true, message: 'Ada zorunludur!' }
            ]}
          >
            <Input placeholder="Örn: Ada 4, Ada 10, vb." />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Açıklama"
          >
            <Input.TextArea rows={3} placeholder="Site açıklaması..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Sites;
