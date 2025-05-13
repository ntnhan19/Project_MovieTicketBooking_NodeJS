import React, { useState } from 'react';
import { Avatar, Upload, Button, message, Spin, Tag } from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const ProfileHeader = ({ user }) => {
  const { uploadAvatar } = useAuth();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');

  // Format date từ ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Hàm xử lý upload avatar
  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', user.id);

    try {
      const response = await uploadAvatar(formData);
      
      if (response.success) {
        message.success('Cập nhật avatar thành công!');
        
        if (response.avatar) {
          const newAvatarUrl = response.avatar.includes('?') 
            ? `${response.avatar}&t=${new Date().getTime()}`
            : `${response.avatar}?t=${new Date().getTime()}`;
            
          setTempAvatar(newAvatarUrl);
        }
      } else {
        message.error('Cập nhật avatar thất bại!');
      }
    } catch (error) {
      message.error('Lỗi khi tải avatar lên. Vui lòng thử lại!');
      console.error('Error uploading avatar:', error);
    } finally {
      setAvatarLoading(false);
    }
    
    return false;
  };

  return (
    <div 
      className="relative w-full bg-cover bg-center pt-12 pb-24" 
      style={{ 
        background: 'linear-gradient(135deg, rgba(231, 26, 15, 0.95) 0%, rgba(255, 59, 48, 0.85) 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Spin spinning={avatarLoading}>
              <Avatar
                size={120}
                src={tempAvatar || user.avatar}
                icon={<UserOutlined />}
                className="border-4 border-white shadow-xl"
              />
            </Spin>
            <div className="mt-3 flex justify-center">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  className="bg-white hover:bg-white/90 text-primary rounded-full shadow-md"
                  size="small"
                >
                  Đổi ảnh
                </Button>
              </Upload>
            </div>
          </div>
          
          {/* Thông tin người dùng */}
          <div className="text-center md:text-left flex-1 text-white">
            <h1 className="text-3xl font-bold mb-2">{user.name || 'Người dùng'}</h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 mb-4">
              {user.email && (
                <div className="flex items-center gap-1 text-white/90">
                  <MailOutlined />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.phone && (
                <div className="flex items-center gap-1 text-white/90">
                  <PhoneOutlined />
                  <span>{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1 text-white/90">
                <CalendarOutlined />
                <span>Thành viên từ: {formatDate(user.createdAt) || 'Không có thông tin'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
              {user.role && (
                <Tag color="gold" className="rounded-full px-3 py-1">{user.role}</Tag>
              )}
              
              {/* Có thể thêm các tag khác ở đây */}
              <Tag color="green" className="rounded-full px-3 py-1">
                Thành viên thường
              </Tag>
              
              <Tag color="blue" className="rounded-full px-3 py-1">
                0 Điểm
              </Tag>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trang trí */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" 
           style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" 
           style={{ clipPath: 'polygon(0 100%, 100% 100%, 0 0, 0 100%)' }}>
      </div>
    </div>
  );
};

export default ProfileHeader;