import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { userApi } from "../api/userApi";
import { useNavigate, useParams } from "react-router-dom";

const { Title, Text } = Typography;

const ResetPasswordForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await userApi.verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setTokenValid(false);
    }
  }, [token]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await userApi.resetPassword(token, values.password);
      setResetSuccess(true);
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      form.setFields([
        {
          name: "password",
          errors: ["Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại."],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-sm w-full">
          <Title level={4} className="text-text-primary dark:text-dark-text-primary">
            Đang xác thực...
          </Title>
          <Text className="text-text-secondary dark:text-dark-text-secondary">
            Vui lòng đợi trong khi chúng tôi xác thực token của bạn.
          </Text>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
        <Result
          status="error"
          title="Liên kết không hợp lệ hoặc đã hết hạn"
          subTitle="Liên kết đặt lại mật khẩu bạn đã nhấp vào không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới."
          extra={[
            <Button
              type="primary"
              key="forgot-password"
              onClick={() => navigate("/forgot-password")}
              className="h-10 text-base font-medium rounded-lg btn-primary"
            >
              Yêu cầu liên kết mới
            </Button>,
            <Button
              key="login"
              onClick={() => navigate("/login")}
              className="h-10 text-base font-medium rounded-lg btn-outline"
            >
              Quay lại đăng nhập
            </Button>,
          ]}
          className="max-w-sm w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        />
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
        <Result
          status="success"
          title="Đặt lại mật khẩu thành công!"
          subTitle="Mật khẩu của bạn đã được thay đổi thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới."
          extra={
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              className="h-10 text-base font-medium rounded-lg btn-primary"
            >
              Đăng nhập ngay
            </Button>
          }
          className="max-w-sm w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center mb-4">
          <Title
            level={4}
            className="mb-1 text-text-primary dark:text-dark-text-primary"
          >
            Đặt lại mật khẩu
          </Title>
          <Text className="text-text-secondary dark:text-dark-text-secondary">
            Vui lòng nhập mật khẩu mới của bạn
          </Text>
        </div>

        <Form
          form={form}
          name="reset_password"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu mới"
              size="middle"
              className="rounded-lg h-10 border form-input"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
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
              placeholder="Xác nhận mật khẩu mới"
              size="middle"
              className="rounded-lg h-10 border form-input"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="middle"
              block
              loading={loading}
              className="h-10 text-base font-medium rounded-lg btn-primary"
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;