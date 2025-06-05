// frontend/src/api/axiosInstance.js
import axios from "axios";

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để gắn token vào header trước mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor xử lý các response và error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (
        !error.config.url.includes("/auth/login") &&
        !error.config.url.includes("/users/verify-email") &&
        !error.config.url.includes("/users/forgot-password") &&
        !error.config.url.includes("/users/verify-reset-token") &&
        !error.config.url.includes("/users/reset-password")
      ) {
        // Chỉ xóa nếu lỗi là do token hết hạn
        if (error.response.data?.message?.includes("expired")) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("auth");
          window.location.href = "/login?session=expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
