// frontend/src/pages/EmailVerificationPage.jsx
import React, { useState, useEffect } from "react";
import { Result, Button, Spin, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const EmailVerificationPage = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          throw new Error("Token không hợp lệ");
        }
        
        console.log("Đang xác thực email với token:", token);
        const result = await authApi.verifyEmail(token);
        console.log("Kết quả xác thực:", result);
        
        setSuccess(true);
        
        // Nếu muốn hiển thị thông báo thành công
        // message.success(result.message || "Xác thực email thành công!");
      } catch (error) {
        console.error("Lỗi xác thực email:", error);
        setErrorMessage(
          error.response?.data?.error ||
            "Có lỗi xảy ra khi xác thực email của bạn."
        );
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setSuccess(false);
      setErrorMessage("Không tìm thấy mã xác thực email.");
    }
  }, [token]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Spin size="large" />
        <div className="mt-4 text-lg">Đang xác thực email của bạn...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Result
          status="success"
          title="Email đã được xác thực!"
          subTitle="Tài khoản của bạn đã được kích hoạt thành công. Bây giờ bạn có thể đăng nhập và sử dụng đầy đủ các tính năng của ứng dụng."
          extra={[
            <Button
              type="primary"
              key="login"
              onClick={() => navigate("/login")}
              size="large"
            >
              Đăng nhập ngay
            </Button>,
            <Button
              key="home"
              onClick={() => navigate("/")}
              size="large"
            >
              Về trang chủ
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Result
        status="error"
        title="Xác thực email thất bại"
        subTitle={errorMessage || "Liên kết xác thực không hợp lệ hoặc đã hết hạn."}
        extra={[
          <Alert
            key="alert"
            message="Bạn cần một liên kết xác thực mới?"
            description="Nếu liên kết đã hết hạn hoặc không hoạt động, bạn có thể đăng nhập và yêu cầu gửi lại email xác thực."
            type="info"
            showIcon
            className="mb-4"
          />,
          <Button
            type="primary"
            key="login"
            onClick={() => navigate("/login")}
            size="large"
          >
            Đến trang đăng nhập
          </Button>,
          <Button key="home" onClick={() => navigate("/")} size="large">
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
};

export default EmailVerificationPage;