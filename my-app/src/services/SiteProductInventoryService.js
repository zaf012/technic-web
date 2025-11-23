import axios from 'axios';
import config from '../config';

/**
 * Site Cihaz Envanteri API Servisleri
 */

// Site Cihaz Envanteri Servisleri
export const siteProductInventoryService = {
    // Tüm kayıtları getir
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/site-product-inventory-details`);
        return response.data;
    },

    // ID'ye göre kayıt getir
    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/site-product-inventory-details/${id}`);
        return response.data;
    },

    // QR koda göre kayıt getir
    fetchByQrCode: async (qrCode) => {
        const response = await axios.get(`${config.apiUrl}/site-product-inventory-details/qr-code/${qrCode}`);
        return response.data;
    },

    // Aktif kayıtları getir
    fetchActive: async () => {
        const response = await axios.get(`${config.apiUrl}/site-product-inventory-details/active`);
        return response.data;
    },

    // Yeni kayıt oluştur
    create: async (data) => {
        const response = await axios.post(`${config.apiUrl}/site-product-inventory-details`, data);
        return response.data;
    },

    // Kayıt güncelle
    update: async (id, data) => {
        const response = await axios.put(`${config.apiUrl}/site-product-inventory-details/${id}`, data);
        return response.data;
    },

    // Kayıt sil
    delete: async (id) => {
        const response = await axios.delete(`${config.apiUrl}/site-product-inventory-details/${id}`);
        return response.data;
    },

    // Kayıt pasif yap
    deactivate: async (id) => {
        const response = await axios.patch(`${config.apiUrl}/site-product-inventory-details/${id}/deactivate`);
        return response.data;
    },
};

// Site Servisleri
export const siteService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/sites/get-all`);
        return response.data?.data || response.data || [];
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/sites/${id}`);
        return response.data;
    },
};

// Square (Ada) Servisleri
export const squareService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/squares/get-all`);
        return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },

    fetchBySite: async (siteId) => {
        const allSquares = await squareService.fetchAll();
        return allSquares.filter(square => square.siteId === siteId);
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/squares/${id}`);
        return response.data;
    },
};

// Block Servisleri
export const blockService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/blocks/get-all`);
        return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },

    fetchBySquare: async (squareId) => {
        const allBlocks = await blockService.fetchAll();
        return allBlocks.filter(block => block.squareId === squareId);
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/blocks/${id}`);
        return response.data;
    },
};

// System Servisleri
export const systemService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/system-info/get-all-systems`);
        return response.data || [];
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/system-info/${id}`);
        return response.data;
    },
};

// Kategori Servisleri (ProductInventoryService'ten import edilebilir)
export const categoryService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories`);
        return response.data;
    },

    fetchTree: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories/tree`);
        return response.data;
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories/${id}`);
        return response.data;
    },
};

// Ürün Envanter Detay Servisleri
export const productInventoryDetailService = {
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details`);
        return response.data?.content || response.data || [];
    },

    fetchByCategory: async (categoryId) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/category/${categoryId}`);
        return response.data;
    },

    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/${id}`);
        return response.data;
    },
};

// Yardımcı Fonksiyonlar
export const categoryHelper = {
    // Kategori yolunu oluştur (örn: Ana > Alt > Alt Alt)
    buildCategoryPath: (categoryId, allCategories) => {
        const path = [];
        let currentCategory = allCategories.find(cat => cat.id === categoryId);

        while (currentCategory) {
            path.unshift(currentCategory.categoryName);
            if (currentCategory.parentCategoryId) {
                currentCategory = allCategories.find(cat => cat.id === currentCategory.parentCategoryId);
            } else {
                break;
            }
        }

        return path.join(' > ');
    },

    // Tree yapısını oluştur
    buildTreeData: (categories) => {
        const buildNode = (category, allCategories) => {
            const children = allCategories
                .filter(cat => cat.parentCategoryId === category.id)
                .map(cat => buildNode(cat, allCategories));

            return {
                title: category.categoryName,
                value: category.id,
                key: category.id,
                children: children.length > 0 ? children : undefined,
            };
        };

        return categories
            .filter(cat => !cat.parentCategoryId)
            .map(cat => buildNode(cat, categories));
    },
};

// QR Kod Üretici
export const qrCodeGenerator = {
    // 12 haneli benzersiz kod üret
    generate: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let qrCode = 'TK';
        for (let i = 0; i < 10; i++) {
            qrCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return qrCode;
    },
};

