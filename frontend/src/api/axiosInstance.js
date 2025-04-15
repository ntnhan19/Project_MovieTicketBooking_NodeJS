// frontend/src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor đính kèm token vào headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // CHUẨN HÓA key token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi phản hồi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status) {
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Không có quyền truy cập.');
          break;
        case 500:
          console.error('Lỗi server.');
          break;
        default:
          console.error('Lỗi không xác định.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;