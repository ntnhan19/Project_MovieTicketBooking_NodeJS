import React, { useState } from "react";
import { Form, Input, Button, Typography, Divider, message, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

const LoginForm = ({ onRegisterClick, onLoginSuccess }) => {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Gọi hàm login từ context
      const response = await login({ email: values.email, password: values.password });
      
      // Kiểm tra nếu đăng nhập thất bại
      if (!response || response.success === false) {
        console.error("Đăng nhập thất bại:", response?.error);
        return;
      }
      
      console.log("Login response:", response);
      
      // Lấy thông tin người dùng
      const { user } = response;
      
      // Kiểm tra role để chuyển hướng
      if (user && user.role?.toUpperCase() === "ADMIN") {
        message.success("Đăng nhập thành công! Đang chuyển hướng tới trang quản trị...");
        // Chuyển hướng tới trang admin (có thể điều chỉnh URL)
        window.location.href = "http://localhost:3001";
      } else {
        // Gọi callback onLoginSuccess nếu có
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Tải lại trang để đảm bảo cập nhật trạng thái
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    message.info(`Đăng nhập bằng ${platform} đang được phát triển.`);
  };

  return (
    <>
      <div className="text-center mb-6">
        <Title level={3} className="mb-2 text-text-primary">
          Chào mừng trở lại
        </Title>
        <Text className="text-text-secondary">Đăng nhập để tiếp tục</Text>
      </div>

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        className="mt-4"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Email"
            size="large"
            className="rounded-lg h-12 border form-input"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Mật khẩu"
            size="large"
            className="rounded-lg h-12 border form-input"
          />
        </Form.Item>

        <div className="flex justify-end mb-4">
          <a 
            className="text-primary hover:text-primary-dark transition-all"
            onClick={() => navigate('/forgot-password')}
          >
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className="h-12 text-base font-medium rounded-lg btn-primary"
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider className="my-6">
        <span className="text-text-secondary">Hoặc</span>
      </Divider>

      <Space direction="vertical" size="middle" className="w-full mb-6">
        <Button
          icon={<GoogleOutlined />}
          size="large"
          onClick={() => handleSocialLogin("Google")}
          block
          className="h-12 text-base rounded-lg border flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          Tiếp tục với Google
        </Button>
        <Button
          icon={<FacebookOutlined />}
          size="large"
          onClick={() => handleSocialLogin("Facebook")}
          block
          className="h-12 text-base rounded-lg bg-blue-600 text-white border-none flex items-center justify-center hover:bg-blue-700 hover:shadow-sm transition-all"
        >
          Tiếp tục với Facebook
        </Button>
      </Space>

      <div className="text-center mt-4">
        <Text className="text-text-secondary">Chưa có tài khoản? </Text>
        <a
          onClick={onRegisterClick}
          className="text-primary font-medium hover:text-primary-dark transition-all cursor-pointer"
        >
          Đăng ký ngay
        </a>
      </div>
    </>
  );
};

export default LoginForm;