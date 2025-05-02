import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Modal, Tooltip } from "antd";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  CloseOutlined,
  StarOutlined,
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

  // Hàm xử lý hiển thị trailer - đã sửa để truyền tham số e (event)
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border border-gray-100"
            onClick={() => handleMovieClick(movie.id)}
          >
            <div className="relative overflow-hidden pb-[140%]">
              <img
                src={
                  movie.poster ||
                  movie.posterUrl ||
                  movie.image ||
                  "/fallback.jpg"
                }
                alt={movie.title}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div className="self-end">
                  {movie.rating && (
                    <div className="flex items-center justify-center bg-yellow-400/90 rounded-lg px-2 py-1 backdrop-blur-sm">
                      <StarOutlined className="mr-1 text-white" />
                      <span className="font-bold text-white">
                        {movie.rating}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  {/* Nút xem trailer - đã sửa để truyền đầy đủ tham số */}
                  {movie.trailerUrl && (
                    <Tooltip title="Xem trailer">
                      {/* Sử dụng div để tránh lồng button trong button */}
                      <div
                        onClick={(e) => showTrailer(movie.trailerUrl, movie.title, e)}
                        className="trailer-btn bg-gradient-to-r from-primary to-primary-light text-white border-none rounded-full py-1 px-6 h-auto flex items-center gap-2 shadow-button transition-all hover:shadow-button-hover hover:-translate-y-0.5 hover:scale-105 cursor-pointer"
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

              {/* Thẻ phim đang chiếu/sắp chiếu */}
              {movie.isNowShowing !== undefined && (
                <div
                  className={`absolute top-3 left-3 py-1 px-3 rounded-full text-xs font-bold text-white ${
                    movie.isNowShowing ? "bg-red-600" : "bg-blue-600"
                  }`}
                >
                  {movie.isNowShowing ? "ĐANG CHIẾU" : "SẮP CHIẾU"}
                </div>
              )}

              {/* Giới hạn tuổi */}
              {movie.ageRestriction && (
                <div
                  className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                    movie.ageRestriction === "P"
                      ? "bg-green-600"
                      : movie.ageRestriction === "C13"
                      ? "bg-orange-500"
                      : movie.ageRestriction === "C16"
                      ? "bg-red-500"
                      : "bg-red-700"
                  }`}
                >
                  {movie.ageRestriction}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 h-14">
                {movie.title}
              </h3>
              {movie.releaseDate && (
                <p className="text-gray-500 text-sm mb-4 flex items-center">
                  <CalendarOutlined className="mr-1" />
                  {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                </p>
              )}
              <div className="flex justify-between items-center">
                {/* Sử dụng div để tránh lồng button trong button */}
                <Button
                  type="primary"
                  className="w-full h-10 font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-none rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/movies/${movie.id}`);
                  }}
                >
                  ĐẶT VÉ
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal hiển thị trailer */}
      <Modal
        title={trailerModal.title}
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
            className="bg-white/20 text-white hover:bg-white/40 hover:text-white border-none"
          />
        }
        destroyOnClose={true}
        styles={{ body: { padding: 0 } }}
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