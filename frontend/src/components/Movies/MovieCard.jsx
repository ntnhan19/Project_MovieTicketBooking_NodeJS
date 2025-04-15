// MovieCard.jsx
import React from "react";
import { Card, Button } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const MovieCard = ({ movie, showModal }) => {
  return (
    <Card
      hoverable
      className="movie-card"
      cover={
        <img alt={movie.title} src={movie.poster || movie.image} className="movie-image" />
      }
      actions={[
        <PlayCircleOutlined
          key="play"
          onClick={() => showModal(movie)}
          className="icon-action"
        />,
        <Button
          type="primary"
          className="booking-button"
          onClick={() => (window.location.href = `/movies/${movie.id}/booking`)}
        >
          ĐẶT VÉ
        </Button>,
      ]}
    >
      <Link to={`/movies/${movie.id}`}>
        <Card.Meta title={movie.title} />
      </Link>
    </Card>
  );
};

export default MovieCard;
