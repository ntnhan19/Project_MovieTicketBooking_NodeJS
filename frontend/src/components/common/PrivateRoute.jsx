// frontend/src/components/common/PrivateRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, openAuthModal } = useAuth();
  const location = useLocation();

  // Nếu chưa đăng nhập, mở modal đăng nhập thay vì chuyển hướng
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal('1', location.pathname);
    }
  }, [loading, isAuthenticated, location.pathname, openAuthModal]);

  // Hiển thị loading khi đang kiểm tra trạng thái xác thực
  if (loading) {
    return <LoadingSpinner />;
  }

  // Nếu chưa đăng nhập, trả về null (không hiển thị nội dung bảo vệ)
  if (!isAuthenticated) {
    return null;
  }

  // Nếu có kiểm tra role và user không có quyền truy cập
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, hiển thị component con
  return children;
};

export default PrivateRoute;