import React, { useState, useContext } from "react";
import { Form, Input, Button, Typography, Result, ConfigProvider, notification } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import { ThemeContext } from "../context/ThemeContext";

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordForm = ({ onLoginClick }) => {
  const { closeForgotPasswordModal } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  // Cấu hình theme cho Ant Design
  const antdTheme = {
    token: {
      colorPrimary: "#e71a0f",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      borderRadius: 8,
      colorBgContainer: theme === "dark" ? "#1a1a1a" : "#ffffff",
      colorText: theme === "dark" ? "#ffffff" : "#1f2937",
      colorTextSecondary: theme === "dark" ? "#a1a1aa" : "#6b7280",
      colorBorder: theme === "dark" ? "#374151" : "#e5e7eb",
      colorTextPlaceholder: theme === "dark" ? "#71717a" : "#9ca3af",
    },
    components: {
      Input: {
        borderRadius: 8,
        colorBgContainer: theme === "dark" ? "#262626" : "#ffffff",
        paddingBlock: 12,
        paddingInline: 16,
        fontSize: 16,
        colorText: theme === "dark" ? "#ffffff" : "#1f2937",
        colorIcon: theme === "dark" ? "#a1a1aa" : "#6b7280",
        hoverBorderColor: "#e71a0f",
        activeBorderColor: "#e71a0f",
        focusBorderColor: "#e71a0f",
      },
      Button: {
        borderRadius: 8,
        paddingBlock: 12,
        fontSize: 16,
        fontWeight: 500,
      },
      Form: {
        labelFontSize: 14,
        labelColor: theme === "dark" ? "#ffffff" : "#1f2937",
      },
    },
  };

  // Xử lý thông báo lỗi
  const showErrorNotification = (error, response, key) => {
    // Không hiển thị lỗi nếu đây là trường hợp thành công
    if (response?.message === "Đã gửi email hướng dẫn đặt lại mật khẩu" && !response?.error) {
      return;
    }

    const errorMessages = {
      VALIDATION_ERROR: "Email không hợp lệ. Vui lòng kiểm tra lại.",
      USER_NOT_FOUND: "Email này chưa được đăng ký. Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.",
      RATE_LIMIT: `Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng đợi ${response.retryAfter || 60} giây.`,
      SERVER_ERROR: "Lỗi hệ thống. Vui lòng thử lại sau.",
    };

    const message = errorMessages[response?.type] || response?.error || "Không thể gửi email đặt lại mật khẩu";
    
    notification.error({
      key,
      message: "Có lỗi xảy ra",
      description: message,
      duration: 5,
      placement: "topRight",
    });
  };

  // Xử lý gửi email
  const handleSubmit = async (values) => {
    const notificationKey = `forgotPassword-${Date.now()}`;
    
    // Hiển thị loading notification
    notification.info({
      key: notificationKey,
      message: "Đang xử lý",
      description: "Đang gửi email đặt lại mật khẩu...",
      duration: 0,
      placement: "topRight",
    });

    try {
      setLoading(true);
      const result = await userApi.forgotPassword(values.email);

      if (result.message === "Đã gửi email hướng dẫn đặt lại mật khẩu" && !result.error) {
        setUserEmail(values.email);
        setEmailSent(true);
        
        notification.success({
          key: notificationKey,
          message: "Gửi email thành công",
          description: "Vui lòng kiểm tra hộp thư để nhận hướng dẫn đặt lại mật khẩu.",
          duration: 5,
          placement: "topRight",
        });
      } else {
        showErrorNotification(null, result, notificationKey);
      }
    } catch (error) {
      const errorResponse = error.response?.data || error.data || { error: error.message };
      showErrorNotification(error, errorResponse, notificationKey);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý gửi lại email
  const handleResendEmail = async () => {
    const notificationKey = `resendEmail-${Date.now()}`;
    
    notification.info({
      key: notificationKey,
      message: "Đang xử lý",
      description: "Đang gửi lại email...",
      duration: 0,
      placement: "topRight",
    });

    try {
      setResendingEmail(true);
      const result = await userApi.forgotPassword(userEmail);

      if (result.message === "Đã gửi email hướng dẫn đặt lại mật khẩu" && !result.error) {
        notification.success({
          key: notificationKey,
          message: "Gửi lại email thành công",
          description: "Vui lòng kiểm tra hộp thư để nhận hướng dẫn.",
          duration: 5,
          placement: "topRight",
        });
      } else {
        showErrorNotification(null, result, notificationKey);
      }
    } catch{
      notification.error({
        key: notificationKey,
        message: "Gửi lại email thất bại",
        description: "Vui lòng kiểm tra kết nối và thử lại.",
        duration: 5,
        placement: "topRight",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  // Xử lý quay lại đăng nhập
  const handleBackToLogin = () => {
    closeForgotPasswordModal();
    onLoginClick?.();
  };

  // Render thành công
  if (emailSent) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div
          className={`max-w-md mx-auto p-8 rounded-xl shadow-xl ${
            theme === "dark" 
              ? "bg-gray-900 border border-gray-700" 
              : "bg-white border border-gray-200"
          }`}
        >
          <Result
            status="success"
            icon={
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <MailOutlined className="text-2xl text-green-600" />
                </div>
              </div>
            }
            title={
              <Title 
                level={3} 
                className={`mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                Email đã được gửi!
              </Title>
            }
            subTitle={
              <div className="space-y-4 text-left">
                <Paragraph className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:{" "}
                  <span className="font-semibold text-red-600">{userEmail}</span>
                </Paragraph>
                
                <Paragraph className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn. Email có thể mất vài phút để đến.
                </Paragraph>
                
                <div className={`p-3 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-blue-50"}`}>
                  <Text className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
                    💡 <strong>Lưu ý:</strong> Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                  </Text>
                </div>
              </div>
            }
            extra={
              <div className="flex flex-col gap-3 mt-6">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleBackToLogin}
                  className="h-12 font-medium"
                  icon={<ArrowLeftOutlined />}
                >
                  Quay lại đăng nhập
                </Button>
                
                <Button
                  size="large"
                  onClick={handleResendEmail}
                  loading={resendingEmail}
                  className="h-12"
                  icon={<MailOutlined />}
                >
                  {resendingEmail ? "Đang gửi lại..." : "Gửi lại email"}
                </Button>
              </div>
            }
          />
        </div>
      </ConfigProvider>
    );
  }

  // Render form
  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className={`max-w-md mx-auto p-8 rounded-xl shadow-xl ${
          theme === "dark" 
            ? "bg-gray-900 border border-gray-700" 
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailOutlined className="text-2xl text-red-600" />
          </div>
          
          <Title 
            level={2} 
            className={`mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            Quên mật khẩu?
          </Title>
          
          <Text className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </Text>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="forgot_password"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          className="space-y-4"
        >
          <Form.Item
            label="Địa chỉ email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Định dạng email không hợp lệ!" },
              { max: 100, message: "Email không được quá 100 ký tự!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Nhập địa chỉ email của bạn"
              className="h-12"
              autoComplete="email"
              autoFocus
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="h-12 font-medium"
              icon={<MailOutlined />}
            >
              {loading ? "Đang gửi..." : "Gửi hướng dẫn đặt lại mật khẩu"}
            </Button>
          </Form.Item>
        </Form>

        {/* Back to login */}
        <div className="text-center">
          <Button
            type="link"
            onClick={handleBackToLogin}
            className={`text-sm font-medium ${
              theme === "dark" 
                ? "text-red-400 hover:text-red-300" 
                : "text-red-600 hover:text-red-700"
            }`}
            icon={<ArrowLeftOutlined />}
          >
            Quay lại đăng nhập
          </Button>
        </div>

        {/* Tip */}
        <div className={`mt-6 p-4 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
          <Text className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            <span className="text-blue-500">💡</span>{" "}
            <strong>Mẹo:</strong> Nếu không nhận được email sau 5 phút, 
            hãy kiểm tra thư mục spam hoặc thử gửi lại.
          </Text>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ForgotPasswordForm;