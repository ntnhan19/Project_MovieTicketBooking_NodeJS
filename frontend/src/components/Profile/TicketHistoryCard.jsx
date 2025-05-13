// frontend/src/components/Profile/TicketHistoryCard.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Empty,
  Tooltip,
  Input,
  Dropdown,
  Space,
  Skeleton,
  message,
  Badge,
  Select,
} from "antd";
import {
  HistoryOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { ticketApi } from "../../api/ticketApi";
import TicketDetailModal from "../Tickets/TicketDetailModal";

const { Option } = Select;

const TicketHistoryCard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUserTickets();
  }, []);

  useEffect(() => {
    // Lọc vé dựa trên từ khóa tìm kiếm và trạng thái
    let filtered = [...tickets];

    // Lọc theo từ khóa
    if (searchText) {
      filtered = filtered.filter(
        (ticket) =>
          (ticket.showtime?.movie?.title &&
            ticket.showtime.movie.title
              .toLowerCase()
              .includes(searchText.toLowerCase())) ||
          (ticket.showtime?.hall?.cinema?.name &&
            ticket.showtime.hall.cinema.name
              .toLowerCase()
              .includes(searchText.toLowerCase()))
      );
    }

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status?.toLowerCase() === statusFilter
      );
    }

    setFilteredTickets(filtered);
  }, [searchText, tickets, statusFilter]);

  // Hàm lấy vé của người dùng từ API
  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const ticketsData = await ticketApi.getMyTickets();
      console.log("Tickets data fetched:", ticketsData); // Debug: Kiểm tra dữ liệu vé
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
    } catch (error) {
      message.error("Không thể lấy lịch sử vé. Vui lòng thử lại!");
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date từ ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  // Format time từ ISO string
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Hàm chuyển đổi trạng thái của vé sang tag có màu
  const renderStatus = (status) => {
    if (!status) return null;

    const statusMap = {
      confirmed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      pending: {
        color: "gold",
        icon: <ClockCircleOutlined />,
        text: "Đang xử lý",
      },
      cancelled: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
      used: { color: "blue", icon: <HistoryOutlined />, text: "Đã sử dụng" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      color: "default",
      icon: null,
      text: status,
    };

    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  // Hàm xem chi tiết vé
  const handleViewTicketDetail = (ticketId) => {
    setSelectedTicketId(ticketId);
    setDetailModalVisible(true);
  };

  // Hàm tải vé
  const handleDownloadTicket = (ticketId) => {
    handleViewTicketDetail(ticketId);
    // Modal chi tiết vé có chức năng tải xuống
  };

  // Hàm đóng modal chi tiết vé
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTicketId(null);
    // Sau khi đóng modal, làm mới dữ liệu vé
    fetchUserTickets();
  };

  // Lọc theo trạng thái
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  // Menu items cho nút thao tác (thay thế getActionMenu cũ)
  const getActionMenuItems = (record) => {
    return {
      items: [
        {
          key: "1",
          icon: <EyeOutlined />,
          label: "Xem chi tiết",
          onClick: () => handleViewTicketDetail(record.id),
        },
        {
          key: "2",
          icon: <QrcodeOutlined />,
          label: "Mã QR vé",
          onClick: () => handleViewTicketDetail(record.id),
          disabled: record.status?.toLowerCase() === "cancelled",
        },
        {
          key: "3",
          icon: <FilePdfOutlined />,
          label: "Tải vé",
          onClick: () => handleDownloadTicket(record.id),
          disabled: record.status?.toLowerCase() === "cancelled",
        },
      ],
    };
  };

  // Kiểm tra xem showtime đã qua chưa
  const isShowtimePassed = (showtimeDate) => {
    if (!showtimeDate) return false;
    const now = new Date();
    const showtime = new Date(showtimeDate);
    return showtime < now;
  };

  // Định nghĩa các cột của bảng
  const columns = [
    {
      title: "Phim",
      dataIndex: "showtime",
      key: "movie",
      render: (showtime, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">
            {showtime?.movie?.title || "Không có tên phim"}
            {isShowtimePassed(showtime?.startTime) &&
              record.status?.toLowerCase() === "active" && (
                <Badge
                  count="Đã chiếu"
                  style={{ backgroundColor: "#52c41a" }}
                  className="ml-2"
                />
              )}
          </span>
          <small className="text-text-secondary flex items-center mt-1">
            <CalendarOutlined className="mr-1" />{" "}
            {formatDate(showtime?.startTime)}
            <span className="mx-1">|</span>
            <ClockCircleOutlined className="mr-1" />{" "}
            {formatTime(showtime?.startTime)}
          </small>
        </div>
      ),
    },
    {
      title: "Rạp",
      dataIndex: "showtime",
      key: "cinema",
      render: (showtime) => (
        <div className="flex flex-col">
          <span>{showtime?.hall?.cinema?.name || "Không có tên rạp"}</span>
          {showtime?.hall && (
            <small className="text-text-secondary flex items-center mt-1">
              <EnvironmentOutlined className="mr-1" />{" "}
              {showtime.hall.name || "Không có phòng"}
            </small>
          )}
        </div>
      ),
    },
    {
      title: "Ghế",
      dataIndex: "seat",
      key: "seat",
      render: (seat) => {
        if (!seat) return "-";

        const seatInfo = `${seat.row}${seat.column || seat.number}`;
        const seatType =
          seat.type === "VIP"
            ? " (VIP)"
            : seat.type === "STANDARD"
            ? " (Thường)"
            : seat.type === "COUPLE"
            ? " (Ghế đôi)"
            : "";

        return (
          <div>
            {seatInfo}
            {seatType}
          </div>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Dropdown menu={getActionMenuItems(record)} trigger={["click"]}>
          <Button type="link" className="p-0">
            <Space>
              Thao tác
              <DownloadOutlined />
            </Space>
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <Card
        title={
          <div className="flex items-center">
            <HistoryOutlined className="mr-2 text-primary" />
            <span>Lịch sử đặt vé</span>
          </div>
        }
        extra={
          <div className="flex space-x-2">
            <Input
              placeholder="Tìm kiếm theo phim/rạp"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-48 md:w-64"
            />
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={handleStatusFilterChange}
              value={statusFilter}
            >
              <Option value="all">Tất cả</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="used">Đã sử dụng</Option>
            </Select>
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUserTickets}
                loading={loading}
              />
            </Tooltip>
          </div>
        }
        className="content-card"
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTickets}
            rowKey="id"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bạn chưa có lịch sử đặt vé nào"
                />
              ),
            }}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} vé`,
            }}
          />
        )}
      </Card>

      {/* Modal chi tiết vé */}
      <TicketDetailModal
        visible={detailModalVisible}
        ticketId={selectedTicketId}
        onClose={handleCloseDetailModal}
      />
    </>
  );
};

export default TicketHistoryCard;
