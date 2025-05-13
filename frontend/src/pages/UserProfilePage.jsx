import React, { useState } from 'react';
import { Tabs, Spin } from 'antd';
import { 
  UserOutlined, 
  HistoryOutlined, 
  CalendarOutlined,
  SettingOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInfoCard from '../components/profile/PersonalInfoCard';
import PasswordChangeCard from '../components/profile/PasswordChangeCard';
import TicketHistoryCard from '../components/profile/TicketHistoryCard';
import LoyaltyCard from '../components/profile/LoyaltyCard';

const UserProfilePage = () => {
  // Sử dụng custom hook useAuth để lấy thông tin người dùng
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  
  // Nếu không có user, hiển thị thông báo loading
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải thông tin người dùng..." />
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
        <div className="space-y-6">
          <PersonalInfoCard user={user} />
          <PasswordChangeCard />
        </div>
      )
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2 px-1">
          <HistoryOutlined />
          <span className="hidden sm:inline">Lịch sử đặt vé</span>
        </span>
      ),
      children: <TicketHistoryCard />
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2 px-1">
          <StarOutlined />
          <span className="hidden sm:inline">Điểm thưởng</span>
        </span>
      ),
      children: <LoyaltyCard user={user} />
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
        <div className="p-6">
          {/* Phần cài đặt thêm của người dùng nếu cần */}
          <div className="text-center text-gray-500">
            <p>Tính năng đang phát triển</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-light-bg min-h-screen pb-12 animate-fadeIn">
      {/* Header phần thông tin profile */}
      <ProfileHeader user={user} />
      
      {/* Content tabs */}
      <div className="max-w-6xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="profile-tabs"
            tabBarStyle={{ padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}
            items={tabItems}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;