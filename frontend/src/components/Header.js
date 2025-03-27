import React from "react";
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
        style={{
          color: "white",
          fontSize: "22px",
          fontWeight: "bold",
          fontFamily: "Pacifico",
        }}
      >
        DHL CINEMA
      </Link>

      <Menu
        mode="horizontal"
        theme="dark"
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          gap: "50px",
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

      <Dropdown overlay={profileMenu}>
        <Button icon={<UserOutlined />} type="primary"></Button>
      </Dropdown>
    </div>
  );
};

export default Header;
