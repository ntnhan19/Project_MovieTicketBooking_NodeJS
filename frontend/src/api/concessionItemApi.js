// frontend/src/api/concessionItemApi.js
import axiosInstance from './axiosInstance';

export const concessionItemApi = {
  // Lấy danh sách tất cả sản phẩm bắp nước
  getAllItems: async () => {
    try {
      const response = await axiosInstance.get('/concession/items');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm bắp nước:', error);
      throw error;
    }
  },

  // Lấy thông tin một sản phẩm bắp nước theo ID
  getItemById: async (itemId) => {
    try {
      const response = await axiosInstance.get(`/concession/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sản phẩm bắp nước ${itemId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm theo danh mục
  getItemsByCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/concession/items/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách sản phẩm theo danh mục:`, error);
      throw error;
    }
  },
  
  // Lấy danh sách sản phẩm có sẵn theo danh mục
  getAvailableItemsByCategory: async (categoryId) => {
    try {
      // Dựa vào phương thức getAvailableItemsByCategory trên backend
      const response = await axiosInstance.get(`/concession/items/category/${categoryId}/available`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách sản phẩm có sẵn theo danh mục:`, error);
      throw error;
    }
  },

  // Lấy tất cả sản phẩm đang có sẵn
  getAllAvailableItems: async () => {
    try {
      // Dựa vào phương thức getAllAvailableItems trên backend
      const response = await axiosInstance.get('/concession/items/available');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tất cả sản phẩm có sẵn:', error);
      throw error;
    }
  },

  // Lấy danh sách sản phẩm phổ biến
  getPopularItems: async (limit = 5) => {
    try {
      // Dựa vào phương thức getPopularItems trên backend
      const response = await axiosInstance.get(`/concession/items/popular?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm phổ biến:', error);
      throw error;
    }
  },

  // Tìm kiếm sản phẩm theo tên
  searchItems: async (searchTerm) => {
    try {
      // Dựa vào phương thức searchItems trên backend
      const response = await axiosInstance.get(`/concession/items/search?term=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm sản phẩm:', error);
      throw error;
    }
  }
};