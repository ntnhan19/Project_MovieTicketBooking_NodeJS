import React from "react";
import { Card } from "antd";
import { PlayCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

import "../index.css";

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
        <InfoCircleOutlined
          key="info"
          onClick={(e) => {
            e.preventDefault();
            showModal(movie);
          }}
          className="icon-action"
        />,
      ]}
    >
      <Card.Meta title={movie.title} />
    </Card>
  );
};

export default MovieCard;
