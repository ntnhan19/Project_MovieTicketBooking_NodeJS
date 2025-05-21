import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
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
  const { theme } = useContext(ThemeContext);

  // State cho dữ liệu
  const [showtimeDetails, setShowtimeDetails] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockingSeats, setLockingSeats] = useState(false);

  // Tính toán giá vé
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seatObj = seats.find((s) => s.id === seatId);
    if (!seatObj) return sum;
    const priceMultiplier = { STANDARD: 1, VIP: 1.5, COUPLE: 2 };
    const basePrice = showtimeDetails?.price || 0;
    const multiplier = priceMultiplier[seatObj.type] || 1;
    return sum + basePrice * multiplier;
  }, 0);

  // Kiểm tra đăng nhập và xóa dữ liệu cũ
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) {
      message.warning("Vui lòng đăng nhập để đặt vé");
      navigate("/login");
    } else {
      const currentPath = window.location.pathname;
      const isNewBookingProcess =
        currentPath.includes("/booking/seats") &&
        !currentPath.includes("/booking/payment");
      if (
        isNewBookingProcess &&
        !sessionStorage.getItem("returningFromPayment")
      ) {
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("showtimeId");
      }
    }
  }, [navigate]);

  // Kiểm tra ghế đã chọn trước đó
  useEffect(() => {
    const checkPreviousSelection = async () => {
      try {
        const storedSeats = JSON.parse(
          localStorage.getItem("selectedSeats") || "[]"
        );
        const storedShowtimeId = localStorage.getItem("showtimeId");
        const returningFromPayment =
          sessionStorage.getItem("returningFromPayment") === "true";
        if (
          storedSeats.length > 0 &&
          storedShowtimeId === showtimeId &&
          returningFromPayment
        ) {
          const seatIds = storedSeats.map((seat) => seat.id);
          await seatApi.unlockSeats(seatIds);
          setSelectedSeats(seatIds);
          sessionStorage.removeItem("returningFromPayment");
        }
      } catch (error) {
        console.error("Lỗi khi mở khóa ghế:", error);
      }
    };
    if (showtimeId) checkPreviousSelection();
  }, [showtimeId]);

  // Lấy thông tin suất chiếu và danh sách ghế
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const showtimeData = await showtimeApi.getShowtimeById(showtimeId);
        setShowtimeDetails(showtimeData);
        const seatsData = await seatApi.getSeatsByShowtime(showtimeId);
        setSeats(seatsData);
      } catch (error) {
        console.error("Error fetching seat data:", error);
        message.error("Không thể tải thông tin ghế");
      } finally {
        setLoading(false);
      }
    };
    if (showtimeId) fetchData();
  }, [showtimeId]);

  // Cleanup ghế khi rời trang
  useEffect(() => {
    return () => {
      if (selectedSeats.length > 0) {
        seatApi.unlockSeats(selectedSeats).catch((err) => {
          console.error("Error unlocking seats:", err);
        });
      }
    };
  }, [selectedSeats]);

  // Xử lý chọn ghế
  const handleSeatClick = (seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    if (seat && seat.status === "AVAILABLE") {
      setSelectedSeats((prev) =>
        prev.includes(seatId)
          ? prev.filter((id) => id !== seatId)
          : [...prev, seatId]
      );
    } else if ((seat && seat.status === "LOCKED") || seat.status === "BOOKED") {
      message.warning("Ghế này không khả dụng");
    }
  };

  // Xử lý khóa ghế và chuyển đến thanh toán
  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế");
      return;
    }
    setLockingSeats(true);
    try {
      await seatApi.lockSeats(selectedSeats);
      const selectedSeatsData = selectedSeats
        .map((seatId) => {
          const seat = seats.find((s) => s.id === seatId);
          if (!seat) return null;
          const priceMultiplier = { STANDARD: 1, VIP: 1.5, COUPLE: 2 };
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
      navigate("/booking/payment");
    } catch (error) {
      console.error("Error locking seats:", error);
      message.error(
        error.response?.data?.message || "Không thể khóa ghế. Vui lòng thử lại."
      );
    } finally {
      setLockingSeats(false);
    }
  };

  // Nhóm ghế theo hàng
  const groupSeatsByRow = () => {
    const seatsByRow = {};
    if (seats && seats.length > 0) {
      seats.forEach((seat) => {
        if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
        seatsByRow[seat.row].push(seat);
      });
    }
    return seatsByRow;
  };

  // Chú thích ghế
  const renderSeatLegend = () => (
    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
      <div className="text-center mb-6">
        <h4
          className={`text-lg font-medium ${
            theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
          }`}
        >
          Chú thích
        </h4>
      </div>
      <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 md:gap-8">
        <div
          className={`w-full md:w-1/2 p-4 rounded-lg ${
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
          }`}
        >
          <h5
            className={`text-center font-medium mb-4 pb-2 border-b ${
              theme === "dark"
                ? "text-dark-text-primary border-gray-600"
                : "text-text-primary border-gray-200"
            }`}
          >
            Loại ghế
          </h5>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-100 border-2 border-blue-500 dark:bg-blue-900 dark:border-blue-400">
                <span
                  className={`text-xs font-bold ${
                    theme === "dark" ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  A1
                </span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                }`}
              >
                Ghế thường
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-amber-100 border-2 border-amber-500 dark:bg-amber-900 dark:border-amber-400">
                <span
                  className={`text-xs font-bold ${
                    theme === "dark" ? "text-amber-300" : "text-amber-700"
                  }`}
                >
                  B2
                </span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                }`}
              >
                Ghế VIP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 flex items-center justify-center rounded-md bg-purple-100 border-2 border-purple-600 dark:bg-purple-900 dark:border-purple-500">
                <span
                  className={`text-xs font-bold ${
                    theme === "dark" ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  C3
                </span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                }`}
              >
                Ghế đôi
              </span>
            </div>
          </div>
        </div>
        <div
          className={`w-full md:w-1/2 p-4 rounded-lg ${
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
          }`}
        >
          <h5
            className={`text-center font-medium mb-4 pb-2 border-b ${
              theme === "dark"
                ? "text-dark-text-primary border-gray-600"
                : "text-text-primary border-gray-200"
            }`}
          >
            Trạng thái ghế
          </h5>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-red-500 text-white font-bold dark:bg-red-600">
                <span className="text-xs">A1</span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                }`}
              >
                Đang chọn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-600 text-white font-bold dark:bg-gray-700">
                <span className="text-xs">B2</span>
              </div>
              <span
                className={`text-sm ${
                  theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                }`}
              >
                Đã đặt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Sơ đồ ghế
  const renderSeats = () => {
    const seatsByRow = groupSeatsByRow();
    const rows = Object.keys(seatsByRow).sort();
    if (rows.length === 0) {
      return (
        <div
          className={`text-center py-8 ${
            theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
          }`}
        >
          Không có thông tin ghế
        </div>
      );
    }
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
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  theme === "dark"
                    ? "bg-dark-bg-secondary text-dark-text-primary"
                    : "bg-light-bg-secondary text-text-primary"
                } font-bold mr-2`}
              >
                {row}
              </div>
              <div
                className="flex gap-2 justify-center"
                style={{ width: `${maxColumns * 40}px` }}
              >
                {seatsByRow[row]
                  .sort((a, b) => parseInt(a.column) - parseInt(b.column))
                  .map((seat) => {
                    let seatClasses =
                      "flex items-center justify-center rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer";
                    seatClasses += seat.type === "COUPLE" ? " w-16 h-8" : " w-8 h-8";
                    if (seat.status === "BOOKED" || seat.status === "LOCKED") {
                      seatClasses +=
                        " bg-gray-600 text-white cursor-not-allowed dark:bg-gray-700";
                    } else if (selectedSeats.includes(seat.id)) {
                      seatClasses +=
                        " bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700";
                    } else if (seat.status === "AVAILABLE") {
                      if (seat.type === "VIP") {
                        seatClasses +=
                          " bg-amber-100 text-amber-700 border-2 border-amber-500 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-400 dark:hover:bg-amber-800";
                      } else if (seat.type === "COUPLE") {
                        seatClasses +=
                          " bg-purple-100 text-purple-700 border-2 border-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-500 dark:hover:bg-purple-800";
                      } else {
                        seatClasses +=
                          " bg-blue-100 text-blue-700 border-2 border-blue-500 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-400 dark:hover:bg-blue-800";
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

  // Thông tin ghế đã chọn
  const renderSelectedSeatsInfo = () => {
    if (selectedSeats.length === 0)
      return (
        <div
          className={`flex items-center justify-center h-12 rounded-lg ${
            theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
          }`}
        >
          <span
            className={`italic ${
              theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
            }`}
          >
            Chưa chọn ghế
          </span>
        </div>
      );
    const priceMultiplier = { STANDARD: 1, VIP: 1.5, COUPLE: 2 };
    const basePrice = showtimeDetails?.price || 0;
    return (
      <div className="flex flex-wrap gap-2">
        {selectedSeats.map((seatId) => {
          const seat = seats.find((s) => s.id === seatId);
          if (!seat) return null;
          const multiplier = priceMultiplier[seat.type] || 1;
          const price = basePrice * multiplier;
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

  // Breadcrumb
  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div
        className={`flex items-center py-3 px-4 rounded-lg shadow-sm ${
          theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
        }`}
      >
        <div className="flex items-center text-red-500 dark:text-red-400">
          <HomeOutlined className="mr-2" />
          <a href="/" className="text-red-500 dark:text-red-400 hover:underline font-medium">
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
        <div className="flex items-center font-medium">
          <TagOutlined className="mr-2 text-red-500 dark:text-red-400" />
          <span
            className={`${
              theme === "dark" ? "text-dark-text-primary" : "text-gray-700"
            }`}
          >
            Đặt vé - Chọn ghế
          </span>
        </div>
      </div>
    </div>
  );

  // Màn hình cinema
  const renderScreen = () => (
    <div className="mb-10 relative">
      <div
        className={`w-full mx-auto h-16 rounded-t-lg flex items-center justify-center text-white font-medium shadow-lg ${
          theme === "dark"
            ? "bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800"
            : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700"
        }`}
      >
        MÀN HÌNH
      </div>
      <div
        className={`w-full mx-auto h-4 ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-600 to-transparent"
            : "bg-gradient-to-b from-gray-500 to-transparent"
        }`}
      ></div>
      <div className="mt-3 w-full mx-auto flex justify-center">
        <div
          className={`w-1/2 h-1 ${
            theme === "dark"
              ? "bg-gradient-to-r from-transparent via-gray-500 to-transparent"
              : "bg-gradient-to-r from-transparent via-gray-300 to-transparent"
          }`}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-screen ${
          theme === "dark" ? "bg-dark-bg" : "bg-light-bg"
        }`}
      >
        <Spin size="large" />
        <h4
          className={`mt-6 font-medium ${
            theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
          }`}
        >
          Đang tải thông tin ghế...
        </h4>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-dark-bg" : "bg-light-bg"}`}>
      <div className="w-full mx-auto px-4 py-6">
        <BreadcrumbNavigation />
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6} className="order-1 lg:order-1">
            <Card
              className={`content-card shadow-md mb-6 border ${
                theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
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
                          theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                        }`}
                      >
                        {showtimeDetails.movie.title}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                            }`}
                          >
                            Rạp:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                            }`}
                          >
                            {showtimeDetails.hall?.cinema?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                            }`}
                          >
                            Phòng:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                            }`}
                          >
                            {showtimeDetails.hall?.name}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                            }`}
                          >
                            Suất chiếu:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                            }`}
                          >
                            {new Date(showtimeDetails.startTime).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <span
                            className={`font-medium w-20 ${
                              theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                            }`}
                          >
                            Thời gian:
                          </span>
                          <span
                            className={`flex-1 ${
                              theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                            }`}
                          >
                            {new Date(showtimeDetails.startTime).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(showtimeDetails.endTime).toLocaleTimeString("vi-VN", {
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
                theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
              }`}
            >
              <div className="space-y-4">
                <h4
                  className={`text-lg font-bold mb-1 ${
                    theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                  }`}
                >
                  Thông tin đặt vé
                </h4>
                <Divider className="my-3" />
                <div className="space-y-3">
                  <h4
                    className={`font-medium ${
                      theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                    }`}
                  >
                    Ghế đã chọn:
                  </h4>
                  {renderSelectedSeatsInfo()}
                </div>
                <div
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
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
                      theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                    }`}
                  >
                    Tổng tiền:
                  </span>
                  <span className="text-lg font-bold text-red-500 dark:text-red-400">
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
                  className="bg-red-500 border-none rounded-lg font-bold h-12 mt-4 hover:bg-red-600 hover:shadow-button-hover dark:bg-red-500 dark:hover:bg-red-600"
                >
                  TIẾP TỤC THANH TOÁN
                </Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={16} className="order-2 lg:order-2">
            <Card
              className={`content-card shadow-md border ${
                theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
              }`}
            >
              {renderScreen()}
              <div className="flex flex-col items-center">
                {seats.length > 0 ? (
                  renderSeats()
                ) : (
                  <div
                    className={`py-12 text-center rounded-lg ${
                      theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
                    }`}
                  >
                    <Text
                      type="warning"
                      className={`text-lg ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                      }`}
                    >
                      Không có thông tin ghế cho suất chiếu này
                    </Text>
                  </div>
                )}
              </div>
              {renderSeatLegend()}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SeatSelectionPage;