// frontend/src/api/userApi.js
import axiosInstance from './axiosInstance';

export const userApi = {
  getAllUsers: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, data) => {
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/users/${userId}`);
    return response.data;
  },
};
