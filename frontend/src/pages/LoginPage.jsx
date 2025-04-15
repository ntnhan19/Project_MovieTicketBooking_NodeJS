// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Divider, message } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await login(values.email, values.password);
      const { token, user } = response;
  
      // ✅ Lưu token và role vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
  
      // ✅ Chuyển hướng theo role
      if (user.role?.toUpperCase() === "ADMIN") {
        window.location.href = "http://localhost:3001"; // redirect đến trang admin
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    message.info(`Đăng nhập bằng ${platform} đang được phát triển.`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Đăng Nhập</Title>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc đăng nhập với</Divider>

        <div className="flex gap-4 mb-4">
          <Button
            icon={<GoogleOutlined />}
            size="large"
            onClick={() => handleSocialLogin("Google")}
            block
          >
            Google
          </Button>
          <Button
            icon={<FacebookOutlined />}
            size="large"
            onClick={() => handleSocialLogin("Facebook")}
            block
          >
            Facebook
          </Button>
        </div>

        <div className="text-center">
          <Text>
            Chưa có tài khoản?{" "}
            <Link to="/register">Đăng ký ngay</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
