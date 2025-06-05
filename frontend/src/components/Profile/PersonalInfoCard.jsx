import React, { useState } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const PersonalInfoCard = ({ user }) => {
  const { updateProfile } = useAuth();
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  const handleSaveUserInfo = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const result = await updateProfile(user.id, values);
      if (result.success) {
        notification.success({
          message: 'Thành công',
          description: 'Cập nhật thông tin thành công!',
        });
        setEditMode(false);
      } else {
        notification.error({
          message: 'Lỗi',
          description: 'Cập nhật thông tin thất bại!',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Lỗi khi cập nhật thông tin. Vui lòng thử lại!',
      });
      console.error('Error updating user info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <div className="flex items-center text-lg font-medium text-gray-800 dark:text-white">
            <UserOutlined className="mr-2 text-red-500 dark:text-red-400" /> 
            Thông tin cá nhân
          </div>
        }
        className="rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600"
        extra={
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type={editMode ? 'primary' : 'default'}
              icon={editMode ? <SaveOutlined /> : <EditOutlined />}
              onClick={editMode ? handleSaveUserInfo : () => setEditMode(true)}
              loading={loading}
              className={`ripple-btn transition-all duration-300 font-medium ${
                editMode
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white'
              }`}
            >
              {editMode ? 'Lưu thông tin' : 'Chỉnh sửa'}
            </Button>
          </motion.div>
        }
      >
        <Form 
          form={form}
          layout="vertical" 
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          }}
          className="transition-all duration-300 animate-fadeIn"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Họ và tên</span>} 
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input 
                disabled={!editMode} 
                className={`form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600 ${
                  !editMode ? 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : ''
                }`}
                prefix={<UserOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
                placeholder="Nhập họ và tên"
              />
            </Form.Item>
            
            <Form.Item 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Số điện thoại</span>} 
              name="phone"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
              ]}
            >
              <Input 
                disabled={!editMode} 
                className={`form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600 ${
                  !editMode ? 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : ''
                }`}
                prefix={<PhoneOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
            
            <Form.Item 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Email</span>} 
              name="email"
            >
              <Input 
                disabled={true} 
                className="form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                prefix={<MailOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
              />
            </Form.Item>
            
            <Form.Item 
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Ngày tham gia</span>}
            >
              <Input 
                value={formatDate(user?.createdAt)} 
                disabled={true} 
                className="form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                prefix={<CalendarOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
              />
            </Form.Item>
          </div>
        </Form>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-lg border border-gray-100 dark:border-gray-600"
        >
          <div className="flex items-start space-x-4">
            <div className="text-red-500 dark:text-red-400 text-2xl">💡</div>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Lời khuyên</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cập nhật thông tin cá nhân của bạn giúp chúng tôi phục vụ bạn tốt hơn và thông báo cho bạn về những ưu đãi đặc biệt phù hợp.
              </p>
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default PersonalInfoCard;