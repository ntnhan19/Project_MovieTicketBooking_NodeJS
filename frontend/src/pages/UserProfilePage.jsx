import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Avatar, message, Upload, Table } from 'antd';
import { UserOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { ticketApi } from '../api/ticketApi'; // Import API lấy tickets
import axios from 'axios';
import '../styles/UserProfilePage.css'; // Import CSS cho trang

const UserProfilePage = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserTickets(); // Gọi API lấy thông tin vé khi component mount
  }, []);

  // Hàm lấy vé của người dùng từ API
  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const ticketsData = await ticketApi.getTicketsByUser(); // API lấy vé
      setTickets(ticketsData);
    } catch {
      message.error('Không thể lấy lịch sử vé. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    try {
      const response = await axios.post('/api/change-password', {
        userId: user.id, // user ID từ backend hoặc state
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        message.success('Đổi mật khẩu thành công!');
      } else {
        message.error(response.data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch {
      message.error('Lỗi khi đổi mật khẩu. Vui lòng thử lại!');
    }
  };

  // Hàm xử lý upload avatar
  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post('/api/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Cập nhật avatar mới cho người dùng
        message.success('Cập nhật avatar thành công!');
      } else {
        message.error('Cập nhật avatar thất bại!');
      }
    } catch {
      message.error('Lỗi khi tải avatar lên. Vui lòng thử lại!');
    }
  };

  return (
    <div className="user-profile">
      <h2>Thông tin cá nhân</h2>

      {/* Avatar */}
      <div className="avatar-section">
        <Avatar
          size={100}
          src={user.avatar}
          icon={<UserOutlined />}
          className="avatar-preview"
        />
        <Upload
          name="avatar"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
        >
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
      </div>

      {/* Thông tin người dùng */}
      <Form layout="vertical" className="user-info-form">
        <Form.Item label="Tên người dùng" name="name">
          <Input value={user.name} disabled />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input value={user.email} disabled />
        </Form.Item>

        {/* Đổi mật khẩu */}
        <Form.Item label="Mật khẩu hiện tại" name="currentPassword">
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item label="Mật khẩu mới" name="newPassword">
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword">
          <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" block htmlType="submit" onClick={handleChangePassword}>
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>

      {/* Lịch sử vé */}
      <h3>Lịch sử vé</h3>
      <Table
        dataSource={tickets}
        loading={loading}
        rowKey="id"
        columns={[
          { title: 'Suất chiếu', dataIndex: 'showtime', key: 'showtime' },
          { title: 'Ghế', dataIndex: 'seats', key: 'seats' },
          { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
        ]}
      />
    </div>
  );
};

export default UserProfilePage;
