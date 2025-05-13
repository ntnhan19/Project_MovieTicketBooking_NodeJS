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
import {
  HomeOutlined,
  TagOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

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
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      message.warning("Vui lòng đăng nhập để đặt vé");
      navigate("/login");
    } else {
      // Kiểm tra nếu người dùng đang bắt đầu quy trình mới
      const currentPath = window.location.pathname;
      const isNewBookingProcess =
        currentPath.includes("/booking/seats") &&
        !currentPath.includes("/booking/payment");

      // Nếu đây là phiên đặt vé mới và không phải quay lại từ trang thanh toán
      if (
        isNewBookingProcess &&
        !sessionStorage.getItem("returningFromPayment")
      ) {
        // Xóa dữ liệu ghế cũ
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("showtimeId");
        console.log("Đã xóa dữ liệu ghế của phiên trước");
      }
    }
  }, [navigate]);

  // Sửa lại useEffect kiểm tra ghế đã chọn trước đó
  useEffect(() => {
    const checkPreviousSelection = async () => {
      try {
        const storedSeats = JSON.parse(
          localStorage.getItem("selectedSeats") || "[]"
        );
        const storedShowtimeId = localStorage.getItem("showtimeId");

        // Chỉ khôi phục lại ghế đã chọn nếu:
        // 1. Có ghế được lưu trữ
        // 2. Đang ở cùng suất chiếu
        // 3. Người dùng đang quay lại từ trang thanh toán
        const returningFromPayment =
          sessionStorage.getItem("returningFromPayment") === "true";

        if (
          storedSeats.length > 0 &&
          storedShowtimeId === showtimeId &&
          returningFromPayment
        ) {
          console.log("Người dùng quay lại từ trang thanh toán, mở khóa ghế");
          const seatIds = storedSeats.map((seat) => seat.id);

          // Mở khóa ghế
          await seatApi.unlockSeats(seatIds);
          console.log("Đã mở khóa ghế từ phiên trước:", seatIds);

          // Thiết lập lại ghế đã chọn trước đó
          setSelectedSeats(seatIds);

          // Xóa trạng thái quay lại sau khi đã xử lý
          sessionStorage.removeItem("returningFromPayment");
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

  // Render chú thích màu ghế - Đã cải tiến với màu sắc rõ ràng hơn
  const renderSeatLegend = () => (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="text-center mb-6">
        <h4 className="text-lg font-medium text-text-primary">Chú thích</h4>
      </div>

      <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 md:gap-8">
        {/* Loại ghế */}
        <div className="w-full md:w-1/2 p-4 bg-light-bg-secondary rounded-lg">
          <h5 className="text-center font-medium text-text-primary mb-4 pb-2 border-b border-gray-200">
            Loại ghế
          </h5>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 border-2 border-blue-500">
                <span className="text-xs text-blue-700 font-bold">A1</span>
              </div>
              <span className="text-sm text-text-secondary">Ghế thường</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-amber-100 border-2 border-amber-500">
                <span className="text-xs text-amber-700 font-bold">B2</span>
              </div>
              <span className="text-sm text-text-secondary">Ghế VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 flex items-center justify-center rounded-md bg-purple-100 border-2 border-purple-600">
                <span className="text-xs text-purple-700 font-bold">C3</span>
              </div>
              <span className="text-sm text-text-secondary">Ghế đôi</span>
            </div>
          </div>
        </div>

        {/* Trạng thái ghế */}
        <div className="w-full md:w-1/2 p-4 bg-light-bg-secondary rounded-lg">
          <h5 className="text-center font-medium text-text-primary mb-4 pb-2 border-b border-gray-200">
            Trạng thái ghế
          </h5>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white font-bold">
                <span className="text-xs">A1</span>
              </div>
              <span className="text-sm text-text-secondary">Đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-600 text-white font-bold">
                <span className="text-xs">B2</span>
              </div>
              <span className="text-sm text-text-secondary">Đã đặt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render sơ đồ ghế - Đã cải tiến với màu sắc rõ ràng hơn
  const renderSeats = () => {
    const seatsByRow = groupSeatsByRow();
    const rows = Object.keys(seatsByRow).sort();

    if (rows.length === 0) {
      return (
        <div className="text-center py-8 text-text-secondary">
          Không có thông tin ghế
        </div>
      );
    }

    // Xác định số lượng cột lớn nhất
    const maxColumns = Math.max(
      ...rows.map((row) =>
        seatsByRow[row].reduce((max, seat) => {
          const width = seat.type === "COUPLE" ? 2 : 1;
          return Math.max(max, parseInt(seat.column) + width - 1);
        }, 0)
      )
    );

    return (
      <div className="overflow-x-auto pb-6 mt-6">
        <div className="mx-auto flex flex-col items-center">
          {rows.map((row) => (
            <div
              className="flex items-center mb-3 justify-center w-full"
              key={row}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-light-bg-secondary text-text-primary font-bold mr-2">
                {row}
              </div>
              <div
                className="flex gap-2 justify-center"
                style={{ width: `${maxColumns * 40}px` }}
              >
                {seatsByRow[row]
                  .sort((a, b) => parseInt(a.column) - parseInt(b.column))
                  .map((seat) => {
                    // Xác định các class cho ghế
                    let seatClasses =
                      "flex items-center justify-center rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer";

                    // Kích thước ghế
                    if (seat.type === "COUPLE") {
                      seatClasses += " w-16 h-8"; // Ghế đôi - đã tăng kích thước
                    } else {
                      seatClasses += " w-8 h-8"; // Ghế thường và VIP - đã tăng kích thước
                    }

                    // Xác định style cho ghế dựa trên trạng thái và loại
                    if (seat.status === "BOOKED") {
                      // Ghế đã đặt
                      seatClasses +=
                        " bg-gray-600 text-white cursor-not-allowed";
                    } else if (seat.status === "LOCKED") {
                      // Bỏ qua ghế đang khóa và xử lý như ghế đã đặt
                      seatClasses +=
                        " bg-gray-600 text-white cursor-not-allowed";
                    } else if (selectedSeats.includes(seat.id)) {
                      // Ghế đang chọn
                      seatClasses +=
                        " bg-primary text-white hover:bg-primary-dark";
                    } else if (seat.status === "AVAILABLE") {
                      // Ghế khả dụng - Thêm màu nền nhạt để dễ phân biệt
                      if (seat.type === "VIP") {
                        seatClasses +=
                          " bg-amber-100 text-amber-700 border-2 border-amber-500 hover:bg-amber-200";
                      } else if (seat.type === "COUPLE") {
                        seatClasses +=
                          " bg-purple-100 text-purple-700 border-2 border-purple-600 hover:bg-purple-200";
                      } else {
                        seatClasses +=
                          " bg-blue-100 text-blue-700 border-2 border-blue-500 hover:bg-blue-200";
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

  // Hiển thị thông tin các ghế đã chọn - Đã cải tiến với màu sắc phù hợp
  const renderSelectedSeatsInfo = () => {
    if (selectedSeats.length === 0)
      return (
        <div className="flex items-center justify-center h-12 bg-light-bg-secondary rounded-lg">
          <span className="text-text-secondary italic">Chưa chọn ghế</span>
        </div>
      );

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
          let tagBgClass = "";

          if (seat.type === "VIP") {
            tagColor = "gold";
            tagBgClass = "bg-amber-100 border border-amber-500 text-amber-700";
          } else if (seat.type === "COUPLE") {
            tagColor = "purple";
            tagBgClass =
              "bg-purple-100 border border-purple-600 text-purple-700";
          } else {
            tagColor = "blue";
            tagBgClass = "bg-blue-100 border border-blue-500 text-blue-700";
          }

          return (
            <Tag
              key={seatId}
              color={tagColor}
              className={`px-3 py-1.5 rounded-lg font-medium ${tagBgClass}`}
            >
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
      <div className="flex items-center py-3 px-4 bg-light-bg-secondary rounded-lg shadow-sm">
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
            className="feather feather-chevron-right"
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
            className="feather feather-chevron-right"
          >
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

  // Render màn hình cinema - Đã cải tiến
  const renderScreen = () => (
    <div className="mb-10 relative">
      <div className="w-full mx-auto h-16 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 rounded-t-lg flex items-center justify-center text-white font-medium shadow-lg">
        MÀN HÌNH
      </div>
      <div className="w-full mx-auto h-4 bg-gradient-to-b from-gray-500 to-transparent"></div>
      <div className="mt-3 w-full mx-auto flex justify-center">
        <div className="w-1/2 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-light-bg">
        <Spin size="large" />
        <h4 className="mt-6 text-text-primary font-medium">
          Đang tải thông tin ghế...
        </h4>
      </div>
    );
  }

  return (
    <div className="bg-light-bg min-h-screen">
      {/* Sử dụng container-fluid thay vì max-w-6xl để mở rộng toàn màn hình */}
      <div className="w-full mx-auto px-4 py-6 pt-24">
        {/* Breadcrumb cải tiến */}
        <BreadcrumbNavigation />

        <Row gutter={[24, 24]}>
          {/* Thông tin phim - Giảm kích thước cột bên trái */}
          <Col xs={24} lg={6} className="order-1 lg:order-1">
            <Card className="content-card shadow-md mb-6 border border-border-light">
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
                        className="w-full rounded-lg shadow-sm object-cover"
                        style={{ aspectRatio: "2/3" }}
                      />
                    </div>

                    {/* Thông tin phim */}
                    <div className="w-2/3">
                      <h3 className="text-lg font-bold text-text-primary mb-3 line-clamp-2">
                        {showtimeDetails.movie.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="font-medium text-text-primary w-20">
                            Rạp:{" "}
                          </span>
                          <span className="text-text-secondary flex-1">
                            {showtimeDetails.hall?.cinema?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium text-text-primary w-20">
                            Phòng:{" "}
                          </span>
                          <span className="text-text-secondary flex-1">
                            {showtimeDetails.hall?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium text-text-primary w-20">
                            Suất chiếu:{" "}
                          </span>
                          <span className="text-text-secondary flex-1">
                            {new Date(
                              showtimeDetails.startTime
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-medium text-text-primary w-20">
                            Thời gian:{" "}
                          </span>
                          <span className="text-text-secondary flex-1">
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

            {/* Thông tin đặt vé */}
            <Card className="content-card shadow-md border border-border-light">
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-text-primary mb-1">
                  Thông tin đặt vé
                </h4>
                <Divider className="my-3" />

                <div className="space-y-3">
                  <h4 className="font-medium text-text-primary">
                    Ghế đã chọn:
                  </h4>
                  {renderSelectedSeatsInfo()}
                </div>

                <div className="flex justify-between items-center p-3 bg-light-bg-secondary rounded-lg">
                  <span className="font-medium text-text-primary">
                    Số lượng ghế:
                  </span>
                  <span className="font-bold text-primary">
                    {selectedSeats.length}
                  </span>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-between items-center bg-primary bg-opacity-5 p-4 rounded-lg">
                  <span className="font-medium text-text-primary">
                    Tổng tiền:
                  </span>
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
                  className="bg-button-gradient border-none rounded-lg font-bold h-12 mt-4 hover:bg-button-gradient-hover hover:shadow-button-hover"
                >
                  TIẾP TỤC THANH TOÁN
                </Button>
              </div>
            </Card>
          </Col>

          {/* Sơ đồ ghế */}
          <Col xs={24} lg={16} className="order-2 lg:order-2">
            <Card className="content-card shadow-md border border-border-light">

              {/* Màn hình - Đã cải tiến */}
              {renderScreen()}

              {/* Sơ đồ ghế */}
              <div className="flex flex-col items-center">
                {seats.length > 0 ? (
                  renderSeats()
                ) : (
                  <div className="py-12 text-center bg-light-bg-secondary rounded-lg">
                    <Text type="warning" className="text-lg">
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
    </div>
  );
};

export default SeatSelectionPage;
