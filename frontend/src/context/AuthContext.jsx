// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../api/authApi";
import { message } from "antd";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Nếu đã có token & user trong localStorage thì giữ lại trạng thái đăng nhập
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });

      const { token, user } = response;

      // Lưu token & user vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
      message.success("Đăng nhập thành công!");
      return { token, user };
    } catch (error) {
      message.error(error.response?.data?.message || "Đăng nhập thất bại!");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authApi.register(userData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return response;
    } catch (error) {
      message.error(error.response?.data?.message || "Đăng ký thất bại!");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    message.success("Đã đăng xuất!");
  };

  // Cập nhật thông tin
  const updateProfile = async (userId, userData) => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(userId, userData);
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      message.success("Cập nhật thông tin thành công!");
      return response;
    } catch (error) {
      message.error(error.response?.data?.message || "Cập nhật thất bại!");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};