// frontend/src/api/promotionApi.js
import axiosInstance from './axiosInstance';

export const promotionApi = {
  getAllPromotions: async () => {
    const response = await axiosInstance.get("/promotions");
    return response.data;
  },

  getPromotionById: async (id) => {
    const response = await axiosInstance.get(`/promotions/${id}`);
    return response.data;
  },

  createPromotion: async (data) => {
    const response = await axiosInstance.post("/promotions", data);
    return response.data;
  },

  updatePromotion: async (id, data) => {
    const response = await axiosInstance.put(`/promotions/${id}`, data);
    return response.data;
  },

  deletePromotion: async (id) => {
    const response = await axiosInstance.delete(`/promotions/${id}`);
    return response.data;
  },
};
