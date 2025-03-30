import React from "react";
import { Modal, Tag } from "antd";
import "../index.css";

const MovieModal = ({ movie, isVisible, onClose }) => {
  if (!movie) return null;

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={850}
      centered
    >
      <div className="modal-content">
        {/* Ảnh poster */}
        <img src={movie.image} alt={movie.title} className="modal-image" />

        {/* Thông tin phim */}
        <div className="modal-info">
          <h2 className="modal-title">
            {movie.title}
            <Tag className="rating-tag">{movie.rating}</Tag>
          </h2>
          <p className="modal-genre">{movie.genre}</p>
          <p>
            <b>Khởi Chiếu:</b> {movie.releaseDate}
          </p>
          <p>
            <b>Thời Lượng:</b> {movie.runtime}
          </p>
          <p>
            <b>Đạo Diễn:</b> {movie.director}
          </p>
          <p>
            <b>Diễn Viên:</b> {movie.cast}
          </p>
          <p className="modal-description">{movie.description}</p>
        </div>
      </div>
    </Modal>
  );
};

export default MovieModal;
