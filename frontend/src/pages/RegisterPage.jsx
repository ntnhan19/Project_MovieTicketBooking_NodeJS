// frontend/src/
import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, Typography, Checkbox, Divider, message, Space } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScroll(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không khớp!");
      return;
    }
  
    try {
      setLoading(true);
      const { confirmPassword: _, agreement: __, ...userData } = values;
      await register(userData);
      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      message.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <Card className="register-card">
          <div className="register-header">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text" 
              onClick={() => navigate(-1)}
              className="back-button"
            />
            <div className="register-title">
              <Title level={2}>Tạo tài khoản mới</Title>
              <Text type="secondary">Tham gia cùng chúng tôi để đặt vé xem phim dễ dàng</Text>
            </div>
          </div>

          <Form
            form={form}
            name="register_form"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            scrollToFirstError
            className="register-form"
          >
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input 
                prefix={<UserOutlined className="site-form-item-icon" />} 
                placeholder="Họ và tên" 
                size="large" 
                className="register-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />} 
                placeholder="Email" 
                size="large" 
                className="register-input"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { pattern: new RegExp(/^(0[3|5|7|8|9])+([0-9]{8})$/), message: "Số điện thoại không hợp lệ!" }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined className="site-form-item-icon" />} 
                placeholder="Số điện thoại" 
                size="large" 
                className="register-input"
              />
            </Form.Item>

            <Space size={0} direction="vertical" style={{ width: "100%" }}>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined className="site-form-item-icon" />} 
                  placeholder="Mật khẩu" 
                  size="large" 
                  className="register-input"
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
                  prefix={<LockOutlined className="site-form-item-icon" />} 
                  placeholder="Xác nhận mật khẩu" 
                  size="large" 
                  className="register-input"
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(new Error("Vui lòng đồng ý với điều khoản dịch vụ!")),
                },
              ]}
              className="agreement-checkbox"
            >
              <Checkbox>
                Tôi đã đọc và đồng ý với <Link to="/terms" className="agreement-link">Điều khoản dịch vụ</Link> và{" "}
                <Link to="/privacy" className="agreement-link">Chính sách bảo mật</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="register-button"
              >
                Tạo tài khoản
              </Button>
            </Form.Item>
          </Form>

          <Divider className="register-divider">Hoặc</Divider>

          <div className="register-footer">
            <Text type="secondary">Đã có tài khoản? </Text>
            <Link to="/login" className="login-link">Đăng nhập ngay</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;