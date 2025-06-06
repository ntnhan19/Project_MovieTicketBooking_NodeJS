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
  Card,
  notification,
  Tooltip,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CoffeeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { ticketApi } from "../../../api/ticketApi";

const { Title, Text, Paragraph } = Typography;

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
  const [refreshingTickets, setRefreshingTickets] = useState(false);
  const [ticketDetails, setTicketDetails] = useState({});

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

  // Lấy thông tin vé chi tiết từ API
  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await ticketApi.getTicketById(ticketId);
      setTicketDetails((prev) => ({ ...prev, [ticketId]: response }));
      return response;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết vé ${ticketId}:`, error);
      notification.error({
        message: "Lỗi tải thông tin vé",
        description: "Không thể tải chi tiết vé. Vui lòng thử lại.",
        placement: "topRight",
      });
    }
  };

  // Tải thông tin vé khi component được render
  useEffect(() => {
    if (paymentSuccess && tickets.length > 0) {
      // Thêm delay nhỏ để đảm bảo payment đã hoàn tất
      const timer = setTimeout(() => {
        tickets.forEach(async (ticket, index) => {
          // Lấy thông tin chi tiết vé nếu chưa có
          if (ticket.id && !ticketDetails[ticket.id]) {
            setTimeout(() => {
              fetchTicketDetails(ticket.id).catch(error => {
                console.error(`Lỗi lấy chi tiết vé ${ticket.id}:`, error);
              });
            }, index * 300); // Delay 300ms giữa mỗi request
          }
        });
      }, 500); // Delay 500ms sau khi thanh toán thành công

      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, tickets]);

  // Làm mới danh sách vé
  const refreshTickets = async () => {
    setRefreshingTickets(true);
    try {
      for (const ticket of tickets) {
        if (ticket.id) {
          await fetchTicketDetails(ticket.id);
        }
      }
      notification.success({
        message: "Làm mới thành công",
        description: "Thông tin vé đã được cập nhật.",
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: "Lỗi làm mới",
        description: "Không thể làm mới thông tin vé.",
        placement: "topRight",
      });
    } finally {
      setRefreshingTickets(false);
    }
  };

  // Lấy thông tin ghế
  const getSeatInfo = (ticket) => {
    if (ticket.seat) {
      return `${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
    }
    const matchingSeat = seatDetails?.find(
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

  // Xử lý in vé
  const handlePrintTicket = (ticket) => {
    const ticketCode = getTicketCode(ticket);
    notification.info({
      message: "Chức năng in vé",
      description: `Đang chuẩn bị in vé ${ticketCode}...`,
      placement: "topRight",
    });
    // Thêm logic in vé ở đây
  };

  // Xử lý lưu vé
  const handleSaveTicket = (ticket) => {
    const ticketCode = getTicketCode(ticket);
    // Logic tạo file PDF hoặc lưu vé
    notification.success({
      message: "Lưu vé thành công",
      description: `Vé ${ticketCode} đã được lưu vào thiết bị.`,
      placement: "topRight",
    });
  };

  // Xử lý chia sẻ vé
  const handleShareTicket = (ticket) => {
    const ticketCode = getTicketCode(ticket);
    const shareData = {
      title: `Vé xem phim - ${showtimeDetails?.movie?.title}`,
      text: `Mã vé: ${ticketCode}\nPhim: ${showtimeDetails?.movie?.title}\nRạp: ${showtimeDetails?.hall?.cinema?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      notification.success({
        message: "Đã sao chép",
        description: "Thông tin vé đã được sao chép vào clipboard.",
        placement: "topRight",
      });
    }
  };

  // Render thông tin bắp nước
  const renderConcessionInfo = () => {
    // Tìm concession data từ nhiều nguồn khác nhau
    let concessions = [];

    // Nguồn 1: Từ payment.concessionOrders (cấu trúc cũ)
    if (payment?.concessionOrders?.length > 0) {
      concessions = payment.concessionOrders.flatMap(
        (order) => order.items || []
      );
    }

    // Nguồn 2: Từ ticketData.concessions (cấu trúc mới)
    else if (ticketData?.concessions && Array.isArray(ticketData.concessions)) {
      concessions = ticketData.concessions;
    }

    // Nếu không có concession nào
    if (!concessions || concessions.length === 0) {
      return (
        <div className="flex items-center justify-center py-4">
          <Text type="secondary" className="text-center">
            <CoffeeOutlined className="mr-2" />
            Không có bắp nước
          </Text>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {concessions.map((item, index) => (
            <Tag
              key={`${item.id}-${index}`}
              color="orange"
              className="px-4 py-2 rounded-full font-medium bg-orange-50 border border-orange-300 text-orange-700 flex items-center"
            >
              <CoffeeOutlined className="mr-2" />
              {item.name} x{item.quantity || 1} -{" "}
              {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                "vi-VN"
              )}
              đ
            </Tag>
          ))}
        </div>

        {/* Hiển thị tổng tiền bắp nước */}
        <div className="mt-3 p-3 bg-orange-50 rounded-lg">
          <Text className="block text-sm font-medium text-orange-700">
            <CoffeeOutlined className="mr-2" />
            Tổng tiền bắp nước:{" "}
            <Text strong className="text-orange-800">
              {concessions
                .reduce(
                  (total, item) =>
                    total + (item.price || 0) * (item.quantity || 1),
                  0
                )
                .toLocaleString("vi-VN")}
              đ
            </Text>
          </Text>
        </div>

        {/* Hiển thị mã đơn nếu có */}
        {payment?.concessionOrders?.length > 0 && (
          <Text className="block text-sm text-gray-600">
            <strong>Mã đơn bắp nước:</strong>{" "}
            {payment.concessionOrders.map((order) => order.id).join(", ")}
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
    const movieTitle = showtimeDetails.movie?.title || "Phim không xác định";
    const cinemaName =
      showtimeDetails.hall?.cinema?.name || "Rạp không xác định";
    const hallName = showtimeDetails.hall?.name || "Phòng không xác định";

    return (
      <Card className="ticket-card overflow-hidden shadow-lg border-0">
        {/* Header với gradient */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-pink-500 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

          <Row justify="space-between" align="middle" className="relative z-10">
            <Col>
              <Title level={3} className="m-0 text-white flex items-center">
                <CheckCircleOutlined className="mr-3 text-2xl" />
                {cinemaName}
              </Title>
              <Text className="text-white/90 text-lg font-medium">
                Vé điện tử - E-Ticket
              </Text>
            </Col>
            <Col>
              <div className="text-right">
                <Text className="text-white/80 block text-sm">Mã vé</Text>
                <Text className="text-white text-xl font-bold">
                  {ticketCode}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <Row gutter={0} className="min-h-[400px]">
          {/* Thông tin chi tiết vé */}
          <Col xs={24} lg={16} className="p-6 border-r border-gray-100">
            <Row gutter={[24, 0]}>
              {/* Poster phim */}
              {showtimeDetails.movie?.posterUrl && (
                <Col xs={24} sm={8} md={6}>
                  <div className="relative">
                    <Image
                      src={showtimeDetails.movie.posterUrl}
                      alt={movieTitle}
                      className="w-full rounded-xl shadow-md object-cover"
                      style={{ height: "240px" }}
                      preview={false}
                    />
                    <div className="absolute top-2 right-2">
                      <Tag color="red" className="font-medium">
                        {showtimeDetails.movie?.duration || "N/A"} phút
                      </Tag>
                    </div>
                  </div>
                </Col>
              )}

              {/* Chi tiết phim và suất chiếu */}
              <Col xs={24} sm={16} md={18}>
                <div className="space-y-4">
                  <div>
                    <Title level={3} className="mb-2 text-gray-800">
                      {movieTitle}
                    </Title>
                    {showtimeDetails.movie?.genre && (
                      <Tag color="blue" className="mb-4">
                        {showtimeDetails.movie.genre}
                      </Tag>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <EnvironmentOutlined className="text-red-500 mr-3 text-lg" />
                        <div>
                          <Text className="text-gray-500 block text-sm">
                            Rạp chiếu
                          </Text>
                          <Text strong className="text-gray-800">
                            {cinemaName}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <TeamOutlined className="text-red-500 mr-3 text-lg" />
                        <div>
                          <Text className="text-gray-500 block text-sm">
                            Phòng & Ghế
                          </Text>
                          <Text strong className="text-gray-800">
                            {hallName} - Ghế {seatInfo}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CalendarOutlined className="text-red-500 mr-3 text-lg" />
                        <div>
                          <Text className="text-gray-500 block text-sm">
                            Ngày chiếu
                          </Text>
                          <Text strong className="text-gray-800">
                            {new Date(
                              showtimeDetails.startTime
                            ).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Text>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <ClockCircleOutlined className="text-red-500 mr-3 text-lg" />
                        <div>
                          <Text className="text-gray-500 block text-sm">
                            Giờ chiếu
                          </Text>
                          <Text strong className="text-gray-800 text-lg">
                            {new Date(
                              showtimeDetails.startTime
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin bắp nước */}
                  <Divider className="my-4" />
                  <div>
                    <Text strong className="text-gray-700 text-base mb-3 block">
                      <CoffeeOutlined className="mr-2" />
                      Bắp nước đã đặt
                    </Text>
                    {renderConcessionInfo()}
                  </div>
                </div>
              </Col>
            </Row>
          </Col>

          {/* Thông tin vé và hướng dẫn */}
          <Col xs={24} lg={8} className="p-6 bg-gray-50 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Thông tin hướng dẫn */}
              <div className="bg-white p-6 rounded-2xl shadow-md mb-6 text-center w-full">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <InfoCircleOutlined className="text-2xl text-blue-600" />
                </div>
                <Title level={4} className="mb-3 text-gray-800">
                  Hướng dẫn sử dụng vé
                </Title>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      1
                    </span>
                    <Text className="text-gray-600">
                      Mang mã vé <Text code>{ticketCode}</Text> đến quầy vé
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      2
                    </span>
                    <Text className="text-gray-600">
                      Xuất trình giấy tờ tùy thân để xác nhận
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      3
                    </span>
                    <Text className="text-gray-600">
                      Nhận vé giấy và bắp nước (nếu có)
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      4
                    </span>
                    <Text className="text-gray-600">
                      Vào phòng chiếu trước giờ chiếu 10 phút
                    </Text>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <Space direction="vertical" className="w-full" size="middle">
                <Button
                  icon={<PrinterOutlined />}
                  size="large"
                  className="w-full h-12 font-medium border-gray-300 hover:border-red-500 hover:text-red-500"
                  onClick={() => handlePrintTicket(ticket)}
                >
                  In vé
                </Button>

                <Button
                  icon={<DownloadOutlined />}
                  size="large"
                  className="w-full h-12 font-medium border-gray-300 hover:border-red-500 hover:text-red-500"
                  onClick={() => handleSaveTicket(ticket)}
                >
                  Lưu vé
                </Button>

                <Button
                  icon={<ShareAltOutlined />}
                  size="large"
                  className="w-full h-12 font-medium border-gray-300 hover:border-red-500 hover:text-red-500"
                  onClick={() => handleShareTicket(ticket)}
                >
                  Chia sẻ
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // Render danh sách vé (nếu có nhiều vé)
  const renderTicketsList = () => {
    if (tickets.length <= 1) return null;

    return (
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <FileTextOutlined className="mr-2 text-red-500" />
              Danh sách vé của bạn ({tickets.length} vé)
            </span>
            <Tooltip title="Làm mới thông tin vé">
              <Button
                icon={<ReloadOutlined />}
                size="small"
                loading={refreshingTickets}
                onClick={refreshTickets}
                className="border-none hover:bg-gray-100"
              />
            </Tooltip>
          </div>
        }
        className="shadow-sm"
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3 }}
          dataSource={tickets}
          renderItem={(ticket, index) => {
            const seatInfo = getSeatInfo(ticket);
            const ticketCode = getTicketCode(ticket);
            const isActive = index === activeTicketIndex;

            return (
              <List.Item>
                <Card
                  size="small"
                  hoverable
                  className={`transition-all cursor-pointer ${
                    isActive
                      ? "border-red-500 shadow-md bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  bodyStyle={{ padding: "16px" }}
                  onClick={() => setActiveTicketIndex(index)}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        isActive
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <FileTextOutlined className="text-xl" />
                    </div>

                    <Title level={5} className="mb-2">
                      Vé {index + 1}
                    </Title>

                    <div className="space-y-1">
                      <Text className="block text-sm text-gray-600">
                        Mã: <Text code>{ticketCode}</Text>
                      </Text>
                      <Text className="block text-sm text-gray-600">
                        Ghế: <Text strong>{seatInfo}</Text>
                      </Text>
                      {ticket.price && (
                        <Text
                          className={`block font-medium ${
                            isActive ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {ticket.price.toLocaleString("vi-VN")}đ
                        </Text>
                      )}
                    </div>

                    <Tag color="green" className="mt-2">
                      <CheckCircleOutlined className="mr-1" />
                      Vé hợp lệ
                    </Tag>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      </Card>
    );
  };

  // Render thông tin thanh toán
  const renderPaymentInfo = () => {
    if (!payment) return null;

    const paymentMethod = getPaymentMethod();
    const transactionId = getTransactionId();
    const totalAmount = payment.amount || 0;

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
      <Card
        title={
          <div className="flex items-center">
            <CreditCardOutlined className="mr-2 text-red-500 text-lg" />
            <span>Thông tin thanh toán</span>
          </div>
        }
        className="shadow-sm"
      >
        <div className="space-y-4">
          <Row justify="space-between" align="middle" className="py-2">
            <Col>
              <Text className="text-gray-600">Phương thức:</Text>
            </Col>
            <Col>
              <div className="flex items-center">
                {paymentLogo && (
                  <Image
                    src={paymentLogo}
                    alt={paymentMethod}
                    preview={false}
                    width={28}
                    height={28}
                    className="mr-2 rounded"
                  />
                )}
                <Text strong className="text-lg">
                  {paymentMethod}
                </Text>
              </div>
            </Col>
          </Row>

          <Row justify="space-between" align="middle" className="py-2">
            <Col>
              <Text className="text-gray-600">Mã giao dịch:</Text>
            </Col>
            <Col>
              <Text code copyable className="bg-gray-100 px-3 py-1 rounded">
                {transactionId}
              </Text>
            </Col>
          </Row>

          <Row justify="space-between" align="middle" className="py-2">
            <Col>
              <Text className="text-gray-600">Thời gian:</Text>
            </Col>
            <Col>
              <Text strong>
                {payment.createdAt
                  ? new Date(payment.createdAt).toLocaleString("vi-VN")
                  : new Date().toLocaleString("vi-VN")}
              </Text>
            </Col>
          </Row>

          <Divider className="my-4" />

          <Row
            justify="space-between"
            align="middle"
            className="bg-red-50 p-4 rounded-lg"
          >
            <Col>
              <Text strong className="text-xl text-gray-800">
                Tổng thanh toán:
              </Text>
            </Col>
            <Col>
              <Text strong className="text-2xl text-red-600">
                {totalAmount.toLocaleString("vi-VN")}đ
              </Text>
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  return (
    <div className="completion-step max-w-7xl mx-auto p-4">
      {/* Kết quả thanh toán */}
      <div className="text-center mb-8">
        <Result
          icon={
            paymentSuccess ? (
              <CheckCircleOutlined className="text-green-500 text-6xl" />
            ) : (
              <CloseCircleOutlined className="text-red-500 text-6xl" />
            )
          }
          status={paymentSuccess ? "success" : "error"}
          title={
            <Title
              level={2}
              className={paymentSuccess ? "text-green-600" : "text-red-600"}
            >
              {paymentSuccess
                ? "🎉 Thanh toán thành công!"
                : "❌ Thanh toán thất bại"}
            </Title>
          }
          subTitle={
            paymentSuccess ? (
              <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cảm ơn bạn đã đặt vé! Vé điện tử đã được tạo thành công. Vui
                lòng mang mã vé đến quầy để nhận vé giấy và bắp nước (nếu có).
              </Paragraph>
            ) : (
              <Paragraph className="text-lg text-red-500 max-w-2xl mx-auto">
                {paymentError ||
                  "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
              </Paragraph>
            )
          }
          extra={
            paymentSuccess ? (
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={onFinish}
                  className="bg-red-500 border-none rounded-lg font-bold h-14 px-8 hover:bg-red-600"
                >
                  Về trang chủ
                </Button>
                <Button
                  size="large"
                  onClick={refreshTickets}
                  loading={refreshingTickets}
                  className="border-gray-300 rounded-lg h-14 px-8 hover:border-red-500 hover:text-red-500"
                >
                  <ReloadOutlined className="mr-2" />
                  Làm mới
                </Button>
              </Space>
            ) : (
              <Space size="large">
                <Button
                  type="default"
                  size="large"
                  onClick={onRetry}
                  className="border-gray-300 rounded-lg h-14 px-8 font-medium"
                >
                  Thử lại
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={onFinish}
                  className="bg-red-500 border-none rounded-lg font-bold h-14 px-8 hover:bg-red-600"
                >
                  Về trang chủ
                </Button>
              </Space>
            )
          }
        />
      </div>

      {/* Hiển thị thông tin vé khi thanh toán thành công */}
      {paymentSuccess && currentTicket && (
        <div className="space-y-6 mt-8">
          {/* Danh sách vé (nếu có nhiều vé) */}
          {renderTicketsList()}

          {/* Thông tin chi tiết vé hiện tại */}
          {renderTicketInfo(currentTicket)}

          {/* Thông tin thanh toán */}
          {renderPaymentInfo()}
        </div>
      )}

      {/* Modal xác nhận các hành động */}
      <Modal
        title="Xác nhận hành động"
        open={false}
        onCancel={() => {}}
        footer={null}
        centered
      >
        <div className="py-4">
          <Text>Bạn có chắc chắn muốn thực hiện hành động này?</Text>
        </div>
      </Modal>
    </div>
  );
};

export default CompletionStep;