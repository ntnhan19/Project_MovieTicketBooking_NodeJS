import React, { useState, useEffect } from "react";
import { Menu, Button, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

const movieMenu = (
  <Menu>
    <Menu.Item key="now-playing">
      <Link to="/movies/now-playing">Phim Đang Chiếu</Link>
    </Menu.Item>
    <Menu.Item key="coming-soon">
      <Link to="/movies/coming-soon">Phim Sắp Chiếu</Link>
    </Menu.Item>
  </Menu>
);

const profileMenu = (
  <Menu>
    <Menu.Item key="profile">
      <Link to="/profile">Tài Khoản</Link>
    </Menu.Item>
    <Menu.Item key="logout">
      <Link to="/logout">Đăng Xuất</Link>
    </Menu.Item>
  </Menu>
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header cố định trên cùng */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled ? "rgba(0, 21, 41, 0.9)" : "#001529",
          boxShadow: isScrolled ? "0px 4px 10px rgba(0, 0, 0, 0.3)" : "none",
          transition: "all 0.3s ease-in-out",
          backdropFilter: isScrolled ? "blur(10px)" : "none",
        }}
      >
        {/* Container với max-width 960px */}
        <div
          style={{
            maxWidth: "960px", // Giới hạn chiều rộng
            margin: "0 auto", // Căn giữa
            padding: isScrolled ? "5px 20px" : "15px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              color: "white",
              fontSize: isScrolled ? "20px" : "22px",
              fontWeight: "bold",
              fontFamily: "Pacifico",
              transition: "font-size 0.3s ease-in-out",
            }}
          >
            DHL CINEMA
          </Link>

          {/* Menu chính */}
          <Menu
            mode="horizontal"
            theme="dark"
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              background: "transparent",
              borderBottom: "none",
            }}
          >
            <Menu.Item key="home">
              <Link to="/">Trang Chủ</Link>
            </Menu.Item>
            <Menu.Item key="movies">
              <Dropdown overlay={movieMenu}>
                <Link to="/movies">Phim</Link>
              </Dropdown>
            </Menu.Item>
            <Menu.Item key="bookings">
              <Link to="/bookings">Đặt Vé</Link>
            </Menu.Item>
            <Menu.Item key="profile">
              <Link to="/profile">Tài Khoản</Link>
            </Menu.Item>
          </Menu>

          {/* Nút tài khoản */}
          <Dropdown overlay={profileMenu}>
            <Button icon={<UserOutlined />} type="primary" />
          </Dropdown>
        </div>
      </div>

      {/* Đệm khoảng trống tránh che mất nội dung */}
      <div style={{ height: "70px" }}></div>
    </>
  );
};

export default Header;
