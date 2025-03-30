import React from "react";
import "../index.css"; // Import CSS
import { Tag } from "antd";
const MovieDetails = ({ movie }) => {
  return (
    <div className="movie-details-container">
      <img src={movie.poster} alt={movie.title} className="movie-poster" />
      <div className="movie-info">
        <h2>
          {movie.title}{" "}
          <Tag className="movie-age-rating">{movie.ageRating}</Tag>{" "}
        </h2>

        <div className="movie-tags">
          {movie.formats.map((format, index) => (
            <span key={index} className="movie-format">
              {format}
            </span>
          ))}
        </div>
        <p>
          <strong>Đạo Diễn:</strong> {movie.director}
        </p>
        <p>
          <strong>Diễn Viên:</strong> {movie.actors}
        </p>
        <p>{movie.description}</p>
        <div className="showtimes">
          {movie.times.map((time, index) => (
            <button key={index} className="showtime-button">
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
