// frontend/src/api/showtimeApi.js
import axiosInstance from './axiosInstance';

export const showtimeApi = {
  // Lấy lịch chiếu theo ngày
  getShowtimesByDate: async (date) => {
    try {
      const response = await axiosInstance.get(`/showtimes?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw error;
    }
  },

  // Lấy lịch chiếu theo phim
  getShowtimesByMovie: async (movieId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching showtimes for movie ${movieId}:`, error);
      throw error;
    }
  },

  // Lấy lịch chiếu theo rạp chiếu
  getShowtimesByCinema: async (cinemaId) => {
    try {
      const response = await axiosInstance.get(`/showtimes/cinema/${cinemaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching showtimes for cinema ${cinemaId}:`, error);
      throw error;
    }
  },

  // Lấy lịch chiếu theo phim và ngày
  getShowtimesByMovieAndDate: async (movieId, date) => {
    try {
      const response = await axiosInstance.get(`/showtimes/movie/${movieId}?date=${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching showtimes for movie ${movieId} on ${date}:`, error);
      throw error;
    }
  }
};