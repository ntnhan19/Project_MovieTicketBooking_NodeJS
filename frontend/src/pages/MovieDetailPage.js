import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Tag, Button, Rate, Input, List } from "antd";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";

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
      "Lotte Cinema": {
        "21/02/2025": ["09:30", "12:45", "15:00", "18:30"],
        "22/02/2025": ["10:15", "13:45", "16:00", "19:15"],
      },
      "Galaxy Cinema": {
        "21/02/2025": ["08:30", "11:45", "14:00", "17:30"],
        "22/02/2025": ["09:00", "12:30", "15:45", "19:00"],
      },
    },
    userRating: 4.5,
    reviews: [
      {
        username: "Nguyễn An",
        rating: 5,
        comment: "Phim rất hay và cảm động!",
      },
      {
        username: "Huy Hoàng",
        rating: 4,
        comment: "Cốt truyện ổn nhưng có vài đoạn hơi dài dòng.",
      },
    ],
  },
];

const MovieDetailPage = () => {
  const { id } = useParams();
  const movie = movies.find((m) => m.id === parseInt(id));
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [reviews, setReviews] = useState(movie.reviews);

  if (!movie) {
    return (
      <h2 style={{ textAlign: "center", marginTop: "50px" }}>
        Phim không tồn tại!
      </h2>
    );
  }

  const handleAddReview = () => {
    if (newComment.trim() === "") return;
    setReviews([
      ...reviews,
      { username: "Người dùng mới", rating: newRating, comment: newComment },
    ]);
    setNewComment("");
  };

  return (
    <div className="p-10">
      <Link to="/">
        <Button icon={<ArrowLeftOutlined />} type="link">
          Quay lại
        </Button>
      </Link>

      <Card
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "left",
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "30px" }}>
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
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
              {movie.title}
            </h1>
            <p style={{ fontSize: "16px", color: "gray", marginBottom: "5px" }}>
              {movie.genre}
            </p>
            <Tag
              color="yellow"
              style={{ fontSize: "16px", fontWeight: "bold" }}
            >
              {movie.rating}
            </Tag>
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
          </div>
        </div>
      </Card>

      <div
        style={{ maxWidth: "1100px", margin: "30px auto", textAlign: "left" }}
      >
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
                    <Button key={time} type="primary" size="small">
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{ maxWidth: "1100px", margin: "30px auto", textAlign: "left" }}
      >
        <h2
          style={{
            color: "red",
            borderBottom: "2px solid red",
            display: "inline-block",
          }}
        >
          Đánh Giá & Bình Luận
        </h2>
        <Rate
          allowHalf
          value={newRating}
          onChange={(value) => setNewRating(value)}
        />
        <Input.TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận..."
          rows={3}
        />
        <Button
          type="primary"
          onClick={handleAddReview}
          style={{ marginTop: "10px" }}
        >
          Gửi
        </Button>
        <List
          dataSource={reviews}
          renderItem={(review) => (
            <List.Item>
              <b>{review.username}</b> -{" "}
              <Rate disabled defaultValue={review.rating} />
              <p>{review.comment}</p>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default MovieDetailPage;
