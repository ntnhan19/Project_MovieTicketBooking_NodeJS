// frontend/src/api/promotionApi.js
import axiosInstance from './axiosInstance';

export const promotionApi = {
  // Lấy danh sách các promotion hiện có (với filter isActive nếu cần)
  getAllPromotions: async (isActive = true) => {
    try {
      const response = await axiosInstance.get(`/promotions?active=${isActive}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },
  
  // Lấy thông tin chi tiết một promotion theo ID
  getPromotionById: async (promotionId) => {
    try {
      const response = await axiosInstance.get(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching promotion ${promotionId}:`, error);
      throw error;
    }
  },
  
  // Lấy thông tin chi tiết một promotion theo mã code
  getPromotionByCode: async (promoCode) => {
    try {
      const response = await axiosInstance.get(`/promotions/code/${promoCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching promotion by code ${promoCode}:`, error);
      throw error;
    }
  },
  
  // Kiểm tra tính hợp lệ của mã khuyến mãi
  validatePromoCode: async (promoCode) => {
    try {
      const response = await axiosInstance.get(`/promotions/validate/${promoCode}`);
      return response.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  }
};