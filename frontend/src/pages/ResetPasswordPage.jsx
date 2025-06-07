import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Typography, Result, ConfigProvider, notification, Progress } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { userApi } from "../api/userApi";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

const { Title, Text } = Typography;

const ResetPasswordForm = () => {
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationCriteria, setValidationCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  
  const { token } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await userApi.verifyResetToken(token);
        setTokenValid(true);
      } catch (error) {
        console.error("Token không hợp lệ:", error);
        setTokenValid(false);
        notification.error({
          message: "Token không hợp lệ",
          description: "Liên kết đặt lại mật khẩu đã hết hạn hoặc không đúng.",
          duration: 5,
          placement: "topRight",
        });
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

  // Kiểm tra độ mạnh của mật khẩu
  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };

    setValidationCriteria(criteria);

    // Tính toán độ mạnh (0-100)
    const metCriteria = Object.values(criteria).filter(Boolean).length;
    const strength = (metCriteria / 4) * 100;
    setPasswordStrength(strength);

    return criteria;
  };

  // Xử lý thay đổi mật khẩu
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  // Lấy màu của thanh progress
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ff4d4f";
    if (passwordStrength < 80) return "#faad14";
    return "#52c41a";
  };

  // Lấy text mô tả độ mạnh
  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 80) return "Trung bình";
    return "Mạnh";
  };

  // Validation rule cho mật khẩu
  const passwordValidator = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập mật khẩu mới!"));
    }

    const criteria = checkPasswordStrength(value);
    const unmetCriteria = [];

    if (!criteria.length) unmetCriteria.push("ít nhất 8 ký tự");
    if (!criteria.uppercase) unmetCriteria.push("1 chữ hoa");
    if (!criteria.lowercase) unmetCriteria.push("1 chữ thường");
    if (!criteria.number) unmetCriteria.push("1 chữ số");

    if (unmetCriteria.length > 0) {
      return Promise.reject(
        new Error(`Mật khẩu phải có ${unmetCriteria.join(", ")}`)
      );
    }

    return Promise.resolve();
  };

  const onFinish = async (values) => {
    const notificationKey = `resetPassword-${Date.now()}`;
    
    // Hiển thị loading notification
    notification.info({
      key: notificationKey,
      message: "Đang xử lý",
      description: "Đang đặt lại mật khẩu...",
      duration: 0,
      placement: "topRight",
    });

    try {
      setLoading(true);
      await userApi.resetPassword(token, values.password);
      
      notification.success({
        key: notificationKey,
        message: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu của bạn đã được thay đổi thành công.",
        duration: 5,
        placement: "topRight",
      });
      
      setResetSuccess(true);
    } catch (error) {
      console.error("Lỗi đặt lại mật khẩu:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.";
      
      notification.error({
        key: notificationKey,
        message: "Đặt lại mật khẩu thất bại",
        description: errorMessage,
        duration: 5,
        placement: "topRight",
      });

      form.setFields([
        {
          name: "password",
          errors: [errorMessage],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className={`text-center p-8 rounded-xl shadow-xl max-w-sm w-full ${
          theme === "dark" 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-200"
        }`}>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockOutlined className="text-2xl text-blue-600" />
          </div>
          <Title level={4} className={theme === "dark" ? "text-white" : "text-gray-900"}>
            Đang xác thực...
          </Title>
          <Text className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Vui lòng đợi trong khi chúng tôi xác thực token của bạn.
          </Text>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className={`max-w-md mx-auto p-8 rounded-xl shadow-xl ${
            theme === "dark" 
              ? "bg-gray-800 border border-gray-700" 
              : "bg-white border border-gray-200"
          }`}>
            <Result
              status="error"
              title={
                <Title level={3} className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Liên kết không hợp lệ hoặc đã hết hạn
                </Title>
              }
              subTitle={
                <Text className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  Liên kết đặt lại mật khẩu bạn đã nhấp vào không hợp lệ hoặc đã hết hạn. 
                  Vui lòng yêu cầu liên kết mới.
                </Text>
              }
              extra={[
                <Button
                  type="primary"
                  key="forgot-password"
                  onClick={() => navigate("/forgot-password")}
                  className="h-12 text-base font-medium"
                  size="large"
                >
                  Yêu cầu liên kết mới
                </Button>,
                <Button
                  key="login"
                  onClick={() => navigate("/login")}
                  className="h-12 text-base font-medium"
                  size="large"
                >
                  Quay lại đăng nhập
                </Button>,
              ]}
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }

  if (resetSuccess) {
    return (
      <ConfigProvider theme={antdTheme}>
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className={`max-w-md mx-auto p-8 rounded-xl shadow-xl ${
            theme === "dark" 
              ? "bg-gray-800 border border-gray-700" 
              : "bg-white border border-gray-200"
          }`}>
            <Result
              status="success"
              title={
                <Title level={3} className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Đặt lại mật khẩu thành công!
                </Title>
              }
              subTitle={
                <Text className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                  Mật khẩu của bạn đã được thay đổi thành công. 
                  Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                </Text>
              }
              extra={
                <Button
                  type="primary"
                  onClick={() => navigate("/login")}
                  className="h-12 text-base font-medium"
                  size="large"
                >
                  Đăng nhập ngay
                </Button>
              }
            />
          </div>
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className={`w-full max-w-md p-8 rounded-xl shadow-xl ${
          theme === "dark" 
            ? "bg-gray-800 border border-gray-700" 
            : "bg-white border border-gray-200"
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LockOutlined className="text-2xl text-red-600" />
            </div>
            
            <Title 
              level={2} 
              className={`mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              Đặt lại mật khẩu
            </Title>
            
            <Text className={`text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              Vui lòng nhập mật khẩu mới của bạn
            </Text>
          </div>

          <Form
            form={form}
            name="reset_password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="space-y-4"
          >
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[{ validator: passwordValidator }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu mới"
                className="h-12"
                onChange={handlePasswordChange}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="new-password"
              />
            </Form.Item>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Text className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Độ mạnh mật khẩu
                  </Text>
                  <Text 
                    className="text-sm font-medium"
                    style={{ color: getStrengthColor() }}
                  >
                    {getStrengthText()}
                  </Text>
                </div>
                <Progress
                  percent={passwordStrength}
                  strokeColor={getStrengthColor()}
                  showInfo={false}
                  size="small"
                />
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div className={`p-4 rounded-lg mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}>
                <Text className={`text-sm font-medium mb-2 block ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}>
                  Yêu cầu mật khẩu:
                </Text>
                <div className="space-y-1">
                  {[
                    { key: 'length', text: 'Ít nhất 8 ký tự' },
                    { key: 'uppercase', text: '1 chữ hoa (A-Z)' },
                    { key: 'lowercase', text: '1 chữ thường (a-z)' },
                    { key: 'number', text: '1 chữ số (0-9)' },
                  ].map(({ key, text }) => (
                    <div key={key} className="flex items-center text-sm">
                      {validationCriteria[key] ? (
                        <CheckCircleOutlined className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleOutlined className="text-red-500 mr-2" />
                      )}
                      <span className={
                        validationCriteria[key]
                          ? "text-green-600 dark:text-green-400"
                          : theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }>
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập lại mật khẩu mới"
                className="h-12"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                autoComplete="new-password"
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
                disabled={passwordStrength < 100}
              >
                {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
            </Form.Item>
          </Form>

          {/* Security tip */}
          <div className={`mt-6 p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}>
            <Text className={`text-sm ${theme === "dark" ? "text-blue-300" : "text-blue-700"}`}>
              🔒 <strong>Bảo mật:</strong> Mật khẩu mạnh sẽ giúp bảo vệ tài khoản của bạn khỏi các mối đe dọa.
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ResetPasswordForm;