import axios from "axios";

// Tạo một instance riêng
const axiosInstance = axios.create({
  baseURL: "http://localhost:3002/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token tự động nếu có
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
