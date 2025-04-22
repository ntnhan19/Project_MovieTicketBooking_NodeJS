// frontend/src/api/seatApi.js
import axiosInstance from './axiosInstance';

export const seatApi = {
  // Lấy danh sách ghế theo suất chiếu
  getSeatsByShowtime: async (showtimeId) => {
    try {
      const response = await axiosInstance.get(`/seats/showtime/${showtimeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  },
  
  // Lấy thông tin chi tiết của một ghế
  getSeatById: async (seatId) => {
    try {
      const response = await axiosInstance.get(`/seats/${seatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seat details:', error);
      throw error;
    }
  },
  
  // Lấy layout ghế theo phòng
  getSeatLayoutByHall: async (hallId) => {
    try {
      const response = await axiosInstance.get(`/seats/hall/${hallId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seat layout:', error);
      throw error;
    }
  },
  
  // Khóa ghế tạm thời 
  lockSeats: async (seatIds) => {
    try {
      const response = await axiosInstance.post(`/seats/lock`, {
        seatIds
      });
      return response.data;
    } catch (error) {
      console.error('Error locking seats:', error);
      throw error;
    }
  },
  
  // Giải phóng ghế đã khóa
  unlockSeats: async (seatIds) => {
    try {
      const response = await axiosInstance.post(`/seats/unlock`, {
        seatIds
      });
      return response.data;
    } catch (error) {
      console.error('Error unlocking seats:', error);
      throw error;
    }
  }
};