import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message, Select, Radio } from 'antd';
import axios from 'axios';

const CariHesaplar = () => {
  const [data, setData] = useState([]);
  const [cariGroups, setCariGroups] = useState([]);
  const [sites, setSites] = useState([]);
  const [firms, setFirms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchGroups();
    fetchSites();
    fetchFirms();
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

  const fetchSites = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/sites/get-all');
      if (response.data && response.data.data) {
        setSites(response.data.data);
      } else {
        setSites([]);
      }
    } catch (error) {
      message.error('Siteler alınırken hata oluştu!');
      setSites([]);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/firms/get-all');
      if (response.data && response.data.data) {
        setFirms(response.data.data);
      } else {
        setFirms([]);
      }
    } catch (error) {
      message.error('Firmalar alınırken hata oluştu!');
      setFirms([]);
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
      { title: 'Cari Grup Adı', dataIndex: 'accountGroupName', key: 'accountGroupName', sorter: (a, b) => a.accountGroupName.localeCompare(b.accountGroupName) },
      { title: 'Site Adı', dataIndex: 'siteName', key: 'siteName', sorter: (a, b) => a.siteName.localeCompare(b.siteName) },
      { title: 'Tip', dataIndex: 'userTypeName', key: 'userTypeName', sorter: (a, b) => a.userTypeName.localeCompare(b.userTypeName) },
      { title: 'Yetkli Personel', dataIndex: 'authorizedPersonnel', key: 'authorizedPersonnel', sorter: (a, b) => a.authorizedPersonnel.localeCompare(b.authorizedPersonnel) },
      { title: 'Firma', dataIndex: 'companyName', key: 'companyName', sorter: (a, b) => a.companyName.localeCompare(b.companyName) },
      { title: 'Telefon', dataIndex: 'phone', key: 'phone', sorter: (a, b) => a.phone.localeCompare(b.phone) },
      { title: 'GSM', dataIndex: 'gsm', key: 'gsm', sorter: (a, b) => a.gsm.localeCompare(b.gsm) },
      { title: 'Aktif', dataIndex: 'isActive', key: 'isActive', 
        render: (isActive) => isActive ? 'Evet' : 'Hayır',
        sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1)
      },
    { title: 'Tip', dataIndex: 'userType', key: 'userType', sorter: (a, b) => a.userType.localeCompare(b.userType) },
    { title: 'Adı', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Soyadı', dataIndex: 'surname', key: 'surname', sorter: (a, b) => a.surname.localeCompare(b.surname) },
    { title: 'Firma', dataIndex: 'companyName', key: 'companyName', sorter: (a, b) => a.companyName.localeCompare(b.companyName) },
    { title: 'Yetkili', dataIndex: 'authorizedPerson', key: 'authorizedPerson', sorter: (a, b) => a.authorizedPerson.localeCompare(b.authorizedPerson) },
    { title: 'Telefon', dataIndex: 'phone', key: 'phone', sorter: (a, b) => a.phone.localeCompare(b.phone) },
    { title: 'GSM', dataIndex: 'gsm', key: 'gsm', sorter: (a, b) => a.gsm.localeCompare(b.gsm) },
    { title: 'Aktif', dataIndex: 'isActive', key: 'isActive', 
      render: (isActive) => isActive ? 'Evet' : 'Hayır',
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1)
    },
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
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Kullanıcı Adı">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="password" label="Şifre">
            <Input.Password />
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
          <Form.Item name="siteId" label="Site">
            <Select
              placeholder="Site seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {sites.map(site => (
                <Select.Option key={site.id} value={site.id}>
                  {site.siteName} - {site.projectName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="firmId" label="Firma">
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
          <Form.Item name="companyShortName" label="Firma Kısa Adı">
            <Input />
          </Form.Item>
          <Form.Item name="projectName" label="Proje Adı">
            <Input />
          </Form.Item>
          <Form.Item name="authorizedPersonnel" label="Yetkili Personel">
            <Input />
          </Form.Item>
          <Form.Item name="phoneCountryCode" label="Telefon Ülke Kodu">
            <Input placeholder="+90" />
          </Form.Item>
          <Form.Item name="phone" label="Telefon">
            <Input />
          </Form.Item>
          <Form.Item name="gsmCountryCode" label="GSM Ülke Kodu">
            <Input placeholder="+90" />
          </Form.Item>
          <Form.Item name="gsm" label="GSM">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Adres">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="fax" label="Fax">
            <Input />
          </Form.Item>
          <Form.Item name="pttBox" label="PTT Kutusu">
            <Input />
          </Form.Item>
          <Form.Item name="postalCode" label="Posta Kodu">
            <Input />
          </Form.Item>
          <Form.Item name="taxNumber" label="Vergi Numarası">
            <Input />
          </Form.Item>
          <Form.Item name="tcIdentityNo" label="TC Kimlik No">
            <Input />
          </Form.Item>
          <Form.Item name="bankAddress" label="Banka Adresi">
            <Input />
          </Form.Item>
          <Form.Item name="riskLimit" label="Risk Limiti">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="riskLimitExplanation" label="Risk Limit Açıklaması">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="userStatus" label="Kullanıcı Durumu">
            <Radio.Group>
              <Radio value={true}>Aktif</Radio>
              <Radio value={false}>Pasif</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="active" label="Cari Hesap Durumu">
            <Radio.Group>
              <Radio value={true}>Aktif</Radio>
              <Radio value={false}>Pasif</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CariHesaplar; 