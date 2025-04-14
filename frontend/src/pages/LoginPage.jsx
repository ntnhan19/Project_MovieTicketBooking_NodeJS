// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Divider, message } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Lấy trang chuyển hướng sau khi đăng nhập (nếu có)
  const from = location.state?.from?.pathname || "/";

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      // Chuyển hướng về trang trước đó hoặc trang chủ
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      // Thông báo lỗi được xử lý trong context
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    message.info(`Đăng nhập bằng ${platform} đang được phát triển.`);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <Card style={{ width: 400, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ marginBottom: 8 }}>Đăng nhập</Title>
          <Text type="secondary">Chào mừng bạn quay trở lại</Text>
        </div>

        <Form
          form={form}
          name="login_form"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
          </Form.Item>

          <Form.Item>
            <Link to="/forgot-password" style={{ float: "right" }}>
              Quên mật khẩu?
            </Link>
          </Form.Item>

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

        <Divider>
          <Text type="secondary">Hoặc đăng nhập với</Text>
        </Divider>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
          <Button
            icon={<GoogleOutlined />}
            size="large"
            onClick={() => handleSocialLogin("Google")}
          >
            Google
          </Button>
          <Button
            icon={<FacebookOutlined />}
            size="large"
            onClick={() => handleSocialLogin("Facebook")}
          >
            Facebook
          </Button>
        </div>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Chưa có tài khoản? </Text>
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;