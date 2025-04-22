import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Typography,
  message,
  Divider,
  Tag,
} from "antd";
import { seatApi } from "../../api/seatApi";
import { showtimeApi } from "../../api/showtimeApi";
import "./SeatSelectionPage.css";

const { Title, Text } = Typography;

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  // State cho dữ liệu
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);
  const [lockingSeats, setLockingSeats] = useState(false);

  // Tính toán giá vé
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seatObj = seats.find((s) => s.id === seatId);
    if (!seatObj) return sum;

    // Hệ số giá theo loại ghế
    const priceMultiplier = {
      STANDARD: 1,
      VIP: 1.5,
      COUPLE: 2,
    };

    // Lấy giá cơ bản từ showtime
    const basePrice = showtimeDetails?.price || 0;
    const multiplier = priceMultiplier[seatObj.type] || 1;
    return sum + basePrice * multiplier;
  }, 0);


  // Kiểm tra xem người dùng đã đăng nhập chưa
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      message.warning('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
    }
  }, [navigate]);

  // Kiểm tra và mở khóa ghế nếu người dùng quay lại từ trang thanh toán
  useEffect(() => {
    const checkPreviousSelection = async () => {
      try {
        const storedSeats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
        const storedShowtimeId = localStorage.getItem("showtimeId");
        
        if (storedSeats.length > 0 && storedShowtimeId === showtimeId) {
          console.log("Người dùng quay lại từ trang thanh toán, mở khóa ghế");
          const seatIds = storedSeats.map(seat => seat.id);
          
          // Mở khóa ghế
          await seatApi.unlockSeats(seatIds);
          console.log("Đã mở khóa ghế từ phiên trước:", seatIds);
          
          // Thiết lập lại ghế đã chọn trước đó
          setSelectedSeats(seatIds);
        }
      } catch (error) {
        console.error("Lỗi khi mở khóa ghế:", error);
      }
    };

    if (showtimeId) {
      checkPreviousSelection();
    }
  }, [showtimeId]);

  // Lấy thông tin suất chiếu và danh sách ghế khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chi tiết suất chiếu
        const showtimeData = await showtimeApi.getShowtimeById(showtimeId);
        setShowtimeDetails(showtimeData);
  
        // Lấy danh sách ghế
        const seatsData = await seatApi.getSeatsByShowtime(showtimeId);
        console.log("Seats data fetched:", seatsData);
        setSeats(seatsData);
      } catch (error) {
        console.error("Error fetching seat data:", error);
        message.error("Không thể tải thông tin ghế");
      } finally {
        setLoading(false);
      }
    };
  
    if (showtimeId) {
      fetchData();
    }
  }, [showtimeId]);

  // Cleanup: Giải phóng ghế khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      if (selectedSeats.length > 0) {
        console.log("Cleanup: Mở khóa ghế khi rời khỏi trang", selectedSeats);
        seatApi.unlockSeats(selectedSeats).catch((err) => {
          console.error("Error unlocking seats:", err);
        });
      }
    };
  }, [selectedSeats]); // Thêm selectedSeats vào dependency array

  // Xử lý chọn ghế
  const handleSeatClick = (seatId) => {
    // Tìm ghế trong danh sách
    const seat = seats.find((s) => s.id === seatId);

    // Chỉ cho phép chọn ghế có trạng thái AVAILABLE
    if (seat && seat.status === "AVAILABLE") {
      setSelectedSeats((prev) => {
        // Nếu ghế đã được chọn, bỏ chọn
        if (prev.includes(seatId)) {
          return prev.filter((id) => id !== seatId);
        }
        // Nếu chưa chọn, thêm vào danh sách
        return [...prev, seatId];
      });
    } else if ((seat && seat.status === "LOCKED") || seat.status === "BOOKED") {
      message.warning("Ghế này không khả dụng");
    }
  };

  // Xử lý khóa ghế và chuyển đến trang thanh toán
  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế");
      return;
    }

    setLockingSeats(true);
    try {
      // Khóa ghế
      await seatApi.lockSeats(selectedSeats);
      console.log("Đã khóa ghế thành công:", selectedSeats);

      // Lưu thông tin chi tiết hơn vào localStorage
      const selectedSeatsData = selectedSeats
        .map((seatId) => {
          const seat = seats.find((s) => s.id === seatId);
          if (!seat) return null;

          // Tính giá cho từng ghế
          const priceMultiplier = {
            STANDARD: 1,
            VIP: 1.5,
            COUPLE: 2,
          };

          const basePrice = showtimeDetails?.price || 0;
          const multiplier = priceMultiplier[seat.type] || 1;

          return {
            id: seatId,
            row: seat.row,
            column: seat.column,
            type: seat.type,
            price: basePrice * multiplier,
          };
        })
        .filter(Boolean);

      console.log("Lưu vào localStorage:", selectedSeatsData);
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeatsData));
      localStorage.setItem("showtimeId", showtimeId);
      localStorage.setItem(
        "showtimeDetails",
        JSON.stringify({
          id: showtimeId,
          movieTitle: showtimeDetails?.movie?.title,
          cinemaName: showtimeDetails?.hall?.cinema?.name,
          hallName: showtimeDetails?.hall?.name,
          startTime: showtimeDetails?.startTime,
          endTime: showtimeDetails?.endTime,
          basePrice: showtimeDetails?.price,
        })
      );
      localStorage.setItem("totalPrice", totalPrice);

      // Chuyển đến trang thanh toán
      navigate("/booking/payment");
    } catch (error) {
      console.error("Error locking seats:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Không thể khóa ghế. Vui lòng thử lại sau.");
      }
    } finally {
      setLockingSeats(false);
    }
  };

  // Hàm tính toán giá riêng cho từng ghế
  // eslint-disable-next-line no-unused-vars
  const calculateSeatPrice = (seat) => {
    const priceMultiplier = {
      STANDARD: 1,
      VIP: 1.5,
      COUPLE: 2,
    };

    const basePrice = showtimeDetails?.price || 0;
    const multiplier = priceMultiplier[seat.type] || 1;
    return basePrice * multiplier;
  };

  // Nhóm ghế theo hàng
  const groupSeatsByRow = () => {
    const seatsByRow = {};

    if (seats && seats.length > 0) {
      seats.forEach((seat) => {
        if (!seatsByRow[seat.row]) {
          seatsByRow[seat.row] = [];
        }
        seatsByRow[seat.row].push(seat);
      });
    }

    return seatsByRow;
  };

  // Render mã màu trạng thái ghế
  const renderSeatLegend = () => (
    <div className="seat-legend">
      <div className="legend-item">
        <div className="seat-sample available"></div>
        <span>Ghế trống</span>
      </div>
      <div className="legend-item">
        <div className="seat-sample selected"></div>
        <span>Ghế đang chọn</span>
      </div>
      <div className="legend-item">
        <div className="seat-sample reserved"></div>
        <span>Ghế đã đặt</span>
      </div>
      <div className="legend-item">
        <div className="seat-sample locked"></div>
        <span>Ghế đang khóa</span>
      </div>
      <div className="legend-item">
        <div className="seat-sample vip"></div>
        <span>Ghế VIP</span>
      </div>
      <div className="legend-item">
        <div className="seat-sample couple"></div>
        <span>Ghế đôi</span>
      </div>
    </div>
  );

  // Render sơ đồ ghế
  const renderSeats = () => {
    const seatsByRow = groupSeatsByRow();
    const rows = Object.keys(seatsByRow).sort();

    if (rows.length === 0) {
      return <div className="no-seats">Không có thông tin ghế</div>;
    }

    return rows.map((row) => (
      <div className="seat-row" key={row}>
        <div className="row-label">{row}</div>
        <div className="seats-container">
          {seatsByRow[row]
            .sort((a, b) => parseInt(a.column) - parseInt(b.column))
            .map((seat) => {
              // Xác định CSS class dựa trên trạng thái và loại ghế
              let seatClass = "seat";

              // Thêm class dựa trên loại ghế
              if (seat.type === "VIP") {
                seatClass += " vip";
              } else if (seat.type === "COUPLE") {
                seatClass += " couple";
              }

              // Thêm class dựa trên trạng thái ghế
              if (seat.status === "BOOKED") {
                seatClass += " reserved";
              } else if (seat.status === "LOCKED") {
                seatClass += " locked";
              } else if (selectedSeats.includes(seat.id)) {
                seatClass += " selected";
              } else if (seat.status === "AVAILABLE") {
                seatClass += " available";
              }

              return (
                <div
                  key={seat.id}
                  className={seatClass}
                  onClick={() => handleSeatClick(seat.id)}
                  title={`${seat.row}${seat.column} - ${seat.type}`}
                >
                  {seat.column}
                </div>
              );
            })}
        </div>
      </div>
    ));
  };

  // Hiển thị thông tin các ghế đã chọn
  const renderSelectedSeatsInfo = () => {
    if (selectedSeats.length === 0) return <span>Chưa chọn ghế</span>;

    // Hệ số giá theo loại ghế
    const priceMultiplier = {
      STANDARD: 1,
      VIP: 1.5,
      COUPLE: 2,
    };

    // Lấy giá cơ bản từ showtime
    const basePrice = showtimeDetails?.price || 0;

    return (
      <div className="selected-seats-list">
        {selectedSeats.map((seatId) => {
          const seat = seats.find((s) => s.id === seatId);
          if (!seat) return null;

          const multiplier = priceMultiplier[seat.type] || 1;
          const price = basePrice * multiplier;

          return (
            <Tag
              key={seatId}
              color={
                seat.type === "VIP"
                  ? "gold"
                  : seat.type === "COUPLE"
                  ? "purple"
                  : "blue"
              }
            >
              {seat.row}
              {seat.column} - {price.toLocaleString("vi-VN")}đ
            </Tag>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Title level={4}>Đang tải thông tin ghế...</Title>
      </div>
    );
  }

  return (
    <div className="seat-selection-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card className="seat-section">
            {/* Thông tin phim và suất chiếu */}
            {showtimeDetails && (
              <div className="showtime-info">
                <Title level={3}>{showtimeDetails.movie?.title}</Title>
                <Text strong>Rạp: {showtimeDetails.hall?.cinema?.name}</Text>
                <Text strong>Phòng: {showtimeDetails.hall?.name}</Text>
                <Divider />
                <Text strong>
                  Suất chiếu:{" "}
                  {new Date(showtimeDetails.startTime).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}{" "}
                  -{" "}
                  {new Date(showtimeDetails.endTime).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </Text>
                <Divider />
                <Text strong>
                  Ngày:{" "}
                  {new Date(showtimeDetails.startTime).toLocaleDateString(
                    "vi-VN"
                  )}
                </Text>
              </div>
            )}

            <Divider />

            {/* Màn hình */}
            <div className="cinema-screen">
              <div className="screen">Màn hình</div>
            </div>

            {/* Sơ đồ ghế */}
            <div className="seating-chart">
              {seats.length > 0 ? (
                renderSeats()
              ) : (
                <div className="no-seats-warning">
                  <Text type="warning">
                    Không có thông tin ghế cho suất chiếu này
                  </Text>
                </div>
              )}
            </div>

            {/* Chú thích ghế */}
            {renderSeatLegend()}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Thông tin đặt vé */}
          <Card className="ticket-info">
            <div className="booking-summary">
              <div className="summary-item">
                <Text strong>Ghế đã chọn:</Text>
                {renderSelectedSeatsInfo()}
              </div>

              <div className="summary-item">
                <Text strong>Số lượng ghế:</Text>
                <Text>{selectedSeats.length}</Text>
              </div>

              <div className="summary-item">
                <Text strong>Tổng tiền:</Text>
                <Text className="total-price">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleContinue}
                loading={lockingSeats}
                disabled={selectedSeats.length === 0}
              >
                Tiếp tục
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SeatSelectionPage;