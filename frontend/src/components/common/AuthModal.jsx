import React, { useContext } from "react";
import { Modal, Tabs, ConfigProvider } from "antd";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../pages/LoginPage";
import RegisterForm from "../../pages/RegisterPage";
import ForgotPasswordForm from "../../pages/ForgotPasswordPage";
import { ThemeContext } from "../../context/ThemeContext";

const AuthModal = () => {
  const { authModal, closeAuthModal, switchAuthTab, forgotPasswordModal, closeForgotPasswordModal, openForgotPasswordModal } = useAuth();
  const { visible, activeTab } = authModal;
  const { theme } = useContext(ThemeContext);

  const antdTheme = {
    token: {
      colorPrimary: '#e71a0f',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      colorBgContainer: theme === 'dark' ? '#1f2a44' : '#ffffff',
      colorText: theme === 'dark' ? '#d1d5db' : '#333333',
      colorTextSecondary: theme === 'dark' ? '#d1d5db' : '#666666',
      colorBorder: theme === 'dark' ? '#374151' : 'rgba(0, 0, 0, 0.1)',
    },
  };

  const modalStyles = {
    content: {
      background: theme === 'dark' ? '#1f2a44' : '#ffffff',
      border: theme === 'dark' ? '1px solid #374151' : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      boxShadow: theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'none',
    },
    body: {
      padding: '16px',
      background: theme === 'dark' ? '#1f2a44' : '#ffffff',
    },
  };

  const handleTabChange = (activeKey) => {
    switchAuthTab(activeKey);
  };

  const handleLoginSuccess = () => {
    closeAuthModal();
  };

  const handleRegisterSuccess = () => {
    switchAuthTab('1');
  };

  const handleSwitchToRegister = () => {
    switchAuthTab('2');
  };

  const handleSwitchToLogin = () => {
    switchAuthTab('1');
  };

  const handleSwitchToForgotPassword = () => {
    openForgotPasswordModal();
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <style>
        {`
          .ant-modal {
            background: ${theme === 'dark' ? '#1f2a44' : 'transparent'} !important;
          }
          .ant-modal-content {
            background: ${theme === 'dark' ? '#1f2a44' : '#ffffff'} !important;
            border: ${theme === 'dark' ? '1px solid #374151' : '1px solid rgba(0, 0, 0, 0.1)'} !important;
            border-radius: 12px !important;
            box-shadow: ${theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.1)'} !important;
          }
          .ant-modal-body {
            background: ${theme === 'dark' ? '#1f2a44' : '#ffffff'} !important;
          }
        `}
      </style>

      {/* Modal Đăng nhập/Đăng ký */}
      <Modal
        title={null}
        open={visible}
        onCancel={closeAuthModal}
        footer={null}
        className="auth-modal"
        width={450}
        destroyOnHidden={true}
        centered
        styles={modalStyles}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          items={[
            {
              key: '1',
              label: 'Đăng Nhập',
              children: (
                <LoginForm
                  onRegisterClick={handleSwitchToRegister}
                  onLoginSuccess={handleLoginSuccess}
                  onForgotPasswordClick={handleSwitchToForgotPassword}
                  isModal={true}
                />
              ),
            },
            {
              key: '2',
              label: 'Đăng Ký',
              children: (
                <RegisterForm
                  onLoginClick={handleSwitchToLogin}
                  onRegisterSuccess={handleRegisterSuccess}
                  isModal={true}
                />
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal Quên mật khẩu */}
      <Modal
        title={null}
        open={forgotPasswordModal.visible}
        onCancel={closeForgotPasswordModal}
        footer={null}
        className="auth-modal"
        width={450}
        destroyOnHidden={true}
        centered
        styles={modalStyles}
      >
        <ForgotPasswordForm
          onLoginClick={handleSwitchToLogin}
          isModal={true}
        />
      </Modal>
    </ConfigProvider>
  );
};

export default AuthModal;