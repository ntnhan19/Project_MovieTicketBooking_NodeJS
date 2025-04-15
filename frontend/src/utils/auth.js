// frontend/src/utils/auth.js
export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };