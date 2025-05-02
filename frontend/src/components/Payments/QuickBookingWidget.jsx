import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Select, DatePicker, Button, Spin, message } from "antd";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import moment from "moment";

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
        const dateString = selectedDate.format("YYYY-MM-DD");
        const data = await movieApi.getMoviesByCinema(
          selectedCinema,
          dateString
        );

        if (data && data.length > 0) {
          setMovies(data);
        } else {
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

  return (
    <div className="bg-light-bg-secondary rounded-lg shadow-card p-4 md:p-6 animate-fadeIn">
      <h3 className="text-lg md:text-xl font-bold text-center mb-6 text-primary">ĐẶT VÉ NHANH</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bước 1: Chọn rạp */}
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mr-2">1</div>
            <label className="text-text-primary font-medium">Rạp phim</label>
          </div>
          <Select
            placeholder="Chọn rạp chiếu"
            className="w-full"
            value={selectedCinema}
            onChange={handleCinemaChange}
            loading={loadingCinemas}
            disabled={loadingCinemas}
            popupClassName="bg-light-bg"
            size="large"
            style={{ borderRadius: '8px' }}
            notFoundContent={loadingCinemas ? <Spin size="small" /> : "Không có dữ liệu"}
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
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mr-2">2</div>
            <label className="text-text-primary font-medium">Ngày chiếu</label>
          </div>
          <DatePicker
            className="w-full"
            value={selectedDate}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            disabled={!selectedCinema}
            placeholder="Chọn ngày"
            size="large"
            style={{ borderRadius: '8px', height: '40px' }}
          />
        </div>

        {/* Bước 3: Chọn phim */}
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mr-2">3</div>
            <label className="text-text-primary font-medium">Phim</label>
          </div>
          <Select
            placeholder="Chọn phim"
            className="w-full"
            value={selectedMovie}
            onChange={handleMovieChange}
            loading={loadingMovies}
            disabled={!selectedDate || loadingMovies}
            popupClassName="bg-light-bg"
            size="large"
            style={{ borderRadius: '8px' }}
            notFoundContent={loadingMovies ? <Spin size="small" /> : "Không có phim"}
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
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold mr-2">4</div>
            <label className="text-text-primary font-medium">Suất chiếu</label>
          </div>
          <Select
            placeholder="Chọn suất chiếu"
            className="w-full"
            value={selectedShowtime}
            onChange={handleShowtimeChange}
            loading={loadingShowtimes}
            disabled={!selectedMovie || loadingShowtimes}
            popupClassName="bg-light-bg"
            size="large"
            style={{ borderRadius: '8px' }}
            notFoundContent={loadingShowtimes ? <Spin size="small" /> : "Không có suất chiếu"}
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
      </div>

      {/* Nút đặt vé */}
      <div className="mt-6">
        <Button
          type="primary"
          size="large"
          onClick={handleBooking}
          disabled={!selectedShowtime}
          className={`w-full h-12 flex items-center justify-center rounded-lg font-bold text-base uppercase transition-all ${
            !selectedShowtime 
              ? 'bg-gray-400 opacity-70' 
              : 'bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary shadow-button hover:shadow-button-hover transform hover:-translate-y-0.5'
          }`}
        >
          Mua vé ngay
        </Button>
      </div>
    </div>
  );
};

export default QuickBookingWidget;