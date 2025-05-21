import React, { useState, useContext } from 'react';
import { Tabs, Spin } from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  CalendarOutlined,
  SettingOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import ProfileHeader from '../components/Profile/ProfileHeader';
import PersonalInfoCard from '../components/Profile/PersonalInfoCard';
import PasswordChangeCard from '../components/Profile/PasswordChangeCard';
import TicketHistoryCard from '../components/Profile/TicketHistoryCard';
import LoyaltyCard from '../components/Profile/LoyaltyCard';

const UserProfilePage = () => {
  const { user } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('1');

  if (!user) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          theme === 'dark' ? 'bg-dark-bg' : 'bg-light-bg'
        }`}
      >
        <Spin size="large" />
        <span
          className={`mt-4 font-medium ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'
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
        <span className="flex items-center gap-2 px-1">
          <UserOutlined />
          <span className="hidden sm:inline">Thông tin cá nhân</span>
        </span>
      ),
      children: (
        <div className="space-y-6 p-4">
          <PersonalInfoCard user={user} />
          <PasswordChangeCard />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2 px-1">
          <HistoryOutlined />
          <span className="hidden sm:inline">Lịch sử đặt vé</span>
        </span>
      ),
      children: <TicketHistoryCard />,
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2 px-1">
          <StarOutlined />
          <span className="hidden sm:inline">Điểm thưởng</span>
        </span>
      ),
      children: <LoyaltyCard user={user} />,
    },
    {
      key: '4',
      label: (
        <span className="flex items-center gap-2 px-1">
          <SettingOutlined />
          <span className="hidden sm:inline">Cài đặt</span>
        </span>
      ),
      children: (
        <div
          className={`p-6 text-center ${
            theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'
          }`}
        >
          <p>Tính năng đang phát triển</p>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`min-h-screen animate-fadeIn ${
        theme === 'dark' ? 'bg-dark-bg' : 'bg-light-bg'
      } pb-12 pt-8 px-4`}
    >
      <div className="max-w-6xl mx-auto">
        <ProfileHeader user={user} className="compact-header" />
        <div
          className={`rounded-xl shadow-lg overflow-hidden mt-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
          } border`}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="profile-tabs"
            tabBarStyle={{
              padding: '0 16px',
              borderBottom: theme === 'dark' ? '1px solid #4b5563' : '1px solid #d1d5db', // Màu border đậm hơn trong light mode
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            }}
            items={tabItems}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;