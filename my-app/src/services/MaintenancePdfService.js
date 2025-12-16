import axios from 'axios';
import config from '../config';

/**
 * Periyodik Bakım PDF Yönetimi API Servisleri
 */

export const maintenancePdfService = {
    // PDF export et (Periyodik Bakım Formu)
    exportPdf: async (data) => {
        try {
            console.log('PDF export isteği gönderiliyor...', data);
            const response = await axios.post(
                `${config.apiUrl}/pdf-print/export-pdf`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            console.log('PDF export yanıtı alındı:', {
                status: response.status,
                dataType: typeof response.data,
                hasFileContent: !!response.data?.fileContent,
                fileContentType: typeof response.data?.fileContent,
                fileContentLength: response.data?.fileContent?.length,
                filename: response.data?.filename
            });
            return response.data;  // FileResponseVM { filename, extension, fileContent }
        } catch (error) {
            console.error('PDF export hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },


    // PDF'leri birleştir
    merge: async (data) => {
        try {
            console.log('PDF merge isteği gönderiliyor...', data);
            const response = await axios.post(
                `${config.apiUrl}/maintenance-pdf/merge`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    responseType: 'blob' // Backend'den PDF blob olarak dönüyor
                }
            );
            console.log('PDF merge yanıtı alındı, blob size:', response.data.size);
            return response.data; // Blob
        } catch (error) {
            console.error('PDF merge hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    },

    // PDF kaydı detayını getir
    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/${id}`);
        return response.data;
    },

    // PDF kaydını sil
    delete: async (id) => {
        const response = await axios.delete(`${config.apiUrl}/maintenance-pdf/${id}`);
        return response.data;
    },

    // Sisteme göre PDF listesini getir
    fetchBySystem: async (systemName) => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/system/${systemName}`);
        return response.data;
    },

    // Son oluşturulan PDF'leri getir
    fetchRecent: async () => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/recent`);
        return response.data;
    },

    // Tüm PDF kayıtlarını listele
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/list`);
        return response.data;
    },

    // PDF'i indir
    download: async (id) => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/download/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Müşteriye göre PDF listesini getir
    fetchByCustomer: async (customerName) => {
        const response = await axios.get(`${config.apiUrl}/maintenance-pdf/customer/${customerName}`);
        return response.data;
    },

    // Sistemin checklist maddelerini getir
    getChecklistsBySystem: async (systemName) => {
        const response = await axios.get(`${config.apiUrl}/system-info/systems/${systemName}/checklists`);
        return response.data;
    },
};

export default maintenancePdfService;

