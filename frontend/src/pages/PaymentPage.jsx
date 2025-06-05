import React, { useState, useEffect, useContext, useCallback } from "react";
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
  ConfigProvider,
} from "antd";
import {
  HomeOutlined,
  CreditCardOutlined,
  TagOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { paymentApi } from "../api/paymentApi";
import { ticketApi } from "../api/ticketApi";
import { showtimeApi } from "../api/showtimeApi";
import { seatApi } from "../api/seatApi";
import { ThemeContext } from "../context/ThemeContext";
import { concessionOrderApi } from "../api/concessionOrderApi";
import VNPayPayment from "../components/Payments/VNPayPayment";
import PaymentMethodStep from "../components/Payments/PaymentSteps/PaymentMethodStep";
import ConcessionStep from "../components/Payments/PaymentSteps/ConcessionsStep";

const { Step } = Steps;
const { Title, Text } = Typography;

const SEAT_LOCK_TIME = 5 * 60;

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedConcessions, setSelectedConcessions] = useState([]);
  const [showtimeId, setShowtimeId] = useState(null);
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seatDetails, setSeatDetails] = useState([]);
  const [isLoadingTotal] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [userId] = useState(parseInt(sessionStorage.getItem("userId")) || null);
  const [concessionOrderId, setConcessionOrderId] = useState(() => {
    const storedUserId = parseInt(sessionStorage.getItem("userId"));
    return storedUserId
      ? sessionStorage.getItem(`concessionOrderId_${storedUserId}`) || null
      : null;
  });
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const storedUserId = parseInt(sessionStorage.getItem("userId"));
    return storedUserId
      ? parseInt(
          sessionStorage.getItem(`timeRemaining_${storedUserId}`) ||
            SEAT_LOCK_TIME
        )
      : SEAT_LOCK_TIME;
  });
  const [lockStartTime, setLockStartTime] = useState(null);

  const antdTheme = {
    token: {
      colorPrimary: "#e71a0f",
      colorText: theme === "dark" ? "#d1d5db" : "#333333",
    },
    components: {
      Steps: {
        colorText: "#e71a0f",
        colorTextDescription: theme === "dark" ? "#d1d5db" : "#666666",
        navArrowColor: "#e71a0f",
        colorPrimary: "#e71a0f",
      },
    },
  };

  useEffect(() => {
    if (userId && totalPrice > 0) {
      sessionStorage.setItem(`totalPrice_${userId}`, totalPrice.toString());
    }
  }, [totalPrice, userId]);

  useEffect(() => {
    const seatsTotal = seatDetails.reduce(
      (sum, seat) => sum + (seat.price || 0),
      0
    );
    const concessionsTotal = selectedConcessions.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    const total = seatsTotal + concessionsTotal;
    setTotalPrice(total);
    if (userId && total > 0) {
      sessionStorage.setItem(`totalPrice_${userId}`, total.toString());
    }
  }, [seatDetails, selectedConcessions, userId]);

  const handleConcessionChange = useCallback(
    (concessions) => {
      setSelectedConcessions(concessions);
      if (userId) {
        sessionStorage.setItem(
          `selectedConcessions_${userId}`,
          JSON.stringify(concessions)
        );
      } else {
        console.warn("Invalid user ID, cannot save selectedConcessions.");
      }
    },
    [userId]
  );

  const handleVNPayComplete = (success, paymentResult = null) => {
    if (success) {
      navigate(`/payment-completion?${searchParams.toString()}`);
    } else {
      const errorMessage =
        paymentResult?.message || "Thanh toán thất bại hoặc bị hủy.";
      setCurrentStep(2);
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    const getBookingData = async () => {
      setLoading(true);
      try {
        const storedUserId = parseInt(sessionStorage.getItem("userId"));
        if (!storedUserId) {
          message.error("Vui lòng đăng nhập để tiếp tục thanh toán.");
          navigate("/login");
          return;
        }

        const storedSeats = JSON.parse(
          sessionStorage.getItem(`selectedSeats_${storedUserId}`) || "[]"
        );
        const storedConcessions = JSON.parse(
          sessionStorage.getItem(`selectedConcessions_${storedUserId}`) || "[]"
        );
        const storedShowtimeId = sessionStorage.getItem(
          `showtimeId_${storedUserId}`
        );
        const storedTotalPrice = parseFloat(
          sessionStorage.getItem(`totalPrice_${storedUserId}`) || "0"
        );
        const storedPromotionDiscount = parseFloat(
          sessionStorage.getItem(`promotionDiscount_${storedUserId}`) || "0"
        );
        const storedLockTime = sessionStorage.getItem(
          `seatLockTime_${storedUserId}`
        );

        if (!storedSeats.length || !storedShowtimeId) {
          message.error(
            "Không tìm thấy thông tin đặt vé. Vui lòng chọn lại ghế."
          );
          navigate(`/booking/seats/${storedShowtimeId || ""}`);
          return;
        }

        setSelectedSeats(storedSeats);
        setSelectedConcessions(storedConcessions);
        setShowtimeId(storedShowtimeId);
        setTotalPrice(storedTotalPrice);
        setPromotionDiscount(storedPromotionDiscount);
        setLockStartTime(
          storedLockTime ? parseInt(storedLockTime) : Date.now()
        );

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
        console.error("Lỗi khi lấy dữ liệu đặt vé:", error);
        message.error(error.message || "Không thể tải thông tin đặt vé.");
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
      sessionStorage.setItem(`timeRemaining_${userId}`, remaining.toString());

      if (remaining <= 0) {
        message.warning("Thời gian giữ ghế đã hết! Vui lòng chọn lại ghế.");
        if (selectedSeats.length > 0) {
          const seatIds = selectedSeats.map((seat) =>
            typeof seat === "object" ? seat.id : seat
          );
          seatApi.unlockSeats(seatIds).catch((err) => {
            console.error("Lỗi khi mở khóa ghế:", err);
          });
        }
        clearPaymentLocalStorage();
        navigate(`/booking/seats/${showtimeId}`);
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [lockStartTime, selectedSeats, showtimeId, navigate, userId]);

  const handlePaymentConfirm = async ({
    promotionCode,
    promotionDiscount,
    concessionOrderId,
  }) => {
    if (!showtimeId || selectedSeats.length === 0) {
      message.error("Thông tin đặt vé không hợp lệ.");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      const storedUserId = parseInt(sessionStorage.getItem("userId"));
      const token = sessionStorage.getItem("token");
      if (!token || !storedUserId) {
        throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
      }

      const seatIds = selectedSeats.map((seat) =>
        typeof seat === "object" ? parseInt(seat.id) : parseInt(seat)
      );

      const ticketResponse = await ticketApi.createTicket({
        userId: storedUserId,
        showtimeId: parseInt(showtimeId),
        seats: seatIds,
        promotionCode: promotionCode || null,
      });

      if (ticketResponse.tickets && ticketResponse.tickets.length > 0) {
        const successTickets = ticketResponse.tickets.filter(
          (ticket) => !ticket.error
        );
        if (successTickets.length === 0) {
          throw new Error("Không có vé nào được tạo thành công.");
        }

        if (concessionOrderId) {
          try {
            await concessionOrderApi.updateOrder(concessionOrderId, {
              ticketIds: successTickets.map((ticket) => ticket.id),
              orderType: "WITH_TICKET",
            });
          } catch (error) {
            console.error("Lỗi khi cập nhật đơn bắp nước với ID vé:", error);
            throw new Error("Không thể cập nhật đơn bắp nước.");
          }
        }

        const ticketData = {
          tickets: successTickets,
          firstTicket: successTickets[0],
          totalAmount: ticketResponse.totalAmount,
          concessions: selectedConcessions,
          promotionCode,
          promotionDiscount,
        };

        const paymentData = {
          ticketIds: successTickets.map((ticket) => ticket.id),
          concessionOrderIds: concessionOrderId
            ? [parseInt(concessionOrderId)]
            : [],
          method: "VNPAY",
          promotionCode: promotionCode || null,
        };

        const paymentResponse = await paymentApi.processPayment(paymentData);
        localStorage.setItem("vnpay_payment_data", JSON.stringify(paymentResponse));
        localStorage.setItem("vnpay_ticket_data", JSON.stringify(ticketData));
        setCurrentStep(2.5);
      } else {
        throw new Error("Không nhận được thông tin vé sau khi tạo.");
      }
    } catch (error) {
      console.error("Lỗi xử lý thanh toán:", error);
      let errorMessage = "Thanh toán thất bại. Vui lòng thử lại sau.";
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
        message.error(errorMessage);
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 409) {
        errorMessage = "Ghế đã được đặt bởi người khác. Vui lòng chọn lại.";
        message.error(errorMessage);
        navigate(`/booking/seats/${showtimeId}`);
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.code === "INVALID_CONCESSION_ORDER"
      ) {
        errorMessage = "Đơn bắp nước không hợp lệ. Vui lòng kiểm tra lại.";
        message.error(errorMessage);
        setCurrentStep(1);
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Dữ liệu thanh toán không hợp lệ.";
        message.error(errorMessage);
      } else if (error.response?.status === 500) {
        errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
        message.error(errorMessage);
      } else {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
        message.error(errorMessage);
      }
    } finally {
      setIsPaymentProcessing(false);
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
    localStorage.removeItem("vnpay_ticket_data");
  };

  const handlePrevious = async () => {
    if (currentStep === 1) {
      try {
        const seatIds = selectedSeats.map((seat) =>
          typeof seat === "object" ? parseInt(seat.id) : parseInt(seat)
        );

        const currentSeats = await seatApi.getSeatsByShowtime(showtimeId);
        const invalidSeats = seatIds.filter((seatId) => {
          const seat = currentSeats.find((s) => s.id === seatId);
          return !seat || seat.status !== "LOCKED" || seat.lockedBy !== userId;
        });

        if (invalidSeats.length > 0) {
          console.log("Phát hiện ghế không hợp lệ:", invalidSeats);
          message.error("Một số ghế không còn hợp lệ. Vui lòng chọn lại.");
          const validSeats = selectedSeats.filter(
            (seat) => !invalidSeats.includes(seat.id)
          );
          sessionStorage.setItem(
            `selectedSeats_${userId}`,
            JSON.stringify(validSeats)
          );
          clearPaymentLocalStorage();
          navigate(`/booking/seats/${showtimeId}`);
          return;
        }

        await seatApi.lockSeats(seatIds);
        sessionStorage.setItem(`seatLockTime_${userId}`, Date.now().toString());
        sessionStorage.setItem("returningFromPayment", "true");

        const updatedSeats = seatIds.map((seatId) => {
          const seat = currentSeats.find((s) => s.id === seatId);
          return {
            id: seatId,
            row: seat.row,
            column: seat.column,
            type: seat.type,
            price: seat.price || 0,
          };
        });

        sessionStorage.setItem(
          `selectedSeats_${userId}`,
          JSON.stringify(updatedSeats)
        );
        clearConcessionData();
        navigate(`/booking/seats/${showtimeId}`);
      } catch (error) {
        console.error("Lỗi khi gia hạn thời gian khóa ghế:", error);
        message.error(
          error.response?.data?.message || "Không thể gia hạn thời gian khóa ghế."
        );
        clearPaymentLocalStorage();
        navigate(`/booking/seats/${showtimeId}`);
      }
    } else if (currentStep === 2 || currentStep === 2.5) {
      setCurrentStep(1);
    }
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      if (!userId) {
        message.error("Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      let newOrderId = null;

      if (selectedConcessions.length > 0) {
        try {
          const concessionItems = selectedConcessions.map((item) => ({
            id: parseInt(item.id),
            type: item.type,
            quantity: parseInt(item.quantity),
            price: item.price,
          }));

          const totalAmount = concessionItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          const orderData = {
            items: concessionItems.filter((item) => item.type === "item"),
            combos: concessionItems.filter((item) => item.type === "combo"),
            totalAmount,
            orderType: "STANDALONE",
            ticketIds: [],
            userId,
          };

          console.log("Tạo đơn bắp nước với dữ liệu:", orderData);
          const orderResponse = await concessionOrderApi.createOrder(orderData);

          if (!orderResponse?.data?.id) {
            throw new Error("Phản hồi API không chứa ID đơn hàng.");
          }

          newOrderId = orderResponse.data.id;
          setConcessionOrderId(newOrderId);
          sessionStorage.setItem(
            `concessionOrderId_${userId}`,
            newOrderId.toString()
          );
        } catch (error) {
          console.error("Lỗi khi tạo đơn bắp nước:", error);
          message.error(
            error.response?.data?.message || "Không thể tạo đơn bắp nước."
          );
          return;
        }
      } else {
        setConcessionOrderId(null);
        sessionStorage.removeItem(`concessionOrderId_${userId}`);
      }

      setCurrentStep(2);
    }
  };

  const clearConcessionData = () => {
    setSelectedConcessions([]);
    sessionStorage.removeItem(`selectedConcessions_${userId}`);
  };

  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div
        className={`flex items-center py-3 px-4 rounded-lg shadow-sm ${
          theme === "dark" ? "bg-gray-800" : "bg-gray-100"
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
          <CoffeeOutlined className="mr-2 text-red-500 dark:text-red-400" />
          <a
            href={`/booking/concessions/${showtimeId}`}
            className="text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            Chọn bắp nước
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
              theme === "dark" ? "text-gray-200" : "text-gray-700"
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
            ? "bg-gray-800 border-gray-600"
            : "bg-gray-100 border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ClockCircleOutlined className="text-red-500 dark:text-red-400 mr-2" />
            <span
              className={`font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
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
            theme === "dark" ? "text-gray-400" : "text-gray-500"
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

  const handleRemoveConcession = (itemId, itemType) => {
    const updatedItems = selectedConcessions.filter(
      (item) => !(item.id === itemId && item.type === itemType)
    );
    setSelectedConcessions(updatedItems);
    sessionStorage.setItem(
      `selectedConcessions_${userId}`,
      JSON.stringify(updatedItems)
    );
    handleConcessionChange(updatedItems);
    if (updatedItems.length === 0) {
      setConcessionOrderId(null);
      sessionStorage.removeItem(`concessionOrderId_${userId}`);
      sessionStorage.removeItem(`concessionOrderDetails_${userId}`);
    }
  };

  const renderSelectedConcessionsInfo = () => {
    if (!selectedConcessions || !selectedConcessions.length)
      return (
        <span
          className={`italic ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Chưa chọn bắp nước
        </span>
      );

    return (
      <div className="flex flex-wrap gap-2">
        {selectedConcessions.map((item, index) => (
          <Tag
            key={`${item.id}-${item.type}-${index}`}
            color={theme === "dark" ? "cyan-300" : "cyan"}
            closable={currentStep === 1}
            onClose={() => handleRemoveConcession(item.id, item.type)}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              theme === "dark"
                ? "bg-cyan-900 border border-cyan-400 text-cyan-300"
                : "bg-cyan-100 border border-cyan-500 text-cyan-700"
            }`}
          >
            {item.name} x{item.quantity} -{" "}
            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
          </Tag>
        ))}
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConcessionStep
            onConcessionChange={handleConcessionChange}
            selectedConcessions={selectedConcessions}
          />
        );
      case 2:
        return (
          <PaymentMethodStep
            onPaymentConfirm={handlePaymentConfirm}
            isProcessing={isPaymentProcessing}
            selectedConcessions={selectedConcessions}
            totalPrice={totalPrice}
            concessionOrderId={concessionOrderId}
            showtimeId={showtimeId}
          />
        );
      case 2.5:
        return (
          <VNPayPayment
            payment={JSON.parse(localStorage.getItem("vnpay_payment_data") || "{}")}
            onPaymentComplete={handleVNPayComplete}
            onBack={() => setCurrentStep(2)}
            isCallback={searchParams.toString() !== ""}
            callbackUrl={searchParams.toString()}
            isProcessing={isPaymentProcessing}
          />
        );
      default:
        return <ConcessionStep />;
    }
  };

  return (
    <ConfigProvider theme={antdTheme}>
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
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Đang tải thông tin...
            </Text>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {currentStep < 3 && (
              <Col xs={24} md={8} lg={6} className="order-1">
                <div className="sticky top-24 z-40">
                  {currentStep < 3 && timeRemaining > 0 && renderCountdown()}
                  <Card
                    className={`content-card shadow-md mb-6 border ${
                      theme === "dark"
                        ? "border-gray-600 bg-gray-800"
                        : "border-gray-200 bg-white"
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
                                  ? "text-gray-200"
                                  : "text-gray-800"
                              }`}
                            >
                              {showtimeDetails.movie.title}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start">
                                <span
                                  className={`font-medium w-20 ${
                                    theme === "dark"
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Rạp:
                                </span>
                                <span
                                  className={`flex-1 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {showtimeDetails.hall?.cinema?.name}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span
                                  className={`font-medium w-20 ${
                                    theme === "dark"
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Phòng:
                                </span>
                                <span
                                  className={`flex-1 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {showtimeDetails.hall?.name}
                                </span>
                              </div>
                              <div className="flex items-start">
                                <span
                                  className={`font-medium w-20 ${
                                    theme === "dark"
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Suất chiếu:
                                </span>
                                <span
                                  className={`flex-1 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
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
                                      ? "text-gray-200"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Thời gian:
                                </span>
                                <span
                                  className={`flex-1 ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
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
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="space-y-4">
                      <h4
                        className={`text-lg font-bold mb-1 ${
                          theme === "dark" ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        Thông tin đặt vé
                      </h4>
                      <Divider className="my-3" />
                      <div className="space-y-3">
                        <h4
                          className={`font-medium ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Ghế đã chọn:
                        </h4>
                        {renderSelectedSeatsInfo()}
                      </div>
                      <div className="space-y-3">
                        <h4
                          className={`font-medium ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Bắp nước:
                        </h4>
                        {renderSelectedConcessionsInfo()}
                      </div>
                      <div
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            theme === "dark" ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Số lượng ghế:
                        </span>
                        <span className="font-bold text-red-500 dark:text-red-400">
                          {selectedSeats.length}
                        </span>
                      </div>
                      {promotionDiscount > 0 && (
                        <div
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            theme === "dark"
                              ? "bg-green-500/10"
                              : "bg-green-500/5"
                          }`}
                        >
                          <span
                            className={`font-medium ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            Giảm giá khuyến mãi:
                          </span>
                          <span className="font-bold text-green-500 dark:text-green-400">
                            -{promotionDiscount.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                      <div
                        className={`p-4 rounded-lg ${
                          theme === "dark" ? "bg-red-500/10" : "bg-red-500/5"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Tiền vé:
                            </span>
                            <span
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {seatDetails
                                .reduce(
                                  (sum, seat) => sum + (seat.price || 0),
                                  0
                                )
                                .toLocaleString("vi-VN")}
                              đ
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Tiền bắp nước:
                            </span>
                            <span
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              {selectedConcessions
                                .reduce(
                                  (sum, item) =>
                                    sum +
                                    (item.price || 0) * (item.quantity || 0),
                                  0
                                )
                                .toLocaleString("vi-VN")}
                              đ
                            </span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span
                              className={`font-medium ${
                                theme === "dark"
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              }`}
                            >
                              Tổng tiền:
                            </span>
                            <span className="text-lg font-bold text-red-500 dark:text-red-400">
                              {isLoadingTotal
                                ? "Đang tải..."
                                : `${totalPrice.toLocaleString("vi-VN")}đ`}
                            </span>
                          </div>
                        </div>
                      </div>
                      {currentStep === 1 && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="large"
                            onClick={handlePrevious}
                            className="h-12 font-medium rounded-lg border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white flex-1"
                          >
                            QUAY LẠI
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            onClick={handleContinue}
                            className="btn-primary h-12 font-medium rounded-lg flex-1"
                          >
                            TIẾP TỤC
                          </Button>
                        </div>
                      )}
                      {currentStep === 2 && (
                        <div className="mt-4">
                          <Button
                            size="large"
                            onClick={handlePrevious}
                            className="h-12 font-medium rounded-lg border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white w-full"
                          >
                            QUAY LẠI
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </Col>
            )}
            <Col
              xs={24}
              md={currentStep < 3 ? 16 : 24}
              lg={currentStep < 3 ? 18 : 24}
              className="order-2"
            >
              <Card
                className={`content-card shadow-md border ${
                  theme === "dark"
                    ? "border-gray-600 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="mb-6">
                  <Steps
                    current={currentStep === 2.5 ? 2 : currentStep - 1}
                    className="payment-steps max-w-3xl mx-auto"
                    items={[
                      {
                        title: "Chọn bắp nước",
                        icon: <CoffeeOutlined />,
                      },
                      {
                        title: "Phương thức thanh toán",
                        icon: <CreditCardOutlined />,
                      },
                      {
                        title: "Thanh toán VNPay",
                        icon: <CreditCardOutlined />,
                      },
                    ]}
                  />
                </div>
                <div className="payment-step-content">{renderCurrentStep()}</div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </ConfigProvider>
  );
};

export default PaymentPage;