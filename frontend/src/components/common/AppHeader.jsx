import React, { useState, useEffect, useContext, Suspense } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Modal } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  VideoCameraOutlined,
  SettingOutlined,
  UserOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuOutlined,
  IdcardOutlined,
  CoffeeOutlined,
  SunOutlined,
  MoonOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import Navigation from "./Navigation";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path.startsWith("/movies")) return "movies";
    if (path.startsWith("/promotions")) return "promotions";
    if (path.startsWith("/concessions")) return "concessions";
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/booking")) return "booking";
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
    navigate("/", { replace: true });
    setTimeout(() => window.location.reload(), 100);
  };

  const showLoginModal = () => {
    openAuthModal("1");
  };

  const showRegisterModal = () => {
    openAuthModal("2");
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      // Mở modal đăng nhập với đường dẫn chuyển hướng
      openAuthModal("1", "/booking");
      return;
    }
    navigate("/booking");
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty("--ripple-x", `${e.clientX - btn.getBoundingClientRect().left}px`);
    btn.style.setProperty("--ripple-y", `${e.clientY - btn.getBoundingClientRect().top}px`);
  };

  const menuItems = [
    { key: "home", icon: <HomeOutlined />, label: <Link to="/">Trang Chủ</Link> },
    { key: "movies", icon: <VideoCameraOutlined />, label: <Link to="/movies">Phim</Link> },
    { key: "promotions", icon: <GiftOutlined />, label: <Link to="/promotions">Khuyến Mãi</Link> },
    { key: "concessions", icon: <CoffeeOutlined />, label: <Link to="/concessions">Bắp Nước</Link> },
    currentUser?.role === "admin" && { key: "admin", icon: <SettingOutlined />, label: <Link to="/admin">Quản Trị</Link> },
  ].filter(Boolean);

  const userMenu = [
    { key: "profile", icon: <UserOutlined />, label: <Link to="/user/profile">Trang cá nhân</Link> },
    { key: "bookings", icon: <IdcardOutlined />, label: <Link to="/user/profile">Lịch sử đặt vé</Link> },
    { key: "logout", label: <span onClick={handleLogout}>Đăng xuất</span>, icon: <LogoutOutlined />, danger: true },
  ];

  const userDropdownMenu = { items: userMenu, className: "user-dropdown-menu" };

  const userToDisplay = currentUser;

  return (
    <>
      <Header
        role="banner"
        aria-label="Main navigation and actions"
        className={`header-fixed transition-all duration-300 ${scrolled ? "h-16 shadow-lg backdrop-blur-md" : "h-20"}`}
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
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          <Link to="/" className="flex items-center shrink-0 animate-float-slow">
            <div className="text-3xl mr-2">🎬</div>
            <div
              className={`text-primary font-logo font-bold transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              } dark:text-red-400 truncate max-w-[200px]`}
            >
              DHL Cinema
            </div>
          </Link>

          <div className="flex items-center md:hidden">
            <Button
              type="text"
              icon={<ShoppingCartOutlined className="text-lg text-gray-700 dark:text-gray-300" />}
              onClick={handleBookingClick}
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

          <div className="hidden md:flex flex-1 justify-center mx-4">
            <Suspense fallback={<div>Loading menu...</div>}>
              <Navigation items={menuItems} activeKey={activeKey} theme={theme} />
            </Suspense>
          </div>

          <div className="hidden md:flex items-center space-x-2">
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
              className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
              onMouseEnter={(e) => (e.currentTarget.title = theme === "light" ? "Chế độ tối" : "Chế độ sáng")}
            />
            <Button
              type="primary"
              onClick={handleBookingClick}
              icon={<ShoppingCartOutlined />}
              className="btn-primary bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-4 h-9 text-sm shadow-button hover:shadow-button-hover"
              onClickCapture={handleRipple}
            >
              Mua Vé
            </Button>
            {isAuthenticated && userToDisplay ? (
              <div className="flex items-center">
                <Dropdown
                  menu={userDropdownMenu}
                  placement="bottomRight"
                  trigger={["click"]}
                  overlayClassName="user-dropdown-overlay"
                >
                  <div className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full px-2 py-1 transition-all">
                    <Avatar
                      size={30}
                      icon={<UserOutlined />}
                      className="bg-primary dark:bg-red-500 text-white"
                    />
                    <span className="ml-2 font-medium hidden lg:inline dark:text-white truncate max-w-[120px]">
                      {userToDisplay.name || userToDisplay.username || userToDisplay.email}
                    </span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={showLoginModal}
                  className="btn-outline ripple-btn rounded-full px-4 h-9 text-sm dark:text-white"
                  onClickCapture={handleRipple}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={showRegisterModal}
                  className="btn-primary ripple-btn rounded-full px-4 h-9 text-sm"
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
        style={{ top: 0, margin: 0, padding: 0, maxWidth: "100%", height: "100%" }}
        styles={{ body: { padding: 0, height: "100vh", backgroundColor: theme === "dark" ? "#111827" : "#fff" } }}
        className="animate-modalSlideIn"
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
              icon={<span className="text-xl text-red-500">×</span>}
              onClick={() => setMobileMenuVisible(false)}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 ripple-btn animate-modalSlideIn"
              onClickCapture={handleRipple}
            />
          </div>

          <Menu
            mode="vertical"
            selectedKeys={[activeKey]}
            className="border-none dark:bg-gray-900 dark:text-gray-300"
            style={{ fontWeight: 500, color: theme === "dark" ? "#ffffff" : "#333333" }}
            items={menuItems}
          />

          <div className="mt-4">
            <Button
              type="text"
              icon={
                theme === "light" ? <MoonOutlined className="text-lg dark:text-gray-300" /> : <SunOutlined className="text-lg dark:text-gray-300" />
              }
              onClick={(e) => {
                handleRipple(e);
                toggleTheme();
              }}
              className="flex items-center justify-start h-10 w-full rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 ripple-btn"
            >
              {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
            </Button>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => {
                handleBookingClick();
                setMobileMenuVisible(false);
              }}
              block
              className="h-10 ripple-btn mt-4 bg-gradient-to-r from-red-500 to-red-600"
              onClickCapture={handleRipple}
            >
              Mua Vé
            </Button>
          </div>

          {!isAuthenticated && (
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