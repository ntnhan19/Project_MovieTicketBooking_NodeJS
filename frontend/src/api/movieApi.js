// frontend/src/api/movieApi.js
import axiosInstance from './axiosInstance';

export const movieApi = {
  // Lấy danh sách tất cả phim
  getAllMovies: async () => {
    try {
      const response = await axiosInstance.get('/movies');
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Lấy phim theo id
  getMovieById: async (id) => {
    try {
      const response = await axiosInstance.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error);
      throw error;
    }
  },

  // Lấy phim đang chiếu
  getNowShowing: async () => {
    try {
      const response = await axiosInstance.get('/movies?status=nowShowing');
      return response.data;
    } catch (error) {
      console.error('Error fetching now showing movies:', error);
      throw error;
    }
  },

  // Lấy phim sắp chiếu
  getComingSoon: async () => {
    try {
      const response = await axiosInstance.get('/movies?status=comingSoon');
      return response.data;
    } catch (error) {
      console.error('Error fetching coming soon movies:', error);
      throw error;
    }
  },

  // Tìm kiếm phim
  searchMovies: async (keyword) => {
    try {
      const response = await axiosInstance.get(`/movies/search?q=${keyword}`);
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  
  getMoviesByCinema: async (cinemaId) => {
    try {
      const response = await axiosInstance.get(`/movies/cinema/${cinemaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movies for cinema ${cinemaId}:`, error);
      throw error;
    }
  }
};