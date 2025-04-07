import React, { useState } from "react";
import { Col, Row, Typography, Divider, Tag, Button, DatePicker } from "antd";

import dayjs from "dayjs";
import "../index.css";
import showtimesData from "../data/showtimesData";

const { Title, Text } = Typography;
const movies = [
  {
    id: 1,
    title: "Nhà Gia Tiên",
    image: "/images/img1.jpg",
    releaseDate: "21/02/2025",
    runtime: "1 giờ 57 phút",
    director: "Huỳnh Lập",
    genre: "Supernatural, Family, Comedy - 2D",
    rating: "T18",
    format: "2D",
    description: "Một câu chuyện đa góc nhìn về các thế hệ...",
    trailer: "https://www.youtube.com/watch?v=hXGozmNBwt4",
  },
  {
    id: 2,
    title: "Quỷ Nhập Tràng",
    image: "/images/img2.jpg",
    releaseDate: "07/03/2025",
    runtime: "2 giờ 2 phút",
    director: "Pom Nguyễn",
    genre: "Horror - 2D",
    format: "2D",
    rating: "T18",
    description: "Lấy cảm hứng từ truyền thuyết kinh dị...",
    trailer: "https://www.youtube.com/watch?v=fQKxDM-hxoU",
  },
  {
    id: 3,
    title: "FLOW: Lạc Trôi",
    image: "/images/img3.jpg",
    releaseDate: "07/04/2025",
    runtime: "1 giờ 29 phút",
    director: "Gints Zilbalodis",
    genre: "Cartoon - 2D",
    format: "2D",
    rating: "P",
    description: "Một chú mèo nhút nhát phải rời bỏ vùng an toàn...",
    trailer: "https://www.youtube.com/watch?v=B3V-9tiuQTo",
  },
  {
    id: 4,
    title: "SÁT THỦ VÔ CÙNG CỰC HÀI",
    image: "/images/img4.jpg",
    releaseDate: "14/04/2025",
    runtime: "1 giờ 47 phút",
    director: "Choi Won-sub",
    genre: "Comedy, Action - 2D Dub",
    format: "2D",
    rating: "T16",
    description: "Câu chuyện về một họa sĩ webtoon...",
    trailer: "https://www.youtube.com/watch?v=0g1v2x4X8aE",
  },
];

const generateDateList = () => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = dayjs().add(i, "day");
    const weekday = date.format("dd"); // T2, T3...
    const formatted = date.format("DD/MM");
    days.push({
      label: `${weekday}, ${formatted}`,
      value: date.format("DD/MM/YYYY"),
    });
  }
  return days;
};

const ShowtimePage = () => {
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("DD/MM/YYYY")
  );
  const [selectedTheater] = useState("id");

  const showtimesForTheater =
    showtimesData[selectedDate]?.[selectedTheater] || {};

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.format("DD/MM/YYYY"));
    }
  };

  return (
    <div className="showtime-page">
      {/* Date Select Buttons + Picker */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {generateDateList().map((dateObj) => (
          <Button
            key={dateObj.value}
            type={selectedDate === dateObj.value ? "primary" : "default"}
            shape="round"
            onClick={() => setSelectedDate(dateObj.value)}
          >
            {dateObj.label}
          </Button>
        ))}
        <DatePicker
          format="DD/MM/YYYY"
          onChange={handleDateChange}
          style={{ marginLeft: 12 }}
          placeholder="Chọn ngày khác"
        />
      </div>

      <Divider />

      {/* Movie showtimes remain the same */}
      <Row gutter={[24, 24]} justify="center">
        {Object.keys(showtimesForTheater).map((movieId) => {
          const movie = movies.find((m) => m.id === parseInt(movieId));
          if (!movie) return null;
          return (
            <Col key={movie.id} span={20}>
              <div className="movie-showtime-box">
                <Row gutter={16} align="middle">
                  <Col xs={4} sm={3} md={2}>
                    <img
                      src={movie.image}
                      alt={movie.title}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  </Col>
                  <Col xs={16} sm={18} md={20}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Title level={5}>{movie.title}</Title>
                      <Tag color={movie.format === "IMAX" ? "blue" : "purple"}>
                        {movie.format}
                      </Tag>
                    </div>
                    <Text>
                      {movie.runtime} • {movie.rating} • {movie.genre}
                    </Text>
                    <div style={{ marginTop: 10 }}>
                      {showtimesForTheater[movieId].map((time, index) => (
                        <Button
                          key={index}
                          type="default"
                          size="middle"
                          style={{ margin: "4px 8px 4px 0" }}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
export default ShowtimePage;
