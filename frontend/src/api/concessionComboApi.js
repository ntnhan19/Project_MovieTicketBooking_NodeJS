// frontend/src/api/concessionComboApi.js
import axiosInstance from './axiosInstance';

export const concessionComboApi = {
  // Lấy tất cả combo có sẵn (dành cho người dùng)
  getAvailableCombos: async () => {
    try {
      const response = await axiosInstance.get('/concession/combos', {
        params: { isAvailable: true }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách combo:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết một combo theo ID
  getComboById: async (comboId) => {
    try {
      const response = await axiosInstance.get(`/concession/combos/${comboId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin combo ${comboId}:`, error);
      throw error;
    }
  },

  // Tìm kiếm combo theo tên
  searchCombos: async (searchTerm) => {
    try {
      const response = await axiosInstance.get('/concession/combos', {
        params: { q: searchTerm, isAvailable: true }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm combo:', error);
      throw error;
    }
  },

  // Lấy danh sách combo phổ biến
  getPopularCombos: async (limit = 5) => {
    try {
      const response = await axiosInstance.get('/concession/combos/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách combo phổ biến:', error);
      throw error;
    }
  }
};

export default concessionComboApi;