import React, { memo } from 'react';
import {
  PlayCircleOutlined,
  StarFilled,
  FieldTimeOutlined,
  FireFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import { Rate } from 'antd';

const MovieCard = memo(({ 
  movie, 
  onMovieClick, 
  onTrailerClick,
  onTicketClick,
  showTrailerButton = true,
  showTicketButton = true 
}) => {
  const getAgeRestrictionStyles = (ageRestriction) => {
    switch (ageRestriction) {
      case "P": return "from-green-500 to-green-600";
      case "C13": return "from-yellow-500 to-orange-500";
      case "C16": return "from-orange-500 to-red-500";
      case "C18": return "from-red-500 to-red-700";
      default: return "from-blue-500 to-blue-600";
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? `${hours}h` : ""} ${mins}p`;
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group border border-gray-100 w-full max-w-[300px] mx-auto"
      onClick={() => onMovieClick?.(movie.id)}
    >
      <div className="relative overflow-hidden pb-[150%]">
        {/* Poster */}
        <img
          src={movie.poster || movie.posterUrl || movie.image || "/fallback.jpg"}
          alt={movie.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay với thông tin và nút */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6 backdrop-blur-[2px]">
          {/* Ratings & Duration */}
          <div className="flex justify-between items-start">            {(movie.avgRating || movie.rating) && (
              <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg gap-2">
                <Rate 
                  disabled
                  allowHalf
                  defaultValue={(movie.avgRating || movie.rating) / 2}
                  className="text-yellow-400 text-[12px]"
                />
                <span className="font-bold text-white text-sm border-l border-white/20 pl-2">
                  {movie.avgRating || movie.rating}/10
                </span>
              </div>
            )}

            {movie.duration && (
              <div className="flex items-center bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg">
                <FieldTimeOutlined className="mr-1.5 text-white text-sm" />
                <span className="font-medium text-white text-sm">
                  {formatDuration(movie.duration)}
                </span>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="text-white my-2">
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {movie.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full"
                  >
                    {typeof genre === "object" ? genre.name : genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            {showTrailerButton && movie.trailerUrl && (
              <div className="relative group/tooltip">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrailerClick?.(movie.trailerUrl, movie.title, movie.id);
                  }}
                  className="relative overflow-hidden bg-black/30 hover:bg-black/50 text-white rounded-lg pl-3 pr-4 py-2.5 flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl backdrop-blur-md group/btn"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-light/80 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  <PlayCircleOutlined className="text-lg relative z-10" />
                  <span className="font-medium text-sm relative z-10">Trailer</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900/90 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 backdrop-blur-sm whitespace-nowrap pointer-events-none shadow-xl">
                  Xem trailer
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90"></div>
                </div>
              </div>
            )}

            {showTicketButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTicketClick?.(movie.id);
                }}
                className="relative overflow-hidden bg-primary text-white rounded-lg px-5 py-2.5 font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl text-sm flex items-center justify-center gap-2 group/btn"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Mua Vé</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {movie.isNowShowing !== undefined && (
          <div
            className={`absolute top-3 left-3 py-1.5 px-3 rounded-full text-xs font-bold text-white shadow-lg ${
              movie.isNowShowing
                ? "bg-gradient-to-r from-primary to-primary-light"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            } backdrop-blur-md`}
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

        {/* Age Restriction Badge */}
        {movie.ageRestriction && (
          <div
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${getAgeRestrictionStyles(
              movie.ageRestriction
            )} backdrop-blur-md`}
          >
            {movie.ageRestriction}
          </div>
        )}

        {/* Hot Badge */}
        {movie.isHot && (
          <div className="absolute top-12 right-3">
            <div className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-r shadow-lg after:content-[''] after:absolute after:top-full after:left-0 after:border-t-[3px] after:border-r-[3px] after:border-t-primary-dark after:border-r-transparent">
              HOT
            </div>
          </div>
        )}
      </div>

      {/* Title và Rating */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-text-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        {/* Rating hiển thị cố định */}
        {(movie.avgRating || movie.rating) && (
          <div className="flex items-center mt-2">
            <Rate 
              disabled
              allowHalf
              defaultValue={(movie.avgRating || movie.rating) / 2}
              className="text-yellow-400 text-xs"
            />
            <span className="ml-2 text-gray-600 text-sm font-medium">
              {movie.avgRating || movie.rating}/10
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MovieCard.displayName = 'MovieCard';

export default MovieCard;