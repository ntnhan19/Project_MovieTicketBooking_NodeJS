// frontend/src/api/authApi.js

import axiosInstance from './axiosInstance';

export const authApi = {
  // Đăng nhập
  login: async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("accessToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Đăng ký
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userId, userData) => {
    const response = await axiosInstance.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (userId, passwordData) => {
    const response = await axiosInstance.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  // Yêu cầu đặt lại mật khẩu
  requestPasswordReset: async (email) => {
    const response = await axiosInstance.post("/auth/reset-password", { email });
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post("/auth/reset-password/confirm", {
      token,
      newPassword,
    });
    return response.data;
  },
};
