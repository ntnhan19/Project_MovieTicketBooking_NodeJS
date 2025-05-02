// frontend/src/api/movieApi.js
import axiosInstance from "./axiosInstance";

export const movieApi = {
  // Lấy danh sách tất cả phim với các điều kiện lọc
  getAllMovies: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/movies", { params });
      return {
        data: response.data,
        pagination: {
          total: parseInt(response.headers["x-total-count"] || 0),
          page: parseInt(response.headers["x-page"] || 1),
          limit: parseInt(response.headers["x-limit"] || 10),
          totalPages: parseInt(response.headers["x-total-pages"] || 1),
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phim:", error);
      throw error;
    }
  },

  // Lấy chi tiết phim theo ID
  getMovieById: async (id) => {
    try {
      const response = await axiosInstance.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin phim ${id}:`, error);
      throw error;
    }
  },

  // Lấy danh sách phim đang chiếu
  getNowShowing: async () => {
    try {
      const response = await axiosInstance.get('/movies/now-showing');
      return response.data;
    } catch (error) {
      console.error('Error fetching now showing movies:', error);
      throw error;
    }
  },

  // Lấy danh sách phim sắp chiếu
  getComingSoon: async () => {
    try {
      const response = await axiosInstance.get("/movies/upcoming");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy phim sắp chiếu:", error);
      throw error;
    }
  },

  // Lấy danh sách phim theo rạp chiếu và ngày (nếu có)
  getMoviesByCinema: async (cinemaId, date = null) => {
    try {
      // Xây dựng URL 
      let url = `/movies/cinema/${cinemaId}`;

      // Log để debug
      console.log(`Calling API: ${url} with date:`, date);

      // Thêm date vào params nếu có
      const params = date ? { date } : {};

      const response = await axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy phim cho rạp ${cinemaId}:`, error);
      throw error;
    }
  },

  // Tìm kiếm phim theo tiêu đề
  searchMoviesByTitle: async (title, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get("/movies", {
        params: { title, page, limit },
      });
      return {
        data: response.data,
        pagination: {
          total: parseInt(response.headers["x-total-count"] || 0),
          page: parseInt(response.headers["x-page"] || 1),
          limit: parseInt(response.headers["x-limit"] || 10),
          totalPages: parseInt(response.headers["x-total-pages"] || 1),
        },
      };
    } catch (error) {
      console.error("Lỗi khi tìm kiếm phim:", error);
      throw error;
    }
  },

  // Lọc phim theo thể loại
  filterMoviesByGenre: async (genreId, page = 1, limit = 10) => {
    try {
      // Kiểm tra xem genreId có hợp lệ không
      if (!genreId) {
        console.error("genreId không hợp lệ:", genreId);
        return { data: [], pagination: { total: 0, page, limit, totalPages: 0 } };
      }
      
      const response = await axiosInstance.get("/movies", {
        params: { genreId, page, limit },
      });
      
      return {
        data: response.data,
        pagination: {
          total: parseInt(response.headers["x-total-count"] || 0),
          page: parseInt(response.headers["x-page"] || 1),
          limit: parseInt(response.headers["x-limit"] || 10),
          totalPages: parseInt(response.headers["x-total-pages"] || 1),
        },
      };
    } catch (error) {
      console.error(`Lỗi khi lọc phim theo thể loại ${genreId}:`, error);
      throw error;
    }
  },

  // Lọc phim nâng cao (kết hợp nhiều điều kiện)
  advancedFilter: async ({
    title,
    genreId,
    releaseDate,
    director,
    page = 1,
    limit = 10,
    sortBy = "releaseDate",
    sortOrder = "desc",
  }) => {
    try {
      const params = {
        title,
        genreId,
        releaseDate,
        director,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      // Loại bỏ các params có giá trị undefined
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axiosInstance.get("/movies", { params });

      return {
        data: response.data,
        pagination: {
          total: parseInt(response.headers["x-total-count"] || 0),
          page: parseInt(response.headers["x-page"] || 1),
          limit: parseInt(response.headers["x-limit"] || 10),
          totalPages: parseInt(response.headers["x-total-pages"] || 1),
        },
      };
    } catch (error) {
      console.error("Lỗi khi lọc phim:", error);
      throw error;
    }
  },
};