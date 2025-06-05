import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      const { token, user } = res.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("userId", user.id);

      // Sửa lỗi template literal
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return res.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const res = await axiosInstance.post("/auth/register", userData);
      return res.data;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: () => {
    // Xóa tất cả dữ liệu auth
    const keysToRemove = ["token", "user", "userId", "auth"];
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    // Xóa Authorization header
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  getCurrentUserFromStorage: () => {
    try {
      const userStr = sessionStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      const res = await axiosInstance.post("/auth/resend-verification", { email });
      return res.data;
    } catch (error) {
      console.error("Resend verification error:", error.response?.data || error.message);
      throw error;
    }
  },

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