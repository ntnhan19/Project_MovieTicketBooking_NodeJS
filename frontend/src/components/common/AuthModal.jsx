// frontend/src/components/common/AuthModal.jsx
import React from "react";
import { Modal, Tabs } from "antd";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../pages/LoginPage";
import RegisterForm from "../../pages/RegisterPage";

const AuthModal = () => {
  const { authModal, closeAuthModal } = useAuth();
  const { visible, activeTab } = authModal;

  return (
    <Modal
      title="Đăng Nhập / Đăng Ký"
      open={visible}
      onCancel={closeAuthModal}
      footer={null}
      className="auth-modal popup-animation"
      width={600}
      destroyOnClose={true}
    >
      <Tabs
        defaultActiveKey={activeTab}
        activeKey={activeTab}
        centered
        type="card"
        className="auth-tabs"
      >
        <Tabs.TabPane tab="Đăng Nhập" key="1">
          <LoginForm onSuccess={closeAuthModal} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Đăng Ký" key="2">
          <RegisterForm onSuccess={() => {}} />
        </Tabs.TabPane>
      </Tabs>
    </Modal>
  );
};

export default AuthModal;