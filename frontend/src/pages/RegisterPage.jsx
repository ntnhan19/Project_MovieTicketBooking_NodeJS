// frontend/src/components/RegisterForm.jsx
import React, { useState } from "react";
import { Form, Input, Button, Typography, Checkbox, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Text, Title } = Typography;

const RegisterForm = ({ onLoginClick }) => {
  const { register } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);
      const { confirmPassword: _, agreement: __, ...userData } = values;
      
      // Chuyển đổi từ fullName sang name để phù hợp với backend
      const submitData = {
        ...userData,
        name: userData.fullName, 
      };
      delete submitData.fullName; 
      
      await register(submitData);
      
      // Lưu email để hiển thị thông báo
      setRegisteredEmail(values.email);
      setShowVerificationMsg(true);
      
      // Reset form
      form.resetFields();
      
      // Quan trọng: Không gọi onRegisterSuccess() nếu muốn hiển thị thông báo xác nhận
      // Người dùng sẽ phải click nút "Quay lại đăng nhập" để chuyển về màn hình đăng nhập
      // Nếu vẫn muốn tự động chuyển đến đăng nhập sau một khoảng thời gian, có thể thêm setTimeout
      
    } catch (error) {
      console.error("Registration error:", error);
      // Thông báo lỗi đã được xử lý trong register function
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { authApi } = await import("../api/authApi"); // Dynamic import
      await authApi.resendVerificationEmail(registeredEmail);
      message.success("Email xác thực đã được gửi lại!");
    } catch {
      message.error("Không thể gửi lại email xác thực. Vui lòng thử lại sau.");
    }
  };

  // Hàm để xử lý việc chuyển sang màn hình đăng nhập
  const handleLoginClick = () => {
    // Reset trạng thái verification message trước khi chuyển sang form đăng nhập
    setShowVerificationMsg(false);
    if (onLoginClick) onLoginClick();
  };

  return (
    <>
      <div className="text-center mb-6">
        <Title level={3} className="mb-2 text-text-primary">
          Tạo tài khoản mới
        </Title>
        <Text className="text-text-secondary">
          Tham gia cùng chúng tôi để đặt vé xem phim dễ dàng
        </Text>
      </div>

      {showVerificationMsg ? (
        <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-100">
          <Title level={4} className="text-blue-700 mb-2">
            Vui lòng xác nhận email của bạn
          </Title>
          <Text className="text-blue-600 block mb-3">
            Chúng tôi đã gửi email xác nhận đến {registeredEmail}. Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận.
          </Text>
          <div className="mt-4">
            <Button type="primary" onClick={handleResendVerification}>
              Gửi lại email xác nhận
            </Button>
            <Button type="link" onClick={handleLoginClick} className="ml-2">
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
          className="mt-4"
        >
          <Form.Item
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Họ và tên"
              size="large"
              className="rounded-lg h-11 form-input"
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
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Email"
              size="large"
              className="rounded-lg h-11 form-input"
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
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Số điện thoại"
              size="large"
              className="rounded-lg h-11 form-input"
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
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              size="large"
              className="rounded-lg h-11 form-input"
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
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              className="rounded-lg h-11 form-input"
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
              <a className="text-primary">Điều khoản dịch vụ</a> và{" "}
              <a className="text-primary">Chính sách bảo mật</a>
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
          <Text className="text-text-secondary">Đã có tài khoản? </Text>
          <a
            onClick={handleLoginClick}
            className="text-primary font-medium hover:text-primary-dark transition-all cursor-pointer"
          >
            Đăng nhập ngay
          </a>
        </div>
      )}
    </>
  );
};

export default RegisterForm;