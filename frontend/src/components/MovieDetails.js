import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag } from "antd";

const movies = [
  {
    id: 1,
    title: "Nhà Gia Tiên",
    image: "/images/img1.jpg",
    releaseDate: "21/02/2025",
    runtime: "1 giờ 57 phút",
    director: "Huỳnh Lập",
    cast: "Huỳnh Lập, Phương Mỹ Chi, NSƯT Hạnh Thúy, NSƯT Huỳnh Đông, Puka...",
    genre: "Supernatural, Family, Comedy - 2D",
    rating: "T18",
    description: "Bộ phim kể về câu chuyện bí ẩn trong một gia đình...",
    showtimes: {
      "CGV Vincom": {
        "21/02/2025": ["10:00", "13:30", "16:45", "19:00"],
        "22/02/2025": ["11:00", "14:15", "17:30", "20:45"],
      },
    },
  },
];

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = movies.find((m) => m.id === parseInt(id));

  if (!movie) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Phim không tồn tại!
      </h2>
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
          src={movie.image}
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
            <b>Diễn viên:</b> {movie.cast}
          </p>
          <p>
            <b>Ngày chiếu:</b> {movie.releaseDate}
          </p>
          <p>
            <b>Thời lượng:</b> {movie.runtime}
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
        {Object.entries(movie.showtimes).map(([cinema, dates]) => (
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
                        navigate(`/booking/${movie.id}?time=${time}`)
                      }
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MovieDetails;
