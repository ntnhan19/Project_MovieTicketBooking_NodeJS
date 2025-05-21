import React, { useState, useContext } from "react";
import { Form, Input, Button, Typography, Checkbox, message, ConfigProvider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const { Text, Title } = Typography;

const RegisterForm = ({ onLoginClick }) => {
  const { register } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

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
      Checkbox: {
        colorText: theme === 'dark' ? '#d1d5db' : '#333333',
      },
    },
  };

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword: _, agreement: __, ...userData } = values;
      const submitData = {
        ...userData,
        name: userData.fullName,
      };
      delete submitData.fullName;
      await register(submitData);
      setRegisteredEmail(values.email);
      setShowVerificationMsg(true);
      form.resetFields();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { authApi } = await import("../api/authApi");
      await authApi.resendVerificationEmail(registeredEmail);
      message.success("Email xác thực đã được gửi lại!");
    } catch {
      message.error("Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
    }
  };

  const handleLoginClick = () => {
    setShowVerificationMsg(false);
    if (onLoginClick) onLoginClick();
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div className={`mt-4 ${theme === 'dark' ? 'text-dark-text-primary' : 'text-text-primary'}`}>
        <div className="text-center mb-6">
          <Title level={3} className={`mb-2 ${theme === 'dark' ? 'text-dark-text-primary' : 'text-text-primary'}`}>
            Tạo tài khoản mới
          </Title>
          <Text className={`${theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'}`}>
            Tham gia cùng chúng tôi để đặt vé xem phim dễ dàng
          </Text>
        </div>

        {showVerificationMsg ? (
          <div className={`p-4 rounded-lg border shadow-sm ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'}`}>
            <Title level={4} className={`text-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} mb-3`}>
              Vui lòng xác nhận email của bạn
            </Title>
            <Text className={`text-center block mb-3 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
              Chúng tôi đã gửi email xác nhận đến <strong>{registeredEmail}</strong>.<br />
              Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận.
            </Text>
            <div className="flex justify-center gap-2">
              <Button type="primary" onClick={handleResendVerification} className="btn-primary">
                Gửi lại email xác nhận
              </Button>
              <Button type="link" onClick={handleLoginClick} className={`${theme === 'dark' ? 'text-red-500' : 'text-primary'}`}>
                Quay lại đăng nhập
              </Button>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            name="register_form"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            scrollToFirstError
            className="mt-4 space-y-4"
          >
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Họ và tên"
                size="large"
                className="rounded-lg h-12 form-input"
              />
            </Form.Item>

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
                className="rounded-lg h-12 form-input"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: new RegExp(/^(0[3|5|7|8|9])+([0-9]{8})$/),
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Số điện thoại"
                size="large"
                className="rounded-lg h-12 form-input"
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
                className="rounded-lg h-12 form-input"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
                size="large"
                className="rounded-lg h-12 form-input"
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Vui lòng đồng ý với điều khoản dịch vụ!")
                        ),
                },
              ]}
              className="mb-6"
            >
              <Checkbox>
                Tôi đã đọc và đồng ý với{" "}
                <a className={`${theme === 'dark' ? 'text-red-500' : 'text-primary'}`}>
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a className={`${theme === 'dark' ? 'text-red-500' : 'text-primary'}`}>
                  Chính sách bảo mật
                </a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="h-12 text-base font-medium rounded-lg btn-primary"
              >
                Tạo tài khoản
              </Button>
            </Form.Item>
          </Form>
        )}

        {!showVerificationMsg && (
          <div className="text-center mt-6">
            <Text className={`text-sm ${theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'}`}>
              Đã có tài khoản?{" "}
            </Text>
            <a
              onClick={handleLoginClick}
              className={`text-sm font-medium transition-all cursor-pointer ${theme === 'dark' ? 'text-red-500 hover:text-red-400' : 'text-primary hover:text-primary-dark'}`}
            >
              Đăng nhập ngay
            </a>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default RegisterForm;