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
        <img alt={movie.title} src={movie.image} className="movie-image" />
      }
      actions={[
        <PlayCircleOutlined
          key="play"
          onClick={(e) => {
            e.preventDefault();
            showModal(movie);
          }}
          className="icon-action"
        />,
        <Link to={`/booking/${movie.id}`} key="book">
          <Button type="primary" className="booking-button">
            ĐẶT VÉ
          </Button>
        </Link>,
      ]}
    >
      <Card.Meta title={movie.title} />
    </Card>
  );
};

export default MovieCard;
