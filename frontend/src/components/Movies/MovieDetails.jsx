import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, Spin, Empty, message } from "antd";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      try {
        setLoading(true);
        // Lấy thông tin chi tiết phim
        const movieData = await movieApi.getMovieById(id);
        setMovie(movieData);

        // Lấy lịch chiếu của phim
        const showtimesData = await showtimeApi.getShowtimesByMovie(id);
        setShowtimes(showtimesData);
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
        message.error("Không thể tải thông tin phim. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!movie) {
    return (
      <Empty 
        description="Không tìm thấy thông tin phim" 
        style={{ padding: '50px' }}
      />
    );
  }

  return (
    <Card
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        textAlign: "left",
        padding: "20px",
      }}
    >
      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        <img
          src={movie.poster || movie.image}
          alt={movie.title}
          style={{
            width: "280px",
            height: "400px",
            objectFit: "cover",
            borderRadius: "10px",
          }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            {movie.title}
            <Tag
              color="yellow"
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              {movie.rating}
            </Tag>
          </h1>
          <p>
            <b>Đạo diễn:</b> {movie.director}
          </p>
          <p>
            <b>Diễn viên:</b> {movie.mainActors || "Chưa cập nhật"}
          </p>
          <p>
            <b>Thể loại:</b> {Array.isArray(movie.genres) 
              ? movie.genres.map(g => g.name).join(', ') 
              : movie.genre || "Chưa cập nhật"}
          </p>
          <p>
            <b>Ngày chiếu:</b> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
          </p>
          <p>
            <b>Thời lượng:</b> {movie.duration} phút
          </p>
          <p>
            <b>Mô tả:</b> {movie.description}
          </p>
        </div>
      </div>

      {/* Lịch Chiếu */}
      <div style={{ marginTop: "30px" }}>
        <h2
          style={{
            color: "red",
            borderBottom: "2px solid red",
            display: "inline-block",
          }}
        >
          Lịch Chiếu
        </h2>
        {Object.keys(showtimes).length > 0 ? (
          Object.entries(showtimes).map(([cinema, dates]) => (
            <div key={cinema} style={{ marginTop: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{cinema}</h3>
              {Object.entries(dates).map(([date, times]) => (
                <div key={date} style={{ marginLeft: "10px" }}>
                  <p style={{ fontWeight: "bold", marginTop: "10px" }}>{date}</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {times.map((time) => (
                      <Button
                        key={time}
                        type="primary"
                        size="small"
                        onClick={() =>
                          navigate(`/booking/${movie.id}?time=${time}&date=${date}&cinema=${cinema}`)
                        }
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Hiện chưa có lịch chiếu cho phim này</p>
        )}
      </div>
    </Card>
  );
};

export default MovieDetails;