import React, { useState, useEffect } from "react";
import { Menu, Button, Dropdown } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import "../index.css";

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
      <div className={`header ${isScrolled ? "scrolled" : ""}`}>
        <div className={`header-container ${isScrolled ? "scrolled" : ""}`}>
          <Link to="/" className={`logo ${isScrolled ? "scrolled" : ""}`}>
            DHL CINEMA
          </Link>

          <Menu
            mode="horizontal"
            theme="dark"
            className="menu"
            selectedKeys={[]}
          >
            <Menu.Item key="home">
              <Link to="/">Trang Chủ</Link>
            </Menu.Item>
            <Menu.Item key="showtimes">
              <Link to="/showtimes">Lịch Chiếu</Link>
            </Menu.Item>
            <Menu.Item key="bookings">
              <Link to="/bookings">Đặt Vé</Link>
            </Menu.Item>
            <Menu.Item key="profile">
              <Link to="/profile">Tài Khoản</Link>
            </Menu.Item>
          </Menu>

          <Dropdown overlay={profileMenu}>
            <Button icon={<UserOutlined />} type="primary" />
          </Dropdown>
        </div>
      </div>

      <div className="spacer"></div>
    </>
  );
};

export default Header;
