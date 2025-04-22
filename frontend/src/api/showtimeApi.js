import axiosInstance from "./axiosInstance";

export const showtimeApi = {
  // Lấy tất cả suất chiếu, có thể lọc theo movieId, cinemaId, date
  getAllShowtimes: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/showtimes', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all showtimes:', error);
      throw error;
    }
  },

  // Lấy thông tin suất chiếu theo ID
  getShowtimeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/showtimes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showtime:', error);
      throw error;
    }
  },
  
  // Lấy trạng thái ghế của một suất chiếu
  getSeatsStatus: async (showtimeId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/${showtimeId}/seats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching seats status:', error);
      throw error;
    }
  },
  
  // Lấy danh sách ngày có suất chiếu của phim tại rạp
  getAvailableDates: async (movieId, cinemaId) => {
    try {
      const response = await axiosInstance.get('/showtimes/available-dates', {
        params: {
          movieId,
          cinemaId
        }
      });
      return response.data.dates; // Response trả về { dates: [...] }
    } catch (error) {
      console.error('Error fetching available dates:', error);
      throw error;
    }
  },
  
  // Lấy các suất chiếu theo phim, rạp và ngày
  getShowtimesByFilters: async (movieId, cinemaId, date) => {
    try {
      const response = await axiosInstance.get('/showtimes/filter', {
        params: {
          movieId,
          cinemaId,
          date
        }
      });
      return response.data; // Danh sách các suất chiếu với thông tin giờ và phòng
    } catch (error) {
      console.error('Error fetching showtimes by filters:', error);
      throw error;
    }
  }
};