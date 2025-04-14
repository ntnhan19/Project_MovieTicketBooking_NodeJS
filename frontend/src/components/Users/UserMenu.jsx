// frontend/src/components/Users/UserMenu.jsx
// frontend/src/components/Users/UserMenu.jsx
import React from "react";
import { Avatar, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const UserMenu = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token và user từ localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Force reload trang để áp dụng thay đổi ngay lập tức
    window.location.href = "/";
  };

  const handleProfile = () => {
    navigate("/user/profile");
  };

  // Menu với các handler được gán trực tiếp
  const items = [
    {
      key: 'profile',
      label: 'Trang cá nhân',
      icon: <SettingOutlined />,
      onClick: handleProfile
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <Avatar icon={<UserOutlined />} />
        <span style={{ color: "#fff", marginLeft: '8px' }}>
          {user?.name || "User"}
        </span>
      </div>
    </Dropdown>
  );
};

export default UserMenu;