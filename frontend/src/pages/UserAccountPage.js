import React, { useState, useEffect } from "react";
import { Form, Input, Button, Tabs, DatePicker, Checkbox, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  LockFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const UserAccountPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  // Thêm user mẫu khi load lần đầu
  useEffect(() => {
    const existingUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];

    if (existingUsers.length === 0) {
      const sampleUsers = [
        {
          username: "admin",
          password: "123456",
          fullName: "Quản trị viên",
          email: "admin@example.com",
        },
        {
          username: "user1",
          password: "111111",
          fullName: "Người dùng 1",
          email: "user1@example.com",
        },
      ];
      localStorage.setItem("registeredUsers", JSON.stringify(sampleUsers));
    }
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleLogin = (values) => {
    const userList = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const foundUser = userList.find(
      (u) => u.username === values.username && u.password === values.password
    );

    if (foundUser) {
      const loggedInUser = {
        username: foundUser.username,
        fullName: foundUser.fullName,
        token: "fake-jwt-token",
      };
      localStorage.setItem("user", JSON.stringify(loggedInUser)); // Lưu thông tin người dùng vào localStorage
      message.success("Đăng nhập thành công!");
      navigate("/showtimes");
    } else {
      message.error("Thông tin đăng nhập không đúng!");
    }
  };

  const handleRegister = (values) => {
    const newUser = {
      username: values.username,
      fullName: values.fullName,
      dob: values.dob?.format("DD/MM/YYYY"),
      email: values.email,
      phone: values.phone,
      idCard: values.idCard,
      password: values.password,
    };

    const users = JSON.parse(localStorage.getItem("registeredUsers")) || [];

    // Kiểm tra tài khoản đã tồn tại
    const exists = users.some((u) => u.username === newUser.username);
    if (exists) {
      message.error("Tên đăng nhập đã tồn tại!");
      return;
    }

    users.push(newUser);
    localStorage.setItem("registeredUsers", JSON.stringify(users));
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: newUser.username,
        fullName: newUser.fullName,
        token: "fake-jwt-token",
      })
    );
    message.success("Đăng ký thành công!");
    navigate("/showtimes");
  };

  return (
    <div className="auth-container">
      <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
        <TabPane tab="ĐĂNG NHẬP" key="login">
          <Form className="auth-form" onFinish={handleLogin}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập tài khoản!" }]}
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
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng xác nhận mật khẩu!",
                },
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
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Bạn phải đồng ý với điều khoản!")
                        ),
                },
              ]}
            >
              <Checkbox>
                Khách hàng đã đồng ý các điều khoản, điều kiện của DHL CINEMA
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

export default UserAccountPage;
