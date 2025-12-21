import React, {useState, useEffect} from 'react';
import {
    Table, Button, Modal, Form, Input, Space, Popconfirm, Select,
    DatePicker, Card, Row, Col, Divider, Tag, Tabs, Upload
} from 'antd';
import {
    DeleteOutlined, DownloadOutlined,
    FileTextOutlined, MergeCellsOutlined, UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';
import maintenancePdfService from '../services/MaintenancePdfService';
import dayjs from 'dayjs';

const {TextArea} = Input;

const MaintenancePdf = () => {
    const [data, setData] = useState([]);
    const [recentData, setRecentData] = useState([]);
    const [systems, setSystems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sites, setSites] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [filterSystem, setFilterSystem] = useState('');
    const [filterCustomer, setFilterCustomer] = useState('');

    // Yeni state'ler - AŞAMA 1
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [checklistItems, setChecklistItems] = useState([]);
    const [checkedItemsMap, setCheckedItemsMap] = useState({});

    // AŞAMA 2 - Fotoğraf upload state'leri
    const [image1, setImage1] = useState('');
    const [image2, setImage2] = useState('');
    const [image3, setImage3] = useState('');
    const [imagePreview1, setImagePreview1] = useState(null);
    const [imagePreview2, setImagePreview2] = useState(null);
    const [imagePreview3, setImagePreview3] = useState(null);

    // PDF Birleştirme state'leri
    const [isMergeModalVisible, setIsMergeModalVisible] = useState(false);
    const [selectedPdfIds, setSelectedPdfIds] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    fetchAllPdfs(),
                    fetchRecentPdfs(),
                    fetchSystems(),
                    fetchCustomers(),
                    fetchSites()
                ]);
            } catch (error) {
                console.error('Veri yükleme hatası:', error);
                toast.error('Veriler yüklenirken bir hata oluştu!');
            }
        };
        loadData();
    }, []);

    // Tüm PDF'leri getir
    const fetchAllPdfs = async () => {
        setLoading(true);
        try {
            const response = await maintenancePdfService.fetchAll();
            setData(response.map(item => ({...item, key: item.id})));
        } catch (error) {
            toast.error('PDF kayıtları alınırken hata oluştu!');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Son PDF'leri getir
    const fetchRecentPdfs = async () => {
        try {
            const response = await maintenancePdfService.fetchRecent();
            setRecentData(response.map(item => ({...item, key: item.id})));
        } catch (error) {
            toast.error('Son PDF kayıtları alınırken hata oluştu!');
            setRecentData([]);
        }
    };

    // Sistemleri getir - Aktif ve checklist olan sistem adlarını getir
    const fetchSystems = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/system-info/active-checklist-system-names`);
            if (response.data) {
                // Backend artık sadece string array dönüyor: ["Yangın Sistemi", "Su Arıtmaları", ...]
                setSystems(response.data);
            } else {
                setSystems([]);
            }
        } catch (error) {
            console.error('Sistemler alınırken hata:', error);
            toast.error('Sistemler alınırken hata oluştu!');
            setSystems([]);
        }
    };

    // Müşterileri getir
    const fetchCustomers = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/instant-accounts/active`);
            if (response.data && response.data.data) {
                setCustomers(response.data.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            toast.error('Müşteriler alınırken hata oluştu!');
            setCustomers([]);
        }
    };

    // Siteleri getir
    const fetchSites = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/sites/get-all`);
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

    const showModal = () => {
        setIsModalVisible(true);
        form.resetFields();
        setSelectedCustomer(null);
        setChecklistItems([]);
        setCheckedItemsMap({});
        setImage1('');
        setImage2('');
        setImage3('');
        setImagePreview1(null);
        setImagePreview2(null);
        setImagePreview3(null);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setSelectedCustomer(null);
        setChecklistItems([]);
        setCheckedItemsMap({});
        setImage1('');
        setImage2('');
        setImage3('');
        setImagePreview1(null);
        setImagePreview2(null);
        setImagePreview3(null);
    };

    // Müşteri seçildiğinde otomatik doldurma
    const handleCustomerChange = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
            form.setFieldsValue({
                customerAddress: customer.address || '',
                authorizedPersonnel: customer.authorizedPersonnel || '',
                telNo: customer.phone || '',
                gsmNo: customer.gsm || '',
                email: customer.email || '',
            });
        }
    };

    // Sistem seçildiğinde checklist maddelerini getir
    const handleSystemChange = async (systemName) => {
        if (!systemName) {
            setChecklistItems([]);
            setCheckedItemsMap({});
            return;
        }

        try {
            setLoading(true);
            console.log('Sistem seçildi:', systemName);
            const response = await maintenancePdfService.getChecklistsBySystem(systemName);
            console.log('Backend yanıtı:', response);

            // Backend'den gelen veriyi filtrele - sadece checklist olan ve aktif olanları al
            const checklistData = Array.isArray(response)
                ? response.filter(item => item.isChecklist === true && item.isActive === true)
                : [];

            console.log('Filtrelenmiş checklist verileri:', checklistData);
            setChecklistItems(checklistData);

            // Başlangıçta tüm maddeleri "checked" (true) yap
            const initialCheckedMap = {};
            checklistData.forEach(item => {
                initialCheckedMap[item.controlPointOrder] = true;
            });
            setCheckedItemsMap(initialCheckedMap);

            if (checklistData.length === 0) {
                toast.info('Bu sistem için aktif checklist maddesi bulunamadı.');
            }
        } catch (error) {
            console.error('Checklist hatası:', error);
            toast.error('Checklist maddeleri alınırken hata oluştu: ' + (error.response?.data?.message || error.message));
            setChecklistItems([]);
            setCheckedItemsMap({});
        } finally {
            setLoading(false);
        }
    };

    // Checklist checkbox değişimi
    const handleChecklistChange = (controlPointOrder, checked) => {
        setCheckedItemsMap(prev => ({
            ...prev,
            [controlPointOrder]: checked
        }));
    };

    // AŞAMA 2 - Fotoğraf upload handler
    const handleImageUpload = (file, imageNumber) => {
        // Validasyon - Sadece image formatlarına izin ver (JPEG, JPG, PNG vb.)
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            toast.error('Lütfen bir resim dosyası seçiniz! (JPEG, JPG, PNG vb.)');
            return false;
        }

        // Dosya boyutu kontrolü - Max 5MB
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            toast.error('Resim boyutu 5MB\'dan küçük olmalıdır!');
            return false;
        }

        // Base64'e çevir
        const reader = new FileReader();
        reader.onload = (e) => {
            let base64 = e.target.result;

            // "data:image/jpeg;base64," veya "data:image/png;base64," prefix'ini kaldır
            if (base64.includes(';base64,')) {
                base64 = base64.split(';base64,')[1];
            }

            // State'leri güncelle
            if (imageNumber === 1) {
                setImage1(base64);
                setImagePreview1(e.target.result); // Preview için tam URL gerekli
                toast.success('Fotoğraf 1 başarıyla yüklendi!');
            } else if (imageNumber === 2) {
                setImage2(base64);
                setImagePreview2(e.target.result);
                toast.success('Fotoğraf 2 başarıyla yüklendi!');
            } else if (imageNumber === 3) {
                setImage3(base64);
                setImagePreview3(e.target.result);
                toast.success('Fotoğraf 3 başarıyla yüklendi!');
            }
        };

        reader.onerror = () => {
            toast.error('Fotoğraf yüklenirken bir hata oluştu!');
        };

        reader.readAsDataURL(file);
        return false; // Upload'u engelle (manuel işlem)
    };

    const handleOk = () => {
        form.validateFields().then(async values => {
            try {
                setLoading(true);

                // Backend'in beklediği formatta veri hazırla
                const requestData = {
                    customerFirmName: selectedCustomer?.firmName || '',
                    customerAddress: values.customerAddress || '',
                    authorizedPersonnel: values.authorizedPersonnel || '',
                    telNo: values.telNo || '',
                    systemName: values.systemName || '',
                    gsmNo: values.gsmNo || '',
                    email: values.email || '',
                    productSerialNo: values.productSerialNo || '',
                    productBrand: values.productBrand || '',
                    productModel: values.productModel || '',
                    productPurpose: values.productPurpose || '',
                    serviceCase: values.serviceCase || '',
                    blockName: values.blockName || '',
                    floor: values.floor || '',
                    location: values.location || '',
                    serviceDate: values.serviceDate ? values.serviceDate.format('YYYY-MM-DD') : '',
                    entryTime: values.entryTime || '',
                    exitTime: values.exitTime || '',
                    serviceCarPlate: values.serviceCarPlate || '',
                    serviceCarKm: values.serviceCarKm || '',
                    servicePersonnel: values.servicePersonnel || '',
                    description: values.description || '',
                    image1: image1 || '',
                    image2: image2 || '',
                    image3: image3 || '',
                    checkedItems: checkedItemsMap, // Map<controlPointOrder, Boolean> - backend'de true ise checked="X", false ise unchecked="X"
                };

                console.log('Gönderilen veri:', requestData);
                const response = await maintenancePdfService.exportPdf(requestData);
                console.log('Backend yanıtı:', response);
                console.log('fileContent type:', typeof response.fileContent);
                console.log('fileContent length:', response.fileContent?.length);

                // PDF'i indirmeyi öner
                if (response && response.fileContent) {
                    let blob;

                    // fileContent base64 string ise
                    if (typeof response.fileContent === 'string') {
                        // Base64 string'i binary'ye çevir
                        const binaryString = window.atob(response.fileContent);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        blob = new Blob([bytes], {type: 'application/pdf'});
                        console.log('Base64 string Blob oluşturuldu, size:', blob.size);
                    }
                    // fileContent byte array ise
                    else if (Array.isArray(response.fileContent)) {
                        blob = new Blob([new Uint8Array(response.fileContent)], {type: 'application/pdf'});
                        console.log('Byte array Blob oluşturuldu, size:', blob.size);
                    }
                    else {
                        console.error('Bilinmeyen fileContent formatı:', response.fileContent);
                        toast.error('PDF formatı tanınamadı!');
                        return;
                    }

                    if (blob.size === 0) {
                        console.error('Blob size 0! Response:', response);
                        toast.error('PDF boş! Backend yanıtını kontrol edin.');
                        return;
                    }

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = response.filename || 'bakim_raporu.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    toast.success('PDF başarıyla indirildi!');
                } else {
                    console.error('Response veya fileContent yok:', response);
                    toast.error('PDF içeriği alınamadı!');
                }

                setIsModalVisible(false);
                form.resetFields();
                setSelectedCustomer(null);
                setChecklistItems([]);
                setCheckedItemsMap({});
                setImage1('');
                setImage2('');
                setImage3('');
                setImagePreview1(null);
                setImagePreview2(null);
                setImagePreview3(null);
                fetchAllPdfs();
                fetchRecentPdfs();
            } catch (error) {
                console.error('PDF oluşturma hatası:', error);
                toast.error('PDF oluşturulurken hata oluştu!');
            } finally {
                setLoading(false);
            }
        });
    };

    const handleDelete = async (id) => {
        try {
            await maintenancePdfService.delete(id);
            toast.success('PDF kaydı başarıyla silindi!');
            fetchAllPdfs();
            fetchRecentPdfs();
        } catch (error) {
            toast.error('PDF kaydı silinirken hata oluştu!');
        }
    };

    const handleDownload = async (record) => {
        try {
            const blob = await maintenancePdfService.download(record.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = record.fileName || `bakim_raporu_${record.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('PDF indiriliyor...');
        } catch (error) {
            toast.error('PDF indirilirken hata oluştu!');
        }
    };

    const handleFilterBySystem = async (systemName) => {
        setFilterSystem(systemName);
        if (!systemName) {
            fetchAllPdfs();
            return;
        }
        try {
            setLoading(true);
            const response = await maintenancePdfService.fetchBySystem(systemName);
            setData(response.map(item => ({...item, key: item.id})));
        } catch (error) {
            toast.error('Filtreleme yapılırken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterByCustomer = async (customerName) => {
        setFilterCustomer(customerName);
        if (!customerName) {
            fetchAllPdfs();
            return;
        }
        try {
            setLoading(true);
            const response = await maintenancePdfService.fetchByCustomer(customerName);
            setData(response.map(item => ({...item, key: item.id})));
        } catch (error) {
            toast.error('Filtreleme yapılırken hata oluştu!');
        } finally {
            setLoading(false);
        }
    };

    // PDF Birleştirme modal açma
    const showMergeModal = () => {
        if (data.length === 0) {
            toast.warning('Birleştirilecek PDF kaydı bulunamadı!');
            return;
        }
        setIsMergeModalVisible(true);
        setSelectedPdfIds([]);
    };

    // PDF Birleştirme modal kapatma
    const handleMergeCancel = () => {
        setIsMergeModalVisible(false);
        setSelectedPdfIds([]);
    };

    // PDF seçimi (checkbox)
    const handlePdfSelection = (pdfId, checked) => {
        if (checked) {
            setSelectedPdfIds(prev => [...prev, pdfId]);
        } else {
            setSelectedPdfIds(prev => prev.filter(id => id !== pdfId));
        }
    };

    // Tüm PDF'leri seç/kaldır
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedPdfIds(data.map(item => item.id));
        } else {
            setSelectedPdfIds([]);
        }
    };

    // PDF Birleştirme işlemi
    const handleMergePdfs = async () => {
        if (selectedPdfIds.length === 0) {
            toast.warning('Lütfen en az bir PDF seçiniz!');
            return;
        }

        try {
            setLoading(true);
            console.log('Birleştirilecek PDF IDs:', selectedPdfIds);

            const response = await maintenancePdfService.merge({
                pdfRecordIds: selectedPdfIds
            });

            // Backend'den blob olarak dönüyor
            const blob = new Blob([response], { type: 'application/pdf' });

            if (blob.size === 0) {
                toast.error('Birleştirilmiş PDF boş!');
                return;
            }

            // İndirme işlemi
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const fileName = `merged_maintenance_${timestamp}.pdf`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`${selectedPdfIds.length} adet PDF başarıyla birleştirildi ve indirildi!`);
            setIsMergeModalVisible(false);
            setSelectedPdfIds([]);
        } catch (error) {
            console.error('PDF birleştirme hatası:', error);
            toast.error('PDF\'ler birleştirilirken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };


    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Dosya Adı',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (text) => (
                <Space>
                    <FileTextOutlined/>
                    {text}
                </Space>
            ),
        },
        {
            title: 'Sistem',
            dataIndex: 'systemName',
            key: 'systemName',
            render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
        },
        {
            title: 'Müşteri',
            dataIndex: 'customerName',
            key: 'customerName',
            render: (text) => text ? <Tag color="green">{text}</Tag> : '-',
        },
        {
            title: 'Site',
            dataIndex: 'siteName',
            key: 'siteName',
            render: (text) => text ? <Tag color="orange">{text}</Tag> : '-',
        },
        {
            title: 'Bakım Tarihi',
            dataIndex: 'maintenanceDate',
            key: 'maintenanceDate',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Yapan Kişi',
            dataIndex: 'performedBy',
            key: 'performedBy',
        },
        {
            title: 'Oluşturulma Tarihi',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : '-',
        },
        {
            title: 'İşlemler',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<DownloadOutlined/>}
                        onClick={() => handleDownload(record)}
                    >
                        İndir
                    </Button>
                    <Popconfirm
                        title="Bu PDF kaydını silmek istediğinizden emin misiniz?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Evet"
                        cancelText="Hayır"
                    >
                        <Button danger icon={<DeleteOutlined/>}>
                            Sil
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: '24px'}}>
            <ToastContainer position="top-right" autoClose={3000}/>

            <Card>
                <Row justify="space-between" align="middle" style={{marginBottom: 16}}>
                    <Col>
                        <h2>
                            <FileTextOutlined/> Periyodik Bakım PDF Yönetimi
                        </h2>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                type="default"
                                icon={<MergeCellsOutlined/>}
                                onClick={showMergeModal}
                                size="large"
                                style={{
                                    backgroundColor: '#ff7f00',
                                    borderColor: '#ff7f00',
                                    color: '#ffffff'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e67300';
                                    e.currentTarget.style.borderColor = '#e67300';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ff7f00';
                                    e.currentTarget.style.borderColor = '#ff7f00';
                                }}
                            >
                                PDF'leri Birleştir
                            </Button>
                            <Button
                                type="primary"
                                icon={<FileTextOutlined/>}
                                onClick={showModal}
                                size="large"
                            >
                                Yeni PDF Oluştur
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Divider/>

                <Row gutter={16} style={{marginBottom: 16}}>
                    <Col span={8}>
                        <Select
                            style={{width: '100%'}}
                            placeholder="Sisteme göre filtrele"
                            allowClear
                            onChange={handleFilterBySystem}
                            value={filterSystem || undefined}
                        >
                            {systems.map(system => (
                                <Select.Option key={system.id} value={system.systemName}>
                                    {system.systemName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{width: '100%'}}
                            placeholder="Müşteriye göre filtrele"
                            allowClear
                            onChange={handleFilterByCustomer}
                            value={filterCustomer || undefined}
                        >
                            {customers.map(customer => (
                                <Select.Option key={customer.id} value={customer.cariAdi}>
                                    {customer.cariAdi}
                                </Select.Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Button onClick={() => {
                            setFilterSystem('');
                            setFilterCustomer('');
                            fetchAllPdfs();
                        }}>
                            Filtreleri Temizle
                        </Button>
                    </Col>
                </Row>

                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: '1',
                            label: 'Tüm PDF\'ler',
                            children: (
                                <Table
                                    columns={columns}
                                    dataSource={data}
                                    loading={loading}
                                    locale={{
                                        emptyText: (
                                            <div style={{padding: '40px', textAlign: 'center'}}>
                                                <FileTextOutlined
                                                    style={{fontSize: '48px', color: '#d9d9d9', marginBottom: '16px'}}/>
                                                <h3>Henüz PDF kaydı yok</h3>
                                                <p style={{color: '#999'}}>Yeni bir PDF oluşturmak için yukarıdaki "Yeni
                                                    PDF
                                                    Oluştur" butonuna tıklayın</p>
                                            </div>
                                        )
                                    }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showTotal: (total) => `Toplam ${total} kayıt`,
                                    }}
                                    scroll={{x: 1200}}
                                />
                            )
                        },
                        {
                            key: '2',
                            label: 'Son Oluşturulanlar',
                            children: (
                                <Table
                                    columns={columns}
                                    dataSource={recentData}
                                    loading={loading}
                                    locale={{
                                        emptyText: (
                                            <div style={{padding: '40px', textAlign: 'center'}}>
                                                <FileTextOutlined
                                                    style={{fontSize: '48px', color: '#d9d9d9', marginBottom: '16px'}}/>
                                                <h3>Son oluşturulan PDF yok</h3>
                                                <p style={{color: '#999'}}>PDF'ler oluşturuldukça burada
                                                    görünecektir</p>
                                            </div>
                                        )
                                    }}
                                    pagination={{
                                        pageSize: 10,
                                        showTotal: (total) => `Toplam ${total} kayıt`,
                                    }}
                                    scroll={{x: 1200}}
                                />
                            )
                        }
                    ]}
                />
            </Card>

            <Modal
                title="Periyodik Bakım Çeklisti Formu"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={1200}
                okText="PDF Oluştur"
                cancelText="İptal"
                confirmLoading={loading}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="maintenancePdfForm"
                >
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                key: '1',
                                label: 'Genel Bilgiler',
                                children: (
                                    <div>
                            <div style={{
                                marginBottom: 16,
                                padding: 12,
                                backgroundColor: '#e6f7ff',
                                border: '1px solid #91d5ff',
                                borderRadius: 4
                            }}>
                                <strong>📋 Bilgi:</strong> Müşteri ve sistem seçtiğinizde bazı alanlar otomatik
                                dolacaktır.
                            </div>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="customerId"
                                        label="Müşterinin Adı"
                                        rules={[{required: true, message: 'Lütfen müşteri seçiniz!'}]}
                                    >
                                        <Select
                                            placeholder="Müşteri seçiniz"
                                            showSearch
                                            onChange={handleCustomerChange}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {customers.map(customer => (
                                                <Select.Option key={customer.id} value={customer.id}>
                                                    {customer.siteName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="customerAddress"
                                        label="Müşterinin Adresi"
                                    >
                                        <Input placeholder="Adres otomatik dolacak" disabled/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="authorizedPersonnel"
                                        label="Yetkili Kişi"
                                    >
                                        <Input placeholder="Otomatik dolacak" disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="systemName"
                                        label="Sistem Adı"
                                        rules={[{required: true, message: 'Lütfen sistem seçiniz!'}]}
                                    >
                                        <Select
                                            placeholder="Sistem seçiniz"
                                            showSearch
                                            onChange={handleSystemChange}
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                        >
                                            {systems.map((systemName, index) => (
                                                <Select.Option key={index} value={systemName}>
                                                    {systemName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="blockName"
                                        label="Blok Adı"
                                        rules={[{required: true, message: 'Lütfen blok seçiniz!'}]}
                                    >
                                        <Select placeholder="Blok seçiniz" showSearch>
                                            {sites.map(site => (
                                                <Select.Option key={site.id} value={site.siteName}>
                                                    {site.siteName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="telNo"
                                        label="İletişim Telefonu"
                                    >
                                        <Input placeholder="Otomatik dolacak" disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="gsmNo"
                                        label="GSM No."
                                    >
                                        <Input placeholder="Otomatik dolacak" disabled/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="email"
                                        label="e-mail Adresi"
                                    >
                                        <Input placeholder="Otomatik dolacak" disabled/>
                                    </Form.Item>
                                </Col>
                            </Row>
                                    </div>
                                )
                            },
                            {
                                key: '2',
                                label: 'Cihaz Bilgileri',
                                children: (
                                    <div>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="productSerialNo"
                                        label="Cihaz Seri No."
                                        rules={[{required: true, message: 'Lütfen cihaz seri no giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: Hv-12345-ABC"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="productBrand"
                                        label="Cihaz Markası"
                                        rules={[{required: true, message: 'Lütfen cihaz markası giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: WILO"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="productModel"
                                        label="Cihaz Modeli"
                                        rules={[{required: true, message: 'Lütfen cihaz modeli giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: Wilo 523"/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="productPurpose"
                                        label="Cihazın Kullanım Amacı"
                                        rules={[{required: true, message: 'Lütfen kullanım amacı giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: Yangın Pompası"/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="serviceCase"
                                        label="Hizmet Koşulu"
                                        rules={[{required: true, message: 'Lütfen hizmet koşulu giriniz!'}]}
                                    >
                                        <Input placeholder="Hizmet koşulu"/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="floor"
                                        label="Bulunduğu Kat"
                                        rules={[{required: true, message: 'Lütfen kat bilgisi giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: -1"/>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="location"
                                        label="Lokasyon"
                                        rules={[{required: true, message: 'Lütfen lokasyon giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: 3.kat makine dairesi"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                                    </div>
                                )
                            },
                            {
                                key: '3',
                                label: 'Servis Bilgileri',
                                children: (
                                    <div>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="serviceDate"
                                        label="Servis Tarihi"
                                        rules={[{required: true, message: 'Lütfen servis tarihi seçiniz!'}]}
                                    >
                                        <DatePicker style={{width: '100%'}} format="DD/MM/YYYY"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="entryTime"
                                        label="Giriş Saati"
                                        rules={[{required: true, message: 'Lütfen giriş saati giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: 21:15"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="exitTime"
                                        label="Çıkış Saati"
                                        rules={[{required: true, message: 'Lütfen çıkış saati giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: 22:15"/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="serviceCarPlate"
                                        label="Servis Araç Plakası"
                                        rules={[{required: true, message: 'Lütfen araç plakası giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: 32 KM 34"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="serviceCarKm"
                                        label="Araç Km."
                                        rules={[{required: true, message: 'Lütfen araç km giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: 22.500 km"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="servicePersonnel"
                                        label="Servis Teknisyeni"
                                        rules={[{required: true, message: 'Lütfen teknisyen adı giriniz!'}]}
                                    >
                                        <Input placeholder="Örn: Ahmet"/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Açıklama"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Servis hakkında açıklama ekleyebilirsiniz"
                                />
                            </Form.Item>

                            <Divider>Fotoğraflar</Divider>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="Fotoğraf 1">
                                        <Upload
                                            beforeUpload={(file) => handleImageUpload(file, 1)}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined/>} block>
                                                Fotoğraf Seç
                                            </Button>
                                        </Upload>
                                        {imagePreview1 && (
                                            <div style={{marginTop: 8, position: 'relative'}}>
                                                <img
                                                    src={imagePreview1}
                                                    alt="Fotoğraf 1"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #d9d9d9',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <Button
                                                    danger
                                                    size="small"
                                                    style={{marginTop: 8, width: '100%'}}
                                                    onClick={() => {
                                                        setImage1('');
                                                        setImagePreview1(null);
                                                    }}
                                                >
                                                    Sil
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Fotoğraf 2">
                                        <Upload
                                            beforeUpload={(file) => handleImageUpload(file, 2)}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined/>} block>
                                                Fotoğraf Seç
                                            </Button>
                                        </Upload>
                                        {imagePreview2 && (
                                            <div style={{marginTop: 8, position: 'relative'}}>
                                                <img
                                                    src={imagePreview2}
                                                    alt="Fotoğraf 2"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #d9d9d9',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <Button
                                                    danger
                                                    size="small"
                                                    style={{marginTop: 8, width: '100%'}}
                                                    onClick={() => {
                                                        setImage2('');
                                                        setImagePreview2(null);
                                                    }}
                                                >
                                                    Sil
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item label="Fotoğraf 3">
                                        <Upload
                                            beforeUpload={(file) => handleImageUpload(file, 3)}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<UploadOutlined/>} block>
                                                Fotoğraf Seç
                                            </Button>
                                        </Upload>
                                        {imagePreview3 && (
                                            <div style={{marginTop: 8, position: 'relative'}}>
                                                <img
                                                    src={imagePreview3}
                                                    alt="Fotoğraf 3"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '200px',
                                                        objectFit: 'cover',
                                                        border: '1px solid #d9d9d9',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <Button
                                                    danger
                                                    size="small"
                                                    style={{marginTop: 8, width: '100%'}}
                                                    onClick={() => {
                                                        setImage3('');
                                                        setImagePreview3(null);
                                                    }}
                                                >
                                                    Sil
                                                </Button>
                                            </div>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                                    </div>
                                )
                            },
                            {
                                key: '4',
                                label: 'Periyodik Bakım Çeklisti',
                                children: (
                                    <div>
                            {checklistItems.length > 0 ? (
                                <div>
                                    <div style={{
                                        marginBottom: 16,
                                        padding: 12,
                                        backgroundColor: '#e6f7ff',
                                        border: '1px solid #91d5ff',
                                        borderRadius: 4
                                    }}>
                                        <strong>📋 Bilgi:</strong> Toplam {checklistItems.length} adet checklist maddesi bulundu.
                                        Her madde için "Yapıldı (Evet)" veya "Yapılmadı (Hayır)" seçeneğini işaretleyiniz.
                                    </div>
                                    <div style={{maxHeight: '500px', overflowY: 'auto', border: '1px solid #d9d9d9'}}>
                                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                            <thead style={{position: 'sticky', top: 0, backgroundColor: '#f0f0f0', zIndex: 1}}>
                                            <tr>
                                                <th style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: '12px 8px',
                                                    textAlign: 'center',
                                                    width: '60px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Kontrol Sıra No
                                                </th>
                                                <th style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: '12px 8px',
                                                    textAlign: 'left',
                                                    width: '150px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Sistem Adı
                                                </th>
                                                <th style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: '12px 8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold'
                                                }}>
                                                    Açıklama
                                                </th>
                                                <th style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: '12px 8px',
                                                    textAlign: 'center',
                                                    width: '100px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#f6ffed'
                                                }}>
                                                    ✓ Yapıldı
                                                </th>
                                                <th style={{
                                                    border: '1px solid #d9d9d9',
                                                    padding: '12px 8px',
                                                    textAlign: 'center',
                                                    width: '100px',
                                                    fontWeight: 'bold',
                                                    backgroundColor: '#fff1f0'
                                                }}>
                                                    ✗ Yapılmadı
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {checklistItems
                                                .sort((a, b) => (a.controlPointOrder || 0) - (b.controlPointOrder || 0))
                                                .map((item, index) => (
                                                <tr key={item.controlPointOrder || item.id || index}
                                                    style={{
                                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                                                    }}>
                                                    <td style={{
                                                        border: '1px solid #d9d9d9',
                                                        padding: '10px 8px',
                                                        textAlign: 'center',
                                                        fontWeight: '500',
                                                        color: '#666'
                                                    }}>
                                                        {item.controlPointOrder || (index + 1)}
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #d9d9d9',
                                                        padding: '10px 12px',
                                                        fontWeight: '500',
                                                        color: '#1890ff'
                                                    }}>
                                                        {item.systemName || '-'}
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #d9d9d9',
                                                        padding: '10px 12px',
                                                        lineHeight: '1.6'
                                                    }}>
                                                        {item.description || '-'}
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #d9d9d9',
                                                        padding: '10px 8px',
                                                        textAlign: 'center',
                                                        backgroundColor: checkedItemsMap[item.controlPointOrder] === true ? '#f6ffed' : 'transparent'
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name={`checklist-${item.controlPointOrder || item.id || index}`}
                                                            checked={checkedItemsMap[item.controlPointOrder] === true}
                                                            onChange={() => handleChecklistChange(item.controlPointOrder, true)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                width: '18px',
                                                                height: '18px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #d9d9d9',
                                                        padding: '10px 8px',
                                                        textAlign: 'center',
                                                        backgroundColor: checkedItemsMap[item.controlPointOrder] === false ? '#fff1f0' : 'transparent'
                                                    }}>
                                                        <input
                                                            type="radio"
                                                            name={`checklist-${item.controlPointOrder || item.id || index}`}
                                                            checked={checkedItemsMap[item.controlPointOrder] === false}
                                                            onChange={() => handleChecklistChange(item.controlPointOrder, false)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                width: '18px',
                                                                height: '18px'
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div style={{textAlign: 'center', padding: '60px 40px', color: '#999'}}>
                                    <FileTextOutlined style={{fontSize: '64px', marginBottom: '16px', color: '#d9d9d9'}}/>
                                    <h3 style={{color: '#666', marginBottom: '8px'}}>Checklist Maddesi Bulunamadı</h3>
                                    <p style={{fontSize: '14px'}}>
                                        Yukarıdan bir sistem seçtiğinizde, o sisteme ait checklist maddeleri burada görünecektir.
                                    </p>
                                    <p style={{fontSize: '12px', color: '#bbb', marginTop: '16px'}}>
                                        Not: Sadece aktif ve checklist olarak işaretlenmiş maddeler gösterilir.
                                    </p>
                                </div>
                            )}
                                    </div>
                                )
                            }
                        ]}
                    />
                </Form>
            </Modal>

            {/* PDF Birleştirme Modal'ı */}
            <Modal
                title={
                    <Space>
                        <MergeCellsOutlined style={{fontSize: '20px', color: '#1890ff'}}/>
                        <span>PDF'leri Birleştir</span>
                    </Space>
                }
                open={isMergeModalVisible}
                onOk={handleMergePdfs}
                onCancel={handleMergeCancel}
                width={900}
                okText={`Seçilen ${selectedPdfIds.length} PDF'i Birleştir ve İndir`}
                cancelText="İptal"
                confirmLoading={loading}
                okButtonProps={{
                    disabled: selectedPdfIds.length === 0
                }}
            >
                <div style={{marginBottom: 16}}>
                    <div style={{
                        padding: 12,
                        backgroundColor: '#ffffff',
                        border: '1px solid #91d5ff',
                        borderRadius: 4,
                        marginBottom: 16
                    }}>
                        <strong>ℹ️ Bilgi:</strong> Birleştirme sırası aşağıdaki gibi olacaktır:
                        <ol style={{marginTop: 8, marginBottom: 0, paddingLeft: 20}}>
                            <li>İlk sayfa (Template - 1 sayfa)</li>
                            <li>Seçilen PDF'ler (seçim sırasına göre)</li>
                            <li>Son sayfalar (Template - 17 sayfa)</li>
                        </ol>
                        <p style={{marginTop: 8, marginBottom: 0, color: '#666'}}>
                            <strong>Not:</strong> Hiçbir veri saklanmaz, sadece birleştirilmiş PDF indirilir.
                        </p>
                    </div>

                    <Space style={{marginBottom: 12}}>
                        <Button
                            type="link"
                            onClick={() => handleSelectAll(true)}
                        >
                            Tümünü Seç ({data.length})
                        </Button>
                        <Button
                            type="link"
                            onClick={() => handleSelectAll(false)}
                        >
                            Tümünü Kaldır
                        </Button>
                        <Tag color="blue">Seçilen: {selectedPdfIds.length}</Tag>
                    </Space>
                </div>

                <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid #d9d9d9',
                    borderRadius: 4
                }}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead style={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: '#fafafa',
                            zIndex: 1
                        }}>
                        <tr>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'center',
                                width: '50px'
                            }}>
                                Seç
                            </th>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'center',
                                width: '60px'
                            }}>
                                Sıra
                            </th>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'left'
                            }}>
                                Dosya Adı
                            </th>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'left',
                                width: '120px'
                            }}>
                                Sistem
                            </th>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'left',
                                width: '150px'
                            }}>
                                Müşteri
                            </th>
                            <th style={{
                                border: '1px solid #d9d9d9',
                                padding: '12px 8px',
                                textAlign: 'center',
                                width: '100px'
                            }}>
                                Tarih
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((item, index) => {
                            const isSelected = selectedPdfIds.includes(item.id);
                            const selectionOrder = selectedPdfIds.indexOf(item.id) + 1;

                            return (
                                <tr
                                    key={item.id}
                                    style={{
                                        backgroundColor: isSelected ? '#e6f7ff' : (index % 2 === 0 ? '#ffffff' : '#fafafa'),
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handlePdfSelection(item.id, !isSelected)}
                                >
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px',
                                        textAlign: 'center'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handlePdfSelection(item.id, e.target.checked);
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                width: '18px',
                                                height: '18px'
                                            }}
                                        />
                                    </td>
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px',
                                        textAlign: 'center',
                                        fontWeight: isSelected ? 'bold' : 'normal'
                                    }}>
                                        {isSelected ? (
                                            <Tag color="blue">{selectionOrder}</Tag>
                                        ) : (
                                            <span style={{color: '#999'}}>{index + 1}</span>
                                        )}
                                    </td>
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px'
                                    }}>
                                        <Space>
                                            <FileTextOutlined style={{color: isSelected ? '#1890ff' : '#999'}}/>
                                            <span style={{fontWeight: isSelected ? '500' : 'normal'}}>
                                                {item.fileName || `PDF_${item.id}`}
                                            </span>
                                        </Space>
                                    </td>
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px'
                                    }}>
                                        {item.systemName ? (
                                            <Tag color="blue">{item.systemName}</Tag>
                                        ) : '-'}
                                    </td>
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px'
                                    }}>
                                        {item.customerName || '-'}
                                    </td>
                                    <td style={{
                                        border: '1px solid #d9d9d9',
                                        padding: '8px',
                                        textAlign: 'center',
                                        fontSize: '12px'
                                    }}>
                                        {item.maintenanceDate
                                            ? dayjs(item.maintenanceDate).format('DD/MM/YYYY')
                                            : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {data.length === 0 && (
                        <div style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999'
                        }}>
                            <FileTextOutlined style={{fontSize: '48px', marginBottom: '16px', color: '#d9d9d9'}}/>
                            <p>Henüz PDF kaydı yok</p>
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: 4
                }}>
                    <strong>⚠️ Uyarı:</strong> PDF'ler seçtiğiniz sırayla birleştirilecektir.
                    Sırayı değiştirmek için önce seçimi kaldırıp, istediğiniz sırayla tekrar seçebilirsiniz.
                </div>
            </Modal>
        </div>
    );
};

export default MaintenancePdf;

