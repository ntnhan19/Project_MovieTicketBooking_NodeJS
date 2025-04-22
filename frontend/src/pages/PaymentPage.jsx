// frontend/src/components/Payments/PaymentPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Steps, Spin, message, Typography, Button } from "antd";
import { paymentApi } from "../api/paymentApi";
import { ticketApi } from "../api/ticketApi";
import { showtimeApi } from "../api/showtimeApi";
import { seatApi } from "../api/seatApi";
import ZaloPayPayment from "../components/Payments/ZaloPayPayment";
import ConfirmationStep from "../components/Payments/PaymentSteps/ConfirmationStep";
import PaymentMethodStep from "../components/Payments/PaymentSteps/PaymentMethodStep";
import CompletionStep from "../components/Payments/PaymentSteps/CompletionStep";
import "../styles/PaymentPage.css";

const { Step } = Steps;

const PaymentPage = () => {
  const navigate = useNavigate();

  // State cho dữ liệu
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showtimeId, setShowtimeId] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // State cho giao diện
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Lấy dữ liệu từ localStorage khi component mount
  useEffect(() => {
    const getBookingData = async () => {
      setLoading(true);
      try {
        // Lấy dữ liệu từ localStorage
        const storedSeats = JSON.parse(
          localStorage.getItem("selectedSeats") || "[]"
        );
        const storedShowtimeId = localStorage.getItem("showtimeId");
        const storedTotalPrice = parseFloat(
          localStorage.getItem("totalPrice") || "0"
        );

        console.log("Dữ liệu ghế từ localStorage:", storedSeats);
        console.log("Showtime ID từ localStorage:", storedShowtimeId);
        console.log("Tổng giá từ localStorage:", storedTotalPrice);

        if (!storedSeats.length || !storedShowtimeId) {
          message.error("Không tìm thấy thông tin đặt vé");
          navigate("/");
          return;
        }

        // Lưu vào state
        setSelectedSeats(storedSeats);
        setShowtimeId(storedShowtimeId);
        setTotalPrice(storedTotalPrice);

        // Lấy thông tin chi tiết suất chiếu
        const showtime = await showtimeApi.getShowtimeById(storedShowtimeId);
        setShowtimeDetails(showtime);

        // Nếu storedSeats đã chứa đầy đủ thông tin (không chỉ là ID)
        if (storedSeats.length > 0 && typeof storedSeats[0] === "object") {
          console.log("Sử dụng thông tin ghế từ localStorage");
          setSeatDetails(storedSeats);
        } else {
          // Nếu chỉ có ID ghế, cần lấy thêm thông tin
          console.log("Lấy thêm thông tin ghế từ API");
          const seatsResponse = await seatApi.getSeatsByShowtime(
            storedShowtimeId
          );
          // Lọc ra chỉ các ghế đã chọn
          const seatIds = storedSeats.map((seat) =>
            typeof seat === "object" ? seat.id : seat
          );
          const selectedSeatsDetails = seatsResponse.filter((seat) =>
            seatIds.includes(seat.id)
          );
          console.log("Thông tin ghế chi tiết:", selectedSeatsDetails);
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
  const handlePaymentConfirm = async (values) => {
    if (!showtimeId || selectedSeats.length === 0) {
      message.error("Thông tin đặt vé không hợp lệ");
      return;
    }
  
    setIsPaymentProcessing(true);
    setPaymentError(null);
    try {
      // Lấy userId và token từ localStorage
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
  
      // Đảm bảo chuyển đổi seats thành mảng các số nguyên
      const seatIds = selectedSeats.map((seat) =>
        typeof seat === "object" ? parseInt(seat.id) : parseInt(seat)
      );
  
      console.log("Gửi yêu cầu tạo vé với dữ liệu:", {
        userId,
        showtimeId: parseInt(showtimeId),
        seats: seatIds,
      });
  
      // Tạo vé với dữ liệu đã được định dạng đúng
      const ticketResponse = await ticketApi.createTicket({
        userId,
        showtimeId: parseInt(showtimeId),
        seats: seatIds,
      });
  
      console.log("Phản hồi tạo vé:", ticketResponse);
  
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
  
        // Lưu tất cả thông tin vé
        setTicketData({
          tickets: successTickets,
          firstTicket: successTickets[0],
          totalAmount: ticketResponse.totalAmount || totalPrice,
        });
  
        // Xử lý phương thức thanh toán
        let method;
  
        // Lấy giá trị paymentMethod từ form
        const formMethod = values.paymentMethod || paymentMethod;
  
        // Xác định phương thức thanh toán dựa trên form và lựa chọn người dùng
        // Đảm bảo method luôn được chuyển sang chữ hoa
        if (formMethod === "e_wallet") {
          if (values.walletProvider === "zalopay") {
            method = "ZALOPAY";
          } else if (values.walletProvider === "momo") {
            method = "MOMO";
          } else if (values.walletProvider === "vnpay") {
            method = "VNPAY";
          } else {
            method = "E_WALLET";
          }
        } else {
          switch (formMethod) {
            case "credit_card":
              method = "CREDIT_CARD";
              break;
            case "bank_transfer":
              method = "BANK_TRANSFER";
              break;
            default:
              method = "CREDIT_CARD";
          }
        }
  
        // Đảm bảo method đã ở dạng chữ hoa để khớp với validMethods trong paymentApi
        method = method.toUpperCase();
  
        // Lấy danh sách ID các vé để thanh toán
        const ticketIds = successTickets.map((ticket) => ticket.id);
  
        // Chuẩn bị dữ liệu thanh toán - đã cập nhật để sử dụng mảng ticketIds
        const paymentData = {
          ticketId: ticketIds,
          method: method, // Đã được chuyển đổi sang chữ hoa
          amount: ticketResponse.totalAmount || totalPrice,
          bankInfo:
            method === "BANK_TRANSFER"
              ? {
                  bankName: values.bankName,
                  accountNumber: values.accountNumber || values.bankAccount,
                }
              : undefined,
          cardInfo:
            method === "CREDIT_CARD"
              ? {
                  cardNumber: values.cardNumber,
                  cardHolder: values.cardName || values.cardHolder,
                  expiryDate: values.expiryDate,
                  cvv: values.cvv,
                }
              : undefined,
          phoneNumber: ["E_WALLET", "ZALOPAY", "MOMO", "VNPAY"].includes(method)
            ? values.phoneNumber || values.walletId || "0123456789" // Thêm giá trị mặc định
            : undefined,
        };
  
        console.log("Dữ liệu thanh toán gửi đi:", paymentData);
  
        try {
          // Gọi API xử lý thanh toán
          const paymentResponse = await paymentApi.processPayment(paymentData);
          console.log("Phản hồi thanh toán:", paymentResponse);
  
          // Lưu thông tin thanh toán
          setPaymentData(paymentResponse);
  
          if (method === "ZALOPAY") {
            // Chuyển tới bước xử lý ZaloPay
            setCurrentStep(1.5);
          } else {
            // Mô phỏng webhook
            try {
              await fetch("/api/payments/webhook", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  paymentId: paymentResponse.id,
                  status: "COMPLETED",
                  transactionId: `DEMO-${Date.now()}`,
                }),
              });
              console.log(
                "Đã gửi webhook cập nhật trạng thái thanh toán thành công"
              );
            } catch (webhookError) {
              console.warn(
                "Không thể gửi webhook, nhưng vẫn tiếp tục:",
                webhookError
              );
            }
  
            setPaymentSuccess(true);
            setCurrentStep(2);
  
            // Xóa dữ liệu đặt vé khỏi localStorage sau khi thanh toán thành công
            localStorage.removeItem("selectedSeats");
            localStorage.removeItem("showtimeId");
            localStorage.removeItem("totalPrice");
  
            message.success("Thanh toán thành công!");
          }
        } catch (payError) {
          console.error("Lỗi thanh toán:", payError);
          if (payError.response?.status === 403) {
            setPaymentError(
              "Không có quyền truy cập API thanh toán. Vui lòng đăng nhập lại."
            );
          } else {
            setPaymentError(
              payError.response?.data?.message ||
                payError.message ||
                "Thanh toán thất bại. Vui lòng thử lại sau."
            );
          }
          message.error(paymentError);
        }
      } else {
        throw new Error("Không nhận được thông tin vé sau khi tạo");
      }
    } catch (error) {
      console.error("Lỗi xử lý thanh toán:", error);
      setPaymentSuccess(false);
      setPaymentError(
        error.response?.data?.message ||
          error.message ||
          "Thanh toán thất bại. Vui lòng thử lại sau."
      );
      message.error(
        error.response?.data?.message || error.message || "Thanh toán thất bại"
      );
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // Xử lý hoàn tất thanh toán ZaloPay
  const handleZaloPayComplete = (success, paymentResult = null) => {
    if (success) {
      // Nếu cần sử dụng paymentResult, bạn có thể dùng nó ở đây
      if (paymentResult) {
        console.log("Kết quả thanh toán ZaloPay:", paymentResult);
      }

      setPaymentSuccess(true);
      setCurrentStep(2); // Chuyển sang bước hoàn tất

      // Xóa dữ liệu đặt vé khỏi localStorage sau khi thanh toán thành công
      localStorage.removeItem("selectedSeats");
      localStorage.removeItem("showtimeId");
      localStorage.removeItem("totalPrice");

      message.success("Thanh toán ZaloPay thành công!");
    } else {
      setPaymentSuccess(false);
      setPaymentError("Thanh toán ZaloPay không thành công hoặc đã bị hủy.");
      setCurrentStep(1); // Quay lại bước chọn phương thức thanh toán
      message.error("Thanh toán ZaloPay không thành công.");
    }
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
      case 1.5: // Bước trung gian cho ZaloPay
        return (
          <ZaloPayPayment
            payment={paymentData}
            ticket={ticketData}
            onPaymentComplete={handleZaloPayComplete}
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

  // Xử lý hoàn tất
  const handleFinish = () => {
    navigate("/");
  };

  // Render nút điều hướng
  const renderNavigationButtons = () => {
    if (currentStep === 2 || currentStep === 1.5) return null; // Không hiển thị nút điều hướng ở bước hoàn tất và ZaloPay

    return (
      <Row justify="space-between" className="navigation-buttons">
        <Col>
          <Button type="default" onClick={handlePrevious}>
            {currentStep === 0 ? "Quay lại chọn ghế" : "Quay lại"}
          </Button>
        </Col>

        {currentStep === 0 && (
          <Col>
            <Button type="primary" onClick={handleNext}>
              Tiếp tục
            </Button>
          </Col>
        )}
      </Row>
    );
  };

  return (
    <Card className="payment-page">
      <Steps
        current={currentStep === 1.5 ? 1 : currentStep}
        className="booking-steps"
      >
        <Step title="Xác nhận thông tin" />
        <Step title="Thanh toán" />
        <Step title="Hoàn tất" />
      </Steps>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Typography.Text>Đang tải thông tin...</Typography.Text>
        </div>
      ) : (
        <>
          <div className="step-content">{renderCurrentStep()}</div>

          {renderNavigationButtons()}
        </>
      )}
    </Card>
  );
};

export default PaymentPage;
