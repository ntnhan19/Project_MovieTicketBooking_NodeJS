// frontend/src/api/authApi.js
import axiosInstance from './axiosInstance';

export const authApi = {
  // Đăng nhập
  login: async (credentials) => {
    const res = await axiosInstance.post("/auth/login", credentials);
    const { token, user } = res.data;

    // Lưu vào localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { token, user };
  },

  // Đăng ký
  register: async (userData) => {
    const res = await axiosInstance.post("/auth/register", userData);
    return res.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Cập nhật profile
  updateProfile: async (userId, userData) => {
    const res = await axiosInstance.put(`/users/${userId}`, userData);
    return res.data;
  },

  // Đổi mật khẩu
  changePassword: async (userId, data) => {
    const res = await axiosInstance.put(`/users/${userId}/password`, data);
    return res.data;
  },

  // Gửi email reset password
  requestPasswordReset: async (email) => {
    const res = await axiosInstance.post("/auth/reset-password", { email });
    return res.data;
  },

  // Reset password với token
  resetPassword: async (token, newPassword) => {
    const res = await axiosInstance.post("/auth/reset-password/confirm", {
      token,
      newPassword,
    });
    return res.data;
  },
};