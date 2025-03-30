import React, { useState } from "react";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";
import "../index.css";

const movies = [
  {
    id: 1,
    title: "Nhà Gia Tiên",
    image: "/images/img1.jpg",
    releaseDate: "21/02/2025",
    runtime: "1 giờ 57 phút",
    director: "Huỳnh Lập",
    genre: "Supernatural, Family, Comedy - 2D",
    rating: "T18",
    description: "Một câu chuyện đa góc nhìn về các thế hệ...",
  },
  {
    id: 2,
    title: "Quỷ Nhập Tràng",
    image: "/images/img2.jpg",
    releaseDate: "07/03/2025",
    runtime: "2 giờ 2 phút",
    director: "Pom Nguyễn",
    genre: "Horror - 2D",
    rating: "T18",
    description: "Lấy cảm hứng từ truyền thuyết kinh dị...",
  },
  {
    id: 3,
    title: "FLOW: Lạc Trôi",
    image: "/images/img3.jpg",
    releaseDate: "07/04/2025",
    runtime: "1 giờ 29 phút",
    director: "Gints Zilbalodis",
    genre: "Cartoon - 2D",
    rating: "P",
    description: "Một chú mèo nhút nhát phải rời bỏ vùng an toàn...",
  },
  {
    id: 4,
    title: "SÁT THỦ VÔ CÙNG CỰC HÀI",
    image: "/images/img4.jpg",
    releaseDate: "14/04/2025",
    runtime: "1 giờ 47 phút",
    director: "Choi Won-sub",
    genre: "Comedy, Action - 2D Dub",
    rating: "T16",
    description: "Câu chuyện về một họa sĩ webtoon...",
  },
];

const MovieList = ({ category }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const showModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Lấy ngày hiện tại
  const today = new Date("2025-03-30");

  // Chuyển đổi ngày phát hành sang dạng Date để so sánh
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Phân loại phim
  const nowShowing = movies.filter(
    (movie) => parseDate(movie.releaseDate) <= today
  );
  const comingSoon = movies.filter(
    (movie) => parseDate(movie.releaseDate) > today
  );

  // Chọn danh sách phim dựa trên category
  const filteredMovies = category === "nowShowing" ? nowShowing : comingSoon;

  return (
    <div className="movie-list-container">
      <Row gutter={[16, 16]} justify="center">
        {filteredMovies.map((movie) => (
          <Col key={movie.id} xs={12} sm={8} md={6} lg={6}>
            <Link to={`/movies/${movie.id}`} style={{ textDecoration: "none" }}>
              <MovieCard movie={movie} showModal={showModal} />
            </Link>
          </Col>
        ))}
      </Row>

      <MovieModal
        movie={selectedMovie}
        isVisible={isModalVisible}
        onClose={handleCancel}
      />
    </div>
  );
};

export default MovieList;
