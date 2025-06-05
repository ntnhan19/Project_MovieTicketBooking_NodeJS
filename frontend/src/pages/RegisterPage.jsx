import React, { useState, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Checkbox,
  ConfigProvider,
  App,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const { Text, Title } = Typography;

const RegisterForm = ({ onLoginClick }) => {
  const { notification } = App.useApp();
  const { register } = useAuth();
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailSendError, setEmailSendError] = useState(null);

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
      Checkbox: {
        colorText: theme === "dark" ? "#d1d5db" : "#333333",
      },
      Alert: {
        borderRadius: 12,
      },
    },
  };

  // Hàm xử lý lỗi chi tiết theo backend response
  const handleRegistrationError = (error) => {
    console.error("Registration error:", error);

    // Kiểm tra lỗi network
    if (!error.response) {
      return {
        title: "Lỗi kết nối",
        description:
          "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối internet và thử lại.",
        type: "error",
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      };
    }

    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.error || errorResponse?.message;
    const errorType = errorResponse?.type;
    const statusCode = error.response?.status;
    const suggestion = errorResponse?.suggestion;

    // Xử lý theo type cụ thể từ backend
    switch (errorType) {
      case "VALIDATION_ERROR":
        return {
          title: "Thông tin không hợp lệ",
          description: errorMessage || "Vui lòng kiểm tra lại thông tin đã nhập",
          type: "error",
          icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        };

      case "EMAIL_EXISTS":
        return {
          title: "Email đã tồn tại",
          description: suggestion || "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn.",
          type: "warning",
          icon: <WarningOutlined style={{ color: "#faad14" }} />,
          fieldError: { field: "email", message: "Email này đã được đăng ký" },
          showLoginButton: true,
        };

      case "PHONE_EXISTS":
        return {
          title: "Số điện thoại đã tồn tại",
          description: suggestion || "Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.",
          type: "warning",
          icon: <WarningOutlined style={{ color: "#faad14" }} />,
          fieldError: {
            field: "phone",
            message: "Số điện thoại đã được sử dụng",
          },
        };

      case "SERVER_ERROR":
        return {
          title: "Lỗi máy chủ",
          description: "Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau ít phút.",
          type: "error",
          icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        };

      default:
        // Xử lý theo status code
        if (statusCode === 409) {
          if (errorMessage?.toLowerCase().includes("email")) {
            return {
              title: "Email đã tồn tại",
              description: suggestion || "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
              type: "warning",
              icon: <WarningOutlined style={{ color: "#faad14" }} />,
              fieldError: { field: "email", message: "Email này đã được đăng ký" },
              showLoginButton: true,
            };
          }

          if (errorMessage?.toLowerCase().includes("phone") || errorMessage?.toLowerCase().includes("điện thoại")) {
            return {
              title: "Số điện thoại đã tồn tại",
              description: suggestion || "Số điện thoại này đã được sử dụng. Vui lòng sử dụng số khác.",
              type: "warning",
              icon: <WarningOutlined style={{ color: "#faad14" }} />,
              fieldError: {
                field: "phone",
                message: "Số điện thoại đã được sử dụng",
              },
            };
          }
        }

        if (statusCode === 400) {
          return {
            title: "Dữ liệu không hợp lệ",
            description: errorMessage || "Vui lòng kiểm tra lại thông tin đã nhập",
            type: "error",
            icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
          };
        }

        if (statusCode >= 500) {
          return {
            title: "Lỗi máy chủ",
            description: "Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau.",
            type: "error",
            icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
          };
        }

        return {
          title: "Có lỗi xảy ra",
          description: errorMessage || "Không thể tạo tài khoản. Vui lòng thử lại sau.",
          type: "error",
          icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        };
    }
  };

  const onFinish = async (values) => {
    const key = `register-${Date.now()}`;

    // Kiểm tra mật khẩu
    if (values.password !== values.confirmPassword) {
      notification.error({
        key,
        message: "Mật khẩu không khớp",
        description: "Vui lòng kiểm tra lại mật khẩu xác nhận.",
        icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
        duration: 4,
      });
      return;
    }

    // Loading notification
    notification.open({
      key,
      message: "Đang xử lý",
      description: "Đang tạo tài khoản của bạn...",
      duration: 0,
      icon: (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      ),
    });

    try {
      setLoading(true);
      setEmailSendError(null);

      const { confirmPassword: _, agreement: __, ...userData } = values;
      const submitData = {
        ...userData,
        name: userData.fullName,
      };
      delete submitData.fullName;

      // Gọi register và kiểm tra kết quả
      const response = await register(submitData);

      // Kiểm tra response từ backend
      if (response && response.success === true) {
        // Đăng ký thành công
        setRegisteredEmail(values.email);
        setShowVerificationMsg(true);
        form.resetFields();

        // Kiểm tra trạng thái gửi email
        if (response.verificationEmailSent === false && response.emailError) {
          setEmailSendError({
            type: response.emailError.type,
            message: response.emailError.message,
            canResend: response.canResendEmail,
          });

          notification.warning({
            key,
            message: "Đăng ký thành công với cảnh báo",
            description: `Tài khoản đã được tạo nhưng ${response.emailError.message.toLowerCase()}. Bạn có thể yêu cầu gửi lại email xác thực.`,
            icon: <WarningOutlined style={{ color: "#faad14" }} />,
            duration: 8,
          });
        } else {
          notification.success({
            key,
            message: "Đăng ký thành công!",
            description: `Chúng tôi đã gửi email xác nhận đến ${values.email}. Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác nhận.`,
            icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
            duration: 6,
          });
        }
      } else if (response && response.success === false) {
        // Xử lý lỗi được trả về từ backend
        const errorInfo = handleRegistrationError({
          response: {
            data: {
              error: response.error,
              type: response.type || "UNKNOWN_ERROR",
              suggestion: response.suggestion,
            },
            status: response.status || 400,
          },
        });

        notification[errorInfo.type]({
          key,
          message: errorInfo.title,
          description: errorInfo.description,
          icon: errorInfo.icon,
          duration: errorInfo.showLoginButton ? 8 : 6,
          btn: errorInfo.showLoginButton ? (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                notification.destroy(key);
                onLoginClick && onLoginClick();
              }}
            >
              Đăng nhập ngay
            </Button>
          ) : null,
        });

        // Set field error nếu có
        if (errorInfo.fieldError) {
          form.setFields([
            {
              name: errorInfo.fieldError.field,
              errors: [errorInfo.fieldError.message],
            },
          ]);
        }
      } else {
        // Trường hợp không có response hoặc response không hợp lệ
        notification.error({
          key,
          message: "Lỗi không xác định",
          description: "Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.",
          icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
          duration: 6,
        });
      }
    } catch (error) {
      // Xử lý lỗi network hoặc lỗi không mong đợi
      const errorInfo = handleRegistrationError(error);

      notification[errorInfo.type]({
        key,
        message: errorInfo.title,
        description: errorInfo.description,
        icon: errorInfo.icon,
        duration: errorInfo.showLoginButton ? 8 : 6,
        btn: errorInfo.showLoginButton ? (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              notification.destroy(key);
              onLoginClick && onLoginClick();
            }}
          >
            Đăng nhập ngay
          </Button>
        ) : null,
      });

      // Set field error nếu có
      if (errorInfo.fieldError) {
        form.setFields([
          {
            name: errorInfo.fieldError.field,
            errors: [errorInfo.fieldError.message],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const key = `resendVerification-${Date.now()}`;

    notification.open({
      key,
      message: "Đang gửi email",
      description: "Đang gửi lại email xác nhận...",
      duration: 0,
      icon: (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      ),
    });

    try {
      const { authApi } = await import("../api/authApi");
      const result = await authApi.resendVerificationEmail(registeredEmail);

      if (result.success) {
        setEmailSendError(null);
        notification.success({
          key,
          message: "Đã gửi email thành công!",
          description: `Email xác thực đã được gửi lại tới ${registeredEmail}. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam).`,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          duration: 6,
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);

      const errorResponse = error.response?.data;
      const errorType = errorResponse?.type;
      let errorMessage = "Không thể gửi lại email xác thực. Vui lòng thử lại sau.";
      let notificationType = "error";
      let icon = <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;

      // Xử lý các loại lỗi cụ thể từ backend
      switch (errorType) {
        case "ALREADY_VERIFIED":
          errorMessage = "Tài khoản đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.";
          notificationType = "info";
          icon = <InfoCircleOutlined style={{ color: "#1890ff" }} />;
          break;

        case "USER_NOT_FOUND":
          errorMessage = "Email không tồn tại trong hệ thống.";
          break;

        case "RATE_LIMIT":
          const retryAfter = errorResponse?.retryAfter;
          errorMessage = retryAfter 
            ? `Vui lòng đợi ${retryAfter} giây trước khi gửi lại email`
            : "Gửi email quá nhanh, vui lòng thử lại sau";
          notificationType = "warning";
          icon = <WarningOutlined style={{ color: "#faad14" }} />;
          break;

        case "INVALID_EMAIL":
          errorMessage = "Địa chỉ email không hợp lệ.";
          break;

        case "EMAIL_NOT_EXISTS":
          errorMessage = "Địa chỉ email không tồn tại.";
          break;

        case "EMAIL_SEND_FAILED":
          errorMessage = errorResponse?.error || "Không thể gửi email xác thực. Vui lòng thử lại sau.";
          break;

        default:
          if (errorResponse?.error?.includes("đã được xác thực")) {
            errorMessage = "Tài khoản đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.";
            notificationType = "info";
            icon = <InfoCircleOutlined style={{ color: "#1890ff" }} />;
          }
      }

      notification[notificationType]({
        key,
        message: notificationType === "info" ? "Thông báo" : "Lỗi gửi email",
        description: errorMessage,
        icon: icon,
        duration: 6,
        btn: notificationType === "info" ? (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              notification.destroy(key);
              handleLoginClick();
            }}
          >
            Đăng nhập ngay
          </Button>
        ) : null,
      });
    }
  };

  const handleLoginClick = () => {
    setShowVerificationMsg(false);
    setEmailSendError(null);
    if (onLoginClick) onLoginClick();
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className={`mt-4 ${
          theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
        }`}
      >
        <div className="text-center mb-6">
          <Title
            level={3}
            className={`mb-2 ${
              theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
            }`}
          >
            Tạo tài khoản mới
          </Title>
          <Text
            className={`${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-text-secondary"
            }`}
          >
            Tham gia cùng chúng tôi để đặt vé xem phim dễ dàng
          </Text>
        </div>

        {showVerificationMsg ? (
          <div
            className={`p-6 rounded-lg border shadow-sm ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <div className="text-center mb-4">
              <CheckCircleOutlined
                className={`text-4xl mb-3 ${
                  theme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
              <Title
                level={4}
                className={`${
                  theme === "dark" ? "text-blue-400" : "text-blue-700"
                } mb-3`}
              >
                Kiểm tra email của bạn
              </Title>
            </div>

            <Text
              className={`text-center block mb-4 ${
                theme === "dark" ? "text-blue-300" : "text-blue-600"
              }`}
            >
              Chúng tôi đã gửi email xác nhận đến{" "}
              <strong>{registeredEmail}</strong>.<br />
              Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và nhấp vào
              liên kết xác nhận để kích hoạt tài khoản.
            </Text>

            {/* Hiển thị cảnh báo nếu có lỗi gửi email */}
            {emailSendError && (
              <Alert
                message="Lưu ý về email xác thực"
                description={`${emailSendError.message}. ${emailSendError.canResend ? 'Bạn có thể thử gửi lại email bên dưới.' : ''}`}
                type="warning"
                showIcon
                className="mb-4"
                icon={<WarningOutlined />}
              />
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
              <Text className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Lưu ý:</strong> Email có thể mất vài phút để được gửi
                đến. Nếu không thấy email, hãy kiểm tra thư mục spam.
              </Text>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="primary"
                onClick={handleResendVerification}
                className="btn-primary"
                icon={<MailOutlined />}
                disabled={emailSendError && !emailSendError.canResend}
              >
                Gửi lại email xác nhận
              </Button>
              <Button
                type="default"
                onClick={handleLoginClick}
                className={`${
                  theme === "dark"
                    ? "text-red-500 border-red-500 hover:bg-red-500/10"
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
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
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
                { max: 50, message: "Họ tên không được quá 50 ký tự!" },
                {
                  pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
                  message: "Họ tên chỉ được chứa chữ cái và khoảng trắng!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Họ và tên"
                size="large"
                className="rounded-lg h-12 form-input"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
                { max: 100, message: "Email không được quá 100 ký tự!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email"
                size="large"
                className="rounded-lg h-12 form-input"
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                  message:
                    "Số điện thoại phải có định dạng: 0xxxxxxxxx (10 số)!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Số điện thoại (VD: 0901234567)"
                size="large"
                className="rounded-lg h-12 form-input"
                maxLength={10}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                { max: 50, message: "Mật khẩu không được quá 50 ký tự!" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số!",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                size="large"
                className="rounded-lg h-12 form-input"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
                size="large"
                className="rounded-lg h-12 form-input"
                maxLength={50}
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
                <a
                  href="/terms"
                  target="_blank"
                  className={`${
                    theme === "dark"
                      ? "text-red-500 hover:text-red-400"
                      : "text-primary hover:text-primary-dark"
                  }`}
                >
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className={`${
                    theme === "dark"
                      ? "text-red-500 hover:text-red-400"
                      : "text-primary hover:text-primary-dark"
                  }`}
                >
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
                disabled={loading}
              >
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </Form.Item>
          </Form>
        )}

        {!showVerificationMsg && (
          <div className="text-center mt-6">
            <Text
              className={`text-sm ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-text-secondary"
              }`}
            >
              Đã có tài khoản?{" "}
            </Text>
            <a
              onClick={handleLoginClick}
              className={`text-sm font-medium transition-all cursor-pointer ${
                theme === "dark"
                  ? "text-red-500 hover:text-red-400"
                  : "text-primary hover:text-primary-dark"
              }`}
            >
              Đăng nhập ngay
            </a>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default () => (
  <App>
    <RegisterForm />
  </App>
);