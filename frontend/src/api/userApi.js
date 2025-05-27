// frontend/src/api/userApi.js
import axiosInstance from "./axiosInstance";

export const userApi = {
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      return res.data;
    } catch (error) {
      console.error(
        "Get current user error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId, userData) => {
    try {
      const res = await axiosInstance.put(`/users/${userId}`, userData);

      // Cập nhật thông tin user trong sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...res.data };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return res.data;
    } catch (error) {
      console.error(
        "Update user error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Thay đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const res = await axiosInstance.post(
        "/users/change-password",
        passwordData
      );
      return res.data;
    } catch (error) {
      console.error(
        "Change password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    try {
      const res = await axiosInstance.post("/users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Cập nhật avatar trong sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      currentUser.avatar = res.data.avatar;
      sessionStorage.setItem("user", JSON.stringify(currentUser));

      return res.data;
    } catch (error) {
      console.error(
        "Upload avatar error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Lấy lịch sử đặt vé
  getMyTickets: async (params = {}) => {
    try {
      const res = await axiosInstance.get("/users/my-tickets", { params });
      return res.data;
    } catch (error) {
      console.error(
        "Get tickets error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Lấy lịch sử đánh giá
  getMyReviews: async (params = {}) => {
    try {
      const res = await axiosInstance.get("/users/my-reviews", { params });
      return res.data;
    } catch (error) {
      console.error(
        "Get reviews error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const res = await axiosInstance.post("/users/forgot-password", { email });
      return res.data;
    } catch (error) {
      console.error(
        "Forgot password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Xác thực token reset mật khẩu
  verifyResetToken: async (token) => {
    try {
      const res = await axiosInstance.get(`/users/verify-reset-token/${token}`);
      return res.data;
    } catch (error) {
      console.error(
        "Verify reset token error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    try {
      const res = await axiosInstance.post("/users/reset-password", {
        token,
        newPassword,
      });
      return res.data;
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Xác thực email (thêm vào để đảm bảo nhất quán với authApi)
  verifyEmail: async (token) => {
    try {
      const res = await axiosInstance.get(`/auth/verify-email/${token}`);
      return res.data;
    } catch (error) {
      console.error(
        "Verify email error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};
