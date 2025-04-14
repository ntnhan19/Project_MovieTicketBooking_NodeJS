// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../api/authApi";
import { message } from "antd";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu người dùng đã đăng nhập
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Đăng nhập
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authApi.login({ email, password });
      setCurrentUser(response.user);
      message.success("Đăng nhập thành công!");
      return response;
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
    authApi.logout();
    setCurrentUser(null);
    message.success("Đã đăng xuất!");
  };

  // Cập nhật thông tin người dùng
  const updateProfile = async (userId, userData) => {
    try {
      setLoading(true);
      const response = await authApi.updateProfile(userId, userData);
      setCurrentUser({ ...currentUser, ...userData });
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