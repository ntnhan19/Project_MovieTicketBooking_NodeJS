//frontend/src/components/LoginForm.jsx
import React, { useState } from "react";
import { Form, Input, Button, Typography, Divider, message, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const { Text, Title } = Typography;

const LoginForm = ({ onRegisterClick, onLoginSuccess }) => {
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kiểm tra xem có tham số redirect không
  const queryParams = new URLSearchParams(location.search);
  const redirectToAdmin = queryParams.get('redirect') === 'admin';

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Gọi hàm login từ context
      const response = await login({
        email: values.email,
        password: values.password,
      });

      // Kiểm tra nếu đăng nhập thất bại
      if (!response || response.success === false) {
        console.error("Đăng nhập thất bại:", response?.error);
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      console.log("Login response:", response);

      // Lấy thông tin người dùng
      const { user, token } = response;

      // Lưu thông tin auth vào localStorage theo định dạng mà trang admin cần
      const authData = {
        user: {
          ...user,
          id: user.id,
          email: user.email,
          role: user.role.toUpperCase(), // Đảm bảo chuyển thành chữ hoa
        },
        token: token,
      };
      
      localStorage.setItem("auth", JSON.stringify(authData));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);

      console.log("Role của người dùng:", user.role);
      console.log("Đã lưu dữ liệu auth vào localStorage:", authData);

      // Kiểm tra role để chuyển hướng
      if (user && user.role && user.role.toUpperCase() === "ADMIN") {
        console.log("Phát hiện người dùng là ADMIN, chuẩn bị chuyển hướng...");
        message.success("Đăng nhập thành công! Đang chuyển hướng tới trang quản trị...");

        // Thay đổi cơ chế chuyển hướng - sử dụng window.location.href thay vì form
        const adminUrl = `http://localhost:3001?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(user))}`;
        
        // Đặt timeout để đảm bảo localStorage đã được cập nhật
        setTimeout(() => {
          console.log("Chuyển hướng đến trang admin...");
          // Chuyển hướng trực tiếp
          window.location.href = adminUrl;
        }, 1000);
      } else {
        message.success("Đăng nhập thành công!");

        // Gọi callback onLoginSuccess nếu có
        if (onLoginSuccess) {
          onLoginSuccess();
        }

        // Ở lại trang người dùng
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
        {redirectToAdmin && (
          <Text className="text-red-500 block mt-2">
            Bạn cần đăng nhập với tài khoản ADMIN để truy cập trang quản trị
          </Text>
        )}
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
            onClick={() => navigate("/forgot-password")}
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