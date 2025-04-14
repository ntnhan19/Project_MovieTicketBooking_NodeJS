// admin/src/services/authProvider.js
const API_URL = "http://localhost:3001/api/auth/login";

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

    // Lưu token + role (hoặc bất cứ info nào cần)
    localStorage.setItem(
      "auth",
      JSON.stringify({
        token,
        role: user.role,
        username: user.username,
        id: user.id,
      })
    );

    return Promise.resolve();
  },

  logout: () => {
    localStorage.removeItem("auth");
    return Promise.resolve();
  },

  checkAuth: () => {
    const auth = localStorage.getItem("auth");
    return auth ? Promise.resolve() : Promise.reject();
  },

  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth");
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
