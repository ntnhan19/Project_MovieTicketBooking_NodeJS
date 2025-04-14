// frontend/src/components/common/AppHeader.jsx
import React from "react";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import UserMenu from "../Users/UserMenu";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();

  // Lấy user từ localStorage (hoặc context nếu dùng Context)
  const user = JSON.parse(localStorage.getItem("user"));

  const selectedKeys = () => {
    if (location.pathname.startsWith("/movies")) return ["movies"];
    if (location.pathname.startsWith("/showtimes")) return ["showtimes"];
    return ["home"];
  };

  // Danh sách items cho Menu
  const menuItems = [
    {
      key: "home",
      label: <Link to="/">Trang Chủ</Link>
    },
    {
      key: "movies",
      label: <Link to="/movies">Phim</Link>
    },
    {
      key: "showtimes",
      label: <Link to="/showtimes">Suất chiếu</Link>
    },
    user?.role === "admin" && {
      key: "admin",
      label: <Link to="/admin">Quản trị</Link>
    }
  ].filter(Boolean); // Loại bỏ các phần tử `false` (trong trường hợp `user?.role !== "admin"`)

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#001529",
        padding: "0 24px",
      }}
    >
      {/* Logo + Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          to="/"
          style={{
            color: "#fadb14",
            fontSize: "20px",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          🎬 MovieTicket
        </Link>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKeys()}
          style={{ backgroundColor: "transparent", borderBottom: "none" }}
          items={menuItems} 
        />
      </div>

      {/* Menu người dùng */}
      <UserMenu user={user} />
    </Header>
  );
};

export default AppHeader;