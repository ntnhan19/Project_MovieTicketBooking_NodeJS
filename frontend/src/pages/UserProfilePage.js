import React from "react";
import { Card, Avatar, List } from "antd";
import { UserOutlined } from "@ant-design/icons";

const user = {
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0123-456-789",
  tickets: [
    {
      movie: "Avengers: Endgame",
      date: "2024-03-15",
      seat: "A12",
      price: 50000,
    },
    { movie: "The Batman", date: "2024-03-18", seat: "B07", price: 50000 },
    {
      movie: "Doctor Strange 2",
      date: "2024-03-20",
      seat: "C03",
      price: 50000,
    },
  ],
};

const UserProfilePage = () => {
  return (
    <div className="flex flex-col items-center p-10">
      <Card className="max-w-lg w-full text-center">
        <Avatar size={100} icon={<UserOutlined />} />
        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Điện thoại: {user.phone}</p>
      </Card>

      <h3 className="text-xl font-bold mt-8">Lịch sử đặt vé</h3>
      <List
        className="max-w-lg w-full mt-4"
        bordered
        dataSource={user.tickets}
        renderItem={(ticket) => (
          <List.Item>
            🎬 {ticket.movie} - {ticket.date} - Ghế: {ticket.seat} - 💰{" "}
            {ticket.price} VND
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserProfilePage;
