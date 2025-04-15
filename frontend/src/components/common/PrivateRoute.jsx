// frontend/src/components/PrivateRoute.jsx

import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // Kiểm tra token và user
  if (!token || !user) {
    // Chuyển hướng đến trang đăng nhập với state để sau khi đăng nhập có thể quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role của người dùng và phân quyền
  if (requiredRole && user.role !== requiredRole) {
    // Nếu role không đúng, chuyển hướng đến trang chính hoặc một trang khác
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;