import React from "react";
import { Avatar, Dropdown, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  LoginOutlined,
  UserAddOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import "./UserMenu.css";

const UserMenu = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    console.log("Logged out");
    navigate("/login");
    setTimeout(() => window.location.reload(), 300);
  };

  // Sửa: Menu dạng items[]
  const guestMenuItems = [
    {
      key: "login",
      icon: <LoginOutlined />,
      label: "Đăng nhập",
      onClick: () => navigate("/login"),
    },
    {
      key: "register",
      icon: <UserAddOutlined />,
      label: "Đăng ký",
      onClick: () => navigate("/register"),
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Trang cá nhân",
      onClick: () => navigate("/user/profile"),
    },
    {
      key: "booking-history",
      icon: <HistoryOutlined />,
      label: "Lịch sử đặt vé",
      onClick: () => navigate("/user/bookings"),
    },
    { type: "divider" },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
      onClick: () => navigate("/user/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown
      menu={{ items: user ? userMenuItems : guestMenuItems }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <div className="user-menu-trigger">
        <Space>
          <Avatar
            size="default"
            icon={<UserOutlined />}
            className={user ? "user-avatar logged-in" : "user-avatar"}
            src={user?.avatar}
          />
          <span className="username-display">
            {user ? user.name || "Thành viên" : "Khách"}
          </span>
        </Space>
      </div>
    </Dropdown>
  );
};

export default UserMenu;
