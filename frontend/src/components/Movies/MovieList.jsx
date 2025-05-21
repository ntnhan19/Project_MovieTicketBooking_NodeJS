// frontend/src/components/Movies/MovieList.jsx
import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Tooltip, Tag } from "antd";
import {  RightCircleOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  StarFilled,
  FieldTimeOutlined,
  FireFilled,
  CalendarOutlined,
  TagOutlined,
} from "@ant-design/icons";

const getAgeRestrictionColor = (ageRestriction) => {
  switch (ageRestriction) {
    case "P":
      return "success";
    case "C13":
      return "warning";
    case "C16":
      return "orange";
    case "C18":
      return "error";
    default:
      return "processing";
  }
};

const formatDuration = (minutes) => {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours ? `${hours}h` : ""} ${mins}p`;
};

const MovieList = memo(
  ({
    movies,
    maxDisplay = 8,
    showMoreButton = true,
    showTrailerButton = true,
    showTicketButton = true,
    onMovieClick,
    onTrailerClick,
    onTicketClick,
  }) => {
    const navigate = useNavigate();
    const [trailerModal, setTrailerModal] = useState({
      visible: false,
      url: "",
      title: "",
    });

    const displayedMovies = movies?.slice(0, maxDisplay) || [];

    // Xử lý click vào phim
    const handleMovieClick = useCallback(
      (movieId) => {
        if (onMovieClick) {
          onMovieClick(movieId);
        } else {
          navigate(`/movies/${movieId}`);
        }
      },
      [navigate, onMovieClick]
    );

    // Xử lý click vào nút mua vé
    const handleTicketClick = useCallback(
      (movieId) => {
        if (onTicketClick) {
          onTicketClick(movieId);
        } else {
          navigate(`/movies/${movieId}`);
        }
      },
      [navigate, onTicketClick]
    );

    // Xử lý hiển thị trailer
    const showTrailer = useCallback(
      (url, title, movieId) => {
        if (onTrailerClick) {
          onTrailerClick(url, title, movieId);
          return;
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
      },
      [onTrailerClick]
    );

    const closeTrailer = useCallback(() => {
      setTrailerModal({
        visible: false,
        url: "",
        title: "",
      });
    }, []);

    if (!movies || movies.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-col items-center">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 w-full">
          {displayedMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100 w-full max-w-[300px] mx-auto"
              onClick={() => handleMovieClick(movie.id)}
            >
              <div className="relative overflow-hidden pb-[150%]">
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

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6 backdrop-blur-[2px]">
                  <div className="flex justify-between items-start">
                    {movie.rating && (
                      <Tag
                        color="warning"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
                      >
                        <StarFilled className="text-yellow-500" />
                        <span className="font-bold text-sm">{movie.rating}/10</span>
                      </Tag>
                    )}

                    {movie.duration && (
                      <Tag className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white border-none">
                        <FieldTimeOutlined />
                        <span className="font-medium text-sm">
                          {formatDuration(movie.duration)}
                        </span>
                      </Tag>
                    )}
                  </div>

                  <div className="text-white my-2">
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {movie.genres.slice(0, 3).map((genre, index) => (
                          <Tag
                            key={index}
                            className="m-0 bg-white/20 border-none text-white text-xs px-3 py-1 rounded-full"
                          >
                            {typeof genre === "object" ? genre.name : genre}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-3">                    {showTrailerButton && movie.trailerUrl && (
                      <Tooltip title="Xem trailer" placement="top">
                        <Button
                          icon={<PlayCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            showTrailer(movie.trailerUrl, movie.title, movie.id);
                          }}
                          className="!bg-white/10 hover:!bg-white/20 !text-white !border-none !rounded-lg !h-9 !px-5 flex items-center gap-2 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          <span className="font-medium">Trailer</span>
                        </Button>
                      </Tooltip>
                    )}

                    {showTicketButton && (
                      <Tooltip title="Đặt vé xem phim" placement="top">
                        <Button
                          icon={<TagOutlined className="rotate-90" />}
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketClick(movie.id);
                          }}
                          className="!rounded-lg !h-9 !px-5 !bg-primary hover:!bg-primary-dark !border-none shadow-lg hover:!shadow-xl flex items-center gap-2 transition-all"
                        >
                          <span className="font-medium">Mua Vé</span>
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {movie.isNowShowing !== undefined && (
                  <Tag
                    color={movie.isNowShowing ? "error" : "processing"}
                    className="absolute top-3 left-3 m-0 rounded-full !py-1 !px-3"
                    icon={
                      movie.isNowShowing ? (
                        <FireFilled />
                      ) : (
                        <CalendarOutlined />
                      )
                    }
                  >
                    {movie.isNowShowing ? "ĐANG CHIẾU" : "SẮP CHIẾU"}
                  </Tag>
                )}

                {movie.ageRestriction && (
                  <Tag
                    color={getAgeRestrictionColor(movie.ageRestriction)}
                    className="absolute top-3 right-3 m-0 !w-8 !h-8 !p-0 flex items-center justify-center rounded-full font-bold"
                  >
                    {movie.ageRestriction}
                  </Tag>
                )}

                {movie.isHot && (
                  <Tag
                    color="error"
                    className="absolute top-12 right-3 m-0"
                  >
                    HOT
                  </Tag>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {showMoreButton && movies.length > maxDisplay && (
          <Button
            type="default"
            icon={<RightCircleOutlined />}
            onClick={() => navigate("/movies")}
            size="large"
            className="mt-8 !h-14 !px-8 !rounded-full !border-2 !border-primary !text-primary hover:!text-white hover:!bg-primary hover:!border-primary !font-medium"
          >
            XEM THÊM
          </Button>
        )}        <Modal
          title={
            <div className="flex items-center text-lg font-bold">
              <PlayCircleOutlined className="text-primary mr-2" />
              {trailerModal.title}
            </div>
          }
          open={trailerModal.visible}
          onCancel={closeTrailer}
          footer={null}
          width="80%"
          centered
          destroyOnHidden
          className="trailer-modal"          styles={{
            body: { padding: 0 },
            content: {
              padding: 0,
              overflow: "hidden",
              borderRadius: "16px",
            },
            mask: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }
          }}
          closeIcon={
            <Button
              type="text"
              icon={<CloseOutlined />}
              className="absolute -top-12 right-0 !text-white hover:!text-white/80 !border-none"
            />
          }
        >
          <div className="relative pb-[56.25%]">
            {trailerModal.url && (
              <iframe
                title="Movie Trailer"
                src={`${trailerModal.url}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </Modal>
      </div>
    );
  }
);

MovieList.displayName = "MovieList";

export default MovieList;
