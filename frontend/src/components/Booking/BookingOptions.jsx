// frontend/src/components/Booking/BookingOptions.jsx
import React, { useState, useEffect, useContext } from "react";
import { 
  Select, 
  Button, 
  message, 
  Spin, 
  Tooltip,
  Empty,
  Space 
} from "antd";
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  BankOutlined, 
  VideoCameraOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import { BookingContext } from "../../context/BookingContext";
import "./BookingOptions.css";

const { Option } = Select;

const BookingOptions = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { bookingData, updateBookingData } = useContext(BookingContext);
  
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  const [selectedCinemaDetails, setSelectedCinemaDetails] = useState(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [selectedShowtimeDetails, setSelectedShowtimeDetails] = useState(null);

  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Lấy danh sách rạp khi component mount
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoadingCinemas(true);
        const data = await cinemaApi.getAllCinemas();
        setCinemas(data);
      } catch (error) {
        console.error("Failed to fetch cinemas:", error);
        message.error("Không thể tải danh sách rạp");
      } finally {
        setLoadingCinemas(false);
      }
    };

    fetchCinemas();
  }, []);

  // Lấy phim khi chọn rạp
  useEffect(() => {
    if (selectedCinema) {
      const fetchMovies = async () => {
        try {
          setLoadingMovies(true);
          // Cập nhật URL endpoint cho đúng
          const data = await movieApi.getMoviesByCinema(selectedCinema);
          
          if (data && Array.isArray(data)) {
            setMovies(data);
            
            // Lưu thông tin chi tiết của rạp đã chọn
            const cinemaDetail = cinemas.find(c => c.id === selectedCinema);
            setSelectedCinemaDetails(cinemaDetail);
            
            // Reset các lựa chọn phụ thuộc
            setSelectedMovie(null);
            setSelectedDate(null);
            setSelectedShowtime(null);
            setSelectedMovieDetails(null);
            setSelectedDateDetails(null);
            setSelectedShowtimeDetails(null);
            setDates([]);
            setShowtimes([]);
          } else {
            console.error("Invalid movie data format:", data);
            message.error("Dữ liệu phim không hợp lệ");
            setMovies([]);
          }
        } catch (error) {
          console.error("Failed to fetch movies:", error);
          message.error("Không thể tải danh sách phim");
          setMovies([]);
        } finally {
          setLoadingMovies(false);
        }
      };

      fetchMovies();
    }
  }, [selectedCinema, cinemas]);

  // Lấy ngày chiếu khi chọn phim
  useEffect(() => {
    if (selectedCinema && selectedMovie) {
      const fetchDates = async () => {
        try {
          setLoadingDates(true);
          const data = await showtimeApi.getDatesByMovieAndCinema(
            selectedMovie,
            selectedCinema
          );
          
          if (data && Array.isArray(data)) {
            setDates(data);
            
            // Lưu thông tin chi tiết của phim đã chọn
            const movieDetail = movies.find(m => m.id === selectedMovie);
            setSelectedMovieDetails(movieDetail);
            
            // Reset các lựa chọn phụ thuộc
            setSelectedDate(null);
            setSelectedShowtime(null);
            setSelectedDateDetails(null);
            setSelectedShowtimeDetails(null);
            setShowtimes([]);
          } else {
            console.error("Invalid date data format:", data);
            message.error("Dữ liệu ngày chiếu không hợp lệ");
            setDates([]);
          }
        } catch (error) {
          console.error("Failed to fetch dates:", error);
          message.error("Không thể tải danh sách ngày chiếu");
          setDates([]);
        } finally {
          setLoadingDates(false);
        }
      };

      fetchDates();
    }
  }, [selectedCinema, selectedMovie, movies]);

  // Lấy suất chiếu khi chọn ngày
  useEffect(() => {
    if (selectedCinema && selectedMovie && selectedDate) {
      const fetchShowtimes = async () => {
        try {
          setLoadingShowtimes(true);
          const data = await showtimeApi.getShowtimesByDateMovieCinema(
            selectedDate,
            selectedMovie,
            selectedCinema
          );
          
          if (data && Array.isArray(data)) {
            setShowtimes(data);
            
            // Lưu thông tin chi tiết của ngày đã chọn
            const dateDetail = dates.find(d => d.id === selectedDate);
            setSelectedDateDetails(dateDetail);
            
            // Reset suất chiếu đã chọn
            setSelectedShowtime(null);
            setSelectedShowtimeDetails(null);
          } else {
            console.error("Invalid showtime data format:", data);
            message.error("Dữ liệu suất chiếu không hợp lệ");
            setShowtimes([]);
          }
        } catch (error) {
          console.error("Failed to fetch showtimes:", error);
          message.error("Không thể tải danh sách suất chiếu");
          setShowtimes([]);
        } finally {
          setLoadingShowtimes(false);
        }
      };

      fetchShowtimes();
    }
  }, [selectedCinema, selectedMovie, selectedDate, dates]);

  // Lưu thông tin suất chiếu khi chọn
  useEffect(() => {
    if (selectedShowtime) {
      const showtimeDetail = showtimes.find(s => s.id === selectedShowtime);
      setSelectedShowtimeDetails(showtimeDetail);
    }
  }, [selectedShowtime, showtimes]);

  // Xử lý khi nhấn nút đặt vé
  const handleBookNow = async () => {
    if (!selectedShowtime) {
      message.warning("Vui lòng chọn đầy đủ thông tin trước khi đặt vé");
      return;
    }

    try {
      // Tạo đối tượng chứa tất cả thông tin cần thiết cho context
      const bookingInfo = {
        cinema: selectedCinemaDetails,
        movie: selectedMovieDetails,
        showtime: {
          id: selectedShowtime,
          date: selectedDateDetails?.date || "",
          time: selectedShowtimeDetails?.startTime || ""
        },
        ticketPrice: selectedShowtimeDetails?.price || 90000,
      };
      
      // Cập nhật BookingContext
      updateBookingData(bookingInfo);
      
      // Log để kiểm tra
      console.log("Thông tin booking đã lưu:", bookingInfo);
      
      // Chuyển đến trang chọn ghế
      navigate(`/booking/seats/${selectedShowtime}`);
    } catch (error) {
      console.error("Error preparing booking:", error);
      message.error("Có lỗi xảy ra khi chuẩn bị đặt vé");
    }
  };

  // Format date để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("vi-VN", options);
  };

  // Hiển thị thông tin đã chọn
  const renderSelectionSummary = () => {
    if (!selectedCinema) return null;
    
    return (
      <div className="selection-summary">
        <h3 className="summary-title">Thông tin đặt vé</h3>
        <div className="summary-content">
          {selectedCinemaDetails && (
            <div className="summary-item">
              <BankOutlined /> Rạp: <span>{selectedCinemaDetails.name}</span>
            </div>
          )}
          
          {selectedMovieDetails && (
            <div className="summary-item">
              <VideoCameraOutlined /> Phim: <span>{selectedMovieDetails.title}</span>
            </div>
          )}
          
          {selectedDateDetails && (
            <div className="summary-item">
              <CalendarOutlined /> Ngày: <span>{formatDate(selectedDateDetails.date)}</span>
            </div>
          )}
          
          {selectedShowtimeDetails && (
            <div className="summary-item">
              <ClockCircleOutlined /> Suất chiếu: <span>{selectedShowtimeDetails.startTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="booking-options-container">
      <h2 className="booking-title">Đặt Vé Xem Phim</h2>
      
      <div className="booking-options">
        <div className="booking-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3 className="step-title">
              <BankOutlined className="step-icon" /> Chọn Rạp
            </h3>
            <Select
              placeholder="Chọn rạp phim"
              className="select-control"
              loading={loadingCinemas}
              value={selectedCinema}
              onChange={(value) => setSelectedCinema(value)}
              allowClear
              notFoundContent={loadingCinemas ? <Spin size="small" /> : <Empty description="Không có rạp nào" />}
              showSearch
              optionFilterProp="children"
            >
              {cinemas.map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="booking-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3 className="step-title">
              <VideoCameraOutlined className="step-icon" /> Chọn Phim
            </h3>
            <Select
              placeholder="Chọn phim"
              className="select-control"
              loading={loadingMovies}
              value={selectedMovie}
              onChange={(value) => setSelectedMovie(value)}
              disabled={!selectedCinema}
              allowClear
              notFoundContent={
                loadingMovies ? <Spin size="small" /> : 
                selectedCinema ? <Empty description="Không có phim nào" /> : 
                <Empty description="Vui lòng chọn rạp trước" />
              }
              showSearch
              optionFilterProp="children"
            >
              {movies.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.title}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="booking-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3 className="step-title">
              <CalendarOutlined className="step-icon" /> Chọn Ngày
            </h3>
            <Select
              placeholder="Chọn ngày xem"
              className="select-control"
              loading={loadingDates}
              value={selectedDate}
              onChange={(value) => setSelectedDate(value)}
              disabled={!selectedMovie}
              allowClear
              notFoundContent={
                loadingDates ? <Spin size="small" /> : 
                selectedMovie ? <Empty description="Không có ngày chiếu nào" /> : 
                <Empty description="Vui lòng chọn phim trước" />
              }
            >
              {dates.map((date) => (
                <Option key={date.id} value={date.id}>
                  {formatDate(date.date)}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="booking-step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3 className="step-title">
              <ClockCircleOutlined className="step-icon" /> Chọn Suất
            </h3>
            <Select
              placeholder="Chọn suất chiếu"
              className="select-control"
              loading={loadingShowtimes}
              value={selectedShowtime}
              onChange={(value) => setSelectedShowtime(value)}
              disabled={!selectedDate}
              allowClear
              notFoundContent={
                loadingShowtimes ? <Spin size="small" /> : 
                selectedDate ? <Empty description="Không có suất chiếu nào" /> : 
                <Empty description="Vui lòng chọn ngày trước" />
              }
            >
              {showtimes.map((showtime) => (
                <Option key={showtime.id} value={showtime.id}>
                  <Space>
                    <span className="showtime-option">{showtime.startTime}</span>
                    {showtime.price && <span className="showtime-price">{showtime.price.toLocaleString('vi-VN')}đ</span>}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <Tooltip title={!selectedShowtime ? "Vui lòng chọn đầy đủ thông tin" : "Tiếp tục để chọn ghế"}>
          <Button
            type="primary"
            className="book-now-button"
            onClick={handleBookNow}
            disabled={!selectedShowtime}
            icon={<ArrowRightOutlined />}
          >
            TIẾP TỤC
          </Button>
        </Tooltip>
      </div>
      
      {renderSelectionSummary()}
    </div>
  );
};

export default BookingOptions;