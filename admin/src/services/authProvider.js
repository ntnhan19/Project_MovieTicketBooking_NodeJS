// admin/src/services/authProvider.js
const API_URL = "http://localhost:3000/api/auth/login";  // Cập nhật lại URL API backend (3000)

const authProvider = {
  login: async ({ username, password }) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Đăng nhập thất bại");
    }

    const { token, user } = await response.json();

    const authData = {
      token,
      role: user.role,
      username: user.username,
      id: user.id,
    };

    // Lưu cả auth object và token riêng để axios dùng
    localStorage.setItem("auth", JSON.stringify(authData));
    localStorage.setItem("token", token); // Đảm bảo axios đọc được

    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem("auth") ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getPermissions: () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return Promise.resolve(auth.role || "user");
  },

  getIdentity: () => {
    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    return Promise.resolve({
      id: auth.id,
      fullName: auth.username,
      role: auth.role,
    });
  },
};

export default authProvider;
