import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Radio, InputNumber } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const Systems = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/system-info/get-all-systems`);
      if (response.data ) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (error) {
        console.log(error);
      toast.error('Sistemler alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record = null) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    if (record) {
      form.setFieldsValue({
        systemName: record.systemName,
        systemOrderNo: record.systemOrderNo,
        isActive: record.isActive,
        description: record.description,
        isChecklist: record.isChecklist,
        isFault: record.isFault,
        controlPointOrder: record.controlPointOrder,
        controlPointIsActive: record.controlPointIsActive
      });
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
        // createdBy ve updatedBy hariç tüm alanları gönder
        const { createdBy, updatedBy, ...recordWithoutMetadata } = editingRecord;
        const updateData = {
          ...recordWithoutMetadata,
          ...values
        };
        try {
          await axios.put(`${config.apiUrl}/system-info/update-system/${editingRecord.id}`, updateData);
          toast.success('Sistem başarıyla güncellendi!');
          fetchSystems();
        } catch (error) {
          toast.error(error.response.message);
        }
      } else {
        // Ekleme işlemi (POST)
        try {
          await axios.post(`${config.apiUrl}/system-info/system`, values);
          toast.success('Sistem başarıyla oluşturuldu!');
          fetchSystems();
        } catch (error) {
          console.log(error);
          toast.error(error.response.message);
        }
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`${config.apiUrl}/system-info/systems/${key}`);
      toast.success('Sistem başarıyla silindi!');
      fetchSystems();
    } catch (error) {
      toast.error(error.response.message);
    }
  };

  // Filtrelenmiş veri
  const filteredData = data.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(searchText.toLowerCase());
  });
console.log('data', data, 'filteredData', filteredData);
  const columns = [
    { 
      title: 'Sistem Adı', 
      dataIndex: 'systemName', 
      key: 'systemName', 
      sorter: (a, b) => (a.systemName || '').localeCompare(b.systemName || ''),
      width: 200
    },
    { 
      title: 'Sistem Sırası', 
      dataIndex: 'systemOrderNo', 
      key: 'systemOrderNo', 
      sorter: (a, b) => (a.systemOrderNo || 0) - (b.systemOrderNo || 0),
      width: 120
    },
    { 
      title: 'Aktif', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive) => isActive === null ? '-' : (isActive ? 'Evet' : 'Hayır'),
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
      width: 80
    },
    { 
      title: 'Checklist', 
      dataIndex: 'isChecklist', 
      key: 'isChecklist',
      render: (isChecklist) => isChecklist === null ? '-' : (isChecklist ? 'Evet' : 'Hayır'),
      sorter: (a, b) => (a.isChecklist === b.isChecklist ? 0 : a.isChecklist ? 1 : -1),
      width: 100
    },
    { 
      title: 'Arıza', 
      dataIndex: 'isFault', 
      key: 'isFault',
      render: (isFault) => isFault === null ? '-' : (isFault ? 'Evet' : 'Hayır'),
      sorter: (a, b) => (a.isFault === b.isFault ? 0 : a.isFault ? 1 : -1),
      width: 80
    },
    { 
      title: 'Kontrol Noktası Sırası', 
      dataIndex: 'controlPointOrder', 
      key: 'controlPointOrder',
      render: (controlPointOrder) => controlPointOrder === null ? '-' : controlPointOrder,
      sorter: (a, b) => (a.controlPointOrder || 0) - (b.controlPointOrder || 0),
      width: 150
    },
    { 
      title: 'Kontrol Noktası Aktif', 
      dataIndex: 'controlPointIsActive', 
      key: 'controlPointIsActive',
      render: (controlPointIsActive) => controlPointIsActive === null ? '-' : (controlPointIsActive ? 'Evet' : 'Hayır'),
      sorter: (a, b) => (a.controlPointIsActive === b.controlPointIsActive ? 0 : a.controlPointIsActive ? 1 : -1),
      width: 150
    },
    { 
      title: 'Açıklama', 
      dataIndex: 'description', 
      key: 'description',
      render: (description) => description || '-',
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      width: 400
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)}>Düzenle</Button>
          <Popconfirm 
            title="Silmek istediğinize emin misiniz?" 
            onConfirm={() => handleDelete(record.id)} 
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
        <Button type="primary" onClick={() => showModal()}>Yeni Sistem Ekle</Button>
        <Input.Search
          placeholder="Arama yap..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 240 }}
        />
      </div>
      <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} scroll={{ x: 'max-content' }}/>
      <Modal
        title={editingRecord ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="systemName" 
            label="Sistem Adı"
            rules={[
              { required: true, message: 'Sistem adı zorunludur!' },
              { min: 2, message: 'En az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Sistem adını giriniz" />
          </Form.Item>
          <Form.Item 
            name="systemOrderNo" 
            label="Sistem Sıra No"
            rules={[
              { required: true, message: 'Sistem sıra no zorunludur!' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Sıra numarası giriniz" min={0} />
          </Form.Item>
          <Form.Item 
            name="isActive" 
            label="Sistem Aktif mi?"
            rules={[
              { required: true, message: 'Bu alan zorunludur!' }
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Evet</Radio>
              <Radio value={false}>Hayır</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="isChecklist" 
            label="Checklist mi?"
            rules={[
              { required: true, message: 'Bu alan zorunludur!' }
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Evet</Radio>
              <Radio value={false}>Hayır</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="isFault" 
            label="Hata mı?"
            rules={[
              { required: true, message: 'Bu alan zorunludur!' }
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Evet</Radio>
              <Radio value={false}>Hayır</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="controlPointOrder" 
            label="Kontrol Noktası Sırası"
            rules={[
              { required: true, message: 'Kontrol noktası sırası zorunludur!' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Kontrol noktası sırası" min={0} />
          </Form.Item>
          <Form.Item 
            name="controlPointIsActive" 
            label="Kontrol Noktası Aktif mi?"
            rules={[
              { required: true, message: 'Bu alan zorunludur!' }
            ]}
          >
            <Radio.Group>
              <Radio value={true}>Evet</Radio>
              <Radio value={false}>Hayır</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Açıklama"
          >
            <Input.TextArea rows={3} placeholder="Sistem açıklaması..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Systems;
