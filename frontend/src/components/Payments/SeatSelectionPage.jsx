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
import { HomeOutlined, TagOutlined, VideoCameraOutlined } from "@ant-design/icons";
import AppHeader from "../../components/common/AppHeader";
import Footer from "../../components/common/Footer";

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
  // Thêm hàm xóa dữ liệu cũ vào useEffect đầu tiên
useEffect(() => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (!token || !userId) {
    message.warning('Vui lòng đăng nhập để đặt vé');
    navigate('/login');
  } else {
    // Kiểm tra nếu người dùng đang bắt đầu quy trình mới
    const currentPath = window.location.pathname;
    const isNewBookingProcess = currentPath.includes('/booking/seats') && !currentPath.includes('/booking/payment');
    
    // Nếu đây là phiên đặt vé mới và không phải quay lại từ trang thanh toán
    if (isNewBookingProcess && !sessionStorage.getItem('returningFromPayment')) {
      // Xóa dữ liệu ghế cũ
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('showtimeId');
      console.log('Đã xóa dữ liệu ghế của phiên trước');
    }
  }
}, [navigate]);

// Sửa lại useEffect kiểm tra ghế đã chọn trước đó
useEffect(() => {
  const checkPreviousSelection = async () => {
    try {
      const storedSeats = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
      const storedShowtimeId = localStorage.getItem("showtimeId");
      
      // Chỉ khôi phục lại ghế đã chọn nếu:
      // 1. Có ghế được lưu trữ
      // 2. Đang ở cùng suất chiếu
      // 3. Người dùng đang quay lại từ trang thanh toán
      const returningFromPayment = sessionStorage.getItem('returningFromPayment') === 'true';
      
      if (storedSeats.length > 0 && storedShowtimeId === showtimeId && returningFromPayment) {
        console.log("Người dùng quay lại từ trang thanh toán, mở khóa ghế");
        const seatIds = storedSeats.map(seat => seat.id);
        
        // Mở khóa ghế
        await seatApi.unlockSeats(seatIds);
        console.log("Đã mở khóa ghế từ phiên trước:", seatIds);
        
        // Thiết lập lại ghế đã chọn trước đó
        setSelectedSeats(seatIds);
        
        // Xóa trạng thái quay lại sau khi đã xử lý
        sessionStorage.removeItem('returningFromPayment');
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
  }, [selectedSeats]);

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

  // Render chú thích màu ghế 
  const renderSeatLegend = () => (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <div className="legend-title w-full text-center mb-4 font-medium text-gray-600">
        Chú thích
      </div>
      
      <div className="flex flex-wrap justify-center">
        {/* Loại ghế - Bên trái */}
        <div className="w-1/2 pr-4">
          <h5 className="text-center font-medium text-gray-600 mb-2">Loại ghế</h5>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border-2 border-blue-500"></div>
              <span className="text-sm text-text-secondary">Ghế thường</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border-2 border-amber-500"></div>
              <span className="text-sm text-text-secondary">Ghế VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md border-2 border-purple-600 w-10"></div>
              <span className="text-sm text-text-secondary">Ghế đôi</span>
            </div>
          </div>
        </div>
        
        {/* Trạng thái ghế - Bên phải */}
        <div className="w-1/2 pl-4 border-l border-gray-200">
          <h5 className="text-center font-medium text-gray-600 mb-2">Trạng thái ghế</h5>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary"></div>
              <span className="text-sm text-text-secondary">Ghế đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-600"></div>
              <span className="text-sm text-text-secondary">Ghế đã đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-400"></div>
              <span className="text-sm text-text-secondary">Ghế đang khóa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render sơ đồ ghế 
  const renderSeats = () => {
    const seatsByRow = groupSeatsByRow();
    const rows = Object.keys(seatsByRow).sort();

    if (rows.length === 0) {
      return <div className="text-center py-8 text-text-secondary">Không có thông tin ghế</div>;
    }

    // Xác định số lượng cột lớn nhất
    const maxColumns = Math.max(...rows.map(row => 
      seatsByRow[row].reduce((max, seat) => {
        const width = seat.type === "COUPLE" ? 2 : 1;
        return Math.max(max, parseInt(seat.column) + width - 1);
      }, 0)
    ));

    return (
      <div className="overflow-x-auto pb-4 mt-6">
        <div className="mx-auto flex flex-col items-center">
          {rows.map((row) => (
            <div className="flex items-center mb-2 justify-center w-full" key={row}>
              <div className="w-6 text-center font-bold text-text-secondary">{row}</div>
              <div className="flex gap-2 justify-center" style={{ width: `${maxColumns * 40}px` }}>
                {seatsByRow[row]
                  .sort((a, b) => parseInt(a.column) - parseInt(b.column))
                  .map((seat) => {
                    // Xác định các class cho ghế
                    let seatClasses = "flex items-center justify-center rounded-md cursor-pointer text-xs font-medium transition-all";
                    
                    // Kích thước ghế
                    if (seat.type === "COUPLE") {
                      seatClasses += " w-14 h-7"; // Ghế đôi
                    } else {
                      seatClasses += " w-7 h-7"; // Ghế thường và VIP
                    }
                    
                    // Xác định style cho ghế dựa trên trạng thái và loại
                    if (seat.status === "BOOKED") {
                      // Ghế đã đặt
                      seatClasses += " bg-gray-600 text-white cursor-not-allowed";
                    } else if (seat.status === "LOCKED") {
                      // Ghế đang khóa
                      seatClasses += " bg-gray-400 text-white cursor-not-allowed";
                    } else if (selectedSeats.includes(seat.id)) {
                      // Ghế đang chọn
                      seatClasses += " bg-primary text-white hover:bg-primary-dark";
                    } else if (seat.status === "AVAILABLE") {
                      // Ghế khả dụng - Thay đổi từ nền sang viền màu
                      if (seat.type === "VIP") {
                        seatClasses += " bg-white text-text-primary border-2 border-amber-500 hover:bg-amber-100";
                      } else if (seat.type === "COUPLE") {
                        seatClasses += " bg-white text-text-primary border-2 border-purple-600 hover:bg-purple-100";
                      } else {
                        seatClasses += " bg-white text-text-primary border-2 border-blue-500 hover:bg-blue-100";
                      }
                    }

                    return (
                      <div
                        key={seat.id}
                        className={seatClasses}
                        onClick={() => handleSeatClick(seat.id)}
                        title={`${seat.row}${seat.column} - ${seat.type}`}
                      >
                        {seat.column}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Hiển thị thông tin các ghế đã chọn
  const renderSelectedSeatsInfo = () => {
    if (selectedSeats.length === 0) return <span className="text-text-secondary italic">Chưa chọn ghế</span>;

    // Hệ số giá theo loại ghế
    const priceMultiplier = {
      STANDARD: 1,
      VIP: 1.5,
      COUPLE: 2,
    };

    // Lấy giá cơ bản từ showtime
    const basePrice = showtimeDetails?.price || 0;

    return (
      <div className="flex flex-wrap gap-2">
        {selectedSeats.map((seatId) => {
          const seat = seats.find((s) => s.id === seatId);
          if (!seat) return null;

          const multiplier = priceMultiplier[seat.type] || 1;
          const price = basePrice * multiplier;

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
            <Tag key={seatId} color={tagColor}>
              {seat.row}
              {seat.column} - {price.toLocaleString("vi-VN")}đ
            </Tag>
          );
        })}
      </div>
    );
  };

  // Breadcrumb cải tiến
  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div className="flex items-center py-2 px-4 bg-gray-50 rounded-lg shadow-sm">
        <div className="flex items-center text-primary">
          <HomeOutlined className="mr-2" />
          <a href="/" className="text-primary hover:underline font-medium">Trang chủ</a>
        </div>
        <div className="mx-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center text-primary">
          <VideoCameraOutlined className="mr-2" />
          <a href="/movies" className="text-primary hover:underline font-medium">Phim</a>
        </div>
        <div className="mx-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center font-medium">
          <TagOutlined className="mr-2" />
          <span className="text-gray-700">Đặt vé - Chọn ghế</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <AppHeader />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Spin size="large" />
          <h4 className="mt-4 text-text-primary font-medium">Đang tải thông tin ghế...</h4>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb cải tiến */}
        <BreadcrumbNavigation />

        <Row gutter={[24, 24]}>
          {/* Thông tin phim */}
          <Col xs={24} lg={8} className="order-1 lg:order-1">
            <Card className="content-card shadow-md mb-6">
              {showtimeDetails && showtimeDetails.movie && (
                <div className="flex flex-col">
                  <div className="flex items-start">
                    {/* Poster phim - đã thu nhỏ */}
                    <div className="w-1/3 mr-4">
                      <img
                        src={showtimeDetails.movie.poster || showtimeDetails.movie.posterUrl || showtimeDetails.movie.image || "/fallback.jpg"}
                        alt={showtimeDetails.movie.title}
                        className="w-full rounded-md shadow-sm"
                      />
                    </div>
                    
                    {/* Thông tin phim */}
                    <div className="w-2/3">
                      <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">{showtimeDetails.movie.title}</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-text-primary">Rạp: </span>
                          <span className="text-text-secondary">{showtimeDetails.hall?.cinema?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-text-primary">Phòng: </span>
                          <span className="text-text-secondary">{showtimeDetails.hall?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-text-primary">Suất chiếu: </span>
                          <span className="text-text-secondary">
                            {new Date(showtimeDetails.startTime).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-text-primary">Thời gian: </span>
                          <span className="text-text-secondary">
                            {new Date(showtimeDetails.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {new Date(showtimeDetails.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Thông tin đặt vé */}
            <Card className="content-card shadow-md">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-text-primary mb-1">Thông tin đặt vé</h4>
                <Divider className="my-3" />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-text-primary">Ghế đã chọn:</h4>
                  {renderSelectedSeatsInfo()}
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">Số lượng ghế:</span>
                  <span className="font-bold">{selectedSeats.length}</span>
                </div>

                <Divider className="my-3" />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">Tổng tiền:</span>
                  <span className="text-lg font-bold text-primary">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleContinue}
                  loading={lockingSeats}
                  disabled={selectedSeats.length === 0}
                  className="bg-button-gradient border-none rounded-md font-bold h-12 mt-4 hover:bg-button-gradient-hover hover:shadow-button-hover"
                >
                  TIẾP TỤC THANH TOÁN
                </Button>
              </div>
            </Card>
          </Col>

          {/* Sơ đồ ghế */}
          <Col xs={24} lg={16} className="order-2 lg:order-2">
            <Card className="content-card shadow-md">
              {/* Màn hình - Cải thiện */}
              <div className="mb-8 relative">
                <div className="w-3/4 mx-auto h-10 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg flex items-center justify-center text-white text-sm font-medium shadow-md">
                  MÀN HÌNH
                </div>
                <div className="w-3/4 mx-auto h-3 bg-gradient-to-b from-gray-400 to-transparent rounded-b-lg"></div>
              </div>

              {/* Sơ đồ ghế */}
              <div className="flex flex-col items-center">
                {seats.length > 0 ? (
                  renderSeats()
                ) : (
                  <div className="py-8 text-center">
                    <Text type="warning">
                      Không có thông tin ghế cho suất chiếu này
                    </Text>
                  </div>
                )}
              </div>

              {/* Chú thích ghế - Đã cải tiến */}
              {renderSeatLegend()}
            </Card>
          </Col>
        </Row>
      </div>
      <Footer />
    </>
  );
};

export default SeatSelectionPage;