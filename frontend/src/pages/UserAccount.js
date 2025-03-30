import React, { useState, useEffect } from "react";
import { Form, Input, Button, Tabs, DatePicker, Checkbox } from "antd";
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  LockFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const { TabPane } = Tabs;

const UserProfilePage = ({ setUser }) => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleLogin = (values) => {
    localStorage.setItem("user", JSON.stringify(values.username));
    if (typeof setUser === "function") {
      setUser(values.username);
      navigate("/showtimes");
    } else {
      console.error("setUser is not a function");
    }
  };

  const handleRegister = (values) => {
    localStorage.setItem("user", JSON.stringify(values.username));
    if (typeof setUser === "function") {
      setUser(values.username);
      navigate("/showtimes");
    } else {
      console.error("setUser is not a function");
    }
  };

  return (
    <div className="auth-container">
      <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
        <TabPane tab="ĐĂNG NHẬP" key="login">
          <Form className="auth-form" onFinish={handleLogin}>
            <Form.Item name="username">
              <Input
                prefix={<UserOutlined />}
                placeholder="Tài khoản, Email hoặc số điện thoại"
              />
            </Form.Item>
            <Form.Item name="password">
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-button">
                ĐĂNG NHẬP
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="ĐĂNG KÝ" key="register">
          <Form className="auth-form" onFinish={handleRegister}>
            <Form.Item
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
            </Form.Item>
            <Form.Item
              name="dob"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker style={{ width: "100%" }} placeholder="Ngày sinh" />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>
            <Form.Item
              name="idCard"
              rules={[{ required: true, message: "Vui lòng nhập CCCD/CMND!" }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Số CCCD/CMND" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ!",
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
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
                prefix={<LockFilled />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>
            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                { required: true, message: "Bạn phải đồng ý với điều khoản!" },
              ]}
            >
              <Checkbox>
                Khách hàng đã đồng ý các điều khoản, điều kiện của thành viên
                Cinestar
              </Checkbox>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-button">
                ĐĂNG KÝ
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

const UserAccount = () => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <div>
      <Header user={user} setUser={setUser} />
      <UserProfilePage setUser={setUser} />
    </div>
  );
};

export default UserAccount;
