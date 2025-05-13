import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { 
  LockOutlined, 
  KeyOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  SafetyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

const PasswordChangeCard = () => {
  const { changePassword, user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
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
        message.success('Đổi mật khẩu thành công!');
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else {
        message.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu. Vui lòng thử lại!');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    {
      validator: (_, value) => {
        if (!value || value.length >= 8) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
      }
    },
    {
      validator: (_, value) => {
        if (!value || /[A-Z]/.test(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ in hoa!'));
      }
    },
    {
      validator: (_, value) => {
        if (!value || /[0-9]/.test(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ số!'));
      }
    }
  ];

  return (
    <Card
      title={
        <div className="flex items-center text-lg font-medium">
          <KeyOutlined className="mr-2 text-primary" /> 
          Đổi mật khẩu
        </div>
      }
      className="shadow-md rounded-xl overflow-hidden"
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
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập mật khẩu hiện tại"
              className="rounded-lg py-2"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              ...passwordRules
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập mật khẩu mới"
              className="rounded-lg py-2"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Xác nhận mật khẩu mới"
              className="rounded-lg py-2"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </div>

        <Form.Item className="mb-0 mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SafetyOutlined />}
            className="bg-button-gradient hover:bg-button-gradient-hover transition-all"
          >
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <div className="bg-light-bg-secondary p-4 rounded-lg">
        <h4 className="font-medium flex items-center">
          <SafetyOutlined className="mr-2 text-primary" />
          Lưu ý bảo mật
        </h4>
        <ul className="text-sm list-disc pl-5 mt-2 text-text-secondary">
          <li>Mật khẩu phải có ít nhất 8 ký tự</li>
          <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          <li>Không sử dụng thông tin cá nhân như ngày sinh, tên, số điện thoại</li>
          <li>Nên thay đổi mật khẩu định kỳ (3-6 tháng một lần)</li>
          <li>Không sử dụng lại mật khẩu từ các tài khoản khác</li>
        </ul>
      </div>
    </Card>
  );
};

export default PasswordChangeCard;