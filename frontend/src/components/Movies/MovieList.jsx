// src/components/MovieList.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import "./MovieList.css";

const MovieList = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <div key={movie.id} className="movie-card">
          <div className="movie-poster">
            <img
              src={
                movie.poster ||
                movie.posterUrl ||
                movie.image ||
                "/fallback.jpg"
              }
              alt={movie.title}
              className="poster-image"
            />
            <div className="movie-overlay">
              <Link to={`/movie/${movie.id}`} className="trailer-button">
                <PlayCircleOutlined /> Xem Trailer
              </Link>
            </div>
          </div>
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            {movie.releaseDate && (
              <p className="movie-release">
                {movie.isNowShowing
                  ? `Khởi chiếu: ${new Date(
                      movie.releaseDate
                    ).toLocaleDateString("vi-VN")}`
                  : `Sắp chiếu: ${new Date(
                      movie.releaseDate
                    ).toLocaleDateString("vi-VN")}`}
              </p>
            )}
            <div className="movie-actions">
              <Link to={`/movie/${movie.id}`}>
                <Button type="primary" className="book-button">
                  ĐẶT VÉ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList;