import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select } from 'antd';
import axios from 'axios';

const CariHesaplar = () => {
  const [data, setData] = useState([]);
  const [cariGroups, setCariGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/instant-groups/get-all-groups');
      if (response.data && response.data.data) {
        setCariGroups(response.data.data);
      } else {
        setCariGroups([]);
      }
    } catch (error) {
      message.error('Gruplar alınırken hata oluştu!');
      setCariGroups([]);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/instant-accounts/active');
      if (response.data && response.data.data) {
        // API'den dönen id veya uygun bir alanı key olarak kullan
        setData(response.data.data.map(item => ({ ...item, key: item.id || item.key || item.email })));
      } else {
        setData([]);
      }
    } catch (error) {
      message.error('Hesaplar alınırken hata oluştu!');
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
          await axios.put(`http://localhost:8080/api/instant-accounts/${editingRecord.key}`, values);
          message.success('Hesap başarıyla güncellendi!');
          fetchAccounts();
        } catch (error) {
          message.error('Güncelleme işlemi başarısız!');
        }
      } else {
        // Ekleme işlemi (local, isterseniz POST ekleyebilirim)
        setData([...data, { ...values, key: Date.now().toString() }]);
      }
      handleCancel();
    });
  };

  const handleDelete = async key => {
    try {
      await axios.delete(`http://localhost:8080/api/instant-accounts/${key}`);
      message.success('Hesap başarıyla silindi!');
      fetchAccounts();
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
    { title: 'Kullanıcı Adı', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: 'Cari Grup', dataIndex: 'accountGroupId', key: 'accountGroupId', sorter: (a, b) => a.accountGroupId.localeCompare(b.accountGroupId) },
    { title: 'Tip', dataIndex: 'userType', key: 'userType', sorter: (a, b) => a.userType.localeCompare(b.userType) },
    { title: 'Adı', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Soyadı', dataIndex: 'surname', key: 'surname', sorter: (a, b) => a.surname.localeCompare(b.surname) },
    { title: 'Firma', dataIndex: 'companyName', key: 'companyName', sorter: (a, b) => a.companyName.localeCompare(b.companyName) },
    { title: 'Yetkili', dataIndex: 'authorizedPerson', key: 'authorizedPerson', sorter: (a, b) => a.authorizedPerson.localeCompare(b.authorizedPerson) },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone', sorter: (a, b) => a.phone.localeCompare(b.phone) },
    { title: 'GSM', dataIndex: 'gsm', key: 'gsm', sorter: (a, b) => a.gsm.localeCompare(b.gsm) },
    { title: 'Aktif', dataIndex: 'isActive', key: 'isActive', sorter: (a, b) => a.isActive.localeCompare(b.isActive) },
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
      <Table columns={columns} dataSource={filteredData} rowKey="key" loading={loading} />
      <Modal
        title={editingRecord ? 'Düzenle' : 'Ekle'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="email" label="Kullanıcı Adı">
            <Input />
          </Form.Item>
          <Form.Item name="accountGroupId" label="Cari Grup">
            <Select
              placeholder="Cari Grup seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {cariGroups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.groupName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="userType" label="Tip">
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Adı">
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Soyadı">
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="Firma">
            <Input />
          </Form.Item>
          <Form.Item name="authorizedPerson" label="Yetkili">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input />
          </Form.Item>
          <Form.Item name="gsm" label="GSM">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Aktif">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CariHesaplar; 