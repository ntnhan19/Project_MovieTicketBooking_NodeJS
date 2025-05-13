// admin/src/services/authProvider.js
const authProvider = {
  login: ({ username, password }) => {
    // Vì người dùng đã đăng nhập từ frontend nên không cần đăng nhập lại
    // Chỉ cần kiểm tra lại thông tin xác thực
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

  getIdentity: () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      if (!auth.user) {
        console.error("Không tìm thấy thông tin người dùng");
        return Promise.reject("Không tìm thấy thông tin người dùng");
      }

      return Promise.resolve({
        id: auth.user.id,
        fullName:
          auth.user.username ||
          auth.user.name ||
          auth.user.fullName ||
          auth.user.email,
        avatar: auth.user.avatar || "https://via.placeholder.com/50",
      });
    } catch (e) {
      console.error("Lỗi khi lấy thông tin người dùng:", e);
      return Promise.reject("Lỗi khi lấy thông tin người dùng");
    }
  },
};

export default authProvider;