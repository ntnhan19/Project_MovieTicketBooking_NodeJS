// frontend/src/components/Payments/PaymentPage.jsx
import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  HomeOutlined,
  CreditCardOutlined,
  TagOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { paymentApi } from "../api/paymentApi";
import { ticketApi } from "../api/ticketApi";
import { showtimeApi } from "../api/showtimeApi";
import { seatApi } from "../api/seatApi";
import VNPayPayment from "../components/Payments/VNPayPayment";
import ConfirmationStep from "../components/Payments/PaymentSteps/ConfirmationStep";
import PaymentMethodStep from "../components/Payments/PaymentSteps/PaymentMethodStep";
import CompletionStep from "../components/Payments/PaymentSteps/CompletionStep";
import AppHeader from "../components/common/AppHeader";
import Footer from "../components/common/Footer";

const { Step } = Steps;
const { Title, Text } = Typography;

// Thời gian giữ ghế tính bằng giây (15 phút)
const SEAT_LOCK_TIME = 15 * 60;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State cho dữ liệu
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtimeId, setShowtimeId] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // State cho giao diện
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // State cho đếm ngược thời gian
  const [timeRemaining, setTimeRemaining] = useState(SEAT_LOCK_TIME);
  const [lockStartTime, setLockStartTime] = useState(null);

  // Kiểm tra xem có phải đang quay lại từ VNPay không
  useEffect(() => {
    const checkVNPayReturn = async () => {
      // Kiểm tra URL có chứa tham số trả về từ VNPay không
      if (window.location.search) {
        // Lấy tất cả query params để xử lý
        const queryParams = window.location.search;
        setLoading(true);
        
        try {
          // Sử dụng phương thức handleVNPayResult mới từ paymentApi
          const paymentResult = await paymentApi.handleVNPayResult(queryParams);
          
          // Lấy lại thông tin ticket từ localStorage
          const storedTicketData = localStorage.getItem("vnpay_ticket_data");
          
          if (storedTicketData) {
            setTicketData(JSON.parse(storedTicketData));
          }
          
          if (paymentResult.success) {
            // Nếu thanh toán thành công, lấy thông tin payment từ kết quả
            setPaymentData(paymentResult.payment);
            setPaymentSuccess(true);
            setCurrentStep(2); // Chuyển thẳng đến bước hoàn tất
            message.success("Thanh toán thành công!");
            
            // Xóa dữ liệu thanh toán tạm thời
            clearPaymentLocalStorage();
          } else {
            // Nếu thanh toán thất bại
            setPaymentError(paymentResult.message);
            setPaymentSuccess(false);
            setCurrentStep(1.6); // Chuyển đến bước xử lý VNPay
          }
        } catch (error) {
          console.error("Lỗi khi xử lý kết quả từ VNPay:", error);
          setPaymentError("Không thể xử lý kết quả thanh toán");
          setCurrentStep(1); // Quay lại bước thanh toán
        } finally {
          setLoading(false);
        }
      }
    };
    checkVNPayReturn();
  }, [searchParams]);

  // Lấy dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const getBookingData = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu từ localStorage
        const storedSeats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
        const storedShowtimeId = localStorage.getItem("showtimeId");
        const storedTotalPrice = parseFloat(localStorage.getItem("totalPrice") || "0");

        if (!storedSeats.length || !storedShowtimeId) {
          message.error("Không tìm thấy thông tin đặt vé");
          navigate("/");
          return;
        }

        // Lưu vào state
        setSelectedSeats(storedSeats);
        setShowtimeId(storedShowtimeId);
        setTotalPrice(storedTotalPrice);

        // Khởi tạo thời gian khóa
        const lockTimeStamp = parseInt(
          localStorage.getItem("seatLockTime") || Date.now().toString()
        );
        setLockStartTime(lockTimeStamp);

        // Lấy thông tin chi tiết suất chiếu
        const showtime = await showtimeApi.getShowtimeById(storedShowtimeId);
        setShowtimeDetails(showtime);

        // Lấy thông tin ghế
        if (storedSeats.length > 0 && typeof storedSeats[0] === "object") {
          setSeatDetails(storedSeats);
        } else {
          const seatsResponse = await seatApi.getSeatsByShowtime(storedShowtimeId);
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

  // Đếm ngược thời gian giữ ghế
  useEffect(() => {
    if (!lockStartTime) return;

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lockStartTime) / 1000);
      const remaining = Math.max(0, SEAT_LOCK_TIME - elapsedSeconds);

      setTimeRemaining(remaining);

      // Nếu hết thời gian, giải phóng ghế và chuyển về trang chọn ghế
      if (remaining <= 0) {
        message.warning("Đã hết thời gian giữ ghế! Vui lòng chọn lại.");

        // Mở khóa ghế
        if (selectedSeats.length > 0) {
          const seatIds = selectedSeats.map((seat) =>
            typeof seat === "object" ? seat.id : seat
          );

          seatApi.unlockSeats(seatIds).catch((err) => {
            console.error("Lỗi khi giải phóng ghế:", err);
          });
        }

        // Xóa dữ liệu đặt vé khỏi localStorage
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("showtimeId");
        localStorage.removeItem("totalPrice");
        localStorage.removeItem("seatLockTime");

        // Chuyển về trang chọn ghế
        navigate(`/booking/seats/${showtimeId}`);
      }
    };

    // Tính toán lần đầu
    calculateTimeRemaining();

    // Cập nhật mỗi giây
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [lockStartTime, selectedSeats, showtimeId, navigate]);

  // Xử lý thay đổi phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Xử lý nút tiếp tục
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  // Xử lý nút quay lại
  const handlePrevious = () => {
    if (currentStep === 0) {
      // Quay lại trang chọn ghế
      navigate(`/booking/seats/${showtimeId}`);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  // Xử lý xác nhận thanh toán
  const handlePaymentConfirm = async () => {
    if (!showtimeId || selectedSeats.length === 0) {
      message.error("Thông tin đặt vé không hợp lệ");
      return;
    }

    setIsPaymentProcessing(true);
    setPaymentError(null);
    
    try {
      // Lấy userId từ localStorage
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
        throw new Error("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.");
      }

      // Đảm bảo chuyển đổi seats thành mảng các số nguyên
      const seatIds = selectedSeats.map((seat) =>
        typeof seat === "object" ? parseInt(seat.id) : parseInt(seat)
      );

      // Tạo vé
      const ticketResponse = await ticketApi.createTicket({
        userId,
        showtimeId: parseInt(showtimeId),
        seats: seatIds,
      });

      if (ticketResponse && ticketResponse.tickets && ticketResponse.tickets.length > 0) {
        const successTickets = ticketResponse.tickets.filter(
          (ticket) => !ticket.error
        );

        if (successTickets.length === 0) {
          throw new Error("Không có vé nào được tạo thành công");
        }

        // Lưu tất cả thông tin vé
        setTicketData({
          tickets: successTickets,
          firstTicket: successTickets[0],
          totalAmount: ticketResponse.totalAmount || totalPrice,
        });

        // Lấy danh sách ID các vé để thanh toán
        const ticketIds = successTickets.map((ticket) => ticket.id);

        // Chuẩn bị dữ liệu thanh toán
        const paymentData = {
          ticketIds: ticketIds,
          method: "VNPAY", // Chuyển thành chữ HOA để phù hợp với validation trong API
        };
        
        // Gọi API thanh toán
        const paymentResponse = await paymentApi.processPayment(paymentData);
        
        // Lưu thông tin thanh toán
        setPaymentData(paymentResponse);
        
        if (paymentResponse.paymentUrl) {
          // Lưu dữ liệu vào localStorage để sử dụng sau khi quay lại từ VNPay
          localStorage.setItem("vnpay_payment_data", JSON.stringify(paymentResponse));
          localStorage.setItem("vnpay_ticket_data", JSON.stringify({
            tickets: successTickets,
            firstTicket: successTickets[0],
            totalAmount: ticketResponse.totalAmount || totalPrice,
          }));
          
          // Không cần lưu lại các thông tin này vì paymentApi đã tự động lưu trong processPayment
          // localStorage.setItem("lastPaymentId", paymentResponse.id);
          // localStorage.setItem("lastPaymentMethod", "VNPAY");
          
          // Chuyển sang giao diện VNPay
          setCurrentStep(1.6);
        } else {
          throw new Error("Không nhận được URL thanh toán từ VNPay");
        }
      } else {
        throw new Error("Không nhận được thông tin vé sau khi tạo");
      }
    } catch (error) {
      console.error("Lỗi xử lý thanh toán:", error);
      setPaymentSuccess(false);
      
      // Xử lý các loại lỗi cụ thể
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
        setPaymentError(
          "Hệ thống đang gặp sự cố. Vui lòng thử lại sau."
        );
        message.error("Lỗi hệ thống");
      } else {
        setPaymentError(
          error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
        );
        message.error(error.response?.data?.message || error.message || "Thanh toán thất bại");
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Xử lý hoàn tất thanh toán VNPay
  const handleVNPayComplete = (success, paymentResult = null) => {
    if (success) {
      if (paymentResult) {
        console.log("Kết quả thanh toán VNPay:", paymentResult);
      }
  
      setPaymentSuccess(true);
      setCurrentStep(2); // Chuyển sang bước hoàn tất
  
      // Xóa dữ liệu đặt vé khỏi localStorage sau khi thanh toán thành công
      clearPaymentLocalStorage();
  
      message.success("Thanh toán thành công!");
    } else {
      // Sử dụng định dạng lỗi mới từ API
      const errorMessage = paymentResult?.message || "Thanh toán không thành công hoặc đã bị hủy.";
      const responseCode = paymentResult?.responseCode;
      
      setPaymentSuccess(false);
      setPaymentError(errorMessage);
      setCurrentStep(1); // Quay lại bước chọn phương thức thanh toán
      
      // Hiển thị thông báo lỗi chi tiết hơn nếu có mã phản hồi
      if (responseCode) {
        message.error(`Thanh toán thất bại (Mã: ${responseCode}): ${errorMessage}`);
      } else {
        message.error(errorMessage);
      }
    }
  };
  
  // Thêm hàm utility để xóa dữ liệu localStorage liên quan đến thanh toán
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

  // Xử lý hoàn tất
  const handleFinish = () => {
    navigate("/");
  };

  // Breadcrumb navigation
  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div className="flex items-center py-2 px-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center text-primary">
          <HomeOutlined className="mr-2" />
          <a href="/" className="text-primary hover:underline font-medium">
            Trang chủ
          </a>
        </div>
        <div className="mx-2 text-gray-400">
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
        <div className="flex items-center text-primary">
          <VideoCameraOutlined className="mr-2" />
          <a
            href="/movies"
            className="text-primary hover:underline font-medium"
          >
            Phim
          </a>
        </div>
        <div className="mx-2 text-gray-400">
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
        <div className="flex items-center text-primary">
          <TagOutlined className="mr-2" />
          <a
            href={`/booking/seats/${showtimeId}`}
            className="text-primary hover:underline font-medium"
          >
            Chọn ghế
          </a>
        </div>
        <div className="mx-2 text-gray-400">
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
          <CreditCardOutlined className="mr-2" />
          <span className="text-gray-700">Thanh toán</span>
        </div>
      </div>
    </div>
  );

  // Hiển thị thời gian đếm ngược
  const renderCountdown = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const percentRemaining = (timeRemaining / SEAT_LOCK_TIME) * 100;

    // Xác định màu sắc cho progress bar
    let statusColor = "success";
    if (percentRemaining <= 30) statusColor = "exception";
    else if (percentRemaining <= 70) statusColor = "warning";

    return (
      <div className="countdown-container p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-primary mr-2" />
            <span className="font-medium text-text-primary">
              Thời gian giữ ghế:
            </span>
          </div>
          <span className="text-lg font-bold text-primary">
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

  // Hiển thị thông tin các ghế đã chọn
  const renderSelectedSeatsInfo = () => {
    if (!seatDetails || !seatDetails.length)
      return <span className="text-text-secondary italic">Chưa chọn ghế</span>;

    return (
      <div className="flex flex-wrap gap-2">
        {seatDetails.map((seat, index) => {
          // Xác định màu tag dựa trên loại ghế
          let tagColor;
          if (seat.type === "VIP") {
            tagColor = "gold";
          } else if (seat.type === "COUPLE") {
            tagColor = "purple";
          } else {
            tagColor = "blue";
          }

          return (
            <Tag key={index} color={tagColor}>
              {seat.row}
              {seat.column || seat.number} -{" "}
              {seat.price?.toLocaleString("vi-VN") || "0"}đ
            </Tag>
          );
        })}
      </div>
    );
  };

  // Render tương ứng với bước hiện tại
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConfirmationStep
            showtimeDetails={showtimeDetails}
            seatDetails={seatDetails}
            totalPrice={totalPrice}
          />
        );
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
      case 1.6: // Bước xử lý VNPay
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
          <ConfirmationStep
            showtimeDetails={showtimeDetails}
            seatDetails={seatDetails}
            totalPrice={totalPrice}
          />
        );
    }
  };

  // Render nút điều hướng
  const renderNavigationButtons = () => {
    if (currentStep === 2 || currentStep === 1.6)
      return null; // Không hiển thị nút điều hướng ở bước hoàn tất và VNPay

    return (
      <div className="flex justify-between items-center mt-6">
        <Button
          type="default"
          onClick={handlePrevious}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-text-primary font-medium px-5 py-2 h-auto rounded-md shadow-sm"
        >
          {currentStep === 0 ? "Quay lại chọn ghế" : "Quay lại"}
        </Button>

        {currentStep === 0 && (
          <Button
            type="primary"
            onClick={handleNext}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2 h-auto rounded-md shadow-button hover:shadow-button-hover"
          >
            Tiếp tục
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb navigation */}
        <BreadcrumbNavigation />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spin size="large" />
            <Text className="text-text-secondary mt-4">
              Đang tải thông tin...
            </Text>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Phần chính: nội dung các bước thanh toán */}
            <Col xs={24} lg={16} className="order-2 lg:order-1">
              <Card className="content-card shadow-md">
                <Steps
                  current={currentStep === 1.6 ? 1 : currentStep}
                  className="mb-8"
                  items={[
                    {
                      title: "Xác nhận thông tin",
                      status: currentStep >= 0 ? "finish" : "wait",
                    },
                    {
                      title: "Thanh toán",
                      status: currentStep >= 1 ? "finish" : "wait",
                    },
                    {
                      title: "Hoàn tất",
                      status: currentStep >= 2 ? "finish" : "wait",
                    },
                  ]}
                />

                <div className="step-content">{renderCurrentStep()}</div>

                {renderNavigationButtons()}
              </Card>
            </Col>

            {/* Phần bên phải: thông tin phim và đếm ngược */}
            <Col xs={24} lg={8} className="order-1 lg:order-2">
              {/* Bộ đếm thời gian */}
              {currentStep < 2 && timeRemaining > 0 && renderCountdown()}

              {/* Thông tin phim */}
              <Card className="content-card shadow-md mt-4">
                {showtimeDetails && showtimeDetails.movie && (
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      {/* Poster phim */}
                      <div className="w-1/3 mr-4">
                        <img
                          src={
                            showtimeDetails.movie.poster ||
                            showtimeDetails.movie.posterUrl ||
                            showtimeDetails.movie.image ||
                            "/fallback.jpg"
                          }
                          alt={showtimeDetails.movie.title}
                          className="w-full rounded-md shadow-sm"
                        />
                      </div>

                      {/* Thông tin phim */}
                      <div className="w-2/3">
                        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                          {showtimeDetails.movie.title}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-text-primary">
                              Rạp:{" "}
                            </span>
                            <span className="text-text-secondary">
                              {showtimeDetails.hall?.cinema?.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">
                              Phòng:{" "}
                            </span>
                            <span className="text-text-secondary">
                              {showtimeDetails.hall?.name}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">
                              Suất chiếu:{" "}
                            </span>
                            <span className="text-text-secondary">
                              {new Date(
                                showtimeDetails.startTime
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-text-primary">
                              Thời gian:{" "}
                            </span>
                            <span className="text-text-secondary">
                              {new Date(
                                showtimeDetails.startTime
                              ).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Divider className="my-4" />

                    {/* Thông tin ghế */}
                    <div>
                      <h4 className="font-medium text-text-primary mb-2">
                        Ghế đã chọn:
                      </h4>
                      {renderSelectedSeatsInfo()}
                    </div>

                    <Divider className="my-4" />

                    {/* Thông tin giá */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-text-primary">
                        Tổng tiền:
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {totalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;