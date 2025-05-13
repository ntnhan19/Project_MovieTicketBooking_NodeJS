// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

// Tạo context cho xác thực người dùng
export const AuthContext = createContext();

// Tạo custom hook useAuth để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Thêm state quản lý modal đăng nhập
  const [authModal, setAuthModal] = useState({
    visible: false,
    activeTab: '1', // '1' cho đăng nhập, '2' cho đăng ký
    redirectAfterLogin: null // Lưu đường dẫn để chuyển hướng sau khi đăng nhập nếu cần
  });

  // Mở modal đăng nhập
  const openAuthModal = (tab = '1', redirectPath = null) => {
    setAuthModal({
      visible: true,
      activeTab: tab,
      redirectAfterLogin: redirectPath
    });
  };

  // Đóng modal đăng nhập
  const closeAuthModal = () => {
    setAuthModal({
      ...authModal,
      visible: false
    });
  };

  // Chuyển tab trong modal
  const switchAuthTab = (tab) => {
    setAuthModal({
      ...authModal,
      activeTab: tab
    });
  };

  // Kiểm tra người dùng đã đăng nhập từ localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Kiểm tra nếu có token trong localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Lấy thông tin người dùng từ API
          try {
            const userData = await userApi.getCurrentUser();
            console.log("Fetched user data:", userData);
            setUser(userData);
            setIsAuthenticated(true);
            
            // Cập nhật lại localStorage với thông tin mới nhất
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (error) {
            // Nếu API request thất bại, xóa token và đăng xuất
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

  // Đăng nhập
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      
      // Lấy dữ liệu người dùng từ response
      const { user, token } = response;
      
      console.log("Login successful, user data:", user);
      
      // Kiểm tra xem có thông tin người dùng hay không
      if (!user) {
        console.error("Không nhận được thông tin người dùng từ API");
        return { success: false, error: 'Không nhận được thông tin người dùng' };
      }
      
      // Cập nhật trạng thái toàn cục
      setUser(user);
      setIsAuthenticated(true);
      
      // Lưu thông tin người dùng theo định dạng mà cả 2 trang (user và admin) đều có thể đọc được
      // Lưu token riêng
      localStorage.setItem('token', token);
      
      // Lưu thông tin user riêng
      localStorage.setItem('user', JSON.stringify(user));
      
      // Lưu id người dùng nếu cần
      localStorage.setItem('userId', user.id);
      
      // QUAN TRỌNG: Lưu cả thông tin auth theo định dạng mà trang admin cần
      localStorage.setItem('auth', JSON.stringify({
        user: user,
        token: token
      }));
      
      console.log("Đã lưu auth vào localStorage:", {user, token});
      
      // Thiết lập token trong header cho tất cả các request tiếp theo
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Đóng modal đăng nhập nếu đang mở
      closeAuthModal();
      
      // Chuyển hướng sau khi đăng nhập thành công nếu có
      if (authModal.redirectAfterLogin) {
        setTimeout(() => {
          window.location.href = authModal.redirectAfterLogin;
        }, 500);
      }
      
      // Hiển thị thông báo thành công
      toast.success('Đăng nhập thành công!');
      
      return response;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại';
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
      toast.success(result.message || 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Sau khi đăng ký thành công, chuyển tab sang đăng nhập
      switchAuthTab('1');
      
      return { success: true, message: result.message };
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage = error.response?.data?.error || 'Đăng ký thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Đã đăng xuất');
  };

  const resendVerificationEmail = async (email) => {
    try {
      setLoading(true);
      const result = await authApi.resendVerificationEmail(email);
      toast.success(result.message || 'Đã gửi lại email xác thực');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể gửi lại email xác thực';
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
      toast.success(result.message || 'Xác thực email thành công');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Xác thực email thất bại';
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
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      toast.success('Cập nhật thông tin thành công');
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Cập nhật thông tin thất bại';
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
      toast.success(result.message || 'Thay đổi mật khẩu thành công');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Thay đổi mật khẩu thất bại';
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
      
      // Cập nhật avatar trong state
      setUser(prevUser => ({
        ...prevUser,
        avatar: result.avatar
      }));
      
      toast.success(result.message || 'Upload avatar thành công');
      return { success: true, avatar: result.avatar };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Upload avatar thất bại';
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
      toast.success(result.message || 'Đã gửi email hướng dẫn đặt lại mật khẩu');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Không thể xử lý yêu cầu quên mật khẩu';
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
      const errorMessage = error.response?.data?.error || 'Token không hợp lệ hoặc đã hết hạn';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const result = await userApi.resetPassword(token, newPassword);
      toast.success(result.message || 'Đặt lại mật khẩu thành công');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Đặt lại mật khẩu thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Value object cung cấp cho context
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
    switchAuthTab
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};