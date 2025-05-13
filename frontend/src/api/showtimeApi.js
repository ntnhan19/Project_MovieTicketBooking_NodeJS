import axiosInstance from "./axiosInstance";

export const showtimeApi = {
  // Lấy tất cả suất chiếu, có thể lọc theo movieId, cinemaId, date
  // Mặc định chỉ lấy các suất chiếu trong tương lai
  getAllShowtimes: async (filters = {}) => {
    try {
      // Đảm bảo rằng chỉ hiển thị các suất chiếu trong tương lai (không hiển thị quá khứ)
      const params = { ...filters, showPast: false };
      
      // Log để debugging múi giờ
      console.log(`Client time: ${new Date().toISOString()}`);
      
      const response = await axiosInstance.get('/showtimes', {
        params
      });
      
      // Lọc tiếp một lần nữa ở client để đảm bảo chỉ hiển thị suất chiếu tương lai
      const now = new Date();
      const filteredShowtimes = response.data.filter(showtime => {
        const showtimeDate = new Date(showtime.startTime);
        return showtimeDate > now;
      });
      
      console.log(`Lọc từ ${response.data.length} xuống còn ${filteredShowtimes.length} suất chiếu`);
      
      return filteredShowtimes;
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
  // API backend đã được sửa để chỉ trả về ngày hiện tại và tương lai
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
  // API backend đã được sửa để chỉ trả về suất chiếu trong tương lai
  getShowtimesByFilters: async (movieId, cinemaId, date) => {
    try {
      console.log(`Lấy suất chiếu cho phim ${movieId}, rạp ${cinemaId}, ngày ${date}`);
      
      const response = await axiosInstance.get('/showtimes/filter', {
        params: {
          movieId,
          cinemaId,
          date
        }
      });
      
      // Lọc thêm một lần nữa ở client để đảm bảo không hiển thị suất chiếu trong quá khứ
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const filteredShowtimes = response.data.filter(showtime => {
        // Kiểm tra nếu ngày là hôm nay thì lọc theo giờ
        if (date === now.toISOString().split('T')[0]) {
          const [hour, minute] = showtime.time.split(':').map(Number);
          // So sánh thời gian
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            return false; // Bỏ qua suất chiếu đã qua
          }
        }
        return true;
      });
      
      console.log(`Lọc từ ${response.data.length} xuống còn ${filteredShowtimes.length} suất chiếu`);
      
      return filteredShowtimes; // Danh sách các suất chiếu với thông tin giờ và phòng (đã lọc)
    } catch (error) {
      console.error('Error fetching showtimes by filters:', error);
      throw error;
    }
  }
};