import React, { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
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

  // Format date từ ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Hàm lưu thông tin người dùng
  const handleSaveUserInfo = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const result = await updateProfile(user.id, values);
      
      if (result.success) {
        message.success('Cập nhật thông tin thành công!');
        setEditMode(false);
      } else {
        message.error('Cập nhật thông tin thất bại!');
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin. Vui lòng thử lại!');
      console.error('Error updating user info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center text-lg font-medium">
          <UserOutlined className="mr-2 text-primary" /> 
          Thông tin cá nhân
        </div>
      }
      className="shadow-md rounded-xl overflow-hidden"
      extra={
        <Button 
          type={editMode ? "primary" : "default"}
          icon={editMode ? <SaveOutlined /> : <EditOutlined />}
          onClick={editMode ? handleSaveUserInfo : () => setEditMode(true)}
          loading={loading}
          className={editMode ? "bg-button-gradient hover:bg-button-gradient-hover" : ""}
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
        className="transition-all duration-300"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item 
            label="Họ và tên" 
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input 
              disabled={!editMode} 
              className="rounded-lg py-2" 
              prefix={<UserOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập họ và tên"
            />
          </Form.Item>
          
          <Form.Item 
            label="Số điện thoại" 
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input 
              disabled={!editMode} 
              className="rounded-lg py-2" 
              prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
          
          <Form.Item label="Email" name="email">
            <Input 
              disabled={true} 
              className="rounded-lg py-2 bg-light-bg-secondary" 
              prefix={<MailOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>
          
          <Form.Item label="Ngày tham gia">
            <Input 
              value={formatDate(user?.createdAt)} 
              disabled={true} 
              className="rounded-lg py-2 bg-light-bg-secondary" 
              prefix={<CalendarOutlined className="text-gray-400 mr-2" />}
            />
          </Form.Item>
        </div>
      </Form>
      
      <div className="mt-4 p-4 bg-light-bg-secondary rounded-lg">
        <div className="flex items-start space-x-4">
          <div className="text-primary text-2xl">💡</div>
          <div>
            <h4 className="font-medium">Lời khuyên</h4>
            <p className="text-sm text-text-secondary">
              Cập nhật thông tin cá nhân của bạn giúp chúng tôi phục vụ bạn tốt hơn và thông báo cho bạn về những ưu đãi đặc biệt phù hợp.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;