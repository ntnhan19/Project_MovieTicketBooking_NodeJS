// frontend/src/components/common/AuthModal.jsx
import React from "react";
import { Modal, Tabs } from "antd";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../pages/LoginPage";
import RegisterForm from "../../pages/RegisterPage";

const AuthModal = () => {
  const { authModal, closeAuthModal, switchAuthTab } = useAuth();
  const { visible, activeTab } = authModal;

  // Xử lý khi chuyển tab
  const handleTabChange = (activeKey) => {
    switchAuthTab(activeKey);
  };

  // Xử lý khi đăng nhập thành công
  const handleLoginSuccess = () => {
    closeAuthModal();
  };

  // Xử lý khi đăng ký thành công (chuyển sang tab đăng nhập)
  const handleRegisterSuccess = () => {
    switchAuthTab('1');
  };

  // Xử lý khi muốn chuyển từ đăng nhập sang đăng ký
  const handleSwitchToRegister = () => {
    switchAuthTab('2');
  };

  // Xử lý khi muốn chuyển từ đăng ký sang đăng nhập
  const handleSwitchToLogin = () => {
    switchAuthTab('1');
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={closeAuthModal}
      footer={null}
      className="auth-modal"
      width={450}
      destroyOnClose={true}
      centered
      styles={{ body: { padding: '24px' } }}
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
  );
};

export default AuthModal;