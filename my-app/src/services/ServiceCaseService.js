import axios from 'axios';
import config from '../config';

/**
 * Hizmet Koşulları (Service Cases) API Servisleri
 */

export const serviceCaseService = {
    /**
     * Tüm hizmet koşullarını getir
     */
    fetchAll: async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/service-cases`);
            return response.data || [];
        } catch (error) {
            console.error('Hizmet koşulları alınırken hata:', error);
            throw error;
        }
    },

    /**
     * ID'ye göre hizmet koşulu getir
     */
    fetchById: async (id) => {
        try {
            const response = await axios.get(`${config.apiUrl}/service-cases/${id}`);
            return response.data;
        } catch (error) {
            console.error('Hizmet koşulu alınırken hata:', error);
            throw error;
        }
    },

    /**
     * Yeni hizmet koşulu oluştur
     */
    create: async (data) => {
        try {
            console.log('🔵 Hizmet koşulu oluşturma isteği:', data);
            const response = await axios.post(`${config.apiUrl}/service-cases`, {
                serviceCaseName: data.serviceCaseName
            });
            console.log('✅ Hizmet koşulu oluşturuldu:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Hizmet koşulu oluşturma hatası:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Hizmet koşulunu güncelle
     */
    update: async (id, data) => {
        try {
            const response = await axios.put(`${config.apiUrl}/service-cases/${id}`, {
                serviceCaseName: data.serviceCaseName
            });
            return response.data;
        } catch (error) {
            console.error('Hizmet koşulu güncellenirken hata:', error);
            throw error;
        }
    },

    /**
     * Hizmet koşulunu sil
     */
    delete: async (id) => {
        try {
            await axios.delete(`${config.apiUrl}/service-cases/${id}`);
        } catch (error) {
            console.error('Hizmet koşulu silinirken hata:', error);
            throw error;
        }
    },

    /**
     * İsme göre hizmet koşulu getir
     */
    fetchByName: async (serviceCaseName) => {
        try {
            const response = await axios.get(`${config.apiUrl}/service-cases/by-name/${serviceCaseName}`);
            return response.data;
        } catch (error) {
            console.error('Hizmet koşulu isimle aranırken hata:', error);
            throw error;
        }
    }
};

export default serviceCaseService;

