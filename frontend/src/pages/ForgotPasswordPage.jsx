import React, { useState } from "react";
import { Form, Input, Button, Typography, Result, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { userApi } from "../api/userApi";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const ForgotPasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await userApi.forgotPassword(values.email);
      setUserEmail(values.email);
      setEmailSent(true);
    } catch (error) {
      console.error("Lỗi quên mật khẩu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      await userApi.forgotPassword(userEmail);
      // Hiển thị thông báo thành công
      message.success("Email đặt lại mật khẩu đã được gửi lại!");
    } catch (error) {
      console.error("Lỗi gửi lại email:", error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
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
          <Button type="primary" key="login" onClick={() => navigate("/login")}>
            Quay lại đăng nhập
          </Button>,
          <Button key="resend" onClick={handleResendEmail} loading={loading}>
            Gửi lại email
          </Button>,
        ]}
      />
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <Title level={3} className="mb-2 text-text-primary">
          Quên mật khẩu
        </Title>
        <Text className="text-text-secondary">
          Vui lòng nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
        </Text>
      </div>

      <Form
        form={form}
        name="forgot_password"
        onFinish={onFinish}
        layout="vertical"
        className="mt-6"
      >
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
          onClick={() => navigate("/login")}
          className="text-primary"
        >
          Quay lại đăng nhập
        </Button>
      </div>
    </>
  );
};

export default ForgotPasswordForm;