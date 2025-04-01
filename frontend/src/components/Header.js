import React, { useState, useEffect } from "react";
import { Menu, Button, Dropdown } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import "../index.css";

const Header = ({ user, setUser }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/profile");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate("/profile")}>
        Thông tin tài khoản
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

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
            <Menu.Item key="movies">
              <Link to="/movies">Đặt Vé</Link>
            </Menu.Item>
          </Menu>

          {user ? (
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Button icon={<UserOutlined />}>{user}</Button>
            </Dropdown>
          ) : (
            <Button
              icon={<UserOutlined />}
              type="primary"
              onClick={() => navigate("/login-register")}
            >
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
      <div className="spacer"></div>
    </>
  );
};

export default Header;
