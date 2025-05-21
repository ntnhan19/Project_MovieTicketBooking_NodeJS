// frontend/src/api/concessionCategoryApi.js
import axiosInstance from './axiosInstance';

export const concessionCategoryApi = {
  // Lấy danh sách tất cả danh mục bắp nước
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get('/concession/categories');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục bắp nước:', error);
      throw error;
    }
  },

  // Lấy thông tin một danh mục bắp nước theo ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await axiosInstance.get(`/concession/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin danh mục bắp nước ${categoryId}:`, error);
      throw error;
    }
  },
  
  // Lấy danh mục bắp nước với các sản phẩm có sẵn
  getCategoryWithAvailableItems: async (categoryId) => {
    try {
      // Dựa vào phương thức getCategoryWithAvailableItems trên backend
      const response = await axiosInstance.get(`/concession/categories/${categoryId}/available-items`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh mục với sản phẩm có sẵn:`, error);
      throw error;
    }
  },

  // Lấy danh sách danh mục đang hoạt động
  getActiveCategories: async () => {
    try {
      // Dựa vào phương thức getActiveCategories trên backend
      const response = await axiosInstance.get('/concession/categories/active');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục đang hoạt động:', error);
      throw error;
    }
  },

  // Tìm kiếm danh mục theo tên
  searchCategories: async (searchTerm) => {
    try {
      // Dựa vào phương thức searchCategories trên backend
      const response = await axiosInstance.get(`/concession/categories/search?term=${searchTerm}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm danh mục:', error);
      throw error;
    }
  }
};

export default concessionCategoryApi;