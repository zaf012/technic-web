import axios from 'axios';
import config from '../config';

/**
 * Ürün Envanter API Servisleri
 */

// Kategori Servisleri
export const categoryService = {
    // Tüm kategorileri getir
    fetchAll: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories`);
        return response.data;
    },

    // Kategori ağacını getir
    fetchTree: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories/tree`);
        return response.data;
    },

    // ID'ye göre kategori getir
    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-categories/${id}`);
        return response.data;
    },

    // Yeni kategori oluştur
    create: async (data) => {
        const response = await axios.post(`${config.apiUrl}/product-inventory-categories`, data);
        return response.data;
    },

    // Kategori güncelle
    update: async (id, data) => {
        const response = await axios.put(`${config.apiUrl}/product-inventory-categories/${id}`, data);
        return response.data;
    },

    // Kategori sil
    delete: async (id) => {
        const response = await axios.delete(`${config.apiUrl}/product-inventory-categories/${id}`);
        return response.data;
    },
};

// Ürün Detay Servisleri
export const productDetailService = {
    // Tüm ürün detaylarını getir (sayfalama ile)
    fetchAll: async (page = 0, size = 10) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details`, {
            params: { page, size }
        });
        return response.data;
    },

    // ID'ye göre ürün detayı getir
    fetchById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/${id}`);
        return response.data;
    },

    // Arama yap
    search: async (keyword) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/search`, {
            params: { keyword }
        });
        return response.data;
    },

    // Market koduna göre getir
    fetchByMarketCode: async (marketCode) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/market-code/${marketCode}`);
        return response.data;
    },

    // Kategoriye göre getir
    fetchByCategory: async (categoryId) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/category/${categoryId}`);
        return response.data;
    },

    // Kategoriye göre aktif ürünleri getir
    fetchActiveByCategoryId: async (categoryId) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/category/${categoryId}/active`);
        return response.data;
    },

    // Markaya göre getir
    fetchByBrand: async (brandName) => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/brand/${brandName}`);
        return response.data;
    },

    // Aktif ürünleri getir
    fetchActive: async () => {
        const response = await axios.get(`${config.apiUrl}/product-inventory-details/active`);
        return response.data;
    },

    // Yeni ürün detayı oluştur
    create: async (data) => {
        const response = await axios.post(`${config.apiUrl}/product-inventory-details`, data);
        return response.data;
    },

    // Ürün detayı güncelle
    update: async (id, data) => {
        const response = await axios.put(`${config.apiUrl}/product-inventory-details/${id}`, data);
        return response.data;
    },

    // Ürün detayı sil
    delete: async (id) => {
        const response = await axios.delete(`${config.apiUrl}/product-inventory-details/${id}`);
        return response.data;
    },

    // Ürünü aktif yap
    activate: async (id) => {
        const response = await axios.patch(`${config.apiUrl}/product-inventory-details/${id}/activate`);
        return response.data;
    },

    // Ürünü pasif yap
    deactivate: async (id) => {
        const response = await axios.patch(`${config.apiUrl}/product-inventory-details/${id}/deactivate`);
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
    buildTreeData: (categories, parentId = null) => {
        return categories
            .filter(cat => cat.parentCategoryId === parentId)
            .map(cat => ({
                title: cat.categoryName,
                value: cat.id,
                key: cat.id,
                children: categoryHelper.buildTreeData(categories, cat.id),
            }));
    },
};

