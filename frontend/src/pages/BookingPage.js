import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Tag, Select, Row, Col } from "antd";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
import movies from "../components/MoviesData";
import BookingOptions from "../components/BookingOptions";
const BookingPage = () => {
  const { id } = useParams();
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const showModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (!id) {
    // ✅ Nếu không có ID, hiển thị danh sách phim
    return (
      <div className="bookingpage-container">
        <div style={{ marginBottom: "30px" }}>
          <BookingOptions /> {/* Thanh chọn phim */}
        </div>

        <Row gutter={[16, 16]} justify="center" style={{ width: "100%" }}>
          {movies.map((movie) => (
            <Col key={movie.id} xs={12} sm={8} md={6} lg={6}>
              <Link
                to={`/booking/${movie.id}`}
                style={{ textDecoration: "none" }}
              >
                <MovieCard movie={movie} showModal={showModal} />
              </Link>
            </Col>
          ))}
        </Row>

        {/* Modal xem trailer */}
        <MovieModal
          movie={selectedMovie}
          isVisible={isModalVisible}
          onClose={handleCancel}
        />
      </div>
    );
  }

  // ✅ Nếu có ID, hiển thị trang đặt vé
  const movie = movies.find((m) => m.id === Number(id));
  if (!movie) {
    return <h2 style={{ textAlign: "center" }}>Phim không tồn tại!</h2>;
  }

  return (
    <div className="booking-container">
      <Card className="movie-detail">
        <img src={movie.image} alt={movie.title} className="movie-image" />
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <Tag color="red">{movie.rating}</Tag>
          <p>
            <b>Thể loại:</b> {movie.genre}
          </p>
          <p>
            <b>Thời lượng:</b> {movie.runtime}
          </p>
        </div>
      </Card>

      <div className="booking-options">
        <h3>Chọn rạp chiếu</h3>
        <Select
          placeholder="Chọn rạp"
          style={{ width: 200 }}
          onChange={setSelectedCinema}
        >
          {Object.keys(movie.showtimes).map((cinema) => (
            <Select.Option key={cinema} value={cinema}>
              {cinema}
            </Select.Option>
          ))}
        </Select>

        {selectedCinema && (
          <>
            <h3>Chọn ngày</h3>
            <Select
              placeholder="Chọn ngày"
              style={{ width: 200 }}
              onChange={setSelectedDate}
            >
              {Object.keys(movie.showtimes[selectedCinema]).map((date) => (
                <Select.Option key={date} value={date}>
                  {date}
                </Select.Option>
              ))}
            </Select>
          </>
        )}

        {selectedDate && (
          <>
            <h3>Chọn suất chiếu</h3>
            <Select
              placeholder="Chọn suất"
              style={{ width: 200 }}
              onChange={setSelectedTime}
            >
              {movie.showtimes[selectedCinema][selectedDate].map((time) => (
                <Select.Option key={time} value={time}>
                  {time}
                </Select.Option>
              ))}
            </Select>
          </>
        )}

        {selectedTime && (
          <Button type="primary" style={{ marginTop: "20px" }}>
            Tiếp tục đặt vé
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
