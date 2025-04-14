// frontend/src/api/seatApi.js
import axiosInstance from './axiosInstance';

export const seatApi = {
  getSeatsByShowtime: async (showtimeId) => {
    const response = await axiosInstance.get(`/seats/showtime/${showtimeId}`);
    return response.data;
  },

  reserveSeats: async (showtimeId, seats) => {
    const response = await axiosInstance.post(`/seats/reserve`, { showtimeId, seats });
    return response.data;
  },
};