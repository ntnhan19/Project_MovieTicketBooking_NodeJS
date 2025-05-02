import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Avatar, message, Upload, Table, Tabs, Card, Spin, Tag } from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  UploadOutlined, 
  CalendarOutlined,
  HistoryOutlined,
  EditOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ticketApi } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  // Sử dụng custom hook useAuth để lấy thông tin người dùng
  const { user, updateProfile, changePassword, uploadAvatar } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  // State để lưu trữ URL avatar tạm thời (để force re-render)
  const [tempAvatar, setTempAvatar] = useState('');
  
  useEffect(() => {
    // Đặt giá trị ban đầu cho form từ user context
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        // Các trường khác nếu có
      });
      
      // Nếu user có avatar, cập nhật tempAvatar để đảm bảo hiển thị đúng
      if (user.avatar) {
        setTempAvatar('');
      }
    }
    
    fetchUserTickets();
  }, [user, form]);

  // Hàm lấy vé của người dùng từ API
  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const ticketsData = await ticketApi.getMyTickets();
      setTickets(ticketsData);
    } catch (error) {
      message.error('Không thể lấy lịch sử vé. Vui lòng thử lại!');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = values;

      if (newPassword !== confirmPassword) {
        message.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        return;
      }

      const result = await changePassword({
        userId: user?.id,
        currentPassword,
        newPassword,
      });

      if (result.success) {
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      }
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu. Vui lòng thử lại!');
      console.error('Error changing password:', error);
    }
  };

  // Hàm lưu thông tin người dùng
  const handleSaveUserInfo = async () => {
    try {
      const values = await form.validateFields();
      
      const result = await updateProfile(user.id, values);
      
      if (result.success) {
        setEditMode(false);
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin. Vui lòng thử lại!');
      console.error('Error updating user info:', error);
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
        // Hiển thị thông báo thành công
        message.success('Cập nhật avatar thành công!');
        
        // Tạo một URL mới bằng cách thêm timestamp để tránh cache
        if (response.avatar) {
          // Cập nhật lại avatar hiển thị ngay lập tức
          // Nếu URL có chứa query string, thêm timestamp
          const newAvatarUrl = response.avatar.includes('?') 
            ? `${response.avatar}&t=${new Date().getTime()}`
            : `${response.avatar}?t=${new Date().getTime()}`;
            
          // Force cập nhật giao diện bằng cách set lại avatar vào một state tạm
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
    
    return false; // Ngăn Upload component tự động upload
  };

  // Format date từ ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Hàm chuyển đổi trạng thái của vé sang tag có màu
  const renderStatus = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'active': { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
      'pending': { color: 'gold', icon: <ClockCircleOutlined />, text: 'Đang xử lý' },
      'cancelled': { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã hủy' },
      'used': { color: 'blue', icon: <HistoryOutlined />, text: 'Đã sử dụng' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'default', icon: null, text: status };
    
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  // Cấu hình cho bảng vé
  const columns = [
    { 
      title: 'Phim', 
      dataIndex: 'movieTitle', 
      key: 'movieTitle',
      render: (text, record) => (
        <div className="movie-info">
          <div className="font-bold">{text || 'Không có tên'}</div>
          <div className="text-xs text-text-secondary">
            {record.movieTime ? formatDate(record.movieTime) : 'Không có ngày'}
          </div>
        </div>
      )
    },
    { 
      title: 'Suất chiếu', 
      dataIndex: 'showtime', 
      key: 'showtime',
      render: (text) => text || 'Không có thông tin'
    },
    { 
      title: 'Ghế', 
      dataIndex: 'seats', 
      key: 'seats',
      render: (seats) => {
        if (!seats || seats.length === 0) return 'Không có thông tin';
        return Array.isArray(seats) ? seats.join(', ') : seats;
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: renderStatus
    },
  ];

  // Cấu hình các tab cho Tabs component
  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined /> Thông tin tài khoản</span>,
      children: (
        <div className="p-6">
          <Card
            title="Đổi mật khẩu"
            className="mb-6 shadow-sm"
            styles={{ header: { borderBottom: '1px solid rgba(0, 0, 0, 0.06)' } }}
          >
            <Form
              form={form}
              layout="vertical"
              name="password_form"
              onFinish={handleChangePassword}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="currentPassword"
                  label="Mật khẩu hiện tại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-text-secondary" />}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="Mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-text-secondary" />}
                    placeholder="Nhập mật khẩu mới"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu mới"
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-text-secondary" />}
                    placeholder="Xác nhận mật khẩu mới"
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>

              <Form.Item className="mb-0 mt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-button-gradient hover:bg-button-gradient-hover transition-all"
                >
                  Cập nhật mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card
            title="Thông tin cá nhân"
            className="shadow-sm"
            extra={
              <Button 
                type={editMode ? "primary" : "default"}
                icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                onClick={editMode ? handleSaveUserInfo : () => setEditMode(true)}
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
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item 
                  label="Họ và tên" 
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                  <Input disabled={!editMode} className="rounded-lg" />
                </Form.Item>
                
                <Form.Item 
                  label="Số điện thoại" 
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                  ]}
                >
                  <Input disabled={!editMode} className="rounded-lg" />
                </Form.Item>
                
                <Form.Item label="Email" name="email">
                  <Input disabled={true} className="rounded-lg bg-light-bg-secondary" />
                </Form.Item>
                
                <Form.Item label="Ngày tham gia">
                  <Input value={formatDate(user?.createdAt)} disabled={true} className="rounded-lg bg-light-bg-secondary" />
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      )
    },
    {
      key: '2',
      label: <span><HistoryOutlined /> Lịch sử vé</span>,
      children: (
        <div className="p-6">
          <Card className="shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-text-primary m-0">Lịch sử giao dịch vé</h3>
              <Button 
                type="primary" 
                icon={<HistoryOutlined />} 
                onClick={fetchUserTickets}
                loading={loading}
              >
                Làm mới
              </Button>
            </div>
            
            <Table
              dataSource={tickets}
              columns={columns}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              className="rounded-lg overflow-hidden"
              locale={{ emptyText: 'Chưa có lịch sử vé' }}
            />
          </Card>
        </div>
      )
    }
  ];

  // Nếu không có user, hiển thị thông báo loading
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin người dùng..." />
      </div>
    );
  }

  return (
    <div className="user-profile max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <Card className="mb-8 overflow-hidden shadow-card">
        <div className="relative bg-cover bg-center p-6 md:p-8" 
             style={{ 
               backgroundImage: 'linear-gradient(90deg, rgba(231, 26, 15, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)',
               borderRadius: '8px 8px 0 0' 
             }}>
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="mb-4 md:mb-0 md:mr-8 relative">
              <Spin spinning={avatarLoading}>
                <Avatar
                  size={100}
                  src={tempAvatar || user.avatar}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
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
                    className="btn-outline"
                  >
                    Thay đổi
                  </Button>
                </Upload>
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{user.name || 'Người dùng'}</h1>
              <p className="text-text-secondary mb-3">{user.email || 'Chưa cập nhật email'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Tag icon={<CalendarOutlined />} color="blue">
                  Thành viên từ: {formatDate(user.createdAt) || 'Không có thông tin'}
                </Tag>
                {user.role && (
                  <Tag color="gold">{user.role}</Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs 
        defaultActiveKey="1" 
        type="card" 
        className="bg-white shadow-card rounded-lg" 
        items={tabItems}
      />
    </div>
  );
};

export default UserProfilePage;