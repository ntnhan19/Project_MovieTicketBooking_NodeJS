import React from "react";
import { Layout, Menu, Typography, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import { HomeOutlined, VideoCameraOutlined, CalendarOutlined, SettingOutlined } from "@ant-design/icons";
import UserMenu from "../Users/UserMenu";
import "./AppHeader.css";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const menuItems = [
    { 
      key: "home", 
      icon: <HomeOutlined />, 
      label: <Link to="/">Trang Chủ</Link> 
    },
    { 
      key: "movies", 
      icon: <VideoCameraOutlined />, 
      label: <Link to="/movies">Phim</Link> 
    },
    { 
      key: "showtimes", 
      icon: <CalendarOutlined />, 
      label: <Link to="/showtimes">Lịch Chiếu</Link> 
    },
    user?.role === "admin" && { 
      key: "admin", 
      icon: <SettingOutlined />, 
      label: <Link to="/admin">Quản Trị</Link> 
    },
  ].filter(Boolean);

  const currentKey = menuItems.find((item) =>
    location.pathname.startsWith(`/${item.key === "home" ? "" : item.key}`)
  )?.key || "home";

  return (
    <Header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo-container">
          <div className="logo-icon">🎬</div>
          <Title level={3} className="logo-text">DHL Cinema</Title>
        </Link>
        <Menu 
          theme="dark" 
          mode="horizontal" 
          selectedKeys={[currentKey]} 
          className="main-menu" 
          items={menuItems} 
        />
      </div>
      <div className="header-right">
        <Space size="large">
          <Link to="/promotions" className="promo-link">Khuyến mãi</Link>
          <UserMenu user={user} />
        </Space>
      </div>
    </Header>
  );
};

export default AppHeader;