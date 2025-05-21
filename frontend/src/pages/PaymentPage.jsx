import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Steps,
  Spin,
  message,
  Typography,
  Button,
  Progress,
  Divider,
  Tag,
  Modal,
} from "antd";
import {
  HomeOutlined,
  CreditCardOutlined,
  TagOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { paymentApi } from "../api/paymentApi";
import { ticketApi } from "../api/ticketApi";
import { showtimeApi } from "../api/showtimeApi";
import { seatApi } from "../api/seatApi";
import { ThemeContext } from "../context/ThemeContext";
import VNPayPayment from "../components/Payments/VNPayPayment";
import PaymentMethodStep from "../components/Payments/PaymentSteps/PaymentMethodStep";
import CompletionStep from "../components/Payments/PaymentSteps/CompletionStep";

const { Step } = Steps;
const { Title, Text } = Typography;

const SEAT_LOCK_TIME = 15 * 60;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtimeId, setShowtimeId] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(SEAT_LOCK_TIME);
  const [lockStartTime, setLockStartTime] = useState(null);

  useEffect(() => {
    const checkVNPayReturn = async () => {
      if (window.location.search) {
        const queryParams = window.location.search;
        setLoading(true);
        try {
          const paymentResult = await paymentApi.handleVNPayResult(queryParams);
          const storedTicketData = localStorage.getItem("vnpay_ticket_data");
          if (storedTicketData) {
            setTicketData(JSON.parse(storedTicketData));
          }
          if (paymentResult.success) {
            setPaymentData(paymentResult.payment);
            setPaymentSuccess(true);
            setCurrentStep(2);
            message.success("Thanh toán thành công!");
            clearPaymentLocalStorage();
          } else {
            setPaymentError(paymentResult.message);
            setPaymentSuccess(false);
            setCurrentStep(1);
          }
        } catch (error) {
          console.error("Lỗi khi xử lý kết quả từ VNPay:", error);
          setPaymentError("Không thể xử lý kết quả thanh toán");
          setCurrentStep(1);
        } finally {
          setLoading(false);
        }
      }
    };
    checkVNPayReturn();
  }, [searchParams]);

  useEffect(() => {
    const getBookingData = async () => {
      setLoading(true);
      try {
        const storedSeats = JSON.parse(
          localStorage.getItem("selectedSeats") || "[]"
        );
        const storedShowtimeId = localStorage.getItem("showtimeId");
        const storedTotalPrice = parseFloat(
          localStorage.getItem("totalPrice") || "0"
        );
        if (!storedSeats.length || !storedShowtimeId) {
          message.error("Không tìm thấy thông tin đặt vé");
          navigate("/");
          return;
        }
        setSelectedSeats(storedSeats);
        setShowtimeId(storedShowtimeId);
        setTotalPrice(storedTotalPrice);
        const lockTimeStamp = parseInt(
          localStorage.getItem("seatLockTime") || Date.now().toString()
        );
        setLockStartTime(lockTimeStamp);
        const showtime = await showtimeApi.getShowtimeById(storedShowtimeId);
        setShowtimeDetails(showtime);
        if (storedSeats.length > 0 && typeof storedSeats[0] === "object") {
          setSeatDetails(storedSeats);
        } else {
          const seatsResponse = await seatApi.getSeatsByShowtime(
            storedShowtimeId
          );
          const seatIds = storedSeats.map((seat) =>
            typeof seat === "object" ? seat.id : seat
          );
          const selectedSeatsDetails = seatsResponse.filter((seat) =>
            seatIds.includes(seat.id)
          );
          setSeatDetails(selectedSeatsDetails);
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
        message.error("Không thể tải thông tin đặt vé");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    getBookingData();
  }, [navigate]);

  useEffect(() => {
    if (!lockStartTime) return;
    const calculateTimeRemaining = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lockStartTime) / 1000);
      const remaining = Math.max(0, SEAT_LOCK_TIME - elapsedSeconds);
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        message.warning("Đã hết thời gian giữ ghế! Vui lòng chọn lại.");
        if (selectedSeats.length > 0) {
          const seatIds = selectedSeats.map((seat) =>
            typeof seat === "object" ? seat.id : seat
          );
          seatApi.unlockSeats(seatIds).catch((err) => {
            console.error("Lỗi khi giải phóng ghế:", err);
          });
        }
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("showtimeId");
        localStorage.removeItem("totalPrice");
        localStorage.removeItem("seatLockTime");
        navigate(`/booking/seats/${showtimeId}`);
      }
    };
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [lockStartTime, selectedSeats, showtimeId, navigate]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePrevious = () => {
    navigate(`/booking/seats/${showtimeId}`);
  };

  const handlePaymentConfirm = async () => {
    if (!showtimeId || selectedSeats.length === 0) {
      message.error("Thông tin đặt vé không hợp lệ");
      return;
    }
    setIsPaymentProcessing(true);
    setPaymentError(null);
    try {
      const storedUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      }
      let userId;
      if (storedUserId) {
        userId = parseInt(storedUserId);
      } else {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userId = userObj.id;
        }
      }
      if (!userId || isNaN(userId)) {
        throw new Error(
          "Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại."
        );
      }
      const seatIds = selectedSeats.map((seat) =>
        typeof seat === "object" ? parseInt(seat.id) : parseInt(seat)
      );
      const ticketResponse = await ticketApi.createTicket({
        userId,
        showtimeId: parseInt(showtimeId),
        seats: seatIds,
      });
      if (
        ticketResponse &&
        ticketResponse.tickets &&
        ticketResponse.tickets.length > 0
      ) {
        const successTickets = ticketResponse.tickets.filter(
          (ticket) => !ticket.error
        );
        if (successTickets.length === 0) {
          throw new Error("Không có vé nào được tạo thành công");
        }
        setTicketData({
          tickets: successTickets,
          firstTicket: successTickets[0],
          totalAmount: ticketResponse.totalAmount || totalPrice,
        });
        const ticketIds = successTickets.map((ticket) => ticket.id);
        const paymentData = {
          ticketIds: ticketIds,
          method: "VNPAY",
        };
        const paymentResponse = await paymentApi.processPayment(paymentData);
        setPaymentData(paymentResponse);
        if (paymentResponse.paymentUrl) {
          localStorage.setItem(
            "vnpay_payment_data",
            JSON.stringify(paymentResponse)
          );
          localStorage.setItem(
            "vnpay_ticket_data",
            JSON.stringify({
              tickets: successTickets,
              firstTicket: successTickets[0],
              totalAmount: ticketResponse.totalAmount || totalPrice,
            })
          );
          setCurrentStep(1.5);
        } else {
          throw new Error("Không nhận được URL thanh toán từ VNPay");
        }
      } else {
        throw new Error("Không nhận được thông tin vé sau khi tạo");
      }
    } catch (error) {
      console.error("Lỗi xử lý thanh toán:", error);
      setPaymentSuccess(false);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setPaymentError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        message.error("Phiên đăng nhập hết hạn");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 400) {
        setPaymentError(
          error.response?.data?.message || "Dữ liệu thanh toán không hợp lệ"
        );
        message.error(error.response?.data?.message || "Dữ liệu không hợp lệ");
      } else if (error.response?.status === 500) {
        setPaymentError("Hệ thống đang gặp sự cố. Vui lòng thử lại sau.");
        message.error("Lỗi hệ thống");
      } else {
        setPaymentError(
          error.response?.data?.message ||
            error.message ||
            "Thanh toán thất bại. Vui lòng thử lại sau."
        );
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Thanh toán thất bại"
        );
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleVNPayComplete = (success, paymentResult = null) => {
    if (success) {
      if (paymentResult) {
        console.log("Kết quả thanh toán VNPay:", paymentResult);
      }
      setPaymentSuccess(true);
      setCurrentStep(2);
      clearPaymentLocalStorage();
      message.success("Thanh toán thành công!");
    } else {
      const errorMessage =
        paymentResult?.message || "Thanh toán không thành công hoặc đã bị hủy.";
      const responseCode = paymentResult?.responseCode;
      setPaymentSuccess(false);
      setPaymentError(errorMessage);
      setCurrentStep(1);
      if (responseCode) {
        message.error(
          `Thanh toán thất bại (Mã: ${responseCode}): ${errorMessage}`
        );
      } else {
        message.error(errorMessage);
      }
    }
  };

  const clearPaymentLocalStorage = () => {
    localStorage.removeItem("selectedSeats");
    localStorage.removeItem("showtimeId");
    localStorage.removeItem("totalPrice");
    localStorage.removeItem("seatLockTime");
    localStorage.removeItem("vnpay_payment_data");
    localStorage.removeItem("vnpay_ticket_data");
    localStorage.removeItem("lastPaymentId");
    localStorage.removeItem("lastPaymentMethod");
    localStorage.removeItem("lastOrderToken");
    localStorage.removeItem("lastPaymentAmount");
  };

  const handleFinish = () => {
    navigate("/");
  };

  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div
        className={`flex items-center py-3 px-4 rounded-lg shadow-sm ${
          theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
        }`}
      >
        <div className="flex items-center text-red-500 dark:text-red-400">
          <HomeOutlined className="mr-2" />
          <a
            href="/"
            className="text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            Trang chủ
          </a>
        </div>
        <div className="mx-2 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center text-red-500 dark:text-red-400">
          <VideoCameraOutlined className="mr-2" />
          <a
            href="/movies"
            className="text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            Phim
          </a>
        </div>
        <div className="mx-2 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center text-red-500 dark:text-red-400">
          <TagOutlined className="mr-2" />
          <a
            href={`/booking/seats/${showtimeId}`}
            className="text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            Chọn ghế
          </a>
        </div>
        <div className="mx-2 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center font-medium">
          <CreditCardOutlined className="mr-2 text-red-500 dark:text-red-400" />
          <span
            className={`${
              theme === "dark" ? "text-dark-text-primary" : "text-gray-700"
            }`}
          >
            Thanh toán
          </span>
        </div>
      </div>
    </div>
  );

  const renderCountdown = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const percentRemaining = (timeRemaining / SEAT_LOCK_TIME) * 100;
    let statusColor = "success";
    if (percentRemaining <= 30) statusColor = "exception";
    else if (percentRemaining <= 70) statusColor = "warning";
    return (
      <div
        className={`countdown-container p-4 rounded-lg shadow-sm mb-6 border ${
          theme === "dark"
            ? "bg-dark-bg-secondary border-gray-600"
            : "bg-light-bg-secondary border-border-light"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-red-500 dark:text-red-400 mr-2" />
            <span
              className={`font-medium ${
                theme === "dark"
                  ? "text-dark-text-primary"
                  : "text-text-primary"
              }`}
            >
              Thời gian giữ ghế:
            </span>
          </div>
          <span className="text-lg font-bold text-red-500 dark:text-red-400">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
        <Progress
          percent={percentRemaining}
          status={statusColor}
          showInfo={false}
          strokeColor={
            percentRemaining <= 30
              ? "#f5222d"
              : percentRemaining <= 70
              ? "#faad14"
              : "#52c41a"
          }
        />
      </div>
    );
  };

  const renderSelectedSeatsInfo = () => {
    if (!seatDetails || !seatDetails.length)
      return (
        <span
          className={`italic ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-text-secondary"
          }`}
        >
          Chưa chọn ghế
        </span>
      );
    return (
      <div className="flex flex-wrap gap-2">
        {seatDetails.map((seat, index) => {
          let tagColor, tagBgClass;
          if (seat.type === "VIP") {
            tagColor = theme === "dark" ? "amber-300" : "gold";
            tagBgClass =
              theme === "dark"
                ? "bg-amber-900 border border-amber-400 text-amber-300"
                : "bg-amber-100 border border-amber-500 text-amber-700";
          } else if (seat.type === "COUPLE") {
            tagColor = theme === "dark" ? "purple-300" : "purple";
            tagBgClass =
              theme === "dark"
                ? "bg-purple-900 border border-purple-500 text-purple-300"
                : "bg-purple-100 border border-purple-600 text-purple-700";
          } else {
            tagColor = theme === "dark" ? "blue-300" : "blue";
            tagBgClass =
              theme === "dark"
                ? "bg-blue-900 border border-blue-400 text-blue-300"
                : "bg-blue-100 border border-blue-500 text-blue-700";
          }
          return (
            <Tag
              key={index}
              color={tagColor}
              className={`px-3 py-1.5 rounded-lg font-medium ${tagBgClass}`}
            >
              {seat.row}
              {seat.column || seat.number} -{" "}
              {seat.price?.toLocaleString("vi-VN") || "0"}đ
            </Tag>
          );
        })}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PaymentMethodStep
            paymentMethod={paymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
            onPaymentConfirm={handlePaymentConfirm}
            paymentError={paymentError}
            isProcessing={isPaymentProcessing}
          />
        );
      case 1.5:
        return (
          <VNPayPayment
            payment={paymentData}
            ticket={ticketData}
            onPaymentComplete={handleVNPayComplete}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 2:
        return (
          <CompletionStep
            paymentSuccess={paymentSuccess}
            ticketData={ticketData}
            paymentError={paymentError}
            showtimeDetails={showtimeDetails}
            seatDetails={seatDetails}
            onFinish={handleFinish}
            onRetry={() => setCurrentStep(1)}
          />
        );
      default:
        return (
          <PaymentMethodStep
            paymentMethod={paymentMethod}
            onPaymentMethodChange={handlePaymentMethodChange}
            onPaymentConfirm={handlePaymentConfirm}
            paymentError={paymentError}
            isProcessing={isPaymentProcessing}
          />
        );
    }
  };

  return (
    <div
      className={`mx-auto px-4 py-6 max-w-full min-h-screen ${
        theme === "dark" ? "bg-dark-bg" : "bg-light-bg"
      } main-content-wrapper`}
    >
      <BreadcrumbNavigation />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Spin size="large" />
          <Text
            className={`mt-4 ${
              theme === "dark"
                ? "text-dark-text-secondary"
                : "text-text-secondary"
            }`}
          >
            Đang tải thông tin...
          </Text>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6} className="order-1">
            {currentStep < 2 && timeRemaining > 0 && renderCountdown()}
            <Card
              className={`content-card shadow-md mb-6 border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-border-light bg-white"
              }`}
            >
              {showtimeDetails && showtimeDetails.movie && (
                <div className="flex flex-col">
                  <div className="flex items-start">
                    <div className="w-1/3 mr-4">
                      <img
                        src={
                          showtimeDetails.movie.poster ||
                          showtimeDetails.movie.posterUrl ||
                          showtimeDetails.movie.image ||
                          "/fallback.jpg"
                        }
                        alt={showtimeDetails.movie.title}
                        className="w-full rounded-lg shadow-sm object-cover"
                        style={{ aspectRatio: "2/3" }}
                      />
                    </div>
                    <div className="w-2/3">
                      <h3
                        className={`text-lg font-bold mb-3 line-clamp-2 ${
                          theme === "dark"
                            ? "text-dark-text-primary"
                            : "text-text-primary"
                        }`}
                      >
                        {showtimeDetails.movie.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            Rạp:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-text-secondary"
                            }`}
                          >
                            {showtimeDetails.hall?.cinema?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            Phòng:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-text-secondary"
                            }`}
                          >
                            {showtimeDetails.hall?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            Suất chiếu:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-text-secondary"
                            }`}
                          >
                            {new Date(
                              showtimeDetails.startTime
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark"
                                ? "text-dark-text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            Thời gian:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark"
                                ? "text-dark-text-secondary"
                                : "text-text-secondary"
                            }`}
                          >
                            {new Date(
                              showtimeDetails.startTime
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(
                              showtimeDetails.endTime
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            <Card
              className={`content-card shadow-md border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-border-light bg-white"
              }`}
            >
              <div className="space-y-4">
                <h4
                  className={`text-lg font-bold mb-1 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-text-primary"
                  }`}
                >
                  Thông tin đặt vé
                </h4>
                <Divider className="my-3" />
                <div className="space-y-3">
                  <h4
                    className={`font-medium ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-text-primary"
                    }`}
                  >
                    Ghế đã chọn:
                  </h4>
                  {renderSelectedSeatsInfo()}
                </div>
                <div
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    theme === "dark"
                      ? "bg-dark-bg-secondary"
                      : "bg-light-bg-secondary"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-text-primary"
                    }`}
                  >
                    Số lượng ghế:
                  </span>
                  <span className="font-bold text-red-500 dark:text-red-400">
                    {selectedSeats.length}
                  </span>
                </div>
                <Divider className="my-4" />
                <div
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    theme === "dark" ? "bg-red-500/10" : "bg-red-500/5"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      theme === "dark"
                        ? "text-dark-text-primary"
                        : "text-text-primary"
                    }`}
                  >
                    Tổng tiền:
                  </span>
                  <span className="text-lg font-bold text-red-500 dark:text-red-400">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {currentStep < 2 && currentStep !== 1.5 && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handlePrevious}
                    className="btn-primary h-12 font-medium rounded-lg"
                  >
                    QUAY LẠI CHỌN GHẾ
                  </Button>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={16} lg={18} className="order-2">
            <Card
              className={`content-card shadow-md border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-border-light bg-white"
              }`}
            >
              <Steps
                current={currentStep === 1.5 ? 1 : currentStep}
                className="mb-8"
                items={[
                  {
                    title: "Phương thức thanh toán",
                    icon: <CreditCardOutlined />,
                  },
                  {
                    title: "Hoàn tất",
                    icon: <TagOutlined />,
                  },
                ]}
              />
              <div className="step-content p-4">{renderCurrentStep()}</div>
            </Card>
          </Col>
        </Row>
      )}
      {searchParams.get("vnp_ResponseCode") && (
        <Modal
          title={
            paymentSuccess
              ? "Thanh toán thành công"
              : "Thanh toán không thành công"
          }
          open={true}
          footer={null}
          closable={false}
          className={theme === "dark" ? "dark-modal" : ""}
        >
          <div
            className={`text-center py-4 ${
              theme === "dark"
                ? "bg-dark-bg text-dark-text-primary"
                : "bg-light-bg text-text-primary"
            }`}
          >
            {paymentSuccess ? (
              <>
                <CheckCircleOutlined
                  style={{ fontSize: "48px", color: "#52c41a" }}
                />
                <Title
                  level={4}
                  className={`mt-4 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-text-primary"
                  }`}
                >
                  Thanh toán của bạn đã được xử lý thành công!
                </Title>
                <Text
                  className={
                    theme === "dark"
                      ? "text-dark-text-secondary"
                      : "text-text-secondary"
                  }
                >
                  Cảm ơn bạn đã đặt vé. Chúc bạn xem phim vui vẻ!
                </Text>
                <Button
                  type="primary"
                  size="large"
                  className="mt-4 bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>
              </>
            ) : (
              <>
                <CloseCircleOutlined
                  style={{ fontSize: "48px", color: "#f5222d" }}
                />
                <Title
                  level={4}
                  className={`mt-4 ${
                    theme === "dark"
                      ? "text-dark-text-primary"
                      : "text-text-primary"
                  }`}
                >
                  Thanh toán không thành công
                </Title>
                <Text className="text-red-500 dark:text-red-400">
                  {paymentError ||
                    "Đã có lỗi xảy ra trong quá trình thanh toán."}
                </Text>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    type="default"
                    onClick={() => {
                      setCurrentStep(1);
                      window.history.replaceState(
                        {},
                        "",
                        window.location.pathname
                      );
                    }}
                    className={`border rounded-lg h-12 font-medium ${
                      theme === "dark"
                        ? "border-gray-600 text-dark-text-primary hover:bg-gray-700"
                        : "border-gray-300 text-text-primary hover:bg-gray-100"
                    }`}
                  >
                    Thử lại
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate("/")}
                    className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    Về trang chủ
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentPage;
