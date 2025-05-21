import React, { useState } from 'react';
import { Card, Form, Input, Button, notification } from 'antd';
import { 
  EditOutlined, 
  SaveOutlined, 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

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
    <Card
      title={
        <div className="flex items-center text-lg font-medium text-text-primary dark:text-dark-text-primary">
          <UserOutlined className="mr-2 text-red-500 dark:text-red-400" /> 
          Thông tin cá nhân
        </div>
      }
      className="content-card"
      extra={
        <Button 
          type={editMode ? "primary" : "default"}
          icon={editMode ? <SaveOutlined /> : <EditOutlined />}
          onClick={editMode ? handleSaveUserInfo : () => setEditMode(true)}
          loading={loading}
          className={`ripple-btn transition-all duration-300 ${editMode ? "bg-button-gradient hover:bg-button-gradient-hover" : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"}`}
        >
          {editMode ? 'Lưu thông tin' : 'Chỉnh sửa'}
        </Button>
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
            label={<span className="text-text-primary dark:text-dark-text-primary">Họ và tên</span>} 
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              disabled={!editMode} 
              className={`form-input ${!editMode ? 'bg-light-bg-secondary dark:bg-gray-700 text-text-primary dark:text-dark-text-primary' : ''}`}
              prefix={<UserOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>
          
          <Form.Item 
            label={<span className="text-text-primary dark:text-dark-text-primary">Số điện thoại</span>} 
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input 
              disabled={!editMode} 
              className={`form-input ${!editMode ? 'bg-light-bg-secondary dark:bg-gray-700 text-text-primary dark:text-dark-text-primary' : ''}`}
              prefix={<PhoneOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
          
          <Form.Item 
            label={<span className="text-text-primary dark:text-dark-text-primary">Email</span>} 
            name="email"
          >
            <Input 
              disabled={true} 
              className="form-input bg-light-bg-secondary dark:bg-gray-700 text-text-primary dark:text-dark-text-primary"
              prefix={<MailOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
            />
          </Form.Item>
          
          <Form.Item 
            label={<span className="text-text-primary dark:text-dark-text-primary">Ngày tham gia</span>}
          >
            <Input 
              value={formatDate(user?.createdAt)} 
              disabled={true} 
              className="form-input bg-light-bg-secondary dark:bg-gray-700 text-text-primary dark:text-dark-text-primary"
              prefix={<CalendarOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
            />
          </Form.Item>
        </div>
      </Form>
      
      <div className="mt-4 p-4 bg-light-bg-secondary dark:bg-gray-700 rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="text-red-500 dark:text-red-400 text-2xl">💡</div>
          <div>
            <h4 className="font-medium text-text-primary dark:text-dark-text-primary">Lời khuyên</h4>
            <p className="text-sm text-text-secondary dark:text-gray-300">
              Cập nhật thông tin cá nhân của bạn giúp chúng tôi phục vụ bạn tốt hơn và thông báo cho bạn về những ưu đãi đặc biệt phù hợp.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;