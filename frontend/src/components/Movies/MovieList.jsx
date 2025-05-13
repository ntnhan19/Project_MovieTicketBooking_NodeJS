// frontend/src/components/Movies/MovieList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Tooltip, Tag, Badge } from "antd";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  CloseOutlined,
  StarFilled,
  FieldTimeOutlined,
  TagsOutlined,
  FireFilled,
} from "@ant-design/icons";

const MovieList = ({ movies }) => {
  const navigate = useNavigate();
  const [trailerModal, setTrailerModal] = useState({
    visible: false,
    url: "",
    title: "",
  });

  if (!movies || movies.length === 0) {
    return null;
  }

  // Hàm xử lý hiển thị trailer
  const showTrailer = (url, title, e) => {
    // Đảm bảo e tồn tại trước khi sử dụng stopPropagation
    if (e) {
      e.stopPropagation();
    }

    if (!url) return;

    // Chuyển đổi URL từ dạng watch thành embed nếu cần
    let embedUrl = url;
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1].split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    setTrailerModal({
      visible: true,
      url: embedUrl,
      title: title,
    });
  };

  // Hàm đóng modal trailer
  const closeTrailer = () => {
    setTrailerModal({
      visible: false,
      url: "",
      title: "",
    });
  };

  // Xử lý khi click vào card phim
  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  // Hàm để tạo màu gradient theo giới hạn tuổi
  const getAgeRestrictionStyles = (ageRestriction) => {
    switch (ageRestriction) {
      case "P":
        return "from-green-500 to-green-600";
      case "C13":
        return "from-yellow-500 to-orange-500";
      case "C16":
        return "from-orange-500 to-red-500";
      case "C18":
        return "from-red-500 to-red-700";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  // Format thời gian
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? `${hours}h` : ""} ${mins}p`;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100"
            onClick={() => handleMovieClick(movie.id)}
          >
            <div className="relative overflow-hidden pb-[140%]">
              {/* Poster phim */}
              <img
                src={
                  movie.poster ||
                  movie.posterUrl ||
                  movie.image ||
                  "/fallback.jpg"
                }
                alt={movie.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 backdrop-blur-sm">
                {/* Top section - rating */}
                <div className="self-end">
                  {movie.rating && (
                    <div className="flex items-center justify-center bg-yellow-400 rounded-lg px-3 py-1.5 shadow-lg">
                      <StarFilled className="mr-1 text-white" />
                      <span className="font-bold text-white">
                        {movie.rating}/10
                      </span>
                    </div>
                  )}
                </div>

                {/* Middle section - thông tin thêm */}
                <div className="text-white my-4">
                  {movie.duration && (
                    <div className="mb-2 flex items-center">
                      <FieldTimeOutlined className="mr-2" />
                      <span>{formatDuration(movie.duration)}</span>
                    </div>
                  )}

                  {movie.genres && movie.genres.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      <TagsOutlined className="mr-2 mt-1" />
                      <div>
                        {movie.genres.slice(0, 3).map((genre, index) => (
                          <Tag
                            key={index}
                            className="mr-1 mb-1 bg-primary/30 text-white border-none"
                          >
                            {typeof genre === "object" ? genre.name : genre}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom section - trailer button */}
                <div className="flex justify-center mt-auto">
                  {movie.trailerUrl && (
                    <Tooltip title="Xem trailer">
                      <div
                        onClick={(e) =>
                          showTrailer(movie.trailerUrl, movie.title, e)
                        }
                        className="trailer-btn bg-gradient-to-r from-primary to-primary-light text-white border-none rounded-full py-2 px-6 h-auto flex items-center gap-2 shadow-button transition-all hover:shadow-button-hover hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
                      >
                        <PlayCircleOutlined />
                        <span className="font-medium tracking-wide">
                          Xem Trailer
                        </span>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Status badge - phim đang chiếu/sắp chiếu */}
              {movie.isNowShowing !== undefined && (
                <div
                  className={`absolute top-3 left-3 py-1.5 px-4 rounded-full text-xs font-bold text-white shadow-lg ${
                    movie.isNowShowing
                      ? "bg-gradient-to-r from-primary to-primary-light"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                >
                  {movie.isNowShowing ? (
                    <div className="flex items-center">
                      <FireFilled className="mr-1" /> ĐANG CHIẾU
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <CalendarOutlined className="mr-1" /> SẮP CHIẾU
                    </div>
                  )}
                </div>
              )}

              {/* Giới hạn tuổi */}
              {movie.ageRestriction && (
                <div
                  className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${getAgeRestrictionStyles(
                    movie.ageRestriction
                  )}`}
                >
                  {movie.ageRestriction}
                </div>
              )}

              {/* Hot badge */}
              {movie.isHot && (
                <div className="absolute top-14 right-3">
                  <Badge.Ribbon text="HOT" color="#e71a0f" />
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 h-14 group-hover:text-primary transition-colors">
                {movie.title}
              </h3>

              <div className="flex justify-between items-center">
                {movie.releaseDate && (
                  <p className="text-text-secondary text-sm flex items-center">
                    <CalendarOutlined className="mr-1" />
                    {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                  </p>
                )}

                {movie.rating && (
                  <div className="flex items-center text-yellow-500">
                    <StarFilled className="text-sm mr-1" />
                    <span className="font-medium">{movie.rating}</span>
                  </div>
                )}
              </div>

              <Button
                type="primary"
                className="w-full h-12 mt-4 font-medium bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary border-none rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-button-hover text-base flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/movies/${movie.id}`);
                }}
              >
                {movie.isNowShowing ? "ĐẶT VÉ NGAY" : "CHI TIẾT"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal hiển thị trailer */}
      <Modal
        title={
          <div className="flex items-center text-lg font-bold">
            <PlayCircleOutlined className="text-primary mr-2" />
            {trailerModal.title}
          </div>
        }
        open={trailerModal.visible}
        onCancel={closeTrailer}
        afterClose={() => setTrailerModal((prev) => ({ ...prev, url: "" }))}
        footer={null}
        width="80%"
        centered
        className="trailer-modal"
        closeIcon={
          <Button
            type="default"
            shape="circle"
            icon={<CloseOutlined />}
            className="bg-white/20 text-white hover:bg-white/40 hover:text-white border-none absolute -top-12 right-0 z-10"
            size="large"
          />
        }
        destroyOnClose={true}
        styles={{
          body: { padding: 0 },
          mask: { backdropFilter: "blur(5px)" },
          content: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <div
          className="responsive-iframe-container"
          style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
        >
          {trailerModal.url && (
            <iframe
              title="Movie Trailer"
              src={`${trailerModal.url}?autoplay=1`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "8px",
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MovieList;
