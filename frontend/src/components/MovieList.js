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
    cast: "Huỳnh Lập, Phương Mỹ Chi, NSƯT Hạnh Thuý, NSƯT Huỳnh Đông, Puka...",
    genre: "Supernatural, Family, Comedy - 2D",
    rating: "T18",
    description:
      "Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn về các thế hệ khác nhau trong một gia đình...",
  },
  {
    id: 2,
    title: "Quỷ Nhập Tràng",
    image: "/images/img2.jpg",
    releaseDate: "07/03/2025",
    runtime: "2 giờ 2 phút",
    director: "Pom Nguyễn",
    cast: "Khả Như, Quang Tuấn,…",
    genre: "Horror - 2D",
    rating: "T18",
    description:
      "Lấy cảm hứng từ truyền thuyết kinh dị nhất về “người chết sống dậy”...",
  },
  {
    id: 3,
    title: "FLOW: Lạc Trôi",
    image: "/images/img3.jpg",
    releaseDate: "07/03/2025",
    runtime: "1 giờ 29 phút",
    director: " Gints Zilbalodisn",
    cast: "Gints Zilbalodis",
    genre: "Cartoon - 2D",
    rating: "P",
    description:
      "Trước bối cảnh hậu tận thế, chú mèo xám nhút nhát, vốn luôn sợ nước phải rời bỏ vùng an toàn khi căn nhà thân yêu bị cuốn trôi bởi cơn lũ dữ...",
  },
  {
    id: 4,
    title: "SÁT THỦ VÔ CÙNG CỰC HÀI",
    image: "/images/img4.jpg",
    releaseDate: "14/03/2025",
    runtime: " 1 giờ 47 phút",
    director: "Choi Won-sub",
    cast: "Rachel Zegler, Gal Gadot, Kwon Sang-woo...",
    genre: "Comedy, Action - 2D Dub",
    rating: "T16",
    description:
      "Câu chuyện tiếp nối về cuộc đời làm hoạ sĩ webtoon Jun, người nổi tiếng trong thời gian ngắn với tư cách là tác giả của webtoon Đặc vụ ám sát Jun...",
  },
];

const MovieList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const showModal = (movie) => {
    setSelectedMovie(movie);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="movie-list-container">
      <Row gutter={[16, 16]} justify="center">
        {movies.map((movie) => (
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
