// frontend/src/api/paymentApi.js
import axiosInstance from './axiosInstance';

export const paymentApi = {
  processPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments', paymentData);
    return response.data;
  },
  
  verifyPayment: async (paymentId) => {
    const response = await axiosInstance.get(`/payments/${paymentId}/verify`);
    return response.data;
  }
};