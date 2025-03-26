import React from "react";
import { Menu, Button, Dropdown } from "antd";
import { Link } from "react-router-dom";

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

const Header = () => {
  return (
    <div
      style={{
        background: "#001529",
        padding: "10px 50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}
      >
        DHL CINEMA
      </Link>

      <Menu
        mode="horizontal"
        theme="dark"
        style={{ flex: 1, justifyContent: "center" }}
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

      <div>
        <Link to="/login">
          <Button type="primary" style={{ marginRight: "10px" }}>
            Đăng Nhập
          </Button>
        </Link>
        <Link to="/register">
          <Button>Đăng Ký</Button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
