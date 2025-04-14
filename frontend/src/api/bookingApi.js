// frontend/src/api/bookingApi.js
import axiosInstance from './axiosInstance';

export const bookingApi = {
  getUserBookings: async (userId) => {
    const response = await axiosInstance.get(`/bookings/user/${userId}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await axiosInstance.post("/bookings", bookingData);
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await axiosInstance.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  },
};
