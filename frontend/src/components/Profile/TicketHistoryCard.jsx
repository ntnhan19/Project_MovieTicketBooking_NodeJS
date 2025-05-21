import React, { useState, useEffect, useContext } from "react";
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
  notification,
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
import { ThemeContext } from "../../context/ThemeContext";

const { Option } = Select;

const TicketHistoryCard = () => {
  const { theme } = useContext(ThemeContext);
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
    let filtered = [...tickets];
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
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.status?.toLowerCase() === statusFilter
      );
    }
    setFilteredTickets(filtered);
  }, [searchText, tickets, statusFilter]);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const ticketsData = await ticketApi.getMyTickets();
      setTickets(ticketsData);
      setFilteredTickets(ticketsData);
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lấy lịch sử vé. Vui lòng thử lại!',
      });
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

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

  const renderStatus = (status) => {
    if (!status) return null;
    const statusMap = {
      confirmed: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      pending: {
        color: "yellow",
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
      <Tag
        className={`ant-tag-${statusInfo.color}`}
      >
        {statusInfo.icon} {statusInfo.text}
      </Tag>
    );
  };

  const handleViewTicketDetail = (ticketId) => {
    setSelectedTicketId(ticketId);
    setDetailModalVisible(true);
  };

  const handleDownloadTicket = (ticketId) => {
    handleViewTicketDetail(ticketId);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTicketId(null);
    fetchUserTickets();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

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

  const isShowtimePassed = (showtimeDate) => {
    if (!showtimeDate) return false;
    const now = new Date();
    const showtime = new Date(showtimeDate);
    return showtime < now;
  };

  const columns = [
    {
      title: "Phim",
      dataIndex: "showtime",
      key: "movie",
      render: (showtime, record) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary dark:text-dark-text-primary">
            {showtime?.movie?.title || "Không có tên phim"}
            {isShowtimePassed(showtime?.startTime) &&
              record.status?.toLowerCase() === "active" && (
                <Badge
                  count="Đã chiếu"
                  style={{ backgroundColor: "#52c41a" }}
                  className="ml-2 text-text-primary dark:text-dark-text-primary"
                />
              )}
          </span>
          <small className="text-text-secondary dark:text-dark-text-secondary flex items-center mt-1">
            <CalendarOutlined className="mr-1 text-gray-400 dark:text-gray-300" />{" "}
            {formatDate(showtime?.startTime)}
            <span className="mx-1 text-gray-400 dark:text-gray-300">|</span>
            <ClockCircleOutlined className="mr-1 text-gray-400 dark:text-gray-300" />{" "}
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
          <span className="text-text-primary dark:text-dark-text-primary">
            {showtime?.hall?.cinema?.name || "Không có tên rạp"}
          </span>
          {showtime?.hall && (
            <small className="text-text-secondary dark:text-dark-text-secondary flex items-center mt-1">
              <EnvironmentOutlined className="mr-1 text-gray-400 dark:text-gray-300" />{" "}
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
          <div className="text-text-primary dark:text-dark-text-primary">
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
          <Button 
            type="link" 
            className="p-0 ripple-btn text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          >
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
          <div className="flex items-center text-text-primary dark:text-dark-text-primary">
            <HistoryOutlined className="mr-2 text-red-500 dark:text-red-400" />
            <span className="font-medium">Lịch sử đặt vé</span>
          </div>
        }
        extra={
          <div className="flex space-x-2">
            <Input
              placeholder="Tìm kiếm theo phim/rạp"
              prefix={<SearchOutlined className="text-gray-400 dark:text-gray-300" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`form-input w-48 md:w-64 ${
                theme === 'dark' ? 'bg-gray-800 text-dark-text-primary' : 'bg-white text-text-primary'
              }`}
            />
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={handleStatusFilterChange}
              value={statusFilter}
              className={`booking-select ${
                theme === 'dark' ? 'bg-gray-800 text-dark-text-primary' : 'bg-white text-text-primary'
              }`}
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
                className={`ripple-btn transition-all ${
                  theme === 'dark'
                    ? 'border-gray-600 text-dark-text-secondary hover:bg-red-600 hover:text-white'
                    : 'border-gray-300 text-text-secondary hover:bg-red-500 hover:text-white'
                }`}
              />
            </Tooltip>
          </div>
        }
        className={`ticket-history-card content-card`}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredTickets}
            rowKey="id"
            className={`animate-fadeIn ${
              theme === 'dark' ? 'text-dark-text-primary' : 'text-text-primary'
            }`}
            rowClassName={`transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Bạn chưa có lịch sử đặt vé nào"
                  className={theme === 'dark' ? 'text-dark-text-secondary' : 'text-text-secondary'}
                />
              ),
            }}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} vé`,
              className: `pagination-custom ${theme === 'dark' ? 'text-white' : 'text-black'}`, // Đảm bảo màu text đúng
            }}
          />
        )}
      </Card>

      <TicketDetailModal
        visible={detailModalVisible}
        ticketId={selectedTicketId}
        onClose={handleCloseDetailModal}
      />
    </>
  );
};

export default TicketHistoryCard;