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
  Modal,
  Statistic,
  Row,
  Col,
  DatePicker,
  Divider,
  Progress,
  Avatar,
  Typography,
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
  DeleteOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  StarOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { ticketApi } from "../../api/ticketApi";
import TicketDetailModal from "../Tickets/TicketDetailModal";
import { ThemeContext } from "../../context/ThemeContext";
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;
const { confirm } = Modal;

const TicketHistoryCard = () => {
  const { theme } = useContext(ThemeContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchUserTickets();
    fetchTicketStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchText, tickets, statusFilter, dateRange]);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (statusFilter !== "all") {
        filter.status = statusFilter.toUpperCase();
      }
      if (dateRange.length === 2) {
        filter.fromDate = dateRange[0].format('YYYY-MM-DD');
        filter.toDate = dateRange[1].format('YYYY-MM-DD');
      }

      const ticketsData = await ticketApi.getMyTickets(filter);
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

  const fetchTicketStats = async () => {
    try {
      const statsData = await ticketApi.getMyTicketStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];
    
    // Tìm kiếm theo tên phim hoặc rạp
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

    // Lọc theo khoảng thời gian
    if (dateRange.length === 2) {
      filtered = filtered.filter((ticket) => {
        const ticketDate = dayjs(ticket.showtime?.startTime);
        return ticketDate.isAfter(dateRange[0]) && ticketDate.isBefore(dateRange[1].add(1, 'day'));
      });
    }

    setFilteredTickets(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch {
      return "";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return dayjs(dateString).format('HH:mm');
    } catch {
      return "";
    }
  };

  const renderStatus = (status) => {
    if (!status) return null;
    const statusMap = {
      confirmed: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Đã xác nhận",
      },
      pending: {
        color: "warning",
        icon: <ClockCircleOutlined />,
        text: "Đang xử lý",
      },
      cancelled: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Đã hủy",
      },
      used: { 
        color: "processing", 
        icon: <HistoryOutlined />, 
        text: "Đã sử dụng" 
      },
    };
    const statusInfo = statusMap[status.toLowerCase()] || {
      color: "default",
      icon: null,
      text: status,
    };
    
    return (
      <Tag
        color={statusInfo.color}
        icon={statusInfo.icon}
        className="rounded-full px-3 py-1 font-medium"
      >
        {statusInfo.text}
      </Tag>
    );
  };

  const handleViewTicketDetail = (ticketId) => {
    setSelectedTicketId(ticketId);
    setDetailModalVisible(true);
  };

  const handleDownloadTicket = async (ticketId) => {
    try {
      await ticketApi.generateTicketQR(ticketId);
      handleViewTicketDetail(ticketId);
      notification.success({
        message: 'Thành công',
        description: 'Mã QR đã được tạo thành công!',
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể tạo mã QR vé!',
      });
    }
  };

  const handleCancelTicket = async (ticketId) => {
    try {
      // Kiểm tra xem có thể hủy vé không
      const canCancel = await ticketApi.canCancelTicket(ticketId);
      if (!canCancel.canCancel) {
        notification.warning({
          message: 'Không thể hủy vé',
          description: canCancel.reason || 'Vé không thể hủy tại thời điểm này',
        });
        return;
      }

      confirm({
        title: 'Xác nhận hủy vé',
        icon: <ExclamationCircleOutlined />,
        content: 'Bạn có chắc chắn muốn hủy vé này? Hành động này không thể hoàn tác.',
        okText: 'Hủy vé',
        okType: 'danger',
        cancelText: 'Không',
        onOk: async () => {
          try {
            await ticketApi.cancelTicket(ticketId);
            notification.success({
              message: 'Thành công',
              description: 'Vé đã được hủy thành công!',
            });
            fetchUserTickets();
          } catch (error) {
            notification.error({
              message: 'Lỗi',
              description: error.message || 'Không thể hủy vé!',
            });
          }
        },
      });
    } catch (error) {
      notification.error({
        message: 'Lỗi',
        description: error.message || 'Không thể kiểm tra trạng thái vé!',
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    confirm({
      title: 'Xác nhận xóa vé',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa vé này khỏi lịch sử? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Không',
      onOk: async () => {
        try {
          await ticketApi.deleteTicket(ticketId);
          notification.success({
            message: 'Thành công',
            description: 'Vé đã được xóa thành công!',
          });
          fetchUserTickets();
        } catch (error) {
          notification.error({
            message: 'Lỗi',
            description: error.message || 'Không thể xóa vé!',
          });
        }
      },
    });
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedTicketId(null);
    fetchUserTickets();
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange([]);
  };

  const isShowtimePassed = (showtimeDate) => {
    if (!showtimeDate) return false;
    return dayjs().isAfter(dayjs(showtimeDate));
  };

  const canCancelTicket = (ticket) => {
    if (!ticket || ticket.status?.toLowerCase() !== 'confirmed') return false;
    if (isShowtimePassed(ticket.showtime?.startTime)) return false;
    return dayjs(ticket.showtime?.startTime).diff(dayjs(), 'hours') >= 2;
  };

  const getActionMenuItems = (record) => {
    const items = [
      {
        key: "1",
        icon: <EyeOutlined />,
        label: "Xem chi tiết",
        onClick: () => handleViewTicketDetail(record.id),
      },
    ];

    if (record.status?.toLowerCase() !== "cancelled") {
      items.push({
        key: "2",
        icon: <QrcodeOutlined />,
        label: "Mã QR vé",
        onClick: () => handleDownloadTicket(record.id),
      });
    }

    if (canCancelTicket(record)) {
      items.push({
        key: "3",
        icon: <CloseCircleOutlined />,
        label: "Hủy vé",
        onClick: () => handleCancelTicket(record.id),
        danger: true,
      });
    }

    if (record.status?.toLowerCase() === "cancelled") {
      items.push({
        key: "4",
        icon: <DeleteOutlined />,
        label: "Xóa khỏi lịch sử",
        onClick: () => handleDeleteTicket(record.id),
        danger: true,
      });
    }

    return { items };
  };

  const getMovieGenre = (movie) => {
    if (!movie?.genre) return "";
    return movie.genre.length > 15 ? `${movie.genre.substring(0, 15)}...` : movie.genre;
  };

  const columns = [
    {
      title: (
        <div className="flex items-center font-semibold">
          <StarOutlined className="mr-2 text-yellow-500" />
          Thông tin phim
        </div>
      ),
      dataIndex: "showtime",
      key: "movie",
      width: "35%",
      render: (showtime, record) => (
        <div className="flex items-start space-x-3">
          {showtime?.movie?.posterUrl && (
            <Avatar
              src={showtime.movie.posterUrl}
              size={64}
              shape="square"
              className="rounded-lg shadow-md"
            />
          )}
          <div className="flex-1">
            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {showtime?.movie?.title || "Không có tên phim"}
              {isShowtimePassed(showtime?.startTime) &&
                record.status?.toLowerCase() === "confirmed" && (
                  <Badge
                    count="Đã chiếu"
                    style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
                  />
                )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {getMovieGenre(showtime?.movie)} • {showtime?.movie?.duration}p
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <CalendarOutlined className="mr-1" />
              {formatDate(showtime?.startTime)}
              <Divider type="vertical" />
              <ClockCircleOutlined className="mr-1" />
              {formatTime(showtime?.startTime)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center font-semibold">
          <EnvironmentOutlined className="mr-2 text-blue-500" />
          Rạp & Ghế
        </div>
      ),
      key: "cinema_seat",
      width: "25%",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
            {record.showtime?.hall?.cinema?.name || "Không có tên rạp"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {record.showtime?.hall?.name || "Không có phòng"}
          </div>
          {record.seat && (
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full px-3 py-1">
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {record.seat.row}{record.seat.column || record.seat.number}
              </span>
              {record.seat.type && (
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                  {record.seat.type === "VIP" ? "VIP" : 
                   record.seat.type === "COUPLE" ? "Đôi" : "Thường"}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center font-semibold">
          <TrophyOutlined className="mr-2 text-green-500" />
          Trạng thái
        </div>
      ),
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: renderStatus,
    },
    {
      title: (
        <div className="flex items-center font-semibold">
          <ThunderboltOutlined className="mr-2 text-red-500" />
          Thao tác
        </div>
      ),
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Dropdown menu={getActionMenuItems(record)} trigger={["click"]} placement="bottomRight">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="primary"
              size="small"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-none shadow-md"
            >
              <Space>
                Thao tác
                <DownloadOutlined />
              </Space>
            </Button>
          </motion.div>
        </Dropdown>
      ),
    },
  ];

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className={`text-center shadow-md rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
            <Statistic
              title="Tổng vé"
              value={stats.totalTickets || 0}
              prefix={<HistoryOutlined className="text-blue-500" />}
              valueStyle={{ color: theme === 'dark' ? '#fff' : '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`text-center shadow-md rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmedTickets || 0}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: theme === 'dark' ? '#fff' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`text-center shadow-md rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
            <Statistic
              title="Đã sử dụng"
              value={stats.usedTickets || 0}
              prefix={<HeartOutlined className="text-purple-500" />}
              valueStyle={{ color: theme === 'dark' ? '#fff' : '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className={`text-center shadow-md rounded-xl ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white'}`}>
            <Statistic
              title="Đã hủy"
              value={stats.cancelledTickets || 0}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: theme === 'dark' ? '#fff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {renderStatsCards()}
        
        <Card
          title={
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg mr-3">
                <HistoryOutlined className="text-white text-lg" />
              </div>
              <div>
                <Title level={4} className="mb-0 text-gray-800 dark:text-white">
                  Lịch sử đặt vé
                </Title>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">
                  Quản lý và theo dõi các vé đã đặt
                </Text>
              </div>
            </div>
          }
          extra={
            <Space wrap>
              <Input
                placeholder="Tìm kiếm theo phim/rạp"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-48 rounded-lg"
                allowClear
              />
              
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterVisible(!filterVisible)}
                className={`rounded-lg ${filterVisible ? 'bg-blue-500 text-white' : ''}`}
              >
                Bộ lọc
              </Button>

              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUserTickets}
                  loading={loading}
                  className="rounded-lg"
                />
              </Tooltip>
            </Space>
          }
          className={`rounded-2xl shadow-lg border-0 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <AnimatePresence>
            {filterVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <Text strong className="block mb-2">Trạng thái:</Text>
                    <Select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="w-full"
                      placeholder="Chọn trạng thái"
                    >
                      <Option value="all">Tất cả</Option>
                      <Option value="confirmed">Đã xác nhận</Option>
                      <Option value="pending">Đang xử lý</Option>
                      <Option value="cancelled">Đã hủy</Option>
                      <Option value="used">Đã sử dụng</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong className="block mb-2">Khoảng thời gian:</Text>
                    <RangePicker
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      className="w-full"
                      placeholder={['Từ ngày', 'Đến ngày']}
                      format="DD/MM/YYYY"
                    />
                  </Col>
                  <Col xs={24} sm={8}>
                    <Text strong className="block mb-2">Hiển thị:</Text>
                    <Select
                      value={pageSize}
                      onChange={setPageSize}
                      className="w-full"
                    >
                      <Option value={5}>5 vé/trang</Option>
                      <Option value={10}>10 vé/trang</Option>
                      <Option value={20}>20 vé/trang</Option>
                      <Option value={50}>50 vé/trang</Option>
                    </Select>
                  </Col>
                </Row>
                <div className="mt-4 text-right">
                  <Button onClick={clearFilters} size="small">
                    Xóa bộ lọc
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Table
                columns={columns}
                dataSource={filteredTickets}
                rowKey="id"
                className={`ticket-history-table ${
                  theme === 'dark' ? 'dark-table' : ''
                }`}
                rowClassName="hover:shadow-md transition-all duration-200"
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="text-center">
                          <Text className="text-gray-500 dark:text-gray-400">
                            Bạn chưa có lịch sử đặt vé nào
                          </Text>
                          <br />
                          <Text className="text-gray-400 dark:text-gray-500 text-sm">
                            Hãy đặt vé xem phim đầu tiên của bạn!
                          </Text>
                        </div>
                      }
                    />
                  ),
                }}
                pagination={{
                  pageSize: pageSize,
                  showSizeChanger: false,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} vé`,
                  showQuickJumper: true,
                  className: "text-center mt-6",
                }}
                scroll={{ x: 800 }}
              />
              
              {filteredTickets.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text className="text-gray-600 dark:text-gray-400">
                        Tổng số vé: <strong>{filteredTickets.length}</strong>
                      </Text>
                    </Col>
                    <Col span={12} className="text-right">
                      <Text className="text-gray-600 dark:text-gray-400">
                        Đã lọc từ: <strong>{tickets.length}</strong> vé
                      </Text>
                    </Col>
                  </Row>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>

      <TicketDetailModal
        visible={detailModalVisible}
        ticketId={selectedTicketId}
        onClose={handleCloseDetailModal}
      />
    </>
  );
};

export default TicketHistoryCard;