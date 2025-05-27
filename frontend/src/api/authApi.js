import axiosInstance from './axiosInstance';

export const authApi = {
  // Đăng nhập
  login: async (credentials) => {
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      const { token, user } = res.data;

      // Lưu vào sessionStorage thay vì localStorage
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("userId", user.id);

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
    // Xóa dữ liệu từ sessionStorage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("auth");
  },

  // Lấy thông tin user hiện tại từ sessionStorage
  getCurrentUserFromStorage: () => {
    const userStr = sessionStorage.getItem("user");
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
      const res = await axiosInstance.get(`/auth/verify-email/${token}`);
      return res.data;
    } catch (error) {
      console.error("Verify email error:", error.response?.data || error.message);
      throw error;
    }
  }
};