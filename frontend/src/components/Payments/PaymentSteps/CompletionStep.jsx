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
  App,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CreditCardOutlined,
  DownloadOutlined,
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
}) => {
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [qrCodes, setQrCodes] = useState({});
  const [loadingQR, setLoadingQR] = useState({});

  // Xử lý để lấy danh sách vé từ ticketData
  const getTicketsList = () => {
    if (!ticketData) return [];
    if (ticketData.tickets && Array.isArray(ticketData.tickets)) {
      return ticketData.tickets;
    }
    // Nếu không có danh sách vé, tạo một mảng với 1 vé
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
        // Chỉ tải QR cho những vé chưa có
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
      // Tạo QR code từ API nếu có thể
      if (ticketApi.generateTicketQR) {
        try {
          const qrData = await ticketApi.generateTicketQR(ticketId);
          setQrCodes((prev) => ({ ...prev, [ticketId]: qrData }));
          setLoadingQR((prev) => ({ ...prev, [ticketId]: false }));
          return;
        } catch (apiError) {
          console.error("Lỗi khi gọi API tạo QR:", apiError);
          // Nếu API thất bại, sẽ tiếp tục tạo QR code trực tiếp
        }
      }

      // Tạo QR code trực tiếp nếu API không có hoặc thất bại
      generateLocalQRCode(ticket);
    } catch (error) {
      console.error("Lỗi khi tạo QR code:", error);
      generateLocalQRCode(ticket);
    } finally {
      setLoadingQR((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  // Tạo QR code trực tiếp từ thông tin vé
  const generateLocalQRCode = (ticket) => {
    if (!ticket || !ticket.id || !showtimeDetails) return;

    const ticketCode = getTicketCode(ticket);
    const seatInfo = getSeatInfo(ticket);

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
    });

    setQrCodes((prev) => ({ ...prev, [ticket.id]: qrData }));
  };

  // Lấy thông tin ghế
  const getSeatInfo = (ticket) => {
    if (ticket.seat) {
      return `${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
    }
    // Tìm ghế tương ứng trong seatDetails
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
    if (!ticketData) return "Không xác định";

    // Kiểm tra nhiều vị trí có thể chứa phương thức thanh toán
    const paymentMethod =
      ticketData.paymentMethod ||
      (ticketData.payment && ticketData.payment.method) ||
      "vnpay"; // Giá trị mặc định nếu không tìm thấy

    return formatPaymentMethod(paymentMethod);
  };

  console.log("Debug ticketData structure:", ticketData);
  console.log("Debug ticketData keys:", Object.keys(ticketData || {}));

  // Lấy mã giao dịch
  // 1. Cập nhật hàm getTransactionId() trong CompletionStep.jsx
  // Hàm getTransactionId() đã được sửa lỗi
  const getTransactionId = () => {
    if (!ticketData) return "Không xác định";

    // Ưu tiên các nguồn dữ liệu theo thứ tự quan trọng

    // 1. Kiểm tra vnp_TransactionNo trực tiếp từ ticketData
    if (ticketData.vnp_TransactionNo) {
      return ticketData.vnp_TransactionNo;
    }

    // 2. Kiểm tra trong vnpayData
    if (ticketData.vnpayData && ticketData.vnpayData.vnp_TransactionNo) {
      return ticketData.vnpayData.vnp_TransactionNo;
    }

    // 3. Kiểm tra transactionId trực tiếp
    if (ticketData.transactionId) {
      return ticketData.transactionId;
    }

    // 4. Kiểm tra trong payment object
    if (ticketData.payment) {
      if (ticketData.payment.vnp_TransactionNo) {
        return ticketData.payment.vnp_TransactionNo;
      }
      if (ticketData.payment.transactionId) {
        return ticketData.payment.transactionId;
      }
      if (ticketData.payment.transactionNo) {
        return ticketData.payment.transactionNo;
      }
    }

    // 5. Kiểm tra trong paymentDetails
    if (ticketData.paymentDetails) {
      if (ticketData.paymentDetails.vnp_TransactionNo) {
        return ticketData.paymentDetails.vnp_TransactionNo;
      }
      if (ticketData.paymentDetails.transactionId) {
        return ticketData.paymentDetails.transactionId;
      }
    }

    // 6. Kiểm tra từ tham số URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlTransactionId =
      urlParams.get("vnp_TransactionNo") ||
      urlParams.get("transactionId") ||
      urlParams.get("vnp_TransactionId");
    if (urlTransactionId) {
      return urlTransactionId;
    }

    // 7. Kiểm tra global variable
    if (window && window.paymentTransactionId) {
      return window.paymentTransactionId;
    }

    // 8. Kiểm tra trong mảng tickets
    if (
      ticketData.tickets &&
      Array.isArray(ticketData.tickets) &&
      ticketData.tickets.length > 0
    ) {
      const firstTicket = ticketData.tickets[0];
      if (firstTicket.payment) {
        if (firstTicket.payment.vnp_TransactionNo) {
          return firstTicket.payment.vnp_TransactionNo;
        }
        if (firstTicket.payment.transactionId) {
          return firstTicket.payment.transactionId;
        }
      }
      if (firstTicket.vnp_TransactionNo) {
        return firstTicket.vnp_TransactionNo;
      }
      if (firstTicket.transactionId) {
        return firstTicket.transactionId;
      }
    }

    // 9. Kiểm tra trong firstTicket
    if (ticketData.firstTicket) {
      if (ticketData.firstTicket.vnp_TransactionNo) {
        return ticketData.firstTicket.vnp_TransactionNo;
      }
      if (
        ticketData.firstTicket.payment &&
        ticketData.firstTicket.payment.vnp_TransactionNo
      ) {
        return ticketData.firstTicket.payment.vnp_TransactionNo;
      }
      if (
        ticketData.firstTicket.payment &&
        ticketData.firstTicket.payment.transactionId
      ) {
        return ticketData.firstTicket.payment.transactionId;
      }
      if (ticketData.firstTicket.transactionId) {
        return ticketData.firstTicket.transactionId;
      }
    }

    // 10. Cuối cùng, trả về thông báo rõ ràng
    console.warn("Không tìm thấy mã giao dịch trong ticketData:", ticketData);
    return "Không có mã giao dịch";
  };

  const DebugTransactionInfo = ({ ticketData }) => {
    if (!ticketData) return null;

    const debugInfo = {
      vnp_TransactionNo: ticketData.vnp_TransactionNo,
      transactionId: ticketData.transactionId,
      payment: ticketData.payment,
      vnpayData: ticketData.vnpayData,
      paymentDetails: ticketData.paymentDetails,
      allKeys: Object.keys(ticketData),
    };

    return (
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          margin: "10px 0",
          borderRadius: "5px",
          fontSize: "12px",
          fontFamily: "monospace",
        }}
      >
        <h4>Debug Transaction Info:</h4>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
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
        {/* Header của vé */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-4 text-white">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} className="m-0 text-white flex items-center">
                <span className="mr-2">{showtimeDetails.hall.cinema.name}</span>
                <Tag
                  color="white"
                  className="text-primary bg-white font-medium"
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
          {/* Phần thông tin phim và suất chiếu */}
          <Col
            xs={24}
            md={16}
            className="p-6 border-r-0 md:border-r border-border-light"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster phim nếu có */}
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

                  {ticket.price && (
                    <div className="flex items-center">
                      <Text strong className="w-24">
                        Giá vé:
                      </Text>
                      <Text className="font-medium text-primary">
                        {ticket.price.toLocaleString("vi-VN")}đ
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* Phần QR code */}
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
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "hover:bg-gray-50 border-l-4 border-transparent"
                }`}
                onClick={() => setActiveTicketIndex(index)}
              >
                <div className="flex items-center w-full">
                  <FileTextOutlined
                    className={`mr-3 ${
                      index === activeTicketIndex
                        ? "text-primary"
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
                          ? "text-primary font-medium"
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
    if (!ticketData) return null;

    const paymentMethod = getPaymentMethod();
    const transactionId = getTransactionId();

    // Lấy tổng tiền từ dữ liệu thanh toán nếu có
    const totalAmount =
      (ticketData.payment && ticketData.payment.amount) ||
      ticketData.totalAmount ||
      tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

    // Map các logo cho phương thức thanh toán
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
              <CreditCardOutlined className="mr-2 text-primary" />
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
                <Text strong className="text-xl text-primary">
                  {totalAmount.toLocaleString("vi-VN")}đ
                </Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="completion-step animate-fadeIn">
      {/* Thông báo kết quả */}
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
          <span className={paymentSuccess ? "text-green-600" : "text-red-600"}>
            {paymentSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </span>
        }
        subTitle={
          paymentSuccess && ticketData
            ? `Mã đặt vé: ${
                tickets.length > 1
                  ? `${tickets.length} vé`
                  : getTicketCode(tickets[0])
              }`
            : paymentError
        }
        extra={[
          <Button
            key="home"
            onClick={onFinish}
            className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white border-none shadow-button hover:shadow-button-hover px-8"
            size="large"
          >
            Về trang chủ
          </Button>,
          !paymentSuccess && (
            <Button
              type="default"
              key="retry"
              onClick={onRetry}
              size="large"
              className="border-primary text-primary hover:bg-primary/5"
            >
              Thử lại
            </Button>
          ),
        ]}
        className="mb-8 bg-white p-6 rounded-lg shadow-card border border-border-light"
      />

      {/* Phần hiển thị vé và thông tin thanh toán */}
      {paymentSuccess && (
        <div className="ticket-content">
          <Title level={4} className="mb-6 text-center">
            Vui lòng xuất trình mã QR khi đến rạp
          </Title>

          <Row gutter={[24, 24]}>
            {/* Danh sách vé (hiển thị khi có nhiều vé) */}
            {tickets.length > 1 && (
              <Col xs={24} lg={8}>
                {renderTicketsList()}
                {renderPaymentInfo()}
              </Col>
            )}

            {/* Chi tiết vé */}
            <Col xs={24} lg={tickets.length > 1 ? 16 : 24}>
              {renderTicketInfo(currentTicket)}

              {/* Hiển thị thông tin thanh toán khi chỉ có 1 vé */}
              {tickets.length <= 1 && (
                <div className="mt-6">{renderPaymentInfo()}</div>
              )}
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default CompletionStep;
