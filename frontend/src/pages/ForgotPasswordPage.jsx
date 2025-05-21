import React, { useState, useContext } from "react";
import { Form, Input, Button, Typography, Result, message, ConfigProvider } from "antd";
import { MailOutlined } from "@ant-design/icons";
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

  const antdTheme = {
    token: {
      colorPrimary: '#e71a0f',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      colorBgContainer: theme === 'dark' ? '#1f2a44' : '#ffffff',
      colorText: theme === 'dark' ? '#d1d5db' : '#333333',
      colorTextSecondary: theme === 'dark' ? '#d1d5db' : '#666666',
      colorBorder: theme === 'dark' ? '#374151' : 'rgba(0, 0, 0, 0.1)',
      colorTextPlaceholder: theme === 'dark' ? '#a0aec0' : '#999999',
    },
    components: {
      Input: {
        borderRadius: 12,
        colorBgContainer: theme === 'dark' ? '#2d3748' : '#ffffff',
        paddingBlock: 10,
        paddingInline: 12,
        colorText: theme === 'dark' ? '#ffffff' : '#333333',
        colorIcon: theme === 'dark' ? '#a0aec0' : '#999999',
        hoverBorderColor: theme === 'dark' ? '#e71a0f' : '#c41208',
        activeBorderColor: theme === 'dark' ? '#e71a0f' : '#c41208',
      },
      Button: {
        borderRadius: 12,
        paddingBlock: 10,
      },
    },
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const result = await userApi.forgotPassword(values.email); // Sử dụng userApi
      if (result.success) {
        setUserEmail(values.email);
        setEmailSent(true);
      } else {
        message.error(result.message || 'Không thể gửi email đặt lại mật khẩu');
      }
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
      message.error(error.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      const result = await userApi.forgotPassword(userEmail); // Sử dụng userApi
      if (result.success) {
        message.success("Email đặt lại mật khẩu đã được gửi lại!");
      } else {
        message.error(result.message || 'Không thể gửi lại email');
      }
    } catch (error) {
      console.error("Lỗi gửi lại email:", error);
      message.error(error.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    closeForgotPasswordModal();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  if (emailSent) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-dark-text-primary' : 'bg-white text-text-primary'} rounded-lg shadow-lg`}>
          <Result
            status="success"
            title="Email đặt lại mật khẩu đã được gửi!"
            subTitle={
              <div className="text-left">
                <Paragraph>
                  Chúng tôi đã gửi một email đến <strong>{userEmail}</strong> với
                  hướng dẫn đặt lại mật khẩu.
                </Paragraph>
                <Paragraph>
                  Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn.
                  Email có thể mất vài phút để đến.
                </Paragraph>
              </div>
            }
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={handleBackToLogin}
                className="h-12 text-base font-medium rounded-lg btn-primary"
              >
                Quay lại đăng nhập
              </Button>,
              <Button
                key="resend"
                onClick={handleResendEmail}
                loading={loading}
                className="h-12 text-base rounded-lg"
              >
                Gửi lại email
              </Button>,
            ]}
          />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 text-dark-text-primary' : 'bg-white text-text-primary'} rounded-lg shadow-lg`}>
        <div className="text-center mb-6">
          <Title level={3} className={`mb-2 ${theme === 'dark' ? 'text-dark-text-primary' : 'text-text-primary'}`}>
            Quên mật khẩu
          </Title>
          <Text className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'}`}>
            Vui lòng nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
          </Text>
        </div>

        <Form
          form={form}
          name="forgot_password"
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
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              className="rounded-lg h-12 border form-input"
            />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="h-12 text-base font-medium rounded-lg btn-primary"
            >
              Gửi hướng dẫn đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Button
            type="link"
            onClick={handleBackToLogin}
            className={`text-sm ${theme === 'dark' ? 'text-red-500 hover:text-red-400' : 'text-primary hover:text-primary-dark'} transition-all`}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ForgotPasswordForm;