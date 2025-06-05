import React, { useState, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  notification,
  Space,
  ConfigProvider,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
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
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastAttemptEmail, setLastAttemptEmail] = useState("");
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
      Notification: {
        colorBgElevated: theme === "dark" ? "#1f2937" : "#ffffff",
        colorText: theme === "dark" ? "#d1d5db" : "#000000",
        colorTextHeading: theme === "dark" ? "#ffffff" : "#000000",
        borderRadius: 12,
      },
      Alert: {
        borderRadius: 12,
        colorInfoBg: theme === "dark" ? "#1e3a8a" : "#dbeafe",
        colorInfoBorder: theme === "dark" ? "#3b82f6" : "#93c5fd",
        colorWarningBg: theme === "dark" ? "#92400e" : "#fef3c7",
        colorWarningBorder: theme === "dark" ? "#f59e0b" : "#fcd34d",
      },
    },
  };

  const queryParams = new URLSearchParams(location.search);
  const redirectToAdmin = queryParams.get("redirect") === "admin";

  // Hàm xử lý các loại lỗi từ backend
  const handleErrorResponse = (error, response) => {
    console.error("Login error details:", { error, response });

    // Reset trạng thái email not verified khi có lỗi khác
    if (response?.type !== "EMAIL_NOT_VERIFIED") {
      setEmailNotVerified(false);
    }

    // Xử lý theo type của lỗi từ backend
    switch (response?.type) {
      case "VALIDATION_ERROR":
        // Hiển thị lỗi validation cụ thể
        const validationMessage = response.error || "Dữ liệu không hợp lệ";
        notification.error({
          message: "Lỗi nhập liệu",
          description: validationMessage,
          duration: 4,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
        
        // Nếu có nhiều lỗi, hiển thị chi tiết
        if (response.errors && response.errors.length > 1) {
          console.log("Chi tiết các lỗi validation:", response.errors);
        }
        break;

      case "INVALID_CREDENTIALS":
        notification.error({
          message: "Đăng nhập thất bại",
          description: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.",
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
        break;

      case "EMAIL_NOT_VERIFIED":
        setEmailNotVerified(true);
        setLastAttemptEmail(form.getFieldValue('email'));
        notification.warning({
          message: "Tài khoản chưa được xác thực",
          description: response.error || "Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.",
          duration: 6,
          icon: <MailOutlined style={{ color: '#faad14' }} />,
        });
        break;

      case "USER_NOT_FOUND":
        notification.error({
          message: "Tài khoản không tồn tại",
          description: "Email này chưa được đăng ký. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.",
          duration: 5,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
        break;

      case "SERVER_ERROR":
        notification.error({
          message: "Lỗi hệ thống",
          description: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.",
          duration: 6,
          icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
        });
        break;

      case "RATE_LIMIT":
        const retryAfter = response.retryAfter || 60;
        notification.warning({
          message: "Thử quá nhiều lần",
          description: `Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi ${retryAfter} giây trước khi thử lại.`,
          duration: Math.max(retryAfter, 8),
          icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        });
        break;

      default:
        // Xử lý lỗi chung hoặc không xác định
        const defaultMessage = response?.error || error?.message || "Đăng nhập thất bại";
        
        // Kiểm tra một số lỗi thường gặp khác
        if (defaultMessage.toLowerCase().includes('network') || 
            defaultMessage.toLowerCase().includes('connection')) {
          notification.error({
            message: "Lỗi kết nối",
            description: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.",
            duration: 5,
          });
        } else if (defaultMessage.toLowerCase().includes('timeout')) {
          notification.error({
            message: "Hết thời gian chờ",
            description: "Yêu cầu bị hết thời gian chờ. Vui lòng thử lại.",
            duration: 5,
          });
        } else {
          notification.error({
            message: "Đăng nhập thất bại",
            description: defaultMessage,
            duration: 4,
          });
        }
        break;
    }
  };

  // Hàm gửi lại email xác thực
  const handleResendVerificationEmail = async () => {
    try {
      setResendingEmail(true);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: lastAttemptEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        notification.success({
          message: "Đã gửi email thành công",
          description: "Vui lòng kiểm tra hộp thư email của bạn để xác thực tài khoản.",
          duration: 5,
          icon: <MailOutlined style={{ color: '#52c41a' }} />,
        });
      } else {
        // Xử lý lỗi khi gửi lại email
        switch (data.type) {
          case "RATE_LIMIT":
            notification.warning({
              message: "Gửi email quá nhanh",
              description: data.error || `Vui lòng đợi ${data.retryAfter || 60} giây trước khi gửi lại.`,
              duration: 6,
            });
            break;
          case "ALREADY_VERIFIED":
            notification.info({
              message: "Tài khoản đã được xác thực",
              description: "Tài khoản của bạn đã được xác thực. Vui lòng thử đăng nhập lại.",
              duration: 4,
            });
            setEmailNotVerified(false);
            break;
          case "USER_NOT_FOUND":
            notification.error({
              message: "Email không tồn tại",
              description: "Email này không tồn tại trong hệ thống.",
              duration: 4,
            });
            break;
          default:
            notification.error({
              message: "Không thể gửi email",
              description: data.error || "Đã xảy ra lỗi khi gửi email xác thực. Vui lòng thử lại sau.",
              duration: 5,
            });
        }
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      notification.error({
        message: "Lỗi kết nối",
        description: "Không thể gửi email xác thực. Vui lòng kiểm tra kết nối và thử lại.",
        duration: 5,
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setEmailNotVerified(false); // Reset trạng thái
      
      const response = await login({
        email: values.email,
        password: values.password,
      });

      if (!response || response.success === false) {
        handleErrorResponse(null, response);
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

      // Sử dụng sessionStorage thay vì localStorage
      sessionStorage.setItem("auth", JSON.stringify(authData));
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userId", user.id);

      if (user && user.role && user.role.toUpperCase() === "ADMIN") {
        notification.success({
          message: "Đăng nhập thành công",
          description: "Chào mừng Admin! Đang chuyển hướng tới trang quản trị...",
          duration: 3,
          icon: <UserOutlined style={{ color: '#52c41a' }} />,
        });
        const adminUrl = `http://localhost:3001?token=${encodeURIComponent(
          token
        )}&user=${encodeURIComponent(JSON.stringify(user))}`;
        setTimeout(() => {
          window.location.href = adminUrl;
        }, 1000);
      } else {
        notification.success({
          message: "Đăng nhập thành công",
          description: `Chào mừng ${user.name || 'bạn'} trở lại!`,
          duration: 3,
          icon: <UserOutlined style={{ color: '#52c41a' }} />,
        });
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Xử lý lỗi từ response hoặc error object
      let errorResponse = null;
      if (error.response && error.response.data) {
        errorResponse = error.response.data;
      } else if (error.data) {
        errorResponse = error.data;
      }
      
      handleErrorResponse(error, errorResponse);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    notification.info({
      message: "Tính năng đang phát triển",
      description: `Đăng nhập bằng ${platform} sẽ sớm được hỗ trợ.`,
      duration: 3,
    });
  };

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

        {/* Alert hiển thị khi email chưa được xác thực */}
        {emailNotVerified && (
          <Alert
            message="Tài khoản chưa được xác thực"
            description={
              <div>
                <p className="mb-3">
                  Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực.
                </p>
                <Button
                  type="link"
                  size="small"
                  loading={resendingEmail}
                  onClick={handleResendVerificationEmail}
                  className="p-0 h-auto"
                  icon={<MailOutlined />}
                >
                  Gửi lại email xác thực
                </Button>
              </div>
            }
            type="warning"
            showIcon
            closable
            onClose={() => setEmailNotVerified(false)}
            className="mb-4"
          />
        )}

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
              { type: "email", message: "Email không đúng định dạng!" },
              { max: 100, message: "Email không được quá 100 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
              className="rounded-lg h-12 border form-input"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu"
              size="large"
              className="rounded-lg h-12 border form-input"
              autoComplete="current-password"
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
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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