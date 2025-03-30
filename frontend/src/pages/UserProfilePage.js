import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Tabs } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "../index.css";

const { TabPane } = Tabs;

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState("login");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="container">
      <div className="auth-container">
        <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
          <TabPane
            tab={
              <span className={activeTab === "login" ? "active-tab" : ""}>
                ĐĂNG NHẬP
              </span>
            }
            key="login"
          >
            <Form className="auth-form">
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Vui lòng nhập tài khoản!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Tài khoản, Email hoặc số điện thoại"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>
              <Form.Item>
                <Checkbox>Lưu mật khẩu đăng nhập</Checkbox>
              </Form.Item>
              <Form.Item>
                <a href="/forgot-password" className="forgot-password">
                  Quên mật khẩu?
                </a>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="auth-button"
                >
                  ĐĂNG NHẬP
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane
            tab={
              <span className={activeTab === "register" ? "active-tab" : ""}>
                ĐĂNG KÝ
              </span>
            }
            key="register"
          >
            <Form className="auth-form">
              <Form.Item
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Email" />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="auth-button"
                >
                  ĐĂNG KÝ
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;
