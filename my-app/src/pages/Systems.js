import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Radio, InputNumber, Tabs, Tag, Select, Card } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

const { TextArea } = Input;

const Systems = () => {
  // Tab 1: Sistem Tanımları
  const [systemsData, setSystemsData] = useState([]);
  const [isSystemModalVisible, setIsSystemModalVisible] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);
  const [systemForm] = Form.useForm();
  const [systemSearchText, setSystemSearchText] = useState('');

  // Tab 2: Checklist/Arıza Maddeleri
  const [checklistFaultData, setChecklistFaultData] = useState([]);
  const [isChecklistFaultModalVisible, setIsChecklistFaultModalVisible] = useState(false);
  const [editingChecklistFault, setEditingChecklistFault] = useState(null);
  const [checklistFaultForm] = Form.useForm();
  const [checklistFaultSearchText, setChecklistFaultSearchText] = useState('');
  const [availableSystems, setAvailableSystems] = useState([]);

  // Genel
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    fetchSystems();
    fetchAllChecklistsAndFaults();
  }, []);

  // ===== TAB 1: Sistem Tanımları Fonksiyonları =====

  const fetchSystems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/system-info/get-all-systems`);
      if (response.data) {
        // Sadece description NULL olanları filtrele (sistem tanımları)
        const systemDefinitions = response.data.filter(system =>
          !system.description || system.description === null || system.description.trim() === ''
        );

        // Her sistem için checklist ve arıza sayılarını getir
        const systemsWithCounts = await Promise.all(
          systemDefinitions.map(async (system) => {
            try {
              const [checklistCountRes, faultCountRes] = await Promise.all([
                axios.get(`${config.apiUrl}/system-info/systems/${system.systemName}/checklists/count`),
                axios.get(`${config.apiUrl}/system-info/systems/${system.systemName}/faults/count`)
              ]);
              return {
                ...system,
                checklistCount: checklistCountRes.data || 0,
                faultCount: faultCountRes.data || 0
              };
            } catch (error) {
              console.error(`Count error for ${system.systemName}:`, error);
              return {
                ...system,
                checklistCount: 0,
                faultCount: 0
              };
            }
          })
        );
        setSystemsData(systemsWithCounts);
        // Mevcut sistemleri Tab 2 için sakla (description NULL olanlar)
        setAvailableSystems(systemsWithCounts);
      } else {
        setSystemsData([]);
        setAvailableSystems([]);
      }
    } catch (error) {
      console.log(error);
      toast.error('Sistemler alınırken hata oluştu!');
      setSystemsData([]);
      setAvailableSystems([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== TAB 2: Checklist/Arıza Fonksiyonları =====

  const fetchAllChecklistsAndFaults = async () => {
    setLoading(true);
    try {
      // Önce tüm sistem adlarını al
      const systemNamesRes = await axios.get(`${config.apiUrl}/system-info/system-names`);
      const systemNames = systemNamesRes.data || [];

      // Her sistem için checklist ve fault'ları getir
      const allRecords = [];
      for (const systemName of systemNames) {
        try {
          const [checklistsRes, faultsRes] = await Promise.all([
            axios.get(`${config.apiUrl}/system-info/systems/${systemName}/checklists`),
            axios.get(`${config.apiUrl}/system-info/systems/${systemName}/faults`)
          ]);

          if (checklistsRes.data) {
            // Sadece description DOLU olanları ekle (checklist/arıza kayıtları)
            const validChecklists = checklistsRes.data.filter(item =>
              item.description && item.description !== null && item.description.trim() !== ''
            );
            allRecords.push(...validChecklists);
          }
          if (faultsRes.data) {
            // Sadece description DOLU olanları ekle (checklist/arıza kayıtları)
            const validFaults = faultsRes.data.filter(item =>
              item.description && item.description !== null && item.description.trim() !== ''
            );
            allRecords.push(...validFaults);
          }
        } catch (error) {
          console.error(`Error fetching records for ${systemName}:`, error);
        }
      }

      setChecklistFaultData(allRecords);
    } catch (error) {
      console.log(error);
      toast.error('Checklist/Arıza kayıtları alınırken hata oluştu!');
      setChecklistFaultData([]);
    } finally {
      setLoading(false);
    }
  };

  // Tab 1: Sistem Modal Fonksiyonları
  const showSystemModal = (record = null) => {
    setEditingSystem(record);
    setIsSystemModalVisible(true);
    if (record) {
      systemForm.setFieldsValue({
        systemName: record.systemName,
        systemOrderNo: record.systemOrderNo,
        isActive: record.isActive
      });
    } else {
      systemForm.resetFields();
      systemForm.setFieldsValue({ isActive: true }); // Default aktif
    }
  };

  const handleSystemCancel = () => {
    setIsSystemModalVisible(false);
    setEditingSystem(null);
    systemForm.resetFields();
  };

  const handleSystemOk = () => {
    systemForm.validateFields().then(async values => {
      try {
        if (editingSystem) {
          // Güncelleme - sadece temel alanlar
          const updateData = {
            id: editingSystem.id,
            systemName: values.systemName,
            systemOrderNo: values.systemOrderNo,
            isActive: values.isActive
          };
          await axios.put(`${config.apiUrl}/system-info/update-system`, updateData);
          toast.success('Sistem başarıyla güncellendi!');
        } else {
          // Yeni ekleme - sadece temel alanlar
          const createData = {
            systemName: values.systemName,
            systemOrderNo: values.systemOrderNo,
            isActive: values.isActive
          };
          await axios.post(`${config.apiUrl}/system-info/system`, createData);
          toast.success('Sistem başarıyla oluşturuldu!');
        }
        fetchSystems();
        handleSystemCancel();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu!');
      }
    });
  };

  const handleSystemDelete = async (id) => {
    try {
      await axios.delete(`${config.apiUrl}/system-info/systems/${id}`);
      toast.success('Sistem başarıyla silindi!');
      fetchSystems();
      fetchAllChecklistsAndFaults(); // Tab 2'yi de güncelle
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme işlemi başarısız!');
    }
  };

  // Tab 2: Checklist/Fault Modal Fonksiyonları
  const showChecklistFaultModal = (record = null) => {
    setEditingChecklistFault(record);
    setIsChecklistFaultModalVisible(true);
    if (record) {
      checklistFaultForm.setFieldsValue({
        systemId: record.systemId || availableSystems.find(s => s.systemName === record.systemName)?.id,
        description: record.description,
        controlPointOrder: record.controlPointOrder,
        controlPointIsActive: record.controlPointIsActive,
        type: record.isChecklist ? 'checklist' : 'fault'
      });
    } else {
      checklistFaultForm.resetFields();
      checklistFaultForm.setFieldsValue({
        controlPointIsActive: true,
        type: 'checklist'
      });
    }
  };

  const handleChecklistFaultCancel = () => {
    setIsChecklistFaultModalVisible(false);
    setEditingChecklistFault(null);
    checklistFaultForm.resetFields();
  };

  const handleChecklistFaultOk = () => {
    checklistFaultForm.validateFields().then(async values => {
      try {
        const requestData = {
          systemId: values.systemId,
          description: values.description,
          controlPointOrder: values.controlPointOrder,
          controlPointIsActive: values.controlPointIsActive,
          checklist: values.type === 'checklist',
          fault: values.type === 'fault'
        };

        if (editingChecklistFault) {
          // Güncelleme
          requestData.id = editingChecklistFault.id;
          await axios.put(`${config.apiUrl}/system-info/checklists-faults`, requestData);
          toast.success('Kayıt başarıyla güncellendi!');
        } else {
          // Yeni ekleme
          await axios.post(`${config.apiUrl}/system-info/checklists-faults`, requestData);
          toast.success(`${values.type === 'checklist' ? 'Checklist' : 'Arıza'} başarıyla oluşturuldu!`);
        }
        fetchAllChecklistsAndFaults();
        fetchSystems(); // Count'ları güncellemek için
        handleChecklistFaultCancel();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu!');
      }
    });
  };

  const handleChecklistFaultDelete = async (record) => {
    try {
      if (record.isChecklist) {
        await axios.delete(`${config.apiUrl}/system-info/checklists/${record.id}`);
        toast.success('Checklist başarıyla silindi!');
      } else if (record.isFault) {
        await axios.delete(`${config.apiUrl}/system-info/faults/${record.id}`);
        toast.success('Arıza başarıyla silindi!');
      }
      fetchAllChecklistsAndFaults();
      fetchSystems(); // Count'ları güncellemek için
    } catch (error) {
      toast.error(error.response?.data?.message || 'Silme işlemi başarısız!');
    }
  };

  // Filtrelenmiş veriler
  const filteredSystemsData = systemsData.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(systemSearchText.toLowerCase());
  });

  const filteredChecklistFaultData = checklistFaultData.filter(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    return values.includes(checklistFaultSearchText.toLowerCase());
  });

  // Tab 1: Sistem Tanımları Kolonları
  const systemColumns = [
    {
      title: 'Sistem Adı',
      dataIndex: 'systemName',
      key: 'systemName',
      sorter: (a, b) => (a.systemName || '').localeCompare(b.systemName || ''),
      width: 200
    },
    {
      title: 'Sistem Sıra No',
      dataIndex: 'systemOrderNo',
      key: 'systemOrderNo',
      sorter: (a, b) => (a.systemOrderNo || 0) - (b.systemOrderNo || 0),
      width: 120,
      align: 'center'
    },
    {
      title: 'Checklist Sayısı',
      dataIndex: 'checklistCount',
      key: 'checklistCount',
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
      sorter: (a, b) => (a.checklistCount || 0) - (b.checklistCount || 0),
      width: 130,
      align: 'center'
    },
    {
      title: 'Arıza Sayısı',
      dataIndex: 'faultCount',
      key: 'faultCount',
      render: (count) => <Tag color="red">{count || 0}</Tag>,
      sorter: (a, b) => (a.faultCount || 0) - (b.faultCount || 0),
      width: 120,
      align: 'center'
    },
    {
      title: 'Aktif',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Evet' : 'Hayır'}
        </Tag>
      ),
      sorter: (a, b) => (a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1),
      width: 100,
      align: 'center'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showSystemModal(record)}>Düzenle</Button>
          <Popconfirm
            title="Sistemi silmek istediğinize emin misiniz?"
            description="Bu işlem sistemin tüm checklist ve arıza kayıtlarını da silecektir!"
            onConfirm={() => handleSystemDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="link" danger>Sil</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tab 2: Checklist/Arıza Kolonları
  const checklistFaultColumns = [
    {
      title: 'Sistem Adı',
      dataIndex: 'systemName',
      key: 'systemName',
      sorter: (a, b) => (a.systemName || '').localeCompare(b.systemName || ''),
      width: 180
    },
    {
      title: 'Tip',
      key: 'type',
      render: (_, record) => {
        if (record.isChecklist) {
          return <Tag color="blue">Checklist</Tag>;
        } else if (record.isFault) {
          return <Tag color="red">Arıza</Tag>;
        }
        return <Tag>-</Tag>;
      },
      filters: [
        { text: 'Checklist', value: 'checklist' },
        { text: 'Arıza', value: 'fault' }
      ],
      onFilter: (value, record) => {
        if (value === 'checklist') return record.isChecklist;
        if (value === 'fault') return record.isFault;
        return false;
      },
      width: 100,
      align: 'center'
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (description) => description || '-',
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      ellipsis: true,
      width: 350
    },
    {
      title: 'Kontrol Noktası Sırası',
      dataIndex: 'controlPointOrder',
      key: 'controlPointOrder',
      render: (order) => order || '-',
      sorter: (a, b) => (a.controlPointOrder || 0) - (b.controlPointOrder || 0),
      width: 150,
      align: 'center'
    },
    {
      title: 'Kontrol Noktası Aktif',
      dataIndex: 'controlPointIsActive',
      key: 'controlPointIsActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Evet' : 'Hayır'}
        </Tag>
      ),
      sorter: (a, b) => (a.controlPointIsActive === b.controlPointIsActive ? 0 : a.controlPointIsActive ? 1 : -1),
      width: 150,
      align: 'center'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showChecklistFaultModal(record)}>Düzenle</Button>
          <Popconfirm
            title={`${record.isChecklist ? 'Checklist' : 'Arıza'} maddesini silmek istediğinize emin misiniz?`}
            onConfirm={() => handleChecklistFaultDelete(record)}
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

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Sistem Tanımları',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Button type="primary" onClick={() => showSystemModal()}>
                      Yeni Sistem Ekle
                    </Button>
                    <Input.Search
                      placeholder="Sistem ara..."
                      allowClear
                      value={systemSearchText}
                      onChange={e => setSystemSearchText(e.target.value)}
                      style={{ width: 300 }}
                    />
                  </div>
                  <Table
                    columns={systemColumns}
                    dataSource={filteredSystemsData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Toplam ${total} sistem`
                    }}
                  />
                </div>
              )
            },
            {
              key: '2',
              label: 'Checklist / Arıza Maddeleri',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Button type="primary" onClick={() => showChecklistFaultModal()}>
                      Yeni Checklist/Arıza Ekle
                    </Button>
                    <Input.Search
                      placeholder="Checklist/Arıza ara..."
                      allowClear
                      value={checklistFaultSearchText}
                      onChange={e => setChecklistFaultSearchText(e.target.value)}
                      style={{ width: 300 }}
                    />
                  </div>
                  <Table
                    columns={checklistFaultColumns}
                    dataSource={filteredChecklistFaultData}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Toplam ${total} kayıt`
                    }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Tab 1: Sistem Tanımları Modal */}
      <Modal
        title={editingSystem ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}
        open={isSystemModalVisible}
        onOk={handleSystemOk}
        onCancel={handleSystemCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={systemForm} layout="vertical">
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
              { required: true, message: 'Sistem sıra no zorunludur!' },
              {
                type: 'number',
                message: 'Sadece sayı girebilirsiniz!'
              },
              {
                validator: (_, value) => {
                  if (value === null || value === undefined) {
                    return Promise.reject('Sistem sıra no zorunludur!');
                  }
                  if (!Number.isInteger(value)) {
                    return Promise.reject('Sadece tam sayı girebilirsiniz!');
                  }
                  if (value < 0) {
                    return Promise.reject('Negatif sayı giremezsiniz!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Sıra numarası giriniz"
              min={0}
              precision={0}
              step={1}
              controls={true}
            />
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
        </Form>
      </Modal>

      {/* Tab 2: Checklist/Arıza Modal */}
      <Modal
        title={editingChecklistFault ? 'Checklist/Arıza Düzenle' : 'Yeni Checklist/Arıza Ekle'}
        open={isChecklistFaultModalVisible}
        onOk={handleChecklistFaultOk}
        onCancel={handleChecklistFaultCancel}
        okText="Kaydet"
        cancelText="İptal"
        width={700}
      >
        <Form form={checklistFaultForm} layout="vertical">
          <Form.Item
            name="systemId"
            label="Sistem Seçiniz"
            rules={[
              { required: true, message: 'Sistem seçimi zorunludur!' }
            ]}
          >
            <Select
              placeholder="Sistem seçiniz"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {availableSystems.map(system => (
                <Select.Option key={system.id} value={system.id}>
                  {system.systemName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Tip"
            rules={[
              { required: true, message: 'Tip seçimi zorunludur!' }
            ]}
          >
            <Radio.Group>
              <Radio value="checklist">Checklist</Radio>
              <Radio value="fault">Arıza</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[
              { required: true, message: 'Açıklama zorunludur!' },
              { min: 3, message: 'En az 3 karakter olmalıdır!' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Checklist/Arıza açıklaması giriniz..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="controlPointOrder" 
            label="Kontrol Noktası Sırası"
            rules={[
              { required: true, message: 'Kontrol noktası sırası zorunludur!' },
              {
                type: 'number',
                message: 'Sadece sayı girebilirsiniz!'
              },
              {
                validator: (_, value) => {
                  if (value === null || value === undefined) {
                    return Promise.reject('Kontrol noktası sırası zorunludur!');
                  }
                  if (!Number.isInteger(value)) {
                    return Promise.reject('Sadece tam sayı girebilirsiniz!');
                  }
                  if (value < 0) {
                    return Promise.reject('Negatif sayı giremezsiniz!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Kontrol noktası sırası"
              min={0}
              precision={0}
              step={1}
              controls={true}
            />
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
        </Form>
      </Modal>
    </div>
  );
};

export default Systems;
