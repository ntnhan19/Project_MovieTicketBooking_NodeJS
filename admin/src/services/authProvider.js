// admin/src/services/authProvider.js
import { httpClient, apiUrl } from './httpClient';

const authProvider = {
  login: ({ username, password }) => {
    try {
      const auth = localStorage.getItem("auth");
      if (!auth) {
        console.error("Không tìm thấy thông tin xác thực");
        return Promise.reject("Không tìm thấy thông tin xác thực");
      }

      const authData = JSON.parse(auth);
      if (
        !authData.token ||
        !authData.user ||
        authData.user.role?.toUpperCase() !== "ADMIN"
      ) {
        console.error("Không có quyền truy cập trang quản trị");
        return Promise.reject("Không có quyền truy cập trang quản trị");
      }

      console.log("Đăng nhập thành công với quyền ADMIN");
      return Promise.resolve();
    } catch (e) {
      console.error("Lỗi khi đăng nhập:", e);
      return Promise.reject("Lỗi khi đăng nhập");
    }
  },

  logout: () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3002/login";
    return Promise.resolve();
  },

  checkAuth: () => {
    try {
      console.log("authProvider.checkAuth được gọi");
      const auth = localStorage.getItem("auth");

      if (!auth) {
        console.error("Không tìm thấy dữ liệu auth trong localStorage");
        return Promise.reject("Không tìm thấy dữ liệu auth");
      }

      const authData = JSON.parse(auth);
      console.log("Auth data sau khi parse:", {
        hasToken: !!authData.token,
        hasUser: !!authData.user,
        role: authData.user?.role,
      });

      if (
        !authData.token ||
        !authData.user ||
        authData.user.role?.toUpperCase() !== "ADMIN"
      ) {
        console.error("Dữ liệu auth không hợp lệ hoặc không có quyền admin");
        return Promise.reject("Không có quyền truy cập");
      }

      console.log("Xác thực ADMIN thành công trong authProvider");
      return Promise.resolve();
    } catch (e) {
      console.error("Lỗi trong checkAuth:", e);
      return Promise.reject("Lỗi xác thực");
    }
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      window.location.href = "http://localhost:3002/login?redirect=admin";
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return Promise.resolve(auth.user?.role || "");
  },

  getIdentity: async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      if (!auth.user || !auth.user.id) {
        console.error("Không tìm thấy thông tin người dùng trong localStorage");
        return Promise.reject("Không tìm thấy thông tin người dùng");
      }

      // Gọi API để lấy thông tin người dùng đầy đủ
      const response = await httpClient(`${apiUrl}/users/${auth.user.id}`);
      const userData = response.json;

      console.log("User data từ API:", userData);

      return Promise.resolve({
        id: userData.id,
        fullName: userData.fullName || userData.name || userData.username || userData.email || "Không xác định",
        email: userData.email || "",
        phone: userData.phone || "",
        avatar: userData.avatar || "https://via.placeholder.com/50",
        role: userData.role || auth.user.role || "ADMIN",
      });
    } catch (e) {
      console.error("Lỗi khi lấy thông tin người dùng:", e);
      return Promise.reject("Lỗi khi lấy thông tin người dùng");
    }
  },
};

export default authProvider;