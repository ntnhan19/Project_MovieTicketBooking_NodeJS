import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Spin, ConfigProvider } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  StarOutlined,
  SettingOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ProfileHeader from '../components/Profile/ProfileHeader';
import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import PasswordChangeCard from '../components/Profile/PasswordChangeCard';
import TicketHistoryCard from '../components/Profile/TicketHistoryCard';
import LoyaltyCard from '../components/Profile/LoyaltyCard';
import { motion } from 'framer-motion';

const UserProfilePage = () => {
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('1');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const createRipple = (event) => {
      const button = event.currentTarget;
      button.style.setProperty('--ripple-x', `${event.clientX - button.getBoundingClientRect().left}px`);
      button.style.setProperty('--ripple-y', `${event.clientY - button.getBoundingClientRect().top}px`);
    };
    const buttonElement = document.getElementById(`tab-${key}`);
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const event = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        currentTarget: buttonElement,
      };
      createRipple(event);
    }
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty('--ripple-x', `${e.clientX - btn.getBoundingClientRect().left}px`);
    btn.style.setProperty('--ripple-y', `${e.clientY - btn.getBoundingClientRect().top}px`);
  };

  if (!user) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          theme === 'dark' ? 'bg-dark-bg' : 'bg-gradient-to-b from-gray-50 to-gray-100'
        }`}
      >
        <Spin size="large" className="text-red-500" />
        <span
          className={`mt-4 font-medium text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Đang tải thông tin người dùng...
        </span>
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === '1'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
          }`}
        >
          <UserOutlined className="text-lg" />
          <span className="hidden sm:inline font-medium">Thông tin cá nhân</span>
        </motion.div>
      ),
      children: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 p-4 md:p-6"
        >
          <PersonalInfoCard user={user} />
          <PasswordChangeCard />
        </motion.div>
      ),
    },
    {
      key: '2',
      label: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === '2'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
          }`}
        >
          <HistoryOutlined className="text-lg" />
          <span className="hidden sm:inline font-medium">Lịch sử đặt vé</span>
        </motion.div>
      ),
      children: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6"
        >
          <TicketHistoryCard />
        </motion.div>
      ),
    },
    {
      key: '3',
      label: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === '3'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
          }`}
        >
          <StarOutlined className="text-lg" />
          <span className="hidden sm:inline font-medium">Điểm thưởng</span>
        </motion.div>
      ),
      children: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 md:p-6"
        >
          <LoyaltyCard user={user} />
        </motion.div>
      ),
    },
    {
      key: '4',
      label: (
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === '4'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
              : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
          }`}
        >
          <SettingOutlined className="text-lg" />
          <span className="hidden sm:inline font-medium">Cài đặt</span>
        </motion.div>
      ),
      children: (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 text-center text-gray-600 dark:text-gray-300"
        >
          <p className="text-lg">Tính năng đang phát triển</p>
        </motion.div>
      ),
    },
  ];

  const antdTheme = {
    token: {
      colorPrimary: '#e71a0f',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
      colorBgContainer: theme === 'dark' ? '#1f2a44' : '#ffffff',
      colorText: theme === 'dark' ? '#d1d5db' : '#333333',
      colorTextSecondary: theme === 'dark' ? '#d1d5db' : '#666666',
      colorBorder: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    components: {
      Tabs: {
        itemSelectedColor: '#e71a0f',
        itemHoverColor: '#e71a0f',
        inkBarColor: '#e71a0f',
        colorBgContainer: theme === 'dark' ? '#1f2a44' : '#ffffff',
        itemActiveColor: '#e71a0f',
        itemColor: theme === 'dark' ? '#d1d5db' : '#666666',
        horizontalItemPadding: '12px 24px',
      },
    },
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className={`min-h-screen pb-16 ${
          theme === 'dark'
            ? 'bg-dark-bg'
            : 'bg-gradient-to-b from-gray-50 to-gray-100'
        }`}
      >
        <div className="container mx-auto px-6 py-10 max-w-7xl">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProfileHeader user={user} />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <div className="content-card custom-movie-tabs rounded-xl bg-white dark:bg-gray-800 shadow-xl p-6">
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                animated={{ tabPane: true }}
                size="middle"
                tabBarStyle={{
                  marginBottom: '24px',
                  padding: '0 16px',
                  borderBottom: 'none',
                }}
                style={{ position: 'relative', zIndex: 10 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              handleRipple(e);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="fixed bottom-8 right-8 bg-red-500 dark:bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all ripple-btn"
          >
            <ArrowUpOutlined className="text-xl" />
          </motion.button>
        )}
      </div>
    </ConfigProvider>
  );
};

export default UserProfilePage;