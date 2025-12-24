import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Alert } from 'antd';
import serviceCaseService from '../services/ServiceCaseService';

const ServiceCases = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null); // Modal içinde hata mesajı için

  useEffect(() => {
    fetchServiceCases();
  }, []);

  const fetchServiceCases = async () => {
    setLoading(true);
    try {
      const data = await serviceCaseService.fetchAll();
      setData(data.map(item => ({ ...item, key: item.id })));
    } catch (error) {
      message.error('Hizmet koşulları alınırken hata oluştu!');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record = null) => {
    setEditingRecord(record);
    setIsModalVisible(true);
    setFormError(null); // Hata mesajını temizle
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    setFormError(null); // Hata mesajını temizle
    form.resetFields();
  };

  const handleOk = () => {
    setFormError(null); // Önce hata mesajını temizle

    form.validateFields().then(async values => {
      try {
        if (editingRecord) {
          // Güncelleme işlemi
          await serviceCaseService.update(editingRecord.key, values);
          message.success('Hizmet koşulu başarıyla güncellendi!');
        } else {
          // Ekleme işlemi
          await serviceCaseService.create(values);
          message.success('Hizmet koşulu başarıyla eklendi!');
        }
        fetchServiceCases();
        handleCancel();
      } catch (error) {
        console.log('🔴 Error yakalandı:', error);
        console.log('🔴 error.response:', error.response);
        console.log('🔴 error.response?.data:', error.response?.data);
        console.log('🔴 error.response?.data?.message:', error.response?.data?.message);

        // Backend'den gelen hata mesajını al
        let errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message;

        console.log('🔴 Gösterilecek mesaj:', errorMessage);

        // Eğer mesaj yoksa HTTP status code'a göre mesaj oluştur
        if (!errorMessage && error.response?.status === 400) {
          errorMessage = editingRecord
            ? 'Bu hizmet koşulu adı zaten kullanılıyor veya geçersiz bir değer girdiniz!'
            : 'Bu hizmet koşulu adı zaten mevcut veya geçersiz bir değer girdiniz!';
        } else if (!errorMessage) {
          errorMessage = 'İşlem başarısız!';
        }

        // Modal içinde hata mesajını göster
        setFormError(errorMessage);

        // Ayrıca toast message da göster
        message.error(errorMessage);

        console.error('Hizmet koşulu işlem hatası:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          error
        });
      }
    }).catch(validationError => {
      // Form validasyon hatası
      console.error('Form validasyon hatası:', validationError);
    });
  };

  const handleDelete = async key => {
    try {
      await serviceCaseService.delete(key);
      message.success('Hizmet koşulu başarıyla silindi!');
      fetchServiceCases();
    } catch (error) {
      // Backend'den gelen hata mesajını göster
      let errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message;

      // Eğer mesaj yoksa HTTP status code'a göre mesaj oluştur
      if (!errorMessage && error.response?.status === 404) {
        errorMessage = 'Hizmet koşulu bulunamadı!';
      } else if (!errorMessage) {
        errorMessage = 'Silme işlemi başarısız!';
      }

      message.error(errorMessage);
      console.error('Hizmet koşulu silme hatası:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        error
      });
    }
  };

  const filteredData = data.filter(item =>
    item.serviceCaseName.toLowerCase().includes(searchText.toLowerCase())
  );
  const columns = [
    {
      title: 'Hizmet Koşulu',
      dataIndex: 'serviceCaseName',
      key: 'serviceCaseName',
      sorter: (a, b) => a.serviceCaseName.localeCompare(b.serviceCaseName)
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
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
        <Button type="primary" onClick={() => showModal()}>Yeni Hizmet Koşulu Ekle</Button>
        <Input.Search
          placeholder="Hizmet koşulu ara..."
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Toplam ${total} kayıt`
        }}
      />
      <Modal
        title={editingRecord ? 'Hizmet Koşulunu Düzenle' : 'Yeni Hizmet Koşulu Ekle'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
      >
        {formError && (
          <Alert
            message="Hata"
            description={formError}
            type="error"
            showIcon
            closable
            onClose={() => setFormError(null)}
            style={{ marginBottom: 16 }}
          />
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="serviceCaseName"
            label="Hizmet Koşulu"
            rules={[
              { required: true, message: 'Hizmet koşulu adı zorunludur!' },
              { max: 255, message: 'Maksimum 255 karakter olabilir!' }
            ]}
          >
            <Input placeholder="Örn: Bakım Sözleşmesi" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceCases;

