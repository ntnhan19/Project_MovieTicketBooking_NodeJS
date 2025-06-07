import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Result,
  Button,
  Typography,
  Spin,
  message,
  Card,
  Row,
  Col,
  Divider,
  List,
  Space,
  Tag,
  Image,
  notification,
  Tooltip,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CoffeeOutlined,
  InfoCircleOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../context/ThemeContext";
import { paymentApi } from "../api/paymentApi";
import { ticketApi } from "../api/ticketApi";
import { concessionOrderApi } from "../api/concessionOrderApi";
import { showtimeApi } from "../api/showtimeApi";

const { Title, Text } = Typography;

const PaymentCompletionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [refreshingTickets, setRefreshingTickets] = useState(false);
  const [ticketDetails, setTicketDetails] = useState({});
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
  const [confirmedTickets, setConfirmedTickets] = useState([]); // Thêm state để track vé đã confirmed
  const userId = parseInt(sessionStorage.getItem("userId")) || null;

  // Key để lưu trữ thông tin đã xử lý
  const getPaymentProcessedKey = () => {
    const transactionNo = searchParams.get("vnp_TransactionNo");
    const paymentId = searchParams.get("paymentId");
    return `payment_processed_${transactionNo || paymentId || "unknown"}`;
  };

  // Key để track vé đã confirmed
  const getConfirmedTicketsKey = () => {
    const transactionNo = searchParams.get("vnp_TransactionNo");
    const paymentId = searchParams.get("paymentId");
    return `confirmed_tickets_${transactionNo || paymentId || "unknown"}`;
  };

  // Lưu thông tin thanh toán vào sessionStorage
  const savePaymentDataToStorage = (data) => {
    const key = getPaymentProcessedKey();
    const storageData = {
      ...data,
      processedAt: new Date().toISOString(),
      searchParamsString: searchParams.toString(),
    };
    sessionStorage.setItem(key, JSON.stringify(storageData));
    sessionStorage.setItem(
      "last_payment_completion_data",
      JSON.stringify(storageData)
    );
  };

  // Lưu danh sách vé đã confirmed
  const saveConfirmedTickets = (ticketIds) => {
    const key = getConfirmedTicketsKey();
    sessionStorage.setItem(key, JSON.stringify(ticketIds));
  };

  // Lấy danh sách vé đã confirmed
  const getConfirmedTickets = () => {
    const key = getConfirmedTicketsKey();
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Lỗi parse danh sách vé đã confirmed:", error);
      }
    }
    return [];
  };

  // Lấy thông tin thanh toán từ sessionStorage
  const getPaymentDataFromStorage = () => {
    const key = getPaymentProcessedKey();
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Lỗi parse dữ liệu từ storage:", error);
      }
    }

    // Fallback: thử lấy từ last_payment_completion_data
    const lastStored = sessionStorage.getItem("last_payment_completion_data");
    if (lastStored) {
      try {
        const data = JSON.parse(lastStored);
        // Kiểm tra xem có phải cùng một giao dịch không
        if (data.searchParamsString === searchParams.toString()) {
          return data;
        }
      } catch (error) {
        console.error("Lỗi parse dữ liệu fallback từ storage:", error);
      }
    }

    return null;
  };

  const handleVNPayCallback = async (callbackSearchParams) => {
    try {
      setLoading(true);

      // Kiểm tra xem đã xử lý thanh toán này chưa
      const storedData = getPaymentDataFromStorage();
      if (storedData && !hasProcessedPayment) {
        console.log("Sử dụng dữ liệu đã lưu từ storage");
        setPaymentData(storedData);
        setPaymentSuccess(storedData.success);
        setHasProcessedPayment(true);
        setConfirmedTickets(getConfirmedTickets()); // Load danh sách vé đã confirmed

        if (storedData.success) {
          // Khôi phục thông tin vé từ storage
          const savedTicketData = JSON.parse(
            localStorage.getItem("vnpay_ticket_data") || "{}"
          );
          setTicketData(savedTicketData);

          // Lấy thông tin chi tiết từ API (không cập nhật trạng thái)
          await loadTicketDetails(storedData.paymentId, false);
        } else {
          setPaymentError(storedData.message || "Thanh toán thất bại.");
        }
        setLoading(false);
        return;
      }

      // Nếu chưa xử lý, thực hiện xử lý thanh toán
      const result = await paymentApi.handleVNPayResult(callbackSearchParams);

      console.log("Payment result structure:", {
        result,
        transactionId: result.transactionId,
        vnp_TransactionNo: result.vnp_TransactionNo,
        payment: result.payment,
        searchParams: Object.fromEntries(searchParams.entries()),
      });

      let concessionOrders = [];

      if (result.payment?.concessionOrderIds?.length > 0) {
        const orderId = result.payment.concessionOrderIds[0];
        try {
          const order = await concessionOrderApi.getUserOrderById(orderId);
          concessionOrders = [
            {
              id: order.id,
              items: order.items.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                type: item.type,
              })),
              totalAmount: order.totalAmount,
            },
          ];
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết đơn bắp nước:", error);
          message.warning("Không thể tải chi tiết đơn bắp nước.");
        }
      }

      const updatedResult = {
        ...result,
        payment: {
          ...result.payment,
          concessionOrders,
        },
      };

      // Lưu vào storage ngay lập tức
      savePaymentDataToStorage(updatedResult);
      setPaymentData(updatedResult);
      setHasProcessedPayment(true);

      if (updatedResult.success) {
        setPaymentSuccess(true);
        setTicketData(
          JSON.parse(localStorage.getItem("vnpay_ticket_data") || "{}")
        );

        // Chỉ cập nhật trạng thái vé nếu chưa được xử lý
        await loadTicketDetails(updatedResult.paymentId, true);

        message.success(
          "Vé đã được xác nhận! Vui lòng kiểm tra email của bạn."
        );
      } else {
        setPaymentSuccess(false);
        setPaymentError(updatedResult.message || "Thanh toán thất bại.");
      }
    } catch (error) {
      console.error("Lỗi xử lý callback:", error);
      setPaymentSuccess(false);
      setPaymentError(
        error.message || "Có lỗi xảy ra khi xử lý kết quả thanh toán."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (paymentId, shouldUpdateStatus = false) => {
    try {
      const ticketIds = await ticketApi.getTicketsByPaymentId(paymentId);
      const confirmedList = getConfirmedTickets();

      if (ticketIds.length > 0) {
        // Chỉ cập nhật trạng thái nếu shouldUpdateStatus = true VÀ chưa từng cập nhật
        if (shouldUpdateStatus) {
          const ticketsToUpdate = ticketIds.filter(t => !confirmedList.includes(t.id));
          
          if (ticketsToUpdate.length > 0) {
            console.log(`Đang cập nhật trạng thái ${ticketsToUpdate.length} vé thành CONFIRMED...`);
            try {
              await ticketApi.updateTicketsStatus(
                ticketsToUpdate.map((t) => t.id),
                "CONFIRMED"
              );
              console.log("Đã cập nhật trạng thái vé thành công");
              
              // Lưu danh sách vé đã confirmed
              const newConfirmedList = [...confirmedList, ...ticketsToUpdate.map(t => t.id)];
              saveConfirmedTickets(newConfirmedList);
              setConfirmedTickets(newConfirmedList);
              
            } catch (updateError) {
              console.error("Lỗi cập nhật trạng thái vé:", updateError);
              // Vẫn tiếp tục xử lý nhưng hiển thị warning
              message.warning(
                "Cập nhật trạng thái vé thất bại, nhưng thanh toán đã thành công"
              );
            }
          } else {
            console.log("Tất cả vé đã được xác nhận trước đó");
          }
        }

        // Lấy thông tin suất chiếu và ghế
        const showtimeId = ticketIds[0]?.showtimeId;
        if (showtimeId) {
          try {
            const showtime = await showtimeApi.getShowtimeById(showtimeId);
            setShowtimeDetails(showtime);
          } catch (error) {
            console.error("Lỗi lấy thông tin suất chiếu:", error);
          }

          // Lấy thông tin ghế từ ticketIds
          const seatsFromTickets = ticketIds.map((ticket) => ({
            id: ticket.seatId,
            row: ticket.seat?.row || "A",
            column: ticket.seat?.column || ticket.seat?.number || "1",
            number: ticket.seat?.number || ticket.seat?.column || "1",
          }));
          setSeatDetails(seatsFromTickets);
        }
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết vé:", error);
      message.error("Không thể tải thông tin chi tiết vé.");
    }
  };

  const clearPaymentLocalStorage = () => {
    if (userId) {
      sessionStorage.removeItem(`selectedSeats_${userId}`);
      sessionStorage.removeItem(`showtimeId_${userId}`);
      sessionStorage.removeItem(`showtimeDetails_${userId}`);
      sessionStorage.removeItem(`totalPrice_${userId}`);
      sessionStorage.removeItem(`seatLockTime_${userId}`);
      sessionStorage.removeItem(`selectedConcessions_${userId}`);
      sessionStorage.removeItem(`promotionCode_${userId}`);
      sessionStorage.removeItem(`promotionDiscount_${userId}`);
      sessionStorage.removeItem(`timeRemaining_${userId}`);
      sessionStorage.removeItem(`concessionOrderId_${userId}`);
      sessionStorage.removeItem(`lastPaymentId_${userId}`);
    }
    localStorage.removeItem("vnpay_payment_data");
    // Không xóa vnpay_ticket_data để có thể sử dụng khi refresh
  };

  useEffect(() => {
    if (searchParams.toString()) {
      handleVNPayCallback(searchParams.toString());
    } else {
      // Thử khôi phục từ storage nếu không có searchParams
      const storedData = getPaymentDataFromStorage();
      if (storedData) {
        setPaymentData(storedData);
        setPaymentSuccess(storedData.success);
        setHasProcessedPayment(true);
        setConfirmedTickets(getConfirmedTickets()); // Load danh sách vé đã confirmed
        if (storedData.success) {
          const savedTicketData = JSON.parse(
            localStorage.getItem("vnpay_ticket_data") || "{}"
          );
          setTicketData(savedTicketData);
          loadTicketDetails(storedData.paymentId, false);
        }
        setLoading(false);
      } else {
        setPaymentError("Không tìm thấy thông tin thanh toán.");
        setLoading(false);
      }
    }

    // Cleanup khi component unmount
    return () => {
      if (paymentSuccess) {
        clearPaymentLocalStorage();
      }
    };
  }, [searchParams]);

  // Các hàm xử lý vé (giữ nguyên như cũ)
  const getTicketsList = () => {
    if (!ticketData) return [];
    if (ticketData.tickets && Array.isArray(ticketData.tickets)) {
      return ticketData.tickets;
    }
    return [ticketData];
  };

  const tickets = getTicketsList();
  const currentTicket = tickets.length > 0 ? tickets[activeTicketIndex] : null;

  const getTicketCode = (ticket) => {
    if (ticket.bookingCode) return ticket.bookingCode;
    if (ticket.code) return ticket.code;
    return `T${ticket.id}`;
  };

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

  useEffect(() => {
    if (paymentSuccess && tickets.length > 0) {
      const timer = setTimeout(() => {
        tickets.forEach(async (ticket, index) => {
          if (ticket.id && !ticketDetails[ticket.id]) {
            setTimeout(() => {
              fetchTicketDetails(ticket.id).catch((error) => {
                console.error(`Lỗi lấy chi tiết vé ${ticket.id}:`, error);
              });
            }, index * 300);
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, tickets]);

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

  const getSeatInfo = (ticket) => {
    // Ưu tiên lấy từ ticket.seat trước
    if (ticket.seat) {
      return `${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
    }

    // Nếu không có, tìm trong seatDetails
    const matchingSeat = seatDetails?.find((seat) => seat.id === ticket.seatId);

    if (matchingSeat) {
      return `${matchingSeat.row}${matchingSeat.column || matchingSeat.number}`;
    }

    if (userId) {
      const selectedSeats = JSON.parse(
        sessionStorage.getItem(`selectedSeats_${userId}`) || "[]"
      );
      const matchingSelectedSeat = selectedSeats.find(
        (seat) => seat.id === ticket.seatId
      );
      if (matchingSelectedSeat) {
        return `${matchingSelectedSeat.row}${
          matchingSelectedSeat.column || matchingSelectedSeat.number
        }`;
      }
    }

    return "Không xác định";
  };

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

  const getPaymentMethod = () => {
    if (!paymentData) return "Không xác định";

    const method =
      paymentData.method ||
      paymentData.payment?.method ||
      paymentData.result?.method ||
      searchParams.get("vnp_BankCode")
        ? "VNPAY"
        : "Không xác định";

    return formatPaymentMethod(method);
  };

  const getTransactionId = () => {
    if (!paymentData) return "Không xác định";

    const transactionId =
      paymentData.transactionId ||
      paymentData.vnp_TransactionNo ||
      paymentData.payment?.transactionId ||
      paymentData.payment?.vnp_TransactionNo ||
      paymentData.result?.transactionId ||
      paymentData.result?.vnp_TransactionNo ||
      searchParams.get("vnp_TransactionNo") ||
      searchParams.get("transactionId") ||
      "Không có mã giao dịch";

    return transactionId;
  };

  const handlePrintTicket = (ticket) => {
    const ticketCode = getTicketCode(ticket);
    notification.info({
      message: "Chức năng in vé",
      description: `Đang chuẩn bị in vé ${ticketCode}...`,
      placement: "topRight",
    });
  };

  const handleSaveTicket = (ticket) => {
    const ticketCode = getTicketCode(ticket);
    notification.success({
      message: "Lưu vé thành công",
      description: `Vé ${ticketCode} đã được lưu vào thiết bị.`,
      placement: "topRight",
    });
  };

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
      navigator.clipboard.writeText(shareData.text);
      notification.success({
        message: "Đã sao chép",
        description: "Thông tin vé đã được sao chép vào clipboard.",
        placement: "topRight",
      });
    }
  };

  const renderConcessionInfo = () => {
    let concessions = [];
    if (paymentData?.concessionOrders?.length > 0) {
      concessions = paymentData.concessionOrders.flatMap(
        (order) => order.items || []
      );
    } else if (
      ticketData?.concessions &&
      Array.isArray(ticketData.concessions)
    ) {
      concessions = ticketData.concessions;
    }

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
        {paymentData?.concessionOrders?.length > 0 && (
          <Text className="block text-sm text-gray-600">
            <strong>Mã đơn bắp nước:</strong>{" "}
            {paymentData.concessionOrders.map((order) => order.id).join(", ")}
          </Text>
        )}
      </div>
    );
  };

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
          <Col xs={24} lg={16} className="p-6 border-r border-gray-100">
            <Row gutter={[24, 0]}>
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
          <Col xs={24} lg={8} className="p-6 bg-gray-50 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center">
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

  const renderPaymentInfo = () => {
    if (!paymentData) return null;

    const paymentMethod = getPaymentMethod();
    const transactionId = getTransactionId();

    // FIX: Lấy amount từ đúng vị trí trong response
    const totalAmount =
      paymentData.amount ||
      paymentData.payment?.amount ||
      paymentData.result?.amount ||
      paymentData.vnp_Amount ||
      paymentData.payment?.vnp_Amount ||
      0;

    console.log("Payment amount debug:", {
      paymentData: paymentData,
      directAmount: paymentData.amount,
      paymentAmount: paymentData.payment?.amount,
      resultAmount: paymentData.result?.amount,
      vnpAmount: paymentData.vnp_Amount,
      paymentVnpAmount: paymentData.payment?.vnp_Amount,
      finalAmount: totalAmount,
    });

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
                {paymentData.createdAt
                  ? new Date(paymentData.createdAt).toLocaleString("vi-VN")
                  : paymentData.payment?.createdAt
                  ? new Date(paymentData.payment.createdAt).toLocaleString(
                      "vi-VN"
                    )
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spin size="large" />
        <Text className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
          Đang xử lý kết quả thanh toán...
        </Text>
      </div>
    );
  }

  return (
    <div
      className={`max-w-7xl mx-auto p-4 ${
        theme === "dark" ? "bg-dark-bg" : "bg-light-bg"
      }`}
    >
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
              <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cảm ơn bạn đã đặt vé! Vé điện tử đã được tạo thành công. Vui
                lòng mang mã vé đến quầy để nhận vé giấy và bắp nước (nếu có).
              </Text>
            ) : (
              <Text className="text-lg text-red-500 max-w-2xl mx-auto">
                {paymentError ||
                  "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
              </Text>
            )
          }
          extra={
            paymentSuccess ? (
              <Space size="large">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/")}
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
                  onClick={() =>
                    navigate(
                      `/payment?showtimeId=${
                        ticketData?.firstTicket?.showtimeId || ""
                      }`
                    )
                  }
                  className="border-gray-300 rounded-lg h-14 px-8 font-medium"
                >
                  Thử lại
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/")}
                  className="bg-red-500 border-none rounded-lg font-bold h-14 px-8 hover:bg-red-600"
                >
                  Về trang chủ
                </Button>
              </Space>
            )
          }
        />
      </div>
      {paymentSuccess && currentTicket && (
        <div className="space-y-6 mt-8">
          {renderTicketsList()}
          {renderTicketInfo(currentTicket)}
          {renderPaymentInfo()}
        </div>
      )}
    </div>
  );
};

export default PaymentCompletionPage;
