import React from "react";
import { Modal } from "antd";

const MovieModal = ({ movie, isVisible, onClose }) => {
  if (!movie) return null;

  // Chuyển URL YouTube thành dạng embed
  const embedUrl = movie.trailer
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "www.youtube.com/embed/");

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={850}
      centered
    >
      <div className="modal-content">
        <iframe
          width="100%"
          height="480"
          src={embedUrl}
          title={movie.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </Modal>
  );
};

export default MovieModal;
