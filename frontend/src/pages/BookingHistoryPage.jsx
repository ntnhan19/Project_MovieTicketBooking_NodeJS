import React, { useEffect, useState } from "react";
import { Table } from "antd";

const BookingHistoryPage = () => {
  const [user, setUser] = useState(null);
  const [tickets] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
    // Giữ tickets mày fetch riêng, không đụng vào
  }, []);

  const columns = [
    { title: "Mã vé", dataIndex: "ticketId", key: "ticketId" },
    { title: "Phim", dataIndex: "movie", key: "movie" },
    { title: "Ngày xem", dataIndex: "date", key: "date" },
    { title: "Rạp", dataIndex: "cinema", key: "cinema" },
    { title: "Ghế", dataIndex: "seat", key: "seat" },
  ];

  if (!user) return null;

  return (
    <>
      <div className="history-container">
        <h2 className="page-title">Lịch sử đặt vé</h2>
        <Table
          dataSource={tickets}
          columns={columns}
          pagination={{ pageSize: 5 }}
          className="history-table"
        />
      </div>
    </>
  );
};

export default BookingHistoryPage;
