import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLogout, useGetIdentity, useGetResourceLabel } from 'react-admin';
import QRScanner from '../components/Common/QRScanner';

// Icons
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

// Breadcrumb Component
const Breadcrumb = () => {
  const location = useLocation();
  const path = location.pathname.split('/').filter(Boolean);
  const getResourceLabel = useGetResourceLabel();

  if (path.length === 0) return <h1 className="text-lg font-semibold">Dashboard</h1>;

  return (
    <div className="flex items-center text-sm">
      <Link to="/" className="text-primary dark:text-primary-light hover:underline">Dashboard</Link>
      {path.map((segment, index) => {
        if (["create", "edit", "show"].includes(segment)) return null;
        if (/^\d+$/.test(segment)) return null;
        const url = `/${path.slice(0, index + 1).join('/')}`;
        const isLast = index === path.length - 1 ||
                       (index === path.length - 2 && ["create", "edit", "show"].includes(path[path.length - 1]));
        const label = getResourceLabel(segment, 1) || segment;
        const action = path[index + 1];
        let actionLabel = '';
        if (action === 'create') actionLabel = ' / Thêm mới';
        else if (action === 'edit') actionLabel = ' / Chỉnh sửa';
        else if (action === 'show') actionLabel = ' / Chi tiết';
        return (
          <div key={segment} className="flex items-center">
            <span className="mx-2 text-gray-500">/</span>
            {!isLast ? (
              <Link to={url} className="text-primary dark:text-primary-light hover:underline">
                {label}
              </Link>
            ) : (
              <span className="font-medium">{label}{actionLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Header = ({ toggleSidebar, sidebarOpen, darkMode, toggleDarkMode }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { data: identity } = useGetIdentity();
  const logout = useLogout();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 ${
          darkMode
            ? "bg-secondary text-white border-b border-border-dark"
            : "bg-white text-text-primary border-b border-border-light"
        } shadow-navbar`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left: Toggle and Logo */}
          <div className="flex items-center space-x-4">
            <button
              className={`text-gray-500 hover:text-primary focus:outline-none ${
                darkMode ? "text-gray-400 hover:text-white" : ""
              }`}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            <Link to="/" className="flex items-center md:hidden">
              <span
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-primary"
                }`}
              >
                Galaxy
              </span>
            </Link>
            <div className="hidden md:block">
              <Breadcrumb />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              className={`p-2 rounded-full ${
                darkMode
                  ? "bg-secondary-light text-white hover:bg-secondary-dark"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            <div className="relative" ref={notificationRef}>
              <button
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-secondary-light text-white hover:bg-secondary-dark"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Notifications"
              >
                <div className="relative">
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                </div>
              </button>
              {notificationOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-md shadow-dropdown overflow-hidden ${
                    darkMode
                      ? "bg-background-paper-dark border border-border-dark"
                      : "bg-white border border-border-light"
                  } animate-fadeIn`}
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium">Thông báo</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`p-4 border-b ${
                          darkMode
                            ? "border-gray-700 hover:bg-secondary-dark"
                            : "border-gray-100 hover:bg-gray-50"
                        } cursor-pointer`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-primary rounded-full p-2">
                            <BellIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <p
                              className={`text-sm font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Lịch chiếu mới được thêm
                            </p>
                            <p
                              className={`text-sm ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              15 phút trước
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center">
                    <Link
                      to="/notifications"
                      className={`text-sm font-medium ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      } hover:underline`}
                    >
                      Xem tất cả thông báo
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  {identity?.fullName?.charAt(0) || 'A'}
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {identity?.name || 'Admin'}
                </span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-md shadow-dropdown overflow-hidden ${
                    darkMode
                      ? "bg-background-paper-dark border border-border-dark"
                      : "bg-white border border-border-light"
                  } animate-fadeIn`}
                >
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className={`flex items-center px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-secondary-dark"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <UserIcon className="mr-3 h-5 w-5" />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/settings"
                      className={`flex items-center px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-secondary-dark"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5" />
                      Cài đặt
                    </Link>
                    <button
                      onClick={() => setQrModalOpen(true)}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-secondary-dark"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <QrCodeIcon className="mr-3 h-5 w-5" />
                      Quét mã QR
                    </button>
                    <button
                      onClick={logout}
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        darkMode
                          ? "text-gray-300 hover:bg-secondary-dark"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* QR Scanner Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`rounded-lg p-6 max-w-lg w-full ${
              darkMode
                ? "bg-background-paper-dark text-white"
                : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Quét mã QR</h2>
              <button
                onClick={() => setQrModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <QRScanner />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;