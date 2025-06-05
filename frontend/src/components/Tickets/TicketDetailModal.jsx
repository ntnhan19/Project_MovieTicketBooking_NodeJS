import React, { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Button,
  Row,
  Col,
  Spin,
  Tag,
  Alert,
  Typography,
  Space,
  Card,
  Image,
  List,
  Tooltip,
  Divider,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  TagOutlined,
  DownloadOutlined,
  StarOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  GiftOutlined,
  HomeOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ticketApi } from "../../api/ticketApi";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const TicketDetailModal = ({ visible, ticketId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    if (visible && ticketId) {
      fetchTicketDetails();
    } else {
      setQrCodeData("");
      setTicket(null);
      setError(null);
    }
  }, [visible, ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ticketApi.getTicketWithFullDetails(ticketId);
      let ticketData;

      // Xử lý response linh hoạt
      if (response.success && response.data) {
        ticketData = response.data;
      } else if (response.data) {
        ticketData = response.data;
      } else {
        ticketData = response;
      }

      // Log dữ liệu concession để kiểm tra
      console.log("Concession Orders:", ticketData.concessionOrders);

      setTicket(ticketData);
      generateQRCode(ticketData);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin vé. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (ticketData) => {
    if (!ticketData || !ticketData.id) return;

    setLoadingQR(true);
    try {
      generateOptimizedQRCode(ticketData);
    } catch (error) {
      console.error("Lỗi khi tạo QR code:", error);
      generateOptimizedQRCode(ticketData);
    } finally {
      setLoadingQR(false);
    }
  };

  const generateOptimizedQRCode = (ticketData) => {
    if (!ticketData) return;

    try {
      const essentialData = {
        id: ticketData.id,
        code: ticketData.verificationCode || ticketData.id,
        seat: `${ticketData.seat?.row || ""}${ticketData.seat?.column || ""}`,
        status: ticketData.status?.substring(0, 10) || "confirmed",
        showtime: ticketData.showtime?.startTime
          ? new Date(ticketData.showtime.startTime).getTime()
          : null,
      };

      const compactQRString = [
        essentialData.id,
        essentialData.code,
        essentialData.seat,
        essentialData.status,
        essentialData.showtime,
      ]
        .filter((item) => item !== null)
        .join("|");

      setQrCodeData(compactQRString);
    } catch (error) {
      console.error("Lỗi khi tạo QR code tối ưu:", error);
      setQrCodeData(ticketData.id?.toString() || "TICKET");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const renderStatus = (status) => {
    if (!status) return null;

    const statusMap = {
      confirmed: {
        color: "success",
        text: "Đã xác nhận",
        icon: <CheckCircleOutlined />,
      },
      pending: {
        color: "warning",
        text: "Đang xử lý",
        icon: <ClockCircleOutlined />,
      },
      cancelled: {
        color: "error",
        text: "Đã hủy",
        icon: <InfoCircleOutlined />,
      },
      used: {
        color: "processing",
        text: "Đã sử dụng",
        icon: <CheckCircleOutlined />,
      },
      expired: {
        color: "default",
        text: "Đã hết hạn",
        icon: <ClockCircleOutlined />,
      },
    };

    const statusInfo = statusMap[status.toLowerCase()] || {
      color: "default",
      text: status,
      icon: <InfoCircleOutlined />,
    };

    return (
      <Tag
        color={statusInfo.color}
        icon={statusInfo.icon}
        className="text-sm px-2 py-1"
      >
        {statusInfo.text}
      </Tag>
    );
  };

  const renderPaymentStatus = (payment) => {
    if (!payment) return <Text type="secondary">Chưa có thông tin</Text>;

    const statusMap = {
      COMPLETED: {
        color: "success",
        text: "Đã thanh toán",
        icon: <CheckCircleOutlined />,
      },
      PENDING: {
        color: "warning",
        text: "Đang xử lý",
        icon: <ClockCircleOutlined />,
      },
      FAILED: {
        color: "error",
        text: "Thất bại",
        icon: <InfoCircleOutlined />,
      },
      CANCELLED: {
        color: "default",
        text: "Đã hủy",
        icon: <InfoCircleOutlined />,
      },
    };

    const statusInfo = statusMap[payment.status] || {
      color: "default",
      text: payment.status,
      icon: <InfoCircleOutlined />,
    };

    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon} size="small">
        {statusInfo.text}
      </Tag>
    );
  };

  const renderPaymentMethod = (method) => {
    const methodMap = {
      VNPAY: {
        text: "VNPay",
        icon: (
          <img
            src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
            alt="VNPay"
            style={{ width: 16, height: 16, marginRight: 4 }}
          />
        ),
      },
      MOMO: {
        text: "MoMo",
        color: "#eb2f96",
        icon: (
          <img
            src="https://developers.momo.vn/v3/assets/images/square-logo.svg"
            alt="MoMo"
            style={{ width: 16, height: 16, marginRight: 4 }}
          />
        ),
      },
      ZALOPAY: {
        text: "ZaloPay",
        color: "#52c41a",
        icon: (
          <img
            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
            alt="ZaloPay"
            style={{ width: 16, height: 16, marginRight: 4 }}
          />
        ),
      },
      CASH: { text: "Tiền mặt", color: "#fa8c16" },
      BANK_TRANSFER: { text: "Chuyển khoản", color: "#722ed1" },
    };

    const methodInfo = methodMap[method] || {
      text: method || "Không xác định",
      color: "#8c8c8c",
    };

    return (
      <Tag color={methodInfo.color} size="small">
        {methodInfo.icon}
        {methodInfo.text}
      </Tag>
    );
  };

  const handleDownloadPDF = async () => {
    const ticketElement = document.getElementById("ticket-content");

    if (!ticketElement) return;

    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `ve-phim-${ticket.id}-${ticket.showtime?.movie?.title || "movie"}.pdf`
      );
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error);
    }
  };

  const handleCancelTicket = async () => {
    try {
      setLoading(true);
      await ticketApi.cancelTicket(ticket.id);
      fetchTicketDetails();
    } catch (error) {
      console.error("Lỗi khi hủy vé:", error);
      setError("Không thể hủy vé. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const renderMovieInfo = () => {
    const movie = ticket?.showtime?.movie;
    if (!movie) return null;

    return (
      <Card className="mb-3 shadow-sm" size="small">
        <Row gutter={[12, 8]} align="middle">
          <Col xs={6} sm={4}>
            {movie.poster || movie.posterUrl ? (
              <Image
                src={movie.poster || movie.posterUrl}
                alt={movie.title}
                width={50}
                height={75}
                className="rounded object-cover"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Pu3BUGcN+g"
              />
            ) : (
              <div className="w-12 h-18 bg-gray-200 rounded flex items-center justify-center">
                <PlayCircleOutlined className="text-xl text-gray-400" />
              </div>
            )}
          </Col>
          <Col xs={18} sm={20}>
            <div>
              <Title level={5} className="mb-1 text-gray-800 leading-tight">
                {movie.title}
              </Title>
              <Space wrap size="small">
                {movie.genre && (
                  <Tag color="blue" size="small">
                    <TagOutlined className="mr-1" />
                    {movie.genre}
                  </Tag>
                )}
                {movie.duration && (
                  <Tag color="green" size="small">
                    <ClockCircleOutlined className="mr-1" /> {movie.duration} phút
                  </Tag>
                )}
                {movie.rating && (
                  <Tag color="gold" size="small">
                    <StarOutlined className="mr-1" /> {movie.rating}/10
                  </Tag>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderShowtimeAndSeatInfo = () => {
    const showtime = ticket?.showtime;
    const seat = ticket?.seat;
    if (!showtime || !seat) return null;

    return (
      <Row gutter={[12, 12]} className="mb-3">
        <Col xs={24} md={16}>
          <Card className="shadow-sm h-full" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item
                label={
                  <Space>
                    <CalendarOutlined className="text-blue-500" />
                    <span>Suất chiếu</span>
                  </Space>
                }
              >
                <Text strong className="text-blue-600">
                  {formatDate(showtime.startTime)} - {formatTime(showtime.startTime)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <EnvironmentOutlined className="text-purple-500" />
                    <span>Rạp & Phòng</span>
                  </Space>
                }
              >
                <Text className="text-purple-600">
                  {showtime.hall?.cinema?.name} - {showtime.hall?.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <TeamOutlined className="text-orange-500" />
                    <span>Ghế ngồi</span>
                  </Space>
                }
              >
                <Space>
                  <Text strong className="text-orange-600 text-base">
                    {seat.row}{seat.column}
                  </Text>
                  {seat.type === "VIP" && (
                    <Tag color="gold" size="small">
                      <StarOutlined /> VIP
                    </Tag>
                  )}
                  {seat.type === "COUPLE" && (
                    <Tag color="pink" size="small">
                      <TeamOutlined /> Đôi
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>
              {showtime.hall?.cinema?.address && (
                <Descriptions.Item
                  label={
                    <Space>
                      <HomeOutlined className="text-gray-500" />
                      <span>Địa chỉ</span>
                    </Space>
                  }
                >
                  <Text type="secondary" className="text-xs">
                    {showtime.hall.cinema.address}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="shadow-sm h-full" size="small">
            <div className="text-center">
              <div className="mb-2">
                {loadingQR ? (
                  <Spin size="default" />
                ) : qrCodeData ? (
                  <Tooltip title="Quét mã QR tại quầy check-in">
                    <QRCode value={qrCodeData} size={120} />
                  </Tooltip>
                ) : (
                  <Button
                    onClick={() => generateQRCode(ticket)}
                    type="dashed"
                    size="small"
                  >
                    Tạo mã QR
                  </Button>
                )}
              </div>
              <Text type="secondary" className="text-xs">
                Mã QR check-in
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderConcessions = () => {
    const concessions = ticket?.concessionOrders;
    
    if (!concessions || concessions.length === 0) {
      return (
        <Card className="mb-3 shadow-sm" size="small">
          <div className="flex items-center justify-center py-3">
            <Text type="secondary" className="text-sm">
              Không có đơn hàng bắp nước hoặc combo.
            </Text>
          </div>
        </Card>
      );
    }

    return (
      <Card
        className="mb-3 shadow-sm"
        title={
          <Space>
            <CoffeeOutlined className="text-amber-500" />
            <span className="text-sm font-medium">Bắp nước & Combo</span>
          </Space>
        }
        size="small"
      >
        <List
          size="small"
          dataSource={concessions}
          renderItem={(order) => (
            <List.Item className="px-0 py-2">
              <List.Item.Meta
                title={
                  <div className="flex items-center justify-between mb-1">
                    <Text strong className="text-gray-800 text-sm">
                      Đơn hàng #{order.id}
                    </Text>
                    <Text className="text-green-600 font-medium text-sm">
                      {formatCurrency(order.totalAmount || 0)}đ
                    </Text>
                  </div>
                }
                description={
                  <div className="space-y-1">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((orderItem, index) => {
                        // Lấy thông tin từ item hoặc combo
                        const itemInfo = orderItem.item || orderItem.combo;
                        const itemName = itemInfo?.name || `Sản phẩm ${index + 1}`;
                        const itemImage = itemInfo?.image || null;
                        const itemPrice = orderItem.price || itemInfo?.price || 0;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                          >
                            <Space size="small">
                              {itemImage && (
                                <Image
                                  src={itemImage}
                                  alt={itemName}
                                  width={32}
                                  height={32}
                                  className="rounded object-cover"
                                  fallback="https://via.placeholder.com/32"
                                />
                              )}
                              <div>
                                <Text className="text-gray-800 font-medium">
                                  {itemName}
                                </Text>
                                <div>
                                  <Text type="secondary" className="text-xs">
                                    Số lượng: {orderItem.quantity || 1}
                                  </Text>
                                </div>
                              </div>
                            </Space>
                            <Text className="text-gray-600 font-medium">
                              {formatCurrency(itemPrice)}đ
                            </Text>
                          </div>
                        );
                      })
                    ) : (
                      <Text type="secondary" className="text-xs">
                        Không có thông tin chi tiết sản phẩm
                      </Text>
                    )}
                    {order.notes && (
                      <Text type="secondary" className="text-xs italic">
                        Ghi chú: {order.notes}
                      </Text>
                    )}
                    <div className="text-xs text-gray-500">
                      Trạng thái: <Tag color="success" size="small">{order.status || 'PAID'}</Tag>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderPaymentInfo = () => {
    const payment = ticket?.payment;
    if (!payment) return null;

    const ticketPrice = ticket?.price || 0;
    const concessionTotal = ticket?.concessionOrders?.reduce(
      (total, order) => total + (order.totalAmount || 0), 0
    ) || 0;
    const subtotal = ticketPrice + concessionTotal;
    const discountAmount = ticket?.discount || 0;
    const promotionDiscount =
      ticket?.promotion?.discountAmount ||
      (ticket?.promotion?.discount
        ? (subtotal * ticket.promotion.discount) / 100
        : 0) || 0;
    const totalDiscount = discountAmount + promotionDiscount;
    const finalTotal = payment.amount || subtotal - totalDiscount;

    return (
      <Card
        className="mb-3 shadow-sm"
        title={
          <Space>
            <CreditCardOutlined className="text-blue-500" />
            <span className="text-sm">Thông tin thanh toán</span>
          </Space>
        }
        size="small"
      >
        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text className="text-gray-600 text-sm">Trạng thái:</Text>
                {renderPaymentStatus(payment)}
              </div>
              <div className="flex justify-between items-center">
                <Text className="text-gray-600 text-sm">Phương thức:</Text>
                {renderPaymentMethod(payment.method)}
              </div>
              {payment.transactionId && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600 text-sm">Mã GD:</Text>
                  <Text code className="text-xs">
                    {payment.transactionId}
                  </Text>
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-3 rounded space-y-1">
              <div className="flex justify-between text-sm">
                <Text>Giá vé:</Text>
                <Text>{formatCurrency(ticketPrice)}đ</Text>
              </div>
              {concessionTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <Text>Bắp nước:</Text>
                  <Text>{formatCurrency(concessionTotal)}đ</Text>
                </div>
              )}
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <Text className="text-red-600">Giảm giá:</Text>
                  <Text className="text-red-600">
                    -{formatCurrency(totalDiscount)}đ
                  </Text>
                </div>
              )}
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text strong>Tổng tiền:</Text>
                <Text strong className="text-green-600 text-base">
                  {formatCurrency(finalTotal)}đ
                </Text>
              </div>
            </div>
          </Col>
        </Row>
        {ticket?.promotion && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <Tag color="orange" icon={<GiftOutlined />} size="small">
              Khuyến mãi: {ticket.promotion.name}
              {ticket.promotion.discount && ` (-${ticket.promotion.discount}%)`}
            </Tag>
          </div>
        )}
      </Card>
    );
  };

  return (
    <Modal
      title={
        <div className="flex items-center justify-between pr-4">
          <Space>
            <SafetyCertificateOutlined className="text-red-500" />
            <span className="text-base font-semibold">
              Chi tiết vé #{ticketId}
            </span>
          </Space>
          <Space size="small">
            {renderStatus(ticket?.status)}
            {ticket?.verificationCode && (
              <Tag color="cyan" size="small">
                <Text code className="text-xs">
                  {ticket.verificationCode}
                </Text>
              </Tag>
            )}
          </Space>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ maxWidth: 800, top: 20 }}
      bodyStyle={{ 
        maxHeight: 'calc(100vh - 200px)', 
        overflowY: 'auto',
        padding: '16px'
      }}
      footer={
        ticket && (
          <div className="flex justify-between items-center">
            <Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
                disabled={ticket.status === "cancelled"}
                size="middle"
              >
                Tải PDF
              </Button>
              {qrCodeData && ticket.status !== "cancelled" && (
                <Button
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => generateQRCode(ticket)}
                  size="middle"
                >
                  Làm mới QR
                </Button>
              )}
            </Space>
            {(ticket.status === "confirmed" || ticket.status === "pending") && (
              <Button danger onClick={handleCancelTicket} size="middle">
                Hủy vé
              </Button>
            )}
          </div>
        )
      }
      className="ticket-detail-modal"
    >
      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-2">
            <Text type="secondary">Đang tải thông tin vé...</Text>
          </div>
        </div>
      ) : error ? (
        <Alert
          message="Lỗi"
          description={
            error.includes("concession")
              ? "Không thể tải thông tin bắp nước. Vui lòng kiểm tra kết nối hoặc liên hệ hỗ trợ."
              : error
          }
          type="error"
          showIcon
        />
      ) : ticket ? (
        <motion.div
          id="ticket-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-3 text-center">
            <Text type="secondary" className="text-sm">
              Ngày đặt: {formatDateTime(ticket.createdAt)}
            </Text>
          </div>

          {renderMovieInfo()}
          {renderShowtimeAndSeatInfo()}
          {renderConcessions()}
          {renderPaymentInfo()}
        </motion.div>
      ) : null}
    </Modal>
  );
};

export default TicketDetailModal;