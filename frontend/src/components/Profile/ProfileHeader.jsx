import React, { useState } from 'react';
import { Avatar, Upload, Button, message, Spin, Tag } from 'antd';
import { 
  UserOutlined, 
  UploadOutlined, 
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ProfileHeader = ({ user }) => {
  const { uploadAvatar } = useAuth();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full bg-cover bg-center pt-8 pb-12 rounded-2xl overflow-hidden shadow-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(231, 26, 15, 0.95) 0%, rgba(255, 59, 48, 0.85) 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-2xl"></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Spin spinning={avatarLoading}>
              <Avatar
                size={140}
                src={tempAvatar || user.avatar}
                icon={<UserOutlined />}
                className="border-4 border-white shadow-2xl rounded-full"
              />
            </Spin>
            <div className="mt-4 flex justify-center">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={handleAvatarUpload}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    icon={<UploadOutlined />}
                    className="bg-white hover:bg-gray-100 text-red-500 dark:text-red-400 rounded-full shadow-md px-4 py-2 font-medium border-none transition-all"
                  >
                    Đổi ảnh
                  </Button>
                </motion.div>
              </Upload>
            </div>
          </motion.div>
          
          {/* Thông tin người dùng */}
          <div className="text-center md:text-left flex-1 text-white">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg"
            >
              {user.name || 'Người dùng'}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 mb-4 text-sm md:text-base"
            >
              {user.email && (
                <div className="flex items-center gap-2 text-white/90">
                  <MailOutlined className="text-lg" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.phone && (
                <div className="flex items-center gap-2 text-white/90">
                  <PhoneOutlined className="text-lg" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-white/90">
                <CalendarOutlined className="text-lg" />
                <span>Thành viên từ: {formatDate(user.createdAt) || 'Không có thông tin'}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Trang trí góc dưới */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-white dark:bg-gray-800 rounded-b-2xl" 
           style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 100%)' }}>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;