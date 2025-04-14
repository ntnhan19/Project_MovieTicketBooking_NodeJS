// frontend/src/components/BookingOptions.jsx
import React, { useState, useEffect } from "react";
import { Select, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { cinemaApi } from "../../api/cinemaApi";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import "./BookingOptions.css";

const { Option } = Select;

const BookingOptions = () => {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

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
          const data = await movieApi.getMoviesByCinema(selectedCinema);
          setMovies(data);
          // Reset các lựa chọn phụ thuộc
          setSelectedMovie(null);
          setSelectedDate(null);
          setSelectedShowtime(null);
          setDates([]);
          setShowtimes([]);
        } catch (error) {
          console.error("Failed to fetch movies:", error);
          message.error("Không thể tải danh sách phim");
        } finally {
          setLoadingMovies(false);
        }
      };

      fetchMovies();
    }
  }, [selectedCinema]);

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
          setDates(data);
          // Reset các lựa chọn phụ thuộc
          setSelectedDate(null);
          setSelectedShowtime(null);
          setShowtimes([]);
        } catch (error) {
          console.error("Failed to fetch dates:", error);
          message.error("Không thể tải danh sách ngày chiếu");
        } finally {
          setLoadingDates(false);
        }
      };

      fetchDates();
    }
  }, [selectedCinema, selectedMovie]);

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
          setShowtimes(data);
          // Reset suất chiếu đã chọn
          setSelectedShowtime(null);
        } catch (error) {
          console.error("Failed to fetch showtimes:", error);
          message.error("Không thể tải danh sách suất chiếu");
        } finally {
          setLoadingShowtimes(false);
        }
      };

      fetchShowtimes();
    }
  }, [selectedCinema, selectedMovie, selectedDate]);

  // Xử lý khi nhấn nút đặt vé
  const handleBookNow = () => {
    if (!selectedShowtime) {
      message.warning("Vui lòng chọn đầy đủ thông tin trước khi đặt vé");
      return;
    }

    navigate(`/booking/seats/${selectedShowtime}`);
  };

  // Format date để hiển thị
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("vi-VN", options);
  };

  return (
    <div className="booking-options">
      <div className="booking-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h3 className="step-title">Chọn Rạp</h3>
          <Select
            placeholder="Chọn rạp phim"
            className="select-cinema"
            loading={loadingCinemas}
            value={selectedCinema}
            onChange={(value) => setSelectedCinema(value)}
            allowClear
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
          <h3 className="step-title">Chọn Phim</h3>
          <Select
            placeholder="Chọn phim"
            className="select-movie"
            loading={loadingMovies}
            value={selectedMovie}
            onChange={(value) => setSelectedMovie(value)}
            disabled={!selectedCinema}
            allowClear
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
          <h3 className="step-title">Chọn Ngày</h3>
          <Select
            placeholder="Chọn ngày xem"
            className="select-date"
            loading={loadingDates}
            value={selectedDate}
            onChange={(value) => setSelectedDate(value)}
            disabled={!selectedMovie}
            allowClear
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
          <h3 className="step-title">Chọn Suất</h3>
          <Select
            placeholder="Chọn suất chiếu"
            className="select-showtime"
            loading={loadingShowtimes}
            value={selectedShowtime}
            onChange={(value) => setSelectedShowtime(value)}
            disabled={!selectedDate}
            allowClear
          >
            {showtimes.map((showtime) => (
              <Option key={showtime.id} value={showtime.id}>
                {showtime.startTime}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <Button
        type="primary"
        className="book-now-button"
        onClick={handleBookNow}
        disabled={!selectedShowtime}
      >
        ĐẶT NGAY
      </Button>
    </div>
  );
};

export default BookingOptions;
