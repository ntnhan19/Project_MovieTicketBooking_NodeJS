import React, { useState, useEffect } from "react";
import { Menu, Button, Dropdown, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import "../index.css";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage khi Header render
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser.fullName); // Lưu tên người dùng vào state
    }
  }, []);

  // Xử lý sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login-register");
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      navigate(`/movies?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(""); // Xóa input tìm kiếm sau khi gửi
    }
  };

  // Menu dropdown người dùng
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
          {/* Logo */}
          <Link to="/" className={`logo ${isScrolled ? "scrolled" : ""}`}>
            DHL CINEMA
          </Link>

          {/* Menu */}
          <Menu
            mode="horizontal"
            theme="dark"
            className="menu"
            selectedKeys={[]}
          >
            <Menu.Item key="home">
              <Link to="/">Trang Chủ</Link>
            </Menu.Item>
            <Menu.Item key="movies">
              <Link to="/movies">Phim</Link>
            </Menu.Item>
            <Menu.Item key="showtimes">
              <Link to="/showtimes">Lịch Chiếu</Link>
            </Menu.Item>
          </Menu>

          {/* Search box */}
          <Input
            placeholder="Tìm phim..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={handleSearch}
            suffix={
              <SearchOutlined
                onClick={handleSearch}
                style={{ cursor: "pointer", color: "#015c92" }}
              />
            }
            style={{ width: 200, marginRight: 15 }}
          />

          {/* User dropdown or login button */}
          {user ? (
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Button icon={<UserOutlined />} type="primary">
                {user}
              </Button>
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
      <div className="spacer" />
    </>
  );
};

export default Header;
