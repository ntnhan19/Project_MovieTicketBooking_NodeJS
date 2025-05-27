import React, { useState, useEffect } from "react";
import {
  Result,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  List,
  Space,
  Tag,
  Image,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import QRCode from "react-qr-code";
import { ticketApi } from "../../../api/ticketApi";

const { Title, Text } = Typography;

const CompletionStep = ({
  paymentSuccess,
  ticketData,
  paymentError,
  showtimeDetails,
  seatDetails,
  onFinish,
  onRetry,
  payment,
}) => {
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [qrCodes, setQrCodes] = useState({});
  const [loadingQR, setLoadingQR] = useState({});

  // Hàm tính tổng tiền vé
  const calculateTicketTotal = (tickets) => {
    let ticketTotal = 0;
    if (tickets && Array.isArray(tickets)) {
      tickets.forEach((ticket) => {
        let amount = ticket.price || 0;
        if (ticket.promotion) {
          if (ticket.promotion.type === "PERCENTAGE") {
            amount = amount * (1 - ticket.promotion.discount / 100);
          } else if (ticket.promotion.type === "FIXED") {
            amount = Math.max(0, amount - ticket.promotion.discount);
          }
        }
        ticketTotal += Math.max(0, amount);
      });
    }
    return Math.round(ticketTotal * 100) / 100;
  };

  // Xử lý để lấy danh sách vé từ ticketData
  const getTicketsList = () => {
    if (!ticketData) return [];
    if (ticketData.tickets && Array.isArray(ticketData.tickets)) {
      return ticketData.tickets;
    }
    return [ticketData];
  };

  const tickets = getTicketsList();
  const currentTicket = tickets.length > 0 ? tickets[activeTicketIndex] : null;

  // Chuyển đổi bookingCode hoặc tạo mã vé duy nhất
  const getTicketCode = (ticket) => {
    if (ticket.bookingCode) return ticket.bookingCode;
    if (ticket.code) return ticket.code;
    return `T${ticket.id}`;
  };

  // Tải QR code từ API khi component được render hoặc khi chọn vé khác
  useEffect(() => {
    if (paymentSuccess && tickets.length > 0) {
      tickets.forEach((ticket) => {
        if (ticket.id && !qrCodes[ticket.id]) {
          generateQRCode(ticket);
        }
      });
    }
  }, [paymentSuccess, tickets]);

  // Hàm tạo QR code cho vé
  const generateQRCode = async (ticket) => {
    if (!ticket || !ticket.id) return;

    const ticketId = ticket.id;
    setLoadingQR((prev) => ({ ...prev, [ticketId]: true }));

    try {
      const response = await ticketApi.generateTicketQR(ticketId);
      setQrCodes((prev) => ({ ...prev, [ticketId]: response.qrCode }));
    } catch (error) {
      console.error("Lỗi khi tạo mã QR:", error);
      setQrCodes((prev) => ({ ...prev, [ticketId]: null }));
    } finally {
      setLoadingQR((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  // Tạo QR code trực tiếp từ thông tin vé
  const generateLocalQRCode = (ticket) => {
    if (!ticket || !ticket.id || !showtimeDetails) return;

    const ticketCode = getTicketCode(ticket);
    const seatInfo = getSeatInfo(ticket);
    const concessions =
      payment?.concessionOrders?.[0]?.items || ticketData?.concessions || [];

    const qrData = JSON.stringify({
      ticketCode: ticketCode,
      movieTitle: showtimeDetails.movie?.title,
      cinema: showtimeDetails.hall.cinema.name,
      hall: showtimeDetails.hall.name,
      time: new Date(showtimeDetails.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date(showtimeDetails.startTime).toLocaleDateString("vi-VN"),
      seat: seatInfo,
      concessions: concessions.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      concessionOrderId: payment?.concessionOrders?.[0]?.id || null,
    });

    setQrCodes((prev) => ({ ...prev, [ticket.id]: qrData }));
  };

  // Lấy thông tin ghế
  const getSeatInfo = (ticket) => {
    if (ticket.seat) {
      return `${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
    }
    const matchingSeat = seatDetails.find(
      (seat) =>
        seat.id === ticket.seatId || (ticket.seat && seat.id === ticket.seat.id)
    );
    return matchingSeat
      ? `${matchingSeat.row}${matchingSeat.column || matchingSeat.number}`
      : "Không xác định";
  };

  // Format phương thức thanh toán
  const formatPaymentMethod = (method) => {
    if (!method) return "Không xác định";

    const methodMap = {
      vnpay: "VNPAY",
      VNPay: "VNPAY",
      VNPAY: "VNPAY",
      cash: "Tiền mặt",
      momo: "Ví MoMo",
      zalopay: "ZaloPay",
      credit: "Thẻ tín dụng",
      banking: "Chuyển khoản",
    };

    return methodMap[method] || method;
  };

  // Lấy thông tin phương thức thanh toán
  const getPaymentMethod = () => {
    if (!payment) return "Không xác định";
    return formatPaymentMethod(payment.method);
  };

  // Lấy mã giao dịch
  const getTransactionId = () => {
    if (!payment) return "Không xác định";
    return (
      payment.transactionId ||
      payment.vnp_TransactionNo ||
      "Không có mã giao dịch"
    );
  };

  // Render thông tin bắp nước
  const renderConcessionInfo = () => {
    const concessions =
      payment?.concessionOrders?.[0]?.items || ticketData?.concessions || [];
    if (!concessions || concessions.length === 0) {
      return <Text type="secondary">Không có bắp nước</Text>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {concessions.map((item, index) => (
          <Tag
            key={`${item.id}-${index}`}
            color="cyan"
            className="px-3 py-1.5 rounded-lg font-medium bg-cyan-100 border border-cyan-500 text-cyan-700"
          >
            {item.name} x{item.quantity} -{" "}
            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
          </Tag>
        ))}
        {payment?.concessionOrders?.[0]?.id && (
          <Text className="block mt-2 text-sm">
            Mã đơn bắp nước: {payment.concessionOrders[0].id}
          </Text>
        )}
      </div>
    );
  };

  // Render thông tin một vé
  const renderTicketInfo = (ticket) => {
    if (!ticket || !showtimeDetails) return null;

    const ticketCode = getTicketCode(ticket);
    const seatInfo = getSeatInfo(ticket);

    return (
      <div className="ticket-info-card bg-white rounded-lg shadow-card overflow-hidden border border-border-light">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} className="m-0 text-white flex items-center">
                <span className="mr-2">{showtimeDetails.hall.cinema.name}</span>
                <Tag
                  color="white"
                  className="text-red-500 bg-white font-medium"
                >
                  E-Ticket
                </Tag>
              </Title>
            </Col>
            <Col>
              <Text className="text-white opacity-80">Mã vé: {ticketCode}</Text>
            </Col>
          </Row>
        </div>

        <Row gutter={[0, 0]} className="h-full">
          <Col
            xs={24}
            md={16}
            className="p-6 border-r-0 md:border-r border-border-light"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {showtimeDetails.movie?.posterUrl && (
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <img
                    src={showtimeDetails.movie.posterUrl}
                    alt={showtimeDetails.movie.title}
                    className="w-full rounded-lg shadow-sm object-cover"
                    style={{ maxHeight: "180px" }}
                  />
                </div>
              )}

              <div className="flex-1">
                <Title level={4} className="m-0 mb-3">
                  {showtimeDetails.movie?.title || "Phim không xác định"}
                </Title>
                {showtimeDetails.movie?.duration && (
                  <Text className="block mb-4 text-text-secondary">
                    Thời lượng: {showtimeDetails.movie.duration} phút
                  </Text>
                )}

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Text strong className="w-24">
                      Rạp:
                    </Text>
                    <Text>{showtimeDetails.hall.cinema.name}</Text>
                  </div>
                  <div className="flex items-center">
                    <Text strong className="w-24">
                      Phòng:
                    </Text>
                    <Text>{showtimeDetails.hall.name}</Text>
                  </div>
                  <div className="flex items-center">
                    <Text strong className="w-24">
                      Ngày:
                    </Text>
                    <Text>
                      {new Date(showtimeDetails.startTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </Text>
                  </div>
                  <div className="flex items-center">
                    <Text strong className="w-24">
                      Giờ chiếu:
                    </Text>
                    <Text>
                      {new Date(showtimeDetails.startTime).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Text>
                  </div>
                  <div className="flex items-center">
                    <Text strong className="w-24">
                      Ghế:
                    </Text>
                    <Text className="font-medium">{seatInfo}</Text>
                  </div>
                  <div className="flex items-start">
                    <Text strong className="w-24">
                      Bắp nước:
                    </Text>
                    <div className="flex-1">{renderConcessionInfo()}</div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col
            xs={24}
            md={8}
            className="p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="qr-code-container mb-4 bg-white p-3 rounded-lg shadow-sm border border-border-light">
              {loadingQR[ticket.id] ? (
                <div
                  className="flex items-center justify-center"
                  style={{ width: 180, height: 180 }}
                >
                  <Spin tip="Đang tải..." />
                </div>
              ) : qrCodes[ticket.id] ? (
                <QRCode
                  value={qrCodes[ticket.id]}
                  size={180}
                  level="H"
                  fgColor="#333333"
                />
              ) : (
                <div
                  className="flex items-center justify-center"
                  style={{ width: 180, height: 180 }}
                >
                  <Button onClick={() => generateQRCode(ticket)}>
                    Tải mã QR
                  </Button>
                </div>
              )}
            </div>
            <Text className="text-text-secondary mb-6">
              Vui lòng quét mã QR tại quầy để nhận vé
            </Text>
            <Space direction="vertical" className="w-full">
              <Button
                icon={<PrinterOutlined />}
                className="w-full bg-gray-50 hover:bg-gray-100 border-gray-200 text-text-primary"
              >
                In vé
              </Button>
              <Button
                icon={<DownloadOutlined />}
                className="w-full bg-gray-50 hover:bg-gray-100 border-gray-200 text-text-primary"
              >
                Lưu vé
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  // Render danh sách vé
  const renderTicketsList = () => {
    if (tickets.length <= 1) return null;

    return (
      <div className="tickets-list bg-white p-4 rounded-lg shadow-sm border border-border-light">
        <Title level={5} className="mb-4">
          Danh sách vé của bạn
        </Title>
        <List
          size="small"
          dataSource={tickets}
          renderItem={(ticket, index) => {
            const seatInfo = getSeatInfo(ticket);

            return (
              <List.Item
                className={`rounded-lg transition-colors cursor-pointer ${
                  index === activeTicketIndex
                    ? "bg-red-500/10 border-l-4 border-red-500"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
                onClick={() => setActiveTicketIndex(index)}
              >
                <div className="flex items-center w-full">
                  <FileTextOutlined
                    className={`mr-3 ${
                      index === activeTicketIndex
                        ? "text-red-500"
                        : "text-text-secondary"
                    }`}
                  />
                  <div className="flex-1">
                    <Text strong>Vé {index + 1}</Text>
                    <div className="text-text-secondary text-sm">
                      Ghế {seatInfo}
                    </div>
                  </div>
                  {ticket.price && (
                    <Text
                      className={`${
                        index === activeTicketIndex
                          ? "text-red-500 font-medium"
                          : "text-text-secondary"
                      }`}
                    >
                      {ticket.price.toLocaleString("vi-VN")}đ
                    </Text>
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  // Render thông tin thanh toán
  const renderPaymentInfo = () => {
    if (!payment) return null;

    const paymentMethod = getPaymentMethod();
    const transactionId = getTransactionId();
    const totalAmount = payment.amount || 0; // Chỉ hiển thị tổng tiền từ payment.amount

    const getPaymentLogo = (method) => {
      const logoMap = {
        VNPAY:
          "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR-350x274.png",
        "Ví MoMo":
          "https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png",
        ZaloPay:
          "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
      };
      return logoMap[method] || null;
    };

    const paymentLogo = getPaymentLogo(paymentMethod);

    return (
      <div className="payment-summary bg-white p-5 rounded-lg shadow-sm border border-border-light">
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Title level={5} className="mb-3 flex items-center">
              <CreditCardOutlined className="mr-2 text-red-500" />
              Thông tin thanh toán
            </Title>
            <Divider className="my-3" />
          </Col>
          <Col span={24}>
            <Row justify="space-between" className="py-1">
              <Col>
                <Text>Phương thức thanh toán:</Text>
              </Col>
              <Col>
                <Text strong className="flex items-center">
                  {paymentLogo ? (
                    <Image
                      src={paymentLogo}
                      alt={paymentMethod}
                      preview={false}
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                  ) : null}
                  {paymentMethod}
                </Text>
              </Col>
            </Row>
            <Row justify="space-between" className="py-1">
              <Col>
                <Text>Mã giao dịch:</Text>
              </Col>
              <Col>
                <Text code copyable>
                  {transactionId}
                </Text>
              </Col>
            </Row>
            <Divider className="my-3" />
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong className="text-lg">
                  Tổng thanh toán:
                </Text>
              </Col>
              <Col>
                <Text strong className="text-xl text-red-500">
                  {totalAmount.toLocaleString("vi-VN")}đ
                </Text>
              </Col>
            </Row>
            {/* Hiển thị chi tiết bắp nước nếu có */}
            {payment?.concessionOrders?.[0]?.items?.length > 0 && (
              <>
                <Divider className="my-3" />
                <Row>
                  <Col span={24}>
                    <Text strong>Chi tiết bắp nước:</Text>
                    <div className="mt-2">{renderConcessionInfo()}</div>
                  </Col>
                </Row>
              </>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="completion-step animate-fadeIn max-w-5xl mx-auto">
      <Result
        icon={
          paymentSuccess ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <CloseCircleOutlined className="text-red-500" />
          )
        }
        status={paymentSuccess ? "success" : "error"}
        title={
          paymentSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"
        }
        subTitle={
          paymentSuccess ? (
            <Text>
              Cảm ơn bạn đã đặt vé! Vui lòng lưu hoặc in vé để sử dụng tại rạp.
            </Text>
          ) : (
            <Text className="text-red-500">
              {paymentError || "Đã có lỗi xảy ra trong quá trình thanh toán."}
            </Text>
          )
        }
        extra={
          paymentSuccess ? (
            <Button
              type="primary"
              size="large"
              onClick={onFinish}
              className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600"
            >
              Về trang chủ
            </Button>
          ) : (
            <Space>
              <Button
                type="default"
                size="large"
                onClick={onRetry}
                className="border rounded-lg h-12 font-medium border-gray-300 text-text-primary hover:bg-gray-100"
              >
                Thử lại
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={onFinish}
                className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600"
              >
                Về trang chủ
              </Button>
            </Space>
          )
        }
      />

      {paymentSuccess && currentTicket && (
        <Row gutter={[24, 24]} className="mt-8">
          <Col xs={24}>{renderTicketInfo(currentTicket)}</Col>
          {tickets.length > 1 && <Col xs={24}>{renderTicketsList()}</Col>}
          <Col xs={24}>{renderPaymentInfo()}</Col>
        </Row>
      )}
    </div>
  );
};

export default CompletionStep;
