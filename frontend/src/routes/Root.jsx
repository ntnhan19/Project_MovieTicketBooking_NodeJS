// frontend/src/routes/Root.jsx
import React from "react";
import AdminRoutes from "./AdminRoutes";
import UserRoutes from "./UserRoutes";
import DefaultRoutes from "./DefaultRoutes";

const Root = () => {
  // Lấy thông tin đăng nhập từ localStorage
  const token = localStorage.getItem("token");
  let user = null;
  
  // Cố gắng parse thông tin người dùng
  if (token) {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        user = JSON.parse(userString);
      }
    } catch {
      // Nếu parse thất bại, xóa dữ liệu không hợp lệ
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  // Kiểm tra role để định tuyến
  if (token && user) {
    if (user.role === "ADMIN") {
      // Nếu là admin
      return <AdminRoutes />;
    } else {
      // Nếu là user thông thường
      return <UserRoutes />;
    }
  }

  // Nếu chưa đăng nhập
  return <DefaultRoutes />;
};

export default Root;