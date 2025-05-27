import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, DatePicker, Button, Spin, App } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  RightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const QuickBookingWidget = () => {
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const { isAuthenticated, openAuthModal } = useAuth();

  // State cho các lựa chọn
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  // State cho giá trị được chọn
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  // State cho loading
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // 1. Load danh sách rạp chiếu khi component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const data = await cinemaApi.getAllCinemas();
        setCinemas(data || []);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách rạp chiếu",
          duration: 3,
        });
        setCinemas([]);
      } finally {
        setLoadingCinemas(false);
      }
    };
    fetchCinemas();
  }, []);

  // 2. Load danh sách phim khi chọn rạp và ngày
  useEffect(() => {
    if (!selectedCinema || !selectedDate) {
      setMovies([]);
      setSelectedMovie(null);
      return;
    }

    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const dateString = selectedDate.format("YYYY-MM-DD");
        const data = await movieApi.getMoviesByCinema(
          selectedCinema,
          dateString
        );

        if (data && data.length > 0) {
          setMovies(data);
        } else {
          setMovies([]);
          notification.info({
            message: "Thông báo",
            description: "Không có phim nào chiếu tại rạp này vào ngày đã chọn",
            duration: 3,
          });
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách phim",
          duration: 3,
        });
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [selectedCinema, selectedDate, notification]);

  // 3. Load danh sách suất chiếu khi chọn ngày, phim và rạp
  useEffect(() => {
    if (!selectedCinema || !selectedMovie || !selectedDate) {
      setShowtimes([]);
      setSelectedShowtime(null);
      return;
    }

    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const dateString = selectedDate.format("YYYY-MM-DD");
        const data = await showtimeApi.getShowtimesByFilters(
          selectedMovie,
          selectedCinema,
          dateString
        );

        if (data && data.length > 0) {
          setShowtimes(data);
        } else {
          setShowtimes([]);
          notification.info({
            message: "Thông báo",
            description: "Không có suất chiếu cho phim này vào ngày đã chọn",
            duration: 3,
          });
        }
      } catch (error) {
        console.error("Error fetching showtimes:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải danh sách suất chiếu",
          duration: 3,
        });
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedCinema, selectedMovie, selectedDate, notification]);

  // Xử lý khi chọn rạp
  const handleCinemaChange = (value) => {
    setSelectedCinema(value);
    setSelectedMovie(null);
    setSelectedShowtime(null);
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedMovie(null);
    setSelectedShowtime(null);
  };

  // Xử lý khi chọn phim
  const handleMovieChange = (value) => {
    setSelectedMovie(value);
    setSelectedShowtime(null);
  };

  // Xử lý khi chọn suất chiếu
  const handleShowtimeChange = (value) => {
    setSelectedShowtime(value);
  };

  // Xử lý khi nhấn nút "Đặt vé"
  const handleBooking = async () => {
    if (!selectedShowtime) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng chọn suất chiếu",
        duration: 3,
      });
      return;
    }

    setBookingLoading(true);

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập, mở modal đăng nhập với đường dẫn chuyển hướng sau khi đăng nhập
      openAuthModal("1", `/booking/seats/${selectedShowtime}`);
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng đăng nhập để đặt vé",
        duration: 3,
      });
      setBookingLoading(false);
      return;
    }

    // Giả lập thời gian tải nhanh để trải nghiệm người dùng mượt mà hơn
    try {
      // Tạo hiệu ứng loading - giả định kết nối API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Nếu đã đăng nhập, chuyển hướng đến trang chọn ghế
      navigate(`/booking/seats/${selectedShowtime}`);
    } catch {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi chuyển hướng",
        duration: 3,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Hiển thị ngày từ hôm nay đến 14 ngày sau
  const disabledDate = (current) => {
    // Disable tất cả các ngày trước ngày hôm nay
    if (current && current < moment().startOf("day")) {
      return true;
    }

    // Disable tất cả các ngày sau 14 ngày kể từ hôm nay
    if (current && current > moment().add(14, "days")) {
      return true;
    }

    return false;
  };

  // Format thời gian suất chiếu
  const formatShowtime = (showtime) => {
    if (showtime.time) {
      return `${showtime.time} - ${showtime.hallName} (${showtime.availableSeats} chỗ trống)`;
    }
    return (
      moment(showtime.startTime).format("HH:mm") +
      ` - ${showtime.hallName || showtime.hall?.name}`
    );
  };

  // Tìm thông tin movie được chọn
  const selectedMovieInfo = selectedMovie
    ? movies.find((m) => m.id === selectedMovie)
    : null;

  // Format tên rạp
  const formatCinemaName = (cinemaId) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    return cinema ? cinema.name : "";
  };

  return (
    <div className="bg-light-bg dark:bg-dark-bg-secondary backdrop-blur-md rounded-2xl shadow-xl p-6 animate-fadeIn transition-all duration-500 border border-border-light dark:border-gray-600">
      <style>
        {`
        .quick-booking-widget .ant-select-selector,
        .quick-booking-widget .ant-picker {
          height: 44px !important;
          padding: 0 16px !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
          background-color: #ffffff !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-selector,
        .quick-booking-widget [data-theme="dark"] .ant-picker {
          border-color: #4b5563 !important;
          background-color: #1f2a44 !important;
          color: #d1d5db !important;
        }
        .quick-booking-widget .ant-select-selection-item {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          line-height: 44px !important;
          padding-right: 30px !important;
        }
        .quick-booking-widget .ant-select-selection-placeholder {
          line-height: 44px !important;
          color: #666666 !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-selection-placeholder {
          color: #d1d5db !important;
        }
        .quick-booking-widget .ant-select-selection-search {
          height: 42px !important;
          line-height: 42px !important;
        }
        .quick-booking-widget .ant-select-dropdown {
          padding: 8px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          max-width: 400px !important;
          background-color: #ffffff !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-dropdown {
          background-color: #1f2a44 !important;
          border: 1px solid #4b5563 !important;
        }
        .quick-booking-widget .ant-select-item {
          padding: 10px 16px !important;
          border-radius: 8px !important;
          margin-bottom: 2px !important;
          transition: all 0.2s ease !important;
        }
        .quick-booking-widget .ant-select-item-option-content {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          color: #333333 !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-item-option-content {
          color: #d1d5db !important;
        }
        .quick-booking-widget .ant-select-item-option-active {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-item-option-active {
          background-color: rgba(239, 68, 68, 0.1) !important;
        }
        .quick-booking-widget .ant-select-item-option-selected {
          background-color: rgba(239, 68, 68, 0.1) !important;
          font-weight: 500 !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-item-option-selected {
          background-color: rgba(239, 68, 68, 0.2) !important;
        }
        .quick-booking-widget .ant-picker input {
          height: 44px !important;
          line-height: 44px !important;
          font-size: 14px !important;
          color: #333333 !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-picker input {
          color: #d1d5db !important;
        }
        .quick-booking-widget .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
        .quick-booking-widget .ant-picker:not(.ant-picker-disabled):hover {
          border-color: #e71a0f !important;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
        .quick-booking-widget [data-theme="dark"] .ant-picker:not(.ant-picker-disabled):hover {
          border-color: #ff3b30 !important;
          box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2) !important;
        }
        .quick-booking-widget .ant-select-disabled .ant-select-selector,
        .quick-booking-widget .ant-picker-disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          background-color: #f5f5f7 !important;
        }
        .quick-booking-widget [data-theme="dark"] .ant-select-disabled .ant-select-selector,
        .quick-booking-widget [data-theme="dark"] .ant-picker-disabled {
          background-color: #4b5563 !important;
        }
        `}
      </style>
      <div className="quick-booking-widget flex flex-col gap-4">
        {/* Tổng quan đã chọn - Hiển thị khi đã chọn phim */}
        {selectedMovie && (
          <div className="mb-1 p-4 bg-primary/5 dark:bg-red-500/5 rounded-xl animate-fadeIn">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {selectedCinema && (
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <EnvironmentOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium truncate max-w-xs text-text-primary dark:text-dark-text-primary">
                    {formatCinemaName(selectedCinema)}
                  </span>
                </div>
              )}

              {selectedDate && (
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <CalendarOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {selectedDate.format("DD/MM/YYYY")}
                  </span>
                </div>
              )}

              {selectedMovie && (
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <VideoCameraOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium truncate max-w-xs text-text-primary dark:text-dark-text-primary">
                    {selectedMovieInfo?.title}
                  </span>
                </div>
              )}

              {selectedShowtime && (
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <ClockCircleOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {formatShowtime(
                      showtimes.find((s) => s.id === selectedShowtime)
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Form đặt vé dạng grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Bước 1: Chọn rạp */}
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <EnvironmentOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Rạp phim
              </label>
            </div>
            <Select
              placeholder="Chọn Rạp"
              className="w-full"
              value={selectedCinema}
              onChange={handleCinemaChange}
              loading={loadingCinemas}
              disabled={loadingCinemas}
              size="large"
              notFoundContent={
                loadingCinemas ? (
                  <div className="flex items-center justify-center py-3">
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                  </div>
                ) : (
                  <div className="py-3 text-center text-text-secondary dark:text-dark-text-secondary">
                    Không có rạp chiếu phim
                  </div>
                )
              }
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              suffixIcon={<RightOutlined className="text-gray-400 dark:text-gray-300" />}
            >
              {cinemas?.map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  <div className="truncate" title={cinema.name}>
                    {cinema.name}
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {/* Bước 2: Chọn ngày */}
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <CalendarOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Ngày chiếu
              </label>
            </div>
            <DatePicker
              className="w-full"
              value={selectedDate}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              disabledDate={disabledDate}
              disabled={!selectedCinema}
              placeholder="Chọn Ngày"
              size="large"
              suffixIcon={<RightOutlined className="text-gray-400 dark:text-gray-300" />}
            />
          </div>

          {/* Bước 3: Chọn phim */}
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <VideoCameraOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Phim
              </label>
            </div>
            <Select
              placeholder="Chọn Phim"
              className="w-full"
              value={selectedMovie}
              onChange={handleMovieChange}
              loading={loadingMovies}
              disabled={!selectedDate || loadingMovies}
              size="large"
              notFoundContent={
                loadingMovies ? (
                  <div className="flex items-center justify-center py-3">
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                  </div>
                ) : (
                  <div className="py-3 text-center text-text-secondary dark:text-dark-text-secondary">
                    Không có phim chiếu vào ngày này
                  </div>
                )
              }
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              suffixIcon={<RightOutlined className="text-gray-400 dark:text-gray-300" />}
            >
              {movies?.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.title}
                </Option>
              ))}
            </Select>
          </div>

          {/* Bước 4: Chọn suất chiếu */}
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <ClockCircleOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Suất chiếu
              </label>
            </div>
            <Select
              placeholder="Chọn Suất"
              className="w-full"
              value={selectedShowtime}
              onChange={handleShowtimeChange}
              loading={loadingShowtimes}
              disabled={!selectedMovie || loadingShowtimes}
              size="large"
              notFoundContent={
                loadingShowtimes ? (
                  <div className="flex items-center justify-center py-3">
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                  </div>
                ) : (
                  <div className="py-3 text-center text-text-secondary dark:text-dark-text-secondary">
                    Không có suất chiếu cho phim này
                  </div>
                )
              }
              suffixIcon={<RightOutlined className="text-gray-400 dark:text-gray-300" />}
            >
              {showtimes?.map((showtime) => (
                <Option key={showtime.id} value={showtime.id}>
                  {formatShowtime(showtime)}
                </Option>
              ))}
            </Select>
          </div>

          {/* Nút đặt vé */}
          <div className="w-full">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <RightOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Mua Vé
              </label>
            </div>
            <Button
              type="primary"
              onClick={handleBooking}
              disabled={!selectedShowtime || bookingLoading}
              loading={bookingLoading}
              className="w-full h-[44px] rounded-xl font-bold text-base tracking-wider transition-all duration-300 flex items-center justify-center gap-2 btn-primary"
            >
              <span>{bookingLoading ? "Đang xử lý..." : "Mua Vé"}</span>
              {!bookingLoading && <RightOutlined />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBookingWidget;