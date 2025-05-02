// frontend/src/pages/UserSettingsPage.jsx
import React, { useEffect, useState } from "react";
import { Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";

const UserSettingsPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="settings-container">
        <h2 className="page-title">Đổi mật khẩu</h2>
        <Form layout="vertical" className="change-password-form">
          <Form.Item label="Mật khẩu hiện tại">
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới">
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" className="change-password-button">Đổi mật khẩu</Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default UserSettingsPage;
