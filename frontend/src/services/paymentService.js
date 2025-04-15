// frontend/src/services/paymentService.js
import axiosInstance from "../api/axiosInstance";

export const paymentService = {
  // Process payment transaction
  processPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payments', paymentData);
    return response.data;
  },
  
  // Verify payment status
  verifyPayment: async (paymentId) => {
    const response = await axiosInstance.get(`/api/payments/${paymentId}`);
    return response.data;
  },
  
  // Get transaction history for user
  getTransactionHistory: async (userId) => {
    const response = await axiosInstance.get(`/api/payments/user/${userId}`);
    return response.data;
  }
};