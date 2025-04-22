// frontend/src/api/concessionApi.js
import axiosInstance from './axiosInstance';

export const concessionApi = {
  // Lấy danh sách tất cả đồ ăn, nước uống
  getAllItems: async () => {
    try {
      const response = await axiosInstance.get('/concessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching concession items:', error);
      throw error;
    }
  },
  
  // Lấy thông tin chi tiết về một món
  getItemById: async (itemId) => {
    try {
      const response = await axiosInstance.get(`/concessions/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching concession item ${itemId}:`, error);
      throw error;
    }
  },
  
  // Lấy danh sách đồ ăn, nước uống theo danh mục
  getItemsByCategory: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/concessions/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching concessions by category:`, error);
      throw error;
    }
  },
  
  // Lấy tất cả danh mục đồ ăn, nước uống
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get('/concessions/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching concession categories:', error);
      throw error;
    }
  },
  
  // Thêm đồ ăn nước uống vào đơn hàng
  addItemsToOrder: async (orderItems) => {
    try {
      const response = await axiosInstance.post('/concessions/order', { items: orderItems });
      return response.data;
    } catch (error) {
      console.error('Error adding concession items to order:', error);
      throw error;
    }
  }
};