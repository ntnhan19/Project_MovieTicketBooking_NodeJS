// frontend/src/api/showtimeApi.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Điều chỉnh URL API server của bạn

export const showtimeApi = {
  // Lấy thông tin suất chiếu
  getShowtimeById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/showtimes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showtime:', error);
      throw error;
    }
  },
  
  // Lấy danh sách suất chiếu theo phim
  getShowtimesByMovie: async (movieId) => {
    try {
      const response = await axios.get(`${API_URL}/movies/${movieId}/showtimes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes by movie:', error);
      throw error;
    }
  },
  
  // Lấy trạng thái ghế của một suất chiếu
  getSeatsStatus: async (showtimeId) => {
    try {
      const response = await axios.get(`${API_URL}/showtimes/${showtimeId}/seats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seats status:', error);
      throw error;
    }
  },
  
  // Đặt giữ ghế tạm thời
  reserveSeats: async (showtimeId, seats) => {
    try {
      const response = await axios.post(`${API_URL}/showtimes/${showtimeId}/reserve`, { seats });
      return response.data;
    } catch (error) {
      console.error('Error reserving seats:', error);
      throw error;
    }
  }
};

export default showtimeApi;