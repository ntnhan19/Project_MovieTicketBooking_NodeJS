// admin/src/services/httpClient.js
import { fetchUtils } from "react-admin";

// URL cơ sở của API
const apiUrl = "http://localhost:3000/api";

// Hàm kiểm tra xác thực
const checkAuth = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");

    // Kiểm tra đầy đủ các điều kiện
    if (!auth.token) {
      console.error("Không tìm thấy token xác thực");
      throw new Error("Không có quyền truy cập");
    }

    if (!auth.user) {
      console.error("Không tìm thấy thông tin người dùng");
      throw new Error("Không có quyền truy cập");
    }

    if (auth.user.role?.toUpperCase() !== "ADMIN") {
      console.error("Người dùng không có quyền ADMIN");
      throw new Error("Không có quyền truy cập");
    }

    console.log("Xác thực ADMIN thành công trong httpClient");
    return auth.token;
  } catch (e) {
    console.error("Lỗi khi kiểm tra xác thực:", e);
    // Chuyển hướng đến trang login của user
    window.location.href = "http://localhost:3002/login?redirect=admin";
    throw e;
  }
};

// HTTP client tùy chỉnh với khả năng đính kèm token
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }

  try {
    const token = checkAuth();
    options.headers.set("Authorization", `Bearer ${token}`);
    return fetchUtils.fetchJson(url, options);
  } catch (e) {
    return Promise.reject(e);
  }
};

// Kiểm tra xem giá trị có phải là file không
const isFile = (value) => value instanceof File;

export { apiUrl, checkAuth, httpClient, isFile };