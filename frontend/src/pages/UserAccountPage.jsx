//Frontend/src/pages/UserAccountPage.jsx
import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Tabs,
  DatePicker,
  Checkbox,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  LockFilled,
} from "@ant-design/icons";
import axios from "../api/axiosInstance";

const { TabPane } = Tabs;

const UserAccountPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (values) => {
    try {
      const res = await axios.post("/api/auth/login", {
        email: values.username,
        password: values.password,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      message.success("Đăng nhập thành công!");

      // Sau khi đăng nhập thành công, reload trang để main.jsx xử lý điều hướng dựa trên role
      window.location.href = user.role === "ADMIN" ? "/admin" : "/";
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi đăng nhập");
    }
  };

  const handleRegister = async (values) => {
    try {
      const newUser = {
        name: values.fullName,
        email: values.email,
        password: values.password,
        phone: values.phone,
        dob: values.dob.toISOString().split("T")[0],
      };

      const res = await axios.post("/api/auth/register", newUser);

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      message.success("Đăng ký thành công!");

      // Reload trang để main.jsx xử lý điều hướng dựa trên role
      window.location.href = user.role === "ADMIN" ? "/admin" : "/";
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi đăng ký");
    }
  };

  return (
    <div className="auth-container">
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
        <TabPane tab="ĐĂNG NHẬP" key="login">
          <Form className="auth-form" onFinish={handleLogin}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
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
            <Form.Item name="fullName" rules={[{ required: true, message: "Nhập họ tên!" }]}>
              <Input prefix={<UserOutlined />} placeholder="Họ tên" />
            </Form.Item>
            <Form.Item name="dob" rules={[{ required: true, message: "Chọn ngày sinh!" }]}>
              <DatePicker style={{ width: "100%" }} placeholder="Ngày sinh" />
            </Form.Item>
            <Form.Item name="phone" rules={[{ required: true, message: "Nhập số điện thoại!" }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>
            <Form.Item name="email" rules={[{ required: true, type: "email", message: "Email không hợp lệ!" }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: "Nhập mật khẩu!" }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return value === getFieldValue("password")
                      ? Promise.resolve()
                      : Promise.reject(new Error("Mật khẩu không khớp!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockFilled />} placeholder="Xác nhận mật khẩu" />
            </Form.Item>
            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error("Phải đồng ý điều khoản!")),
                },
              ]}
            >
              <Checkbox>Đồng ý điều khoản của DHL CINEMA</Checkbox>
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

export default UserAccountPage;