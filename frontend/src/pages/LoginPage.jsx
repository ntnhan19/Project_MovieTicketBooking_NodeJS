// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Divider, message, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
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

      // Lưu token, role và userId vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);

      // Chuyển hướng theo role
      if (user.role?.toUpperCase() === "ADMIN") {
        window.location.href = "http://localhost:3001"; // redirect đến trang admin
      } else {
        navigate("/");
        message.success("Đăng nhập thành công!");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    message.info(`Đăng nhập bằng ${platform} đang được phát triển.`);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card">
          <div className="login-header">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text" 
              onClick={() => navigate(-1)}
              className="back-button"
            />
            <div className="login-title">
              <Title level={2}>Chào mừng trở lại</Title>
              <Text type="secondary">Đăng nhập để tiếp tục</Text>
            </div>
          </div>

          <Form 
            form={form} 
            name="login" 
            onFinish={onFinish} 
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" }
              ]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                size="large"
                className="login-input" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                size="large"
                className="login-input"
              />
            </Form.Item>

            <div className="flex justify-end mb-4">
              <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="login-button"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider className="login-divider">Hoặc</Divider>

          <Space direction="vertical" size="middle" className="social-login">
            <Button
              icon={<GoogleOutlined />}
              size="large"
              onClick={() => handleSocialLogin("Google")}
              block
              className="google-button"
            >
              Tiếp tục với Google
            </Button>
            <Button
              icon={<FacebookOutlined />}
              size="large"
              onClick={() => handleSocialLogin("Facebook")}
              block
              className="facebook-button"
            >
              Tiếp tục với Facebook
            </Button>
          </Space>

          <div className="login-footer">
            <Text type="secondary">Chưa có tài khoản? </Text>
            <Link to="/register" className="register-link">Đăng ký ngay</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;