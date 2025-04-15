import axios from "axios";

const baseURL = "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    const token = auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      window.location.href = "/login"; // tuỳ chỉnh nếu cần redirect lại
    }
    return Promise.reject(error);
  }
);

export default api;
