import axiosInstance from './axiosInstance';

/**
 * Xử lý lỗi API promotion
 * @param {Error} error - Lỗi cần xử lý
 * @param {string} operation - Tên hành động đang thực hiện
 * @returns {Error} Lỗi đã được xử lý với thông báo cụ thể
 */
const handlePromotionApiError = (error, operation) => {
  const errorMessage = error.response?.data?.message || `Đã xảy ra lỗi khi ${operation}`;
  console.error(`Lỗi ${operation}:`, error);
  
  // Tạo lỗi với thông báo từ server nếu có
  const enhancedError = new Error(errorMessage);
  enhancedError.originalError = error;
  enhancedError.status = error.response?.status;
  
  throw enhancedError;
};

export const promotionApi = {
  /**
   * Lấy danh sách các promotion hiện có
   * @param {boolean} isActive - Lọc theo trạng thái hoạt động (mặc định: true)
   * @returns {Promise<Array>} Danh sách khuyến mãi
   */
  getAllPromotions: async (isActive = true) => {
    try {
      const response = await axiosInstance.get(`/promotions?active=${isActive}`);
      return response.data;
    } catch (error) {
      return handlePromotionApiError(error, 'lấy danh sách khuyến mãi');
    }
  },

  /**
   * Lấy thông tin promotion theo ID
   * @param {number|string} id - ID của khuyến mãi
   * @returns {Promise<Object>} Thông tin chi tiết khuyến mãi
   */
  getPromotionById: async (id) => {
    try {
      const response = await axiosInstance.get(`/promotions/${id}`);
      return response.data;
    } catch (error) {
      return handlePromotionApiError(error, 'lấy thông tin khuyến mãi');
    }
  },

  /**
   * Lấy thông tin promotion theo mã code
   * @param {string} code - Mã khuyến mãi
   * @returns {Promise<Object>} Thông tin chi tiết khuyến mãi
   */
  getPromotionByCode: async (code) => {
    try {
      const response = await axiosInstance.get(`/promotions/code/${code}`);
      return response.data;
    } catch (error) {
      return handlePromotionApiError(error, 'lấy thông tin mã khuyến mãi');
    }
  },

  /**
   * Xác thực mã khuyến mãi
   * @param {string} code - Mã khuyến mãi cần xác thực
   * @returns {Promise<Object>} Kết quả xác thực mã khuyến mãi
   */
  validatePromotionCode: async (code) => {
    try {
      const response = await axiosInstance.get(`/promotions/validate/${code}`);
      return response.data;
    } catch (error) {
      return handlePromotionApiError(error, 'xác thực mã khuyến mãi');
    }
  },
};