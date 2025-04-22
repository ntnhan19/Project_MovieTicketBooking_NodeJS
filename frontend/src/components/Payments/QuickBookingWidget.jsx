// frontend/src/components/Booking/QuickBookingWidget.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Select, DatePicker, Button, Spin, message } from "antd";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import moment from "moment";
import "./QuickBookingWidget.css";

const { Option } = Select;

const QuickBookingWidget = () => {
  const navigate = useNavigate();
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

  // 1. Load danh sách rạp chiếu khi component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      setLoadingCinemas(true);
      try {
        const data = await cinemaApi.getAllCinemas();
        setCinemas(data || []);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
        message.error("Không thể tải danh sách rạp chiếu");
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
        // Chuyển đổi trực tiếp thành chuỗi ngày YYYY-MM-DD
        const dateString = selectedDate.format("YYYY-MM-DD");

        console.log("Fetching movies for cinema and date:", {
          cinemaId: selectedCinema,
          date: dateString,
        });

        const data = await movieApi.getMoviesByCinema(
          selectedCinema,
          dateString
        );

        console.log("Movies data received:", data);

        if (data && data.length > 0) {
          setMovies(data);
        } else {
          console.log("No movies found for this cinema and date");
          setMovies([]);
          message.info("Không có phim nào chiếu tại rạp này vào ngày đã chọn");
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        message.error("Không thể tải danh sách phim");
        setMovies([]);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, [selectedCinema, selectedDate]);

  // 3. Load danh sách suất chiếu khi chọn ngày, phim và rạp - ĐIỀU CHỈNH PHẦN NÀY
  useEffect(() => {
    if (!selectedCinema || !selectedMovie || !selectedDate) {
      setShowtimes([]);
      setSelectedShowtime(null);
      return;
    }

    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        // Sử dụng đúng format ngày YYYY-MM-DD theo API backend
        const dateString = selectedDate.format("YYYY-MM-DD");

        console.log("Fetching showtimes with params:", {
          movieId: selectedMovie,
          cinemaId: selectedCinema,
          date: dateString,
        });

        // Điều chỉnh thứ tự tham số theo API backend
        const data = await showtimeApi.getShowtimesByFilters(
          selectedMovie, // movieId
          selectedCinema, // cinemaId
          dateString // date string YYYY-MM-DD
        );

        console.log("Showtimes received:", data);

        if (data && data.length > 0) {
          setShowtimes(data);
        } else {
          setShowtimes([]);
          message.info("Không có suất chiếu cho phim này vào ngày đã chọn");
        }
      } catch (error) {
        console.error("Error fetching showtimes:", error);
        message.error("Không thể tải danh sách suất chiếu");
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedCinema, selectedMovie, selectedDate]);

  // Xử lý khi chọn rạp
  const handleCinemaChange = (value) => {
    console.log("Cinema selected:", value);
    setSelectedCinema(value);
    setSelectedMovie(null);
    setSelectedShowtime(null);
    // Không reset selectedDate để người dùng không phải chọn lại ngày
  };

  // Xử lý khi chọn ngày
  const handleDateChange = (date) => {
    console.log(
      "Date selected formatted:",
      date ? date.format("YYYY-MM-DD") : null
    );
    setSelectedDate(date);
    setSelectedMovie(null);
    setSelectedShowtime(null);
  };

  // Xử lý khi chọn phim
  const handleMovieChange = (value) => {
    console.log("Movie selected:", value);
    setSelectedMovie(value);
    setSelectedShowtime(null);
  };

  // Xử lý khi chọn suất chiếu
  const handleShowtimeChange = (value) => {
    console.log("Showtime selected:", value);
    setSelectedShowtime(value);
  };

  // Xử lý khi nhấn nút "Đặt vé"
  const handleBooking = () => {
    if (!selectedShowtime) {
      message.warning("Vui lòng chọn suất chiếu");
      return;
    }

    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      message.warning("Vui lòng đăng nhập để đặt vé");
      navigate("/login");
      return;
    }

    // Chuyển hướng đến trang chọn ghế
    navigate(`/booking/seats/${selectedShowtime}`);
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

  // Format thời gian suất chiếu - Điều chỉnh theo cấu trúc dữ liệu từ API
  const formatShowtime = (showtime) => {
    // Kiểm tra nếu API trả về đã có trường time định dạng HH:MM
    if (showtime.time) {
      return `${showtime.time} - ${showtime.hallName} (${showtime.availableSeats} chỗ trống)`;
    }
    // Nếu API trả về startTime dạng ISO string
    return (
      moment(showtime.startTime).format("HH:mm") +
      ` - ${showtime.hallName || showtime.hall?.name}`
    );
  };

  return (
    <Card title="Đặt vé nhanh" className="quick-booking-widget">
      <div className="booking-steps">
        {/* Bước 1: Chọn rạp */}
        <div className="booking-step">
          <label>Chọn rạp:</label>
          <Select
            placeholder="Chọn rạp chiếu"
            style={{ width: "100%" }}
            value={selectedCinema}
            onChange={handleCinemaChange}
            loading={loadingCinemas}
            disabled={loadingCinemas}
          >
            {cinemas &&
              cinemas.length > 0 &&
              cinemas.map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </Option>
              ))}
          </Select>
        </div>

        {/* Bước 2: Chọn ngày */}
        <div className="booking-step">
          <label>Chọn ngày:</label>
          <DatePicker
            style={{ width: "100%" }}
            value={selectedDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            disabled={!selectedCinema}
            placeholder="Chọn ngày chiếu"
          />
        </div>

        {/* Bước 3: Chọn phim */}
        <div className="booking-step">
          <label>Chọn phim:</label>
          <Select
            placeholder="Chọn phim"
            style={{ width: "100%" }}
            value={selectedMovie}
            onChange={handleMovieChange}
            loading={loadingMovies}
            disabled={!selectedDate || loadingMovies}
          >
            {movies &&
              movies.length > 0 &&
              movies.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.title}
                </Option>
              ))}
          </Select>
        </div>

        {/* Bước 4: Chọn suất chiếu */}
        <div className="booking-step">
          <label>Chọn suất chiếu:</label>
          <Select
            placeholder="Chọn suất chiếu"
            style={{ width: "100%" }}
            value={selectedShowtime}
            onChange={handleShowtimeChange}
            loading={loadingShowtimes}
            disabled={!selectedMovie || loadingShowtimes}
          >
            {showtimes &&
              showtimes.length > 0 &&
              showtimes.map((showtime) => (
                <Option key={showtime.id} value={showtime.id}>
                  {formatShowtime(showtime)}
                </Option>
              ))}
          </Select>
        </div>

        {/* Nút đặt vé */}
        <div className="booking-step booking-submit">
          <Button
            type="primary"
            size="large"
            onClick={handleBooking}
            disabled={!selectedShowtime}
            block
          >
            Đặt vé ngay
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuickBookingWidget;
