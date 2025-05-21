import React, { useState, useEffect, useContext } from "react";
import { Layout, Menu, Button, Badge, Avatar, Dropdown, Modal } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  UserOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuOutlined,
  IdcardOutlined,
  BellOutlined,
  SearchOutlined,
  CoffeeOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path.startsWith("/movies")) return "movies";
    if (path.startsWith("/promotions")) return "promotions";
    if (path.startsWith("/concessions")) return "concessions";
    if (path.startsWith("/admin")) return "admin";
    return "";
  };

  const activeKey = getActiveKey();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const showLoginModal = () => {
    openAuthModal('1'); // Mở tab Đăng Nhập
  };

  const showRegisterModal = () => {
    openAuthModal('2'); // Mở tab Đăng Ký
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty(
      "--ripple-x",
      `${e.clientX - btn.getBoundingClientRect().left}px`
    );
    btn.style.setProperty(
      "--ripple-y",
      `${e.clientY - btn.getBoundingClientRect().top}px`
    );
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang Chủ</Link>,
    },
    {
      key: "movies",
      icon: <VideoCameraOutlined />,
      label: <Link to="/movies">Phim</Link>,
    },
    {
      key: "promotions",
      icon: <GiftOutlined />,
      label: <Link to="/promotions">Khuyến Mãi</Link>,
    },
    {
      key: "concessions",
      icon: <CoffeeOutlined />,
      label: <Link to="/concessions">Bắp Nước</Link>,
    },
    currentUser?.role === "admin" && {
      key: "admin",
      icon: <SettingOutlined />,
      label: <Link to="/admin">Quản Trị</Link>,
    },
  ].filter(Boolean);

  const userMenu = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/user/profile">Trang cá nhân</Link>,
    },
    {
      key: "bookings",
      icon: <IdcardOutlined />,
      label: <Link to="/user/profile">Lịch sử đặt vé</Link>,
    },
    {
      key: "logout",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const userDropdownMenu = {
    items: userMenu,
    className: "user-dropdown-menu",
  };

  const checkStorageAuth = () => {
    const userFromStorage = localStorage.getItem("user");
    const tokenFromStorage = localStorage.getItem("token");
    return !!(userFromStorage && tokenFromStorage);
  };

  const isUserAuthenticated = isAuthenticated || checkStorageAuth();
  const userToDisplay =
    currentUser ||
    (localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null);

  return (
    <>
      <Header
        className={`header-fixed transition-all duration-300 ${
          scrolled ? "h-16 shadow-lg backdrop-blur-md" : "h-20"
        }`}
        style={{
          padding: 0,
          background: scrolled
            ? theme === "dark"
              ? "rgba(17, 24, 39, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
            : theme === "dark"
            ? "#111827"
            : "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          color: theme === "dark" ? "#ffffff" : "#333333",
          textShadow:
            theme === "dark" ? "0 1px 3px rgba(0, 0, 0, 0.5)" : "none",
        }}
        data-scrolled={scrolled ? "true" : "false"}
      >
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-full">
          <Link to="/" className="flex items-center">
            <div className="text-3xl mr-2">🎬</div>
            <div
              className={`text-primary font-logo font-bold transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              } dark:text-red-400`}
            >
              DHL Cinema
            </div>
          </Link>

          <div className="flex items-center md:hidden">
            <Button
              type="text"
              icon={
                <SearchOutlined className="text-lg text-gray-700 dark:text-gray-300" />
              }
              onClick={() => setSearchActive(!searchActive)}
              className="mr-2 flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
              onClickCapture={handleRipple}
            />
            <Button
              type="text"
              icon={<MenuOutlined className="text-lg dark:text-gray-300" />}
              onClick={() => setMobileMenuVisible(true)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
              onClickCapture={handleRipple}
            />
          </div>

          <div className="hidden md:block flex-1 mx-8">
            <Menu
              mode="horizontal"
              selectedKeys={[activeKey]}
              className="flex justify-center bg-transparent border-b-0 dark:bg-gray-900 custom-header-menu"
              style={{
                fontWeight: 500,
                fontSize: "15px",
                backgroundColor: theme === "dark" ? "#111827" : undefined,
                color: theme === "dark" ? "#ffffff" : "#333333",
              }}
              items={menuItems}
              override={{
                inkBar: { display: "none" },
              }}
            />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button
              type="text"
              icon={
                theme === "light" ? (
                  <MoonOutlined className="text-lg text-gray-700 dark:text-gray-300" />
                ) : (
                  <SunOutlined className="text-lg text-gray-700 dark:text-gray-300" />
                )
              }
              onClick={(e) => {
                handleRipple(e);
                toggleTheme();
              }}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
            />
            <Button
              type="text"
              icon={
                <SearchOutlined className="text-lg text-gray-700 dark:text-gray-300" />
              }
              onClick={() => setSearchActive(!searchActive)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
              onClickCapture={handleRipple}
            />

            {isUserAuthenticated && userToDisplay ? (
              <div className="flex items-center">
                <Badge count={0} dot>
                  <Button
                    type="text"
                    icon={
                      <BellOutlined className="text-lg text-gray-700 dark:text-gray-300" />
                    }
                    className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
                    onClickCapture={handleRipple}
                  />
                </Badge>

                <Dropdown
                  menu={userDropdownMenu}
                  placement="bottomRight"
                  trigger={["click"]}
                  overlayClassName="user-dropdown-overlay"
                >
                  <div className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full px-3 py-1.5 transition-all">
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      className="bg-primary dark:bg-red-500 text-white"
                    />
                    <span className="ml-2 font-medium hidden lg:inline dark:text-white">
                      {userToDisplay.name ||
                        userToDisplay.username ||
                        userToDisplay.email}
                    </span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={showLoginModal}
                  className="btn-outline ripple-btn rounded-full px-5 h-10 dark:text-white"
                  onClickCapture={handleRipple}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={showRegisterModal}
                  className="btn-primary ripple-btn rounded-full px-5 h-10"
                  onClickCapture={handleRipple}
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      <Modal
        open={mobileMenuVisible}
        onCancel={() => setMobileMenuVisible(false)}
        footer={null}
        closable={false}
        width="100%"
        style={{
          top: 0,
          margin: 0,
          padding: 0,
          maxWidth: "100%",
          height: "100%",
        }}
        bodyStyle={{
          padding: 0,
          height: "100vh",
          backgroundColor: theme === "dark" ? "#111827" : "#fff",
        }}
      >
        <div className="mobile-menu p-5 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="text-3xl mr-2">🎬</div>
              <div className="text-primary font-logo font-bold text-xl dark:text-red-400">
                DHL Cinema
              </div>
            </div>
            <Button
              icon={<span className="text-xl dark:text-gray-300">×</span>}
              onClick={() => setMobileMenuVisible(false)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
              onClickCapture={handleRipple}
            />
          </div>

          <Menu
            mode="vertical"
            selectedKeys={[activeKey]}
            className="border-none dark:bg-gray-900 dark:text-gray-300"
            style={{
              fontWeight: 500,
              color: theme === "dark" ? "#ffffff" : "#333333",
            }}
            items={menuItems}
          />

          <div className="mt-4">
            <Button
              type="text"
              icon={
                theme === "light" ? (
                  <MoonOutlined className="text-lg dark:text-gray-300" />
                ) : (
                  <SunOutlined className="text-lg dark:text-gray-300" />
                )
              }
              onClick={(e) => {
                handleRipple(e);
                toggleTheme();
              }}
              className="flex items-center justify-start h-10 w-full rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
            >
              {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
            </Button>
          </div>

          {!isUserAuthenticated && (
            <div className="mt-8 flex flex-col gap-3">
              <Button
                onClick={() => {
                  showLoginModal();
                  setMobileMenuVisible(false);
                }}
                block
                className="h-10 ripple-btn dark:text-white"
                onClickCapture={handleRipple}
              >
                Đăng nhập
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  showRegisterModal();
                  setMobileMenuVisible(false);
                }}
                block
                className="h-10 ripple-btn"
                onClickCapture={handleRipple}
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AppHeader;