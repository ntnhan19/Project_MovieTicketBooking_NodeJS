// frontend/src/api/cinemaApi.js
import axiosInstance from './axiosInstance';

export const cinemaApi = {
  // Lấy danh sách tất cả rạp chiếu phim
  getAllCinemas: async () => {
    const response = await axiosInstance.get('/cinemas');
    return response.data;
  },

  // Lấy thông tin một rạp chiếu phim theo ID
  getCinemaById: async (cinemaId) => {
    const response = await axiosInstance.get(`/cinemas/${cinemaId}`);
    return response.data;
  },

  // Lấy danh sách rạp chiếu theo bộ lọc
  getCinemasByFilter: async (filters) => {
    const response = await axiosInstance.get('/cinemas/filter', { params: filters });
    return response.data;
  },

  // Lấy danh sách phòng chiếu của một rạp
  getCinemaRooms: async (cinemaId) => {
    const response = await axiosInstance.get(`/cinemas/${cinemaId}/rooms`);
    return response.data;
  },
};
