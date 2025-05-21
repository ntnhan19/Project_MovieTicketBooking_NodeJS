import React, { useState, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
  Space,
  ConfigProvider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const { Text, Title } = Typography;

const LoginForm = ({
  onRegisterClick,
  onLoginSuccess,
  onForgotPasswordClick,
}) => {
  const { login } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const antdTheme = {
    token: {
      colorPrimary: "#e71a0f",
      fontFamily:
        "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      colorText: theme === "dark" ? "#d1d5db" : "#333333",
      colorTextSecondary: theme === "dark" ? "#d1d5db" : "#666666",
      colorBorder: theme === "dark" ? "#374151" : "rgba(0, 0, 0, 0.1)",
      colorTextPlaceholder: theme === "dark" ? "#a0aec0" : "#999999",
    },
    components: {
      Input: {
        borderRadius: 12,
        colorBgContainer: theme === "dark" ? "#2d3748" : "#ffffff",
        paddingBlock: 10,
        paddingInline: 12,
        colorText: theme === "dark" ? "#ffffff" : "#333333",
        colorIcon: theme === "dark" ? "#a0aec0" : "#999999",
        hoverBorderColor: theme === "dark" ? "#e71a0f" : "#c41208",
        activeBorderColor: theme === "dark" ? "#e71a0f" : "#c41208",
      },
      Button: {
        borderRadius: 12,
        paddingBlock: 10,
      },
    },
  };

  const queryParams = new URLSearchParams(location.search);
  const redirectToAdmin = queryParams.get("redirect") === "admin";

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await login({
        email: values.email,
        password: values.password,
      });

      if (!response || response.success === false) {
        console.error("Đăng nhập thất bại:", response?.error);
        message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      const { user, token } = response;
      const authData = {
        user: {
          ...user,
          id: user.id,
          email: user.email,
          role: user.role.toUpperCase(),
        },
        token: token,
      };

      localStorage.setItem("auth", JSON.stringify(authData));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);

      if (user && user.role && user.role.toUpperCase() === "ADMIN") {
        message.success(
          "Đăng nhập thành công! Đang chuyển hướng tới trang quản trị..."
        );
        const adminUrl = `http://localhost:3001?token=${encodeURIComponent(
          token
        )}&user=${encodeURIComponent(JSON.stringify(user))}`;
        setTimeout(() => {
          window.location.href = adminUrl;
        }, 1000);
      } else {
        message.success("Đăng nhập thành công!");
        if (onLoginSuccess) {
          onLoginSuccess();
        }
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

  // Sửa hàm này để trực tiếp gọi callback từ prop
  const handleForgotPasswordClick = () => {
    console.log("Forgot password clicked in LoginForm");
    if (onForgotPasswordClick && typeof onForgotPasswordClick === "function") {
      onForgotPasswordClick();
    }
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className={`mt-4 ${
          theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
        }`}
      >
        <div className="text-center mb-6">
          <Title level={3}>Chào mừng trở lại</Title>
          <Text>Đăng nhập để tiếp tục</Text>
          {redirectToAdmin && (
            <Text className="text-red-500 dark:text-red-400 block mt-2">
              Bạn cần đăng nhập với tài khoản ADMIN để truy cập trang quản trị
            </Text>
          )}
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="mt-4 space-y-4"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
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
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              className="rounded-lg h-12 border form-input"
            />
          </Form.Item>

          <div className="flex justify-end mb-4">
            <Button
              type="link"
              onClick={handleForgotPasswordClick}
              className={`text-sm px-0 transition-all ${
                theme === "dark"
                  ? "text-red-500 hover:text-red-400"
                  : "text-primary hover:text-primary-dark"
              }`}
            >
              Quên mật khẩu?
            </Button>
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

        <Divider
          className={`my-6 ${theme === "dark" ? "border-gray-600" : ""}`}
        >
          <span>Hoặc</span>
        </Divider>

        <Space direction="vertical" size="middle" className="w-full mb-6">
          <Button
            icon={<GoogleOutlined />}
            size="large"
            onClick={() => handleSocialLogin("Google")}
            block
            className={`h-12 text-base rounded-lg border flex items-center justify-center transition-all ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 border-gray-600 text-dark-text-primary"
                : "hover:bg-gray-50 text-text-primary"
            }`}
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
          <Text>Chưa có tài khoản? </Text>
          <Button
            type="link"
            onClick={onRegisterClick}
            className={`text-sm px-0 font-medium transition-all ${
              theme === "dark"
                ? "text-red-500 hover:text-red-400"
                : "text-primary hover:text-primary-dark"
            }`}
          >
            Đăng ký ngay
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginForm;
