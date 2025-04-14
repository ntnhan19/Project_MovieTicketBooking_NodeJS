// frontend/src/pages/ShowtimePage.jsx
import React, { useState, useEffect } from "react";
import { Col, Row, Typography, Divider, Tag, Button, DatePicker, Spin, Empty, Select, message } from "antd";
import dayjs from "dayjs";
import "../index.css";
import { showtimeApi } from "../api/showtimeApi";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [selectedTheater, setSelectedTheater] = useState("all");
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState({});
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách rạp khi component mount
  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        // Giả sử API này trả về danh sách các rạp phim
        const response = await fetch('http://localhost:5000/api/cinemas');
        const data = await response.json();
        setTheaters(data);
      } catch (error) {
        console.error("Failed to fetch theaters:", error);
        message.error("Không thể tải danh sách rạp phim!");
      }
    };

    fetchTheaters();
  }, []);

  // Lấy lịch chiếu khi ngày hoặc rạp thay đổi
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        
        // Thực hiện gọi API lấy lịch chiếu
        let data;
        if (selectedTheater === "all") {
          data = await showtimeApi.getShowtimesByDate(selectedDate);
        } else {
          data = await showtimeApi.getShowtimesByCinema(selectedTheater);
          // Lọc theo ngày nếu cần
          if (data && Object.keys(data).length > 0) {
            Object.keys(data).forEach(cinemaId => {
              const filteredDates = {};
              if (data[cinemaId][selectedDate]) {
                filteredDates[selectedDate] = data[cinemaId][selectedDate];
              }
              data[cinemaId] = filteredDates;
            });
          }
        }
        
        setShowtimes(data || {});
        
        // Lấy thông tin chi tiết của các phim trong lịch chiếu
        const movieIds = new Set();
        if (data) {
          Object.keys(data).forEach(cinema => {
            Object.keys(data[cinema]).forEach(date => {
              Object.keys(data[cinema][date]).forEach(movieId => {
                movieIds.add(parseInt(movieId));
              });
            });
          });
        }
        
        // Lấy thông tin phim từ IDs
        if (movieIds.size > 0) {
          const moviesData = await Promise.all(
            Array.from(movieIds).map(id => 
              fetch(`http://localhost:5000/api/movies/${id}`).then(res => res.json())
            )
          );
          setMovies(moviesData);
        }
      } catch (error) {
        console.error("Failed to fetch showtimes:", error);
        message.error("Không thể tải lịch chiếu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, selectedTheater]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date.format("DD/MM/YYYY"));
    }
  };

  const handleTheaterChange = (value) => {
    setSelectedTheater(value);
  };

  const getShowtimesForMovie = (movieId) => {
    const result = {};
    Object.keys(showtimes).forEach(cinema => {
      if (showtimes[cinema][selectedDate] && showtimes[cinema][selectedDate][movieId]) {
        result[cinema] = showtimes[cinema][selectedDate][movieId];
      }
    });
    return result;
  };

  const findMovie = (movieId) => {
    return movies.find(m => m.id === parseInt(movieId));
  };

  return (
    <div className="showtime-page">
      {/* Bộ lọc */}
      <div style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select 
              placeholder="Chọn rạp" 
              style={{ width: '100%' }}
              onChange={handleTheaterChange}
              value={selectedTheater}
            >
              <Option value="all">Tất cả rạp</Option>
              {theaters.map(theater => (
                <Option key={theater.id} value={theater.id}>
                  {theater.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

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

      {/* Movie showtimes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : Object.keys(showtimes).length === 0 ? (
        <Empty description="Không có lịch chiếu nào cho ngày này" />
      ) : (
        <Row gutter={[24, 24]} justify="center">
          {movies.length > 0 && movies.map(movie => {
            const movieShowtimes = getShowtimesForMovie(movie.id.toString());
            if (Object.keys(movieShowtimes).length === 0) return null;
            
            return (
              <Col key={movie.id} span={20}>
                <div className="movie-showtime-box">
                  <Row gutter={16} align="middle">
                    <Col xs={4} sm={3} md={2}>
                      <Link to={`/movies/${movie.id}`}>
                        <img
                          src={movie.poster || movie.image}
                          alt={movie.title}
                          style={{ width: "100%", borderRadius: 8 }}
                        />
                      </Link>
                    </Col>
                    <Col xs={16} sm={18} md={20}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Link to={`/movies/${movie.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          <Title level={5}>{movie.title}</Title>
                        </Link>
                        <Tag color="purple">
                          {movie.format || '2D'}
                        </Tag>
                      </div>
                      <Text>
                        {movie.duration} phút • {movie.rating} • {
                          Array.isArray(movie.genres) 
                            ? movie.genres.map(g => g.name).join(', ') 
                            : "Chưa cập nhật"
                        }
                      </Text>
                      
                      {Object.entries(movieShowtimes).map(([cinema, times]) => (
                        <div key={cinema} style={{ marginTop: 10 }}>
                          <Text strong>{cinema}</Text>
                          <div>
                            {times.map((time, idx) => (
                              <Link 
                                key={idx} 
                                to={`/booking/${movie.id}?time=${time}&date=${selectedDate}&cinema=${cinema}`}
                              >
                                <Button
                                  type="default"
                                  size="middle"
                                  style={{ margin: "4px 8px 4px 0" }}
                                >
                                  {time}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </Col>
                  </Row>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default ShowtimePage;