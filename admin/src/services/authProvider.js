// src/services/authProvider.js
const authProvider = {
  login: ({ username, password }) => {
    localStorage.setItem('auth', JSON.stringify({ username }));
    return Promise.resolve();
  },
  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem('auth') ? Promise.resolve() : Promise.reject();
  },
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
