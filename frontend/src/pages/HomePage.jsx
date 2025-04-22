// frontend/src/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Spin, Empty, Typography, Carousel, Button, Row, Col } from "antd";
import { RightOutlined, LeftOutlined, PlayCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import useMovies from "../hooks/useMovies";
import { movieApi } from "../api/movieApi"; // Import movieApi
import MovieList from "../components/Movies/MovieList";
import QuickBookingWidget from "../components/Payments/QuickBookingWidget";
import AppHeader from "../components/common/AppHeader";
import Footer from "../components/common/Footer";
import "../styles/HomePage.css";

const { Title } = Typography;

// Một số ảnh dự phòng trong trường hợp không có ảnh từ API
const DEFAULT_MOVIE_IMAGE = "https://cdn.galaxycine.vn/media/2024/2/5/banner-homepage-2048x682_1707120352514.jpg";
const DEFAULT_PROMO_IMAGES = [
  "https://cdn.galaxycine.vn/media/2023/12/21/combo-u22-digital-2_1703137185284.jpg",
  "https://cdn.galaxycine.vn/media/2024/1/26/banner-digital-u22_1706254226102.jpg",
  "https://cdn.galaxycine.vn/media/2023/3/30/combo-thanh-vien-moi-300x450_1680144568244.jpg"
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("nowShowing");
  const { nowShowing, comingSoon, loading } = useMovies();
  const [loadingHeroBanner, setLoadingHeroBanner] = useState(true);
  const [bannerMovies, setBannerMovies] = useState([]);

  const moviesToShow = activeTab === "nowShowing" ? nowShowing : comingSoon;

  // Fetch banner movies from API
  useEffect(() => {
    const fetchBannerMovies = async () => {
      try {
        setLoadingHeroBanner(true);
        // Lấy danh sách phim đang chiếu từ API
        const data = await movieApi.getNowShowing();
        
        // Lấy 3 phim nổi bật đầu tiên làm banner
        const topMovies = data.slice(0, 3).map(movie => ({
          id: movie.id,
          title: movie.title,
          // Sử dụng đường dẫn ảnh thực từ API
          image: movie.backdropUrl || movie.posterUrl || movie.imageUrl || movie.image || DEFAULT_MOVIE_IMAGE,
          description: movie.overview || movie.shortDescription || movie.description || "Xem ngay bộ phim hấp dẫn này tại rạp!"
        }));
        
        setBannerMovies(topMovies);
      } catch (error) {
        console.error("Error fetching banner movies:", error);
        // Trong trường hợp lỗi, đặt một banner mặc định
        setBannerMovies([{
          id: 1,
          title: "Phim đang chiếu",
          image: DEFAULT_MOVIE_IMAGE,
          description: "Khám phá các bộ phim hấp dẫn đang chiếu tại rạp."
        }]);
      } finally {
        setLoadingHeroBanner(false);
      }
    };

    fetchBannerMovies();
  }, []);

  const handleCinemaChange = (cinemaId) => {
    console.log("Cinema selected:", cinemaId);
  };

  // Custom arrows for carousel
  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow next-arrow`}
        style={{ ...style }}
        onClick={onClick}
      >
        <Button type="primary" shape="circle" icon={<RightOutlined />} />
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={`${className} custom-arrow prev-arrow`}
        style={{ ...style }}
        onClick={onClick}
      >
        <Button type="primary" shape="circle" icon={<LeftOutlined />} />
      </div>
    );
  };

  // Xử lý sự kiện khi người dùng nhấn nút đặt vé cho phim trong banner
  const handleBookTicket = (movieId) => {
    console.log(`Booking ticket for movie: ${movieId}`);
    // Có thể chuyển hướng đến trang đặt vé với movieId
    // history.push(`/booking/${movieId}`);
  };

  // Xử lý sự kiện khi người dùng muốn xem trailer
  const handleWatchTrailer = (movieId) => {
    console.log(`Watch trailer for movie: ${movieId}`);
    // Có thể mở modal chứa trailer
    // Có thể gọi thêm API để lấy URL trailer nếu cần
  };

  return (
    <div className="home-page">
      <AppHeader />
      
      {/* Hero Banner Section */}
      <section className="hero-banner">
        {loadingHeroBanner ? (
          <div className="banner-loading">
            <Spin size="large" />
          </div>
        ) : bannerMovies.length > 0 ? (
          <Carousel
            autoplay
            effect="fade"
            arrows
            prevArrow={<PrevArrow />}
            nextArrow={<NextArrow />}
            className="banner-carousel"
          >
            {bannerMovies.map((movie) => (
              <div key={movie.id} className="banner-slide">
                <div 
                  className="banner-image" 
                  style={{ backgroundImage: `url(${movie.image})` }}
                >
                  <div className="banner-overlay">
                    <div className="banner-content">
                      <h1 className="banner-title">{movie.title}</h1>
                      <p className="banner-description">{movie.description}</p>
                      <div className="banner-buttons">
                        <Button 
                          type="primary" 
                          size="large" 
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleWatchTrailer(movie.id)}
                        >
                          Xem Trailer
                        </Button>
                        <Button 
                          className="book-button" 
                          size="large"
                          onClick={() => handleBookTicket(movie.id)}
                        >
                          Đặt Vé Ngay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className="banner-error">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không thể tải banner phim"
              className="empty-container"
            />
          </div>
        )}
      </section>

      {/* Quick Booking Widget Section */}
      <section className="booking-section">
        <div className="booking-container">
          <div className="booking-header">
            <CalendarOutlined className="booking-icon" />
            <h3 className="booking-title">Đặt Vé Nhanh</h3>
          </div>
          <QuickBookingWidget onCinemaChange={handleCinemaChange} />
        </div>
      </section>

      {/* Movie List Section */}
      <section className="main-content">
        <div className="movies-section">
          <Row justify="center">
            <Col xs={24} md={16}>
              <Title level={2} className="section-title">
                <span className="title-highlight">Danh Sách Phim</span>
              </Title>
            </Col>
          </Row>

          <div className="movie-tabs">
            <div className="tab-header">
              <Button
                className={`tab-button ${activeTab === "nowShowing" ? "active" : ""}`}
                onClick={() => setActiveTab("nowShowing")}
              >
                Phim Đang Chiếu
              </Button>
              <Button
                className={`tab-button ${activeTab === "comingSoon" ? "active" : ""}`}
                onClick={() => setActiveTab("comingSoon")}
              >
                Phim Sắp Chiếu
              </Button>
            </div>

            <div className="tab-content">
              {loading ? (
                <div className="loading-container">
                  <Spin tip="Đang tải phim..." size="large">
                    <div style={{ height: "200px" }} />
                  </Spin>
                </div>
              ) : moviesToShow.length ? (
                <MovieList movies={moviesToShow} />
              ) : (
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="empty-text">
                      {activeTab === "nowShowing" ? "Không có phim đang chiếu" : "Không có phim sắp chiếu"}
                    </span>
                  }
                  className="empty-container"
                />
              )}
            </div>
          </div>
        </div>

        {/* Promotion Section */}
        <div className="promotion-section">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24}>
              <Title level={2} className="section-title">
                <span className="title-highlight">Ưu Đãi Đặc Biệt</span>
              </Title>
            </Col>
            <Col xs={24} md={8}>
              <div className="promo-card">
                <div className="promo-image">
                  <img src={DEFAULT_PROMO_IMAGES[0]} alt="Combo bắp nước" />
                </div>
                <div className="promo-content">
                  <h3>Combo bắp nước siêu tiết kiệm</h3>
                  <p>Tiết kiệm đến 30% khi mua combo bắp nước khi đặt vé online.</p>
                  <Button type="primary">Xem chi tiết</Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="promo-card">
                <div className="promo-image">
                  <img src={DEFAULT_PROMO_IMAGES[1]} alt="Ngày hội thành viên" />
                </div>
                <div className="promo-content">
                  <h3>Ngày hội thành viên</h3>
                  <p>Giảm 50% vé xem phim vào thứ Tư hàng tuần cho thành viên.</p>
                  <Button type="primary">Đăng ký ngay</Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="promo-card">
                <div className="promo-image">
                  <img src={DEFAULT_PROMO_IMAGES[2]} alt="Sinh nhật vui vẻ" />
                </div>
                <div className="promo-content">
                  <h3>Sinh nhật vui vẻ</h3>
                  <p>Tặng 1 vé miễn phí cho khách hàng trong tháng sinh nhật.</p>
                  <Button type="primary">Tìm hiểu thêm</Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;