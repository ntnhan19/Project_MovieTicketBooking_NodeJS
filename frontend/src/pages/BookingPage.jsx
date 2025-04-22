//frontend/src/pages/BookingPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Steps,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Form,
  message,
  Spin,
  Space,
  Tag,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { movieApi } from "../api/movieApi";
import { ticketApi } from "../api/ticketApi";
import SeatSelection from "../components/Payments/SeatSelectionPage";
import PaymentMethod from "./PaymentPage";
import CustomerInfoForm from "../components/Payments/CustomerInfoForm";

const { Title, Text } = Typography;

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cinema = searchParams.get("cinema");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const [currentStep, setCurrentStep] = useState(0);
  const [movie, setMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [form] = Form.useForm();

  // Giá vé và phí (VND)
  const ticketPrice = 90000;
  const serviceFee = 10000;

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        // Kiểm tra id có tồn tại và hợp lệ không
        if (!id) {
          message.error("ID phim không hợp lệ!");
          navigate("/"); // Điều hướng về trang chủ hoặc trang phim
          return;
        }

        const movieData = await movieApi.getMovieById(id);
        setMovie(movieData);
      } catch (error) {
        console.error("Không thể tải thông tin phim:", error);
        message.error("Không thể tải thông tin phim. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id, navigate]);

  const handleSeatSelection = (seats) => {
    setSelectedSeats(seats);
  };

  const calculateTotal = () => {
    return selectedSeats.length * ticketPrice + serviceFee;
  };

  const handleNext = () => {
    if (currentStep === 0 && selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    if (currentStep === 1) {
      form
        .validateFields()
        .then(() => {
          setCurrentStep(currentStep + 1);
        })
        .catch(() => {
          message.error("Vui lòng điền đầy đủ thông tin");
        });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePayment = async (paymentMethod) => {
    try {
      setPaymentLoading(true);

      // Lấy thông tin từ form
      const userInfo = form.getFieldsValue();

      // Tạo object booking
      const bookingData = {
        movieId: id,
        cinema: cinema,
        showDate: date,
        showTime: time,
        seats: selectedSeats,
        customerInfo: userInfo,
        paymentMethod: paymentMethod,
        amount: calculateTotal(),
      };

      // Gọi API đặt vé
      const response = await ticketApi.createBooking(bookingData);

      // Lưu mã đặt vé để hiển thị
      setBookingReference(
        response.bookingId ||
          response.id ||
          "BK-" + Math.floor(Math.random() * 1000000)
      );
      setPaymentComplete(true);
      message.success("Đặt vé thành công!");
    } catch (error) {
      console.error("Lỗi khi đặt vé:", error);
      message.error("Đã xảy ra lỗi khi đặt vé. Vui lòng thử lại!");
    } finally {
      setPaymentLoading(false);
    }
  };

  const steps = [
    {
      title: "Chọn ghế",
      icon: <ShoppingCartOutlined />,
      content: (
        <SeatSelection
          onSelectSeats={handleSeatSelection}
          selectedSeats={selectedSeats}
        />
      ),
    },
    {
      title: "Thông tin",
      icon: <UserOutlined />,
      content: <CustomerInfoForm form={form} />,
    },
    {
      title: "Thanh toán",
      icon: <CreditCardOutlined />,
      content: (
        <PaymentMethod onPayment={handlePayment} loading={paymentLoading} />
      ),
    },
    {
      title: "Hoàn tất",
      icon: <CheckCircleOutlined />,
      content: paymentComplete ? (
        <div className="booking-success">
          <div className="booking-success-content">
            <CheckCircleOutlined className="success-icon" />
            <Title level={2}>Đặt vé thành công!</Title>
            <Text className="booking-reference">
              Mã đặt vé: {bookingReference}
            </Text>
            <Text className="booking-info">
              Vui lòng kiểm tra email để xem chi tiết.
            </Text>

            <Space className="action-buttons" size="middle">
              <Button type="primary" size="large" onClick={() => navigate("/")}>
                Về trang chủ
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/profile/bookings")}
              >
                Xem lịch sử đặt vé
              </Button>
            </Space>
          </div>
        </div>
      ) : (
        <div className="payment-processing">
          <Spin size="large" tip="Đang xử lý thanh toán..." />
        </div>
      ),
    },
  ];

  if (loading && !movie) {
    return (
      <div style={{ textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "10px" }}>Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      <Card variant="borderless" className="booking-card">
        {movie && (
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8} md={6}>
              <div className="movie-poster">
                <img src={movie.poster || movie.image} alt={movie.title} />
              </div>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <Title level={2}>{movie.title}</Title>

              <Space size="large" wrap className="movie-info">
                <div className="info-item">
                  <Text strong>Rạp:</Text> <Tag color="blue">{cinema}</Tag>
                </div>
                <div className="info-item">
                  <Text strong>Ngày:</Text> <Tag color="purple">{date}</Tag>
                </div>
                <div className="info-item">
                  <Text strong>Giờ chiếu:</Text> <Tag color="green">{time}</Tag>
                </div>
              </Space>

              <Divider />

              <Steps current={currentStep} className="booking-steps">
                {steps.map((item) => (
                  <Steps.Step
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                  />
                ))}
              </Steps>
            </Col>
          </Row>
        )}

        <div className="steps-content">{steps[currentStep].content}</div>

        {currentStep < 3 && (
          <div className="steps-action">
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={handlePrev}>
                Quay lại
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleNext}
              icon={
                currentStep === steps.length - 2 ? null : <ArrowRightOutlined />
              }
            >
              {currentStep === steps.length - 2 ? "Hoàn tất" : "Tiếp tục"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookingPage;
