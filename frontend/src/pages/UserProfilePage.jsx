import React, { useState, useEffect } from "react";
import { Form, Input, Button, Tabs, Table, DatePicker } from "antd";
import { LockOutlined } from "@ant-design/icons";
import AppHeader from "../components/common/AppHeader.jsx";
import "../index.css";

const { TabPane } = Tabs;

const UserProfile = ({ user }) => {
  return (
    <Form layout="vertical" className="profile-form">
      <Form.Item label="Họ và tên">
        <Input value={user?.fullName || ""} disabled />
      </Form.Item>
      <Form.Item label="Email">
        <Input value={user?.email || ""} disabled />
      </Form.Item>
      <Form.Item label="Số điện thoại">
        <Input value={user?.phone || ""} disabled />
      </Form.Item>
      <Form.Item label="Ngày sinh">
        <DatePicker
          value={user?.dob || null}
          disabled
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Form>
  );
};

const TicketHistory = ({ tickets }) => {
  const columns = [
    { title: "Mã vé", dataIndex: "ticketId", key: "ticketId" },
    { title: "Phim", dataIndex: "movie", key: "movie" },
    { title: "Ngày xem", dataIndex: "date", key: "date" },
    { title: "Rạp", dataIndex: "cinema", key: "cinema" },
    { title: "Ghế", dataIndex: "seat", key: "seat" },
  ];

  return (
    <Table
      dataSource={tickets}
      columns={columns}
      pagination={{ pageSize: 5 }}
      className="ticket-table"
    />
  );
};

const ChangePassword = () => {
  return (
    <Form layout="vertical" className="change-password-form">
      <Form.Item label="Mật khẩu hiện tại">
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Nhập mật khẩu hiện tại"
        />
      </Form.Item>
      <Form.Item label="Mật khẩu mới">
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Nhập mật khẩu mới"
        />
      </Form.Item>
      <Form.Item label="Xác nhận mật khẩu mới">
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Xác nhận mật khẩu mới"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" className="change-password-button">
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  );
};

const UserProfilePage = () => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
    setTickets([
      {
        ticketId: "123456",
        movie: "Godzilla x Kong",
        date: "01/04/2025",
        cinema: "Cinestar Quốc Thanh",
        seat: "D5",
      },
      {
        ticketId: "789012",
        movie: "Dune: Part Two",
        date: "28/03/2025",
        cinema: "Cinestar Huế",
        seat: "A7",
      },
    ]);
  }, []);

  return (
    <div>
      {typeof setUser === "function" && (
        <AppHeader user={user} setUser={setUser} />
      )}
      <div className="profile-container">
        <Tabs defaultActiveKey="1" centered>
          <TabPane tab="Thông tin cá nhân" key="1">
            {user && <UserProfile user={user} />}
          </TabPane>
          <TabPane tab="Lịch sử đặt vé" key="2">
            <TicketHistory tickets={tickets} />
          </TabPane>
          <TabPane tab="Đổi mật khẩu" key="3">
            <ChangePassword />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;
