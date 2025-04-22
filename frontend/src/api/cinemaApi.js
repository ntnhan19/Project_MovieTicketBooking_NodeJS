// frontend/src/api/cinemaApi.js
import axiosInstance from './axiosInstance';

export const cinemaApi = {
  // Lấy danh sách tất cả rạp chiếu phim
  getAllCinemas: async () => {
    try {
      const response = await axiosInstance.get('/cinemas');
      return response.data;
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      throw error;
    }
  },

  // Lấy thông tin một rạp chiếu phim theo ID
  getCinemaById: async (cinemaId) => {
    try {
      const response = await axiosInstance.get(`/cinemas/${cinemaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cinema ${cinemaId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách phòng chiếu của một rạp
  getCinemaRooms: async (cinemaId) => {
    try {
      const response = await axiosInstance.get(`/cinemas/${cinemaId}/rooms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cinema rooms:`, error);
      throw error;
    }
  }
};