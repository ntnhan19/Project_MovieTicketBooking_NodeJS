// MovieList.jsx
import React, { useState } from "react";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";
import MovieModal from "./TrailerModal";
import "../index.css";
import movies from "../data/movies.js";

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

  const today = new Date(2025, 2, 20); // Fixed test date
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const nowShowing = movies.filter(
    (movie) => parseDate(movie.releaseDate) <= today
  );
  const comingSoon = movies.filter(
    (movie) => parseDate(movie.releaseDate) > today
  );

  const filteredMovies = category === "nowShowing" ? nowShowing : comingSoon;

  return (
    <div className="movie-list-container">
      <Row gutter={[16, 16]} justify="center">
        {filteredMovies.map((movie) => (
          <Col key={movie.id} xs={12} sm={8} md={6} lg={6}>
            <div className="movie-card-container">
              <Link
                to={`/movies/${movie.id}`}
                style={{ textDecoration: "none" }}
              >
                <MovieCard movie={movie} showModal={showModal} />
              </Link>
            </div>
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
