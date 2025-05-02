import React, { useState, useEffect } from "react";
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
  SearchOutlined
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../pages/LoginPage";
import RegisterForm from "../../pages/RegisterPage";

const { Header } = Layout;

const AppHeader = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);
  const [setMobileMenuVisible] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
  console.log("AppHeader render - currentUser:", currentUser);
  console.log("AppHeader render - isAuthenticated:", isAuthenticated);
  
  // Xử lý sự kiện scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout(); // Gọi hàm logout từ context
    // Redirect sau khi đăng xuất
    window.location.href = "/";
  };

  // Hiển thị modal đăng nhập
  const showLoginModal = () => {
    setLoginVisible(true);
    setRegisterVisible(false);
  };

  // Hiển thị modal đăng ký
  const showRegisterModal = () => {
    setRegisterVisible(true);
    setLoginVisible(false);
  };

  // Đóng các modal
  const closeModals = () => {
    setLoginVisible(false);
    setRegisterVisible(false);
  };

  // Xử lý chuyển đổi từ đăng nhập sang đăng ký và ngược lại
  const handleSwitchToRegister = () => {
    setLoginVisible(false);
    setRegisterVisible(true);
  };

  const handleSwitchToLogin = () => {
    setRegisterVisible(false);
    setLoginVisible(true);
  };

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    closeModals();
    window.location.reload(); // Tải lại trang để cập nhật trạng thái
  };

  // Logic xác định chính xác trang hiện tại
  const getActiveKey = () => {
    const path = location.pathname;
    
    if (path === '/') return 'home';
    if (path.startsWith('/movies')) return 'movies';
    if (path.startsWith('/promotions')) return 'promotions';
    if (path.startsWith('/admin')) return 'admin';
    
    return '';
  };

  // Các menu item
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
      key: "promotions", 
      icon: <GiftOutlined />, 
      label: <Link to="/promotions">Khuyến Mãi</Link> 
    },
    currentUser?.role === "admin" && { 
      key: "admin", 
      icon: <SettingOutlined />, 
      label: <Link to="/admin">Quản Trị</Link> 
    },
  ].filter(Boolean);

  // Menu cho user khi đã đăng nhập
  const userMenu = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/user/profile">Trang cá nhân</Link>
    },
    {
      key: "bookings",
      icon: <IdcardOutlined />,
      label: <Link to="/user/bookings">Lịch sử đặt vé</Link>
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link to="/user/settings">Cài đặt tài khoản</Link>
    },
    {
      key: "logout",
      label: <span onClick={handleLogout}>Đăng xuất</span>,
      icon: <LogoutOutlined />,
      danger: true
    }
  ];

  const activeKey = getActiveKey();

  // Dropdown menu cho user profile
  const userDropdownMenu = {
    items: userMenu,
    className: "user-dropdown-menu"
  };

  // Kiểm tra trạng thái đăng nhập từ localStorage nếu cần
  const checkStorageAuth = () => {
    const userFromStorage = localStorage.getItem('user');
    const tokenFromStorage = localStorage.getItem('token');
    return !!(userFromStorage && tokenFromStorage);
  };

  // Sử dụng isAuthenticated từ context hoặc kiểm tra localStorage
  const isUserAuthenticated = isAuthenticated || checkStorageAuth();
  const userToDisplay = currentUser || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  return (
    <>
      <Header 
        className={`header-fixed transition-all duration-300 ${
          scrolled ? "h-16 shadow-lg backdrop-blur-md" : "h-20"
        }`}
        style={{ 
          padding: 0, 
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="max-w-6xl mx-auto px-5 flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-3xl mr-2">🎬</div>
            <div className={`text-primary font-logo font-bold transition-all duration-300 ${
              scrolled ? "text-xl" : "text-2xl"
            }`}>
              DHL Cinema
            </div>
          </Link>
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Button 
              type="text"
              icon={<SearchOutlined className="text-lg text-gray-700" />} 
              onClick={() => setSearchActive(!searchActive)}
              className="mr-2 flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
            />
            <Button 
              type="text"
              icon={<MenuOutlined className="text-lg" />} 
              onClick={() => setMobileMenuVisible(true)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
            />
          </div>
          
          {/* Main Menu - Desktop */}
          <div className="hidden md:block flex-1 mx-8">
            <Menu 
              mode="horizontal" 
              selectedKeys={[activeKey]} 
              className="flex justify-center bg-transparent border-b-0"
              style={{ 
                fontWeight: 500,
                fontSize: '15px'
              }}
              items={menuItems}
            />
          </div>
          
          {/* User Menu/Login Button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search icon */}
            <Button 
              type="text"
              icon={<SearchOutlined className="text-lg text-gray-700" />} 
              onClick={() => setSearchActive(!searchActive)}
              className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100"
            />
            
            {isUserAuthenticated && userToDisplay ? (
              <div className="flex items-center">
                {/* Notification Bell */}
                <Badge count={0} dot>
                  <Button 
                    type="text"
                    icon={<BellOutlined className="text-lg text-gray-700" />} 
                    className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 mr-4"
                  />
                </Badge>
                
                {/* User Avatar Dropdown */}
                <Dropdown 
                  menu={userDropdownMenu} 
                  placement="bottomRight" 
                  trigger={['click']}
                  overlayClassName="user-dropdown-overlay"
                >
                  <div className="flex items-center cursor-pointer hover:bg-gray-50 rounded-full px-3 py-1.5 transition-all">
                    <Avatar 
                      size={32} 
                      icon={<UserOutlined />} 
                      className="bg-primary text-white"
                    />
                    <span className="ml-2 font-medium hidden lg:inline">
                      {userToDisplay.name || userToDisplay.username || userToDisplay.email}
                    </span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  onClick={showLoginModal} 
                  className="btn-outline rounded-full px-5 h-10"
                >
                  Đăng nhập
                </Button>
                <Button 
                  type="primary" 
                  onClick={showRegisterModal} 
                  className="btn-primary rounded-full px-5 h-10"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>
      </Header>

      {/* Các phần còn lại giữ nguyên */}
      {/* ... */}
      
      {/* Modal Đăng Nhập */}
      <Modal
        open={loginVisible}
        footer={null}
        onCancel={closeModals}
        width={450}
        className="auth-modal"
        destroyOnClose
        centered
        styles={{ body: { padding: '24px' } }}
      >
        <LoginForm 
          onRegisterClick={handleSwitchToRegister} 
          onLoginSuccess={handleLoginSuccess}
        />
      </Modal>

      {/* Modal Đăng Ký */}
      <Modal
        open={registerVisible}
        footer={null}
        onCancel={closeModals}
        width={450}
        className="auth-modal"
        destroyOnClose
        centered
        styles={{ body: { padding: '24px' } }}
      >
        <RegisterForm
          onLoginClick={handleSwitchToLogin}
          onRegisterSuccess={handleSwitchToLogin}
        />
      </Modal>
    </>
  );
};

export default AppHeader;