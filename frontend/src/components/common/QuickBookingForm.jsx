import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Select, DatePicker, Button, Spin } from "antd"; // Không import notification
import {
  CalendarOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  RightOutlined,
  LoadingOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const QuickBookingForm = ({ onSelectionChange, notification }) => { // Nhận notification qua props
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isMovieListVisible, setIsMovieListVisible] = useState(false);

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
  }, [notification]);

  useEffect(() => {
    if (!selectedCinema || !selectedDate) {
      setMovies([]);
      setSelectedMovie(null);
      setIsMovieListVisible(false);
      return;
    }
    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const dateString = selectedDate.format("YYYY-MM-DD");
        const data = await movieApi.getMoviesByCinema(selectedCinema, dateString);
        if (data && data.length > 0) {
          setMovies(data);
        } else {
          setMovies([]);
          notification.warning({
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

  const selectionData = useMemo(
    () => ({
      movie: movies.find((m) => m.id === selectedMovie) || null,
      cinema: cinemas.find((c) => c.id === selectedCinema) || null,
      date: selectedDate,
      showtime: showtimes.find((s) => s.id === selectedShowtime) || null,
    }),
    [
      selectedCinema,
      selectedDate,
      selectedMovie,
      selectedShowtime,
      movies,
      cinemas,
      showtimes,
    ]
  );

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectionData);
    }
  }, [selectionData, onSelectionChange]);

  const handleCinemaChange = (value) => {
    setSelectedCinema(value);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setIsMovieListVisible(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setIsMovieListVisible(false);
  };

  const handleMovieChange = (movieId) => {
    if (movieId === selectedMovie) {
      setSelectedMovie(null);
      setSelectedShowtime(null);
    } else {
      setSelectedMovie(movieId);
      setSelectedShowtime(null);
    }
    setIsMovieListVisible(false);
  };

  const handleShowtimeChange = (value) => {
    setSelectedShowtime(value);
  };

  const toggleMovieList = () => {
    if (!selectedDate) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng chọn ngày chiếu trước khi chọn phim",
        duration: 3,
      });
      return;
    }
    if (movies.length > 0) {
      setIsMovieListVisible(!isMovieListVisible);
    }
  };

  const handleBooking = useCallback(async () => {
    if (!selectedShowtime) {
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng chọn suất chiếu",
        duration: 3,
      });
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("1", `/booking/seats/${selectedShowtime}`);
      notification.warning({
        message: "Cảnh báo",
        description: "Vui lòng đăng nhập để đặt vé",
        duration: 3,
      });
      return;
    }

    setBookingLoading(true);
    try {
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
  }, [selectedShowtime, isAuthenticated, openAuthModal, navigate, notification]);

  const disabledDate = (current) => {
    if (current && current < moment().startOf("day")) return true;
    if (current && current > moment().add(14, "days")) return true;
    return false;
  };

  const formatShowtime = (showtime) => {
    if (showtime.time) {
      return `${showtime.time} - ${showtime.hallName} (${showtime.availableSeats} chỗ trống)`;
    }
    return (
      moment(showtime.startTime).format("HH:mm") +
      ` - ${showtime.hallName || showtime.hall?.name}`
    );
  };

  const formatCinemaName = (cinemaId) => {
    const cinema = cinemas.find((c) => c.id === cinemaId);
    return cinema ? cinema.name : "";
  };

  const selectedMovieInfo = selectedMovie
    ? movies.find((m) => m.id === selectedMovie)
    : null;

  return (
    <div className="bg-light-bg dark:bg-dark-bg-secondary backdrop-blur-md rounded-2xl shadow-xl p-6 animate-fadeIn transition-all duration-500 border border-border-light dark:border-gray-600">
      <style>
        {`
          .quick-booking-form .ant-select-selector,
          .quick-booking-form .ant-picker {
            height: 44px !important;
            padding: 0 16px !important;
            border: 1px solid rgba(0, 0, 0, 0.1) !important;
            border-radius: 12px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
            background-color: #ffffff !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-selector,
          .quick-booking-form [data-theme="dark"] .ant-picker {
            border-color: #4b5563 !important;
            background-color: #1f2a44 !important;
            color: #d1d5db !important;
          }
          .quick-booking-form .ant-select-selection-item {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            line-height: 44px !important;
            padding-right: 30px !important;
          }
          .quick-booking-form .ant-select-selection-placeholder {
            line-height: 44px !important;
            color: #666666 !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-selection-placeholder {
            color: #d1d5db !important;
          }
          .quick-booking-form .ant-select-selection-search {
            height: 42px !important;
            line-height: 42px !important;
          }
          .quick-booking-form .ant-select-dropdown {
            padding: 8px !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
            max-width: 400px !important;
            background-color: #ffffff !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-dropdown {
            background-color: #1f2a44 !important;
            border: 1px solid #4b5563 !important;
          }
          .quick-booking-form .ant-select-item {
            padding: 10px 16px !important;
            border-radius: 8px !important;
            margin-bottom: 2px !important;
            transition: all 0.2s ease !important;
          }
          .quick-booking-form .ant-select-item-option-content {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            color: #333333 !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-item-option-content {
            color: #d1d5db !important;
          }
          .quick-booking-form .ant-select-item-option-active {
            background-color: rgba(239, 68, 68, 0.05) !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-item-option-active {
            background-color: rgba(239, 68, 68, 0.1) !important;
          }
          .quick-booking-form .ant-select-item-option-selected {
            background-color: rgba(239, 68, 68, 0.1) !important;
            font-weight: 500 !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-item-option-selected {
            background-color: rgba(239, 68, 68, 0.2) !important;
          }
          .quick-booking-form .ant-picker input {
            height: 44px !important;
            line-height: 44px !important;
            font-size: 14px !important;
            color: #333333 !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-picker input {
            color: #d1d5db !important;
          }
          .quick-booking-form .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
          .quick-booking-form .ant-picker:not(.ant-picker-disabled):hover {
            border-color: #e71a0f !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select:not(.ant-select-disabled):hover .ant-select-selector,
          .quick-booking-form [data-theme="dark"] .ant-picker:not(.ant-picker-disabled):hover {
            border-color: #ff3b30 !important;
            box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2) !important;
          }
          .quick-booking-form .ant-select-disabled .ant-select-selector,
          .quick-booking-form .ant-picker-disabled {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
            background-color: #f5f5f7 !important;
          }
          .quick-booking-form [data-theme="dark"] .ant-select-disabled .ant-select-selector,
          .quick-booking-form [data-theme="dark"] .ant-picker-disabled {
            background-color: #4b5563 !important;
          }
          .movie-list {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            background-color: #ffffff;
            padding: 8px;
          }
          .movie-list [data-theme="dark"] {
            border-color: #4b5563;
            background-color: #1f2a44;
          }
          .movie-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }
          .movie-item:hover {
            background-color: rgba(239, 68, 68, 0.05);
          }
          .movie-item img {
            width: 50px;
            height: 75px;
            object-fit: cover;
            border-radius: 4px;
          }
          .movie-item .movie-info {
            flex-grow: 1;
          }
          .movie-item .movie-info h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 500;
            color: #333333;
          }
          .movie-item [data-theme="dark"] .movie-info h4 {
            color: #d1d5db;
          }
          .movie-item .movie-info p {
            margin: 0;
            font-size: 12px;
            color: #666666;
          }
          .movie-item [data-theme="dark"] .movie-info p {
            color: #d1d5db;
          }
          .movie-select-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            padding: 8px 16px;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            background-color: #ffffff;
            transition: all 0.3s ease;
          }
          .movie-select-header:hover {
            border-color: #e71a0f;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
          }
          .movie-select-header [data-theme="dark"] {
            border-color: #4b5563;
            background-color: #1f2a44;
            color: #d1d5db;
          }
          .movie-select-header.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background-color: #f5f5f7;
          }
          .movie-select-header.disabled [data-theme="dark"] {
            background-color: #4b5563;
          }
        `}
      </style>
      <div className="quick-booking-form flex flex-col gap-6">
        {selectedCinema &&
          selectedDate &&
          selectedMovie &&
          selectedShowtime && (
            <div className="mb-4 p-4 bg-primary/5 dark:bg-red-500/5 rounded-xl animate-fadeIn">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <EnvironmentOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium truncate max-w-xs text-text-primary dark:text-dark-text-primary">
                    {formatCinemaName(selectedCinema)}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <CalendarOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {selectedDate.format("DD/MM/YYYY")}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <VideoCameraOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium truncate max-w-xs text-text-primary dark:text-dark-text-primary">
                    {selectedMovieInfo?.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-3 py-1 rounded-full shadow-sm">
                  <ClockCircleOutlined className="text-primary dark:text-red-500" />
                  <span className="font-medium text-text-primary dark:text-dark-text-primary">
                    {formatShowtime(
                      showtimes.find((s) => s.id === selectedShowtime)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        <div className="flex flex-col gap-4">
          <div>
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
              suffixIcon={
                <RightOutlined className="text-gray-400 dark:text-gray-300" />
              }
            >
              {cinemas.map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
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
              suffixIcon={
                <RightOutlined className="text-gray-400 dark:text-gray-300" />
              }
            />
          </div>
          <div>
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-red-500/10 flex items-center justify-center text-primary dark:text-red-500 mr-2">
                <VideoCameraOutlined className="text-xs" />
              </div>
              <label className="text-sm font-medium text-text-primary dark:text-dark-text-primary">
                Phim
              </label>
            </div>
            <div>
              <div
                className={`movie-select-header ${
                  !selectedDate || loadingMovies ? "disabled" : ""
                }`}
                onClick={toggleMovieList}
                title={
                  selectedDate
                    ? "Nhấp để chọn lại phim"
                    : "Vui lòng chọn ngày trước"
                }
              >
                <span>
                  {selectedMovieInfo ? selectedMovieInfo.title : "Chọn Phim"}
                </span>
                {isMovieListVisible ? (
                  <UpOutlined className="text-gray-400 dark:text-gray-300" />
                ) : (
                  <DownOutlined className="text-gray-400 dark:text-gray-300" />
                )}
              </div>
              {isMovieListVisible && (
                <div className="movie-list mt-2">
                  {loadingMovies ? (
                    <div className="flex items-center justify-center py-3">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{ fontSize: 24 }} spin />
                        }
                      />
                    </div>
                  ) : movies.length > 0 ? (
                    movies.map((movie) => (
                      <div
                        key={movie.id}
                        className="movie-item"
                        onClick={() => handleMovieChange(movie.id)}
                      >
                        <img
                          src={
                            movie.poster ||
                            movie.posterUrl ||
                            movie.image ||
                            "/fallback.jpg"
                          }
                          alt={movie.title}
                        />
                        <div className="movie-info">
                          <h4>{movie.title}</h4>
                          <p>
                            {movie.genre} | {movie.duration} phút
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-center text-text-secondary dark:text-dark-text-secondary">
                      Không có phim chiếu vào ngày này
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
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
              suffixIcon={
                <RightOutlined className="text-gray-400 dark:text-gray-300" />
              }
            >
              {showtimes.map((showtime) => (
                <Option key={showtime.id} value={showtime.id}>
                  {formatShowtime(showtime)}
                </Option>
              ))}
            </Select>
          </div>
          <div>
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

export default QuickBookingForm;