import React, { createContext, useState, useEffect, useContext } from "react";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [authModal, setAuthModal] = useState({
    visible: false,
    activeTab: "1",
    redirectAfterLogin: null,
  });

  // Thêm trạng thái cho modal Quên mật khẩu
  const [forgotPasswordModal, setForgotPasswordModal] = useState({
    visible: false,
  });

  const openAuthModal = (tab = "1", redirectPath = null) => {
    setAuthModal({
      visible: true,
      activeTab: tab,
      redirectAfterLogin: redirectPath,
    });
  };

  const closeAuthModal = () => {
    setAuthModal({
      ...authModal,
      visible: false,
    });
  };

  const switchAuthTab = (tab) => {
    setAuthModal({
      ...authModal,
      activeTab: tab,
    });
  };

  // Hàm mở modal Quên mật khẩu
  const openForgotPasswordModal = () => {
    setForgotPasswordModal({
      visible: true,
    });
    closeAuthModal(); // Đóng modal đăng nhập/đăng ký khi mở modal quên mật khẩu
  };

  // Hàm đóng modal Quên mật khẩu
  const closeForgotPasswordModal = () => {
    setForgotPasswordModal({
      visible: false,
    });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          try {
            const userData = await userApi.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            sessionStorage.setItem("user", JSON.stringify(userData)); 
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            authApi.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      const { user, token } = response;
      if (!user) {
        console.error("Không nhận được thông tin người dùng từ API");
        return {
          success: false,
          error: "Không nhận được thông tin người dùng",
        };
      }
      setUser(user);
      setIsAuthenticated(true);
      sessionStorage.setItem("token", token); 
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.setItem("userId", user.id); 
      sessionStorage.setItem("auth", JSON.stringify({ user, token })); 
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      closeAuthModal();
      if (authModal.redirectAfterLogin) {
        setTimeout(() => {
          window.location.href = authModal.redirectAfterLogin;
        }, 500);
      }
      toast.success("Đăng nhập thành công!");
      return response;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || "Đăng nhập thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await authApi.register(userData);

      // Chỉ hiển thị toast thành công và chuyển tab nếu thực sự thành công
      toast.success(
        result.message ||
          "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản."
      );
      switchAuthTab("1");
      return { success: true, message: result.message };
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Đã đăng xuất");
  };

  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const result = await authApi.resendVerificationEmail(email);
      toast.success(result.message || "Đã gửi lại email xác thực");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Không thể gửi lại email xác thực";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    try {
      setLoading(true);
      const result = await authApi.verifyEmail(token);
      toast.success(result.message || "Xác thực email thành công");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Xác thực email thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId, userData) => {
    try {
      setLoading(true);
      const updatedUser = await userApi.updateUser(userId, userData);
      setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
      toast.success("Cập nhật thông tin thành công");
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Cập nhật thông tin thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const result = await userApi.changePassword(passwordData);
      toast.success(result.message || "Thay đổi mật khẩu thành công");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Thay đổi mật khẩu thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      setLoading(true);
      const result = await userApi.uploadAvatar(formData);
      setUser((prevUser) => ({
        ...prevUser,
        avatar: result.avatar,
      }));
      toast.success(result.message || "Upload avatar thành công");
      return { success: true, avatar: result.avatar };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Upload avatar thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const result = await userApi.forgotPassword(email);
      toast.success(
        result.message || "Đã gửi email hướng dẫn đặt lại mật khẩu"
      );
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Không thể xử lý yêu cầu quên mật khẩu";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyResetToken = async (token) => {
    try {
      setLoading(true);
      const result = await userApi.verifyResetToken(token);
      return { success: result.valid };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Token không hợp lệ hoặc đã hết hạn";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const result = await userApi.resetPassword(token, newPassword);
      toast.success(result.message || "Đặt lại mật khẩu thành công");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Đặt lại mật khẩu thất bại";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    currentUser: user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    resendVerificationEmail,
    verifyEmail,
    updateProfile,
    changePassword,
    uploadAvatar,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    authModal,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    forgotPasswordModal,
    openForgotPasswordModal,
    closeForgotPasswordModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
