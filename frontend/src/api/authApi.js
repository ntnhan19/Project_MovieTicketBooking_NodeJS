// frontend/src/api/authApi.js
import axiosInstance from './axiosInstance';

export const authApi = {
  // Đăng nhập
  login: async (credentials) => {
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      const { token, user } = res.data;

      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user.id);

      // Đặt token trong header cho các request tiếp theo
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return res.data; // Trả về toàn bộ kết quả từ API
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Đăng ký
  register: async (userData) => {
    try {
      const res = await axiosInstance.post("/auth/register", userData);
      return res.data;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("auth"); // Xóa thêm auth trong localStorage
  },

  // Lấy thông tin user hiện tại từ localStorage
  getCurrentUserFromStorage: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Gửi lại email xác thực
  resendVerificationEmail: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      return res.data;
    } catch (error) {
      console.error("Resend verification error:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Xác thực email
  verifyEmail: async (token) => {
    try {
      // Sửa endpoint này để khớp với backend
      const res = await axiosInstance.get(`/auth/verify-email/${token}`);
      return res.data;
    } catch (error) {
      console.error("Verify email error:", error.response?.data || error.message);
      throw error;
    }
  }
};