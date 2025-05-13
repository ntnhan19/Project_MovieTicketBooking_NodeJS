import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, Button, Carousel, message } from "antd";
import {
  RightOutlined,
  LeftOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import useMovies from "../hooks/useMovies";
import { movieApi } from "../api/movieApi";
import MovieList from "../components/Movies/MovieList";
import QuickBookingWidget from "../components/Payments/QuickBookingWidget";
import PromotionsPage from "./PromotionPage";
import { useAuth } from "../context/AuthContext";

const DEFAULT_MOVIE_IMAGE =
  "https://cdn.galaxycine.vn/media/2024/2/5/banner-homepage-2048x682_1707120352514.jpg";
const DEFAULT_PROMO_IMAGES = [
  "https://cdn.galaxycine.vn/media/2023/12/21/combo-u22-digital-2_1703137185284.jpg",
  "https://cdn.galaxycine.vn/media/2024/1/26/banner-digital-u22_1706254226102.jpg",
  "https://cdn.galaxycine.vn/media/2023/3/30/combo-thanh-vien-moi-300x450_1680144568244.jpg",
];

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("nowShowing");
  const { nowShowing, comingSoon, loading } = useMovies();
  const [loadingHeroBanner, setLoadingHeroBanner] = useState(true);
  const [bannerMovies, setBannerMovies] = useState([]);
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const moviesToShow = activeTab === "nowShowing" ? nowShowing : comingSoon;

  // Fetch banner movies from API
  useEffect(() => {
    const fetchBannerMovies = async () => {
      try {
        setLoadingHeroBanner(true);
        // Lấy danh sách phim đang chiếu từ API
        const data = await movieApi.getNowShowing();

        // Lấy 3 phim nổi bật đầu tiên làm banner
        const topMovies = data.slice(0, 3).map((movie) => ({
          id: movie.id,
          title: movie.title,
          // Sử dụng đường dẫn poster thay vì image - dựa theo MovieList.jsx
          image:
            movie.poster ||
            movie.posterUrl ||
            movie.image ||
            DEFAULT_MOVIE_IMAGE,
          description:
            movie.overview ||
            movie.shortDescription ||
            movie.description ||
            "Xem ngay bộ phim hấp dẫn này tại rạp!",
        }));

        console.log("Banner movies:", topMovies); // Debug
        setBannerMovies(topMovies);
      } catch (error) {
        console.error("Error fetching banner movies:", error);
        // Trong trường hợp lỗi, đặt một banner mặc định
        setBannerMovies([
          {
            id: 1,
            title: "Phim đang chiếu",
            image:
              "https://cdn.galaxycine.vn/media/2025/3/28/pororo-500_1743132281795.jpg",
            description: "Khám phá các bộ phim hấp dẫn đang chiếu tại rạp.",
          },
          {
            id: 2,
            title: "Phim sắp chiếu",
            image:
              "https://cdn.galaxycine.vn/media/2025/3/25/dia-dao-2_1742873342430.jpg",
            description: "Khám phá các bộ phim hấp dẫn sắp chiếu tại rạp.",
          },
          {
            id: 3,
            title: "Phim bom tấn",
            image:
              "https://cdn.galaxycine.vn/media/2025/2/24/interstellar-1_1740384205450.jpg",
            description: "Khám phá các bộ phim bom tấn đang chiếu tại rạp.",
          },
        ]);
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
    const { className, onClick } = props;
    return (
      <div
        className={`${className} absolute right-5 top-1/2 z-10 -translate-y-1/2`}
        onClick={onClick}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary-dark shadow-button transition-all hover:scale-105"
        />
      </div>
    );
  };

  const PrevArrow = (props) => {
    const { className, onClick } = props;
    return (
      <div
        className={`${className} absolute left-5 top-1/2 z-10 -translate-y-1/2`}
        onClick={onClick}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary-dark shadow-button transition-all hover:scale-105"
        />
      </div>
    );
  };

  // Xử lý sự kiện khi người dùng nhấn nút đặt vé cho phim trong banner
  const handleBookTicket = (movieId) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!isAuthenticated) {
      // Nếu chưa đăng nhập, mở modal đăng nhập với đường dẫn chuyển hướng sau khi đăng nhập
      openAuthModal("1", `/movies/${movieId}`);
      message.warning("Vui lòng đăng nhập để đặt vé");
      return;
    }

    // Nếu đã đăng nhập, chuyển hướng đến trang chọn ghế
    navigate(`/movies/${movieId}`);
    // history.push(`/booking/${movieId}`);
  };

  // Xử lý sự kiện khi người dùng muốn xem trailer
  const handleWatchTrailer = (movieId) => {
    console.log(`Watch trailer for movie: ${movieId}`);
    // Có thể mở modal chứa trailer
  };

  return (
    <div className="home-page-container">
      {/* Hero Banner Section - Đã chỉnh sửa để tối ưu hiển thị poster */}
      <section className="w-full h-[550px] relative overflow-hidden mb-10">
        {loadingHeroBanner ? (
          <div className="w-full h-full flex justify-center items-center bg-light-bg-secondary">
            <Spin size="large" />
          </div>
        ) : bannerMovies.length > 0 ? (
          <div className="w-full h-full">
            <Carousel
              autoplay
              effect="fade"
              arrows
              nextArrow={<NextArrow />}
              prevArrow={<PrevArrow />}
              className="w-full h-full"
              autoplaySpeed={5000}
            >
              {bannerMovies.map((movie) => (
                <div key={movie.id} className="w-full h-[550px] relative">
                  {/* Layout 2 cột cho mỗi banner: Nội dung bên trái, poster bên phải */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black to-black/70"></div>

                  <div className="max-w-6xl h-full mx-auto px-5 flex items-center">
                    {/* Cột thông tin phim - 50% bên trái */}
                    <div className="w-full md:w-1/2 z-10 pr-6">
                      <h2 className="text-4xl font-bold text-white shadow-text mb-4">
                        {movie.title}
                      </h2>
                      <p className="text-white/80 shadow-text text-lg mb-8 line-clamp-3">
                        {movie.description}
                      </p>
                      <div className="flex gap-4 flex-wrap">
                        <Button
                          type="primary"
                          size="large"
                          icon={<PlayCircleOutlined />}
                          onClick={() => handleWatchTrailer(movie.id)}
                          className="btn-primary h-12 px-6 text-base rounded-lg font-semibold flex items-center justify-center shadow-button"
                        >
                          Xem Trailer
                        </Button>
                        <Button
                          size="large"
                          onClick={() => handleBookTicket(movie.id)}
                          className="btn-outline h-12 px-6 text-base rounded-lg font-semibold flex items-center justify-center shadow-button"
                        >
                          Đặt Vé Ngay
                        </Button>
                      </div>
                    </div>

                    {/* Cột ảnh poster - 50% bên phải */}
                    <div className="hidden md:block w-1/2 h-full relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-full h-[400px] overflow-hidden rounded-l-2xl shadow-2xl">
                        <img
                          src={movie.image}
                          alt={movie.title}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ảnh nền mờ phía sau tất cả nội dung - chỉ làm hiệu ứng */}
                  <div className="absolute inset-0 -z-10">
                    <div className="w-full h-full opacity-30">
                      <img
                        src={movie.image}
                        alt="Background"
                        className="w-full h-full object-cover object-center blur-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không thể tải banner phim"
              className="p-12"
            />
          </div>
        )}
      </section>

      {/* Quick Booking Widget Section */}
      <section className="flex justify-center w-full relative z-10 -mt-[100px] mb-[90px]">
        <div className="w-full content-card mx-auto max-w-4xl hover:shadow-card-hover transition-all hover:-translate-y-1">
          <div className="flex items-center p-5 bg-primary/10 border-b border-border-light">
            <CalendarOutlined className="text-2xl mr-3 text-primary" />
            <h3 className="text-xl font-semibold m-0 text-text-primary">
              Đặt Vé Nhanh
            </h3>
          </div>
          <QuickBookingWidget onCinemaChange={handleCinemaChange} />
        </div>
      </section>

      {/* Movie List Section */}
      <section className="main-content relative z-[1] mt-10">
        <div className="py-16 w-full relative mt-5">
          <div className="flex justify-center">
            <div className="w-full md:w-2/3">
              <h2 className="text-3xl font-bold mb-10 text-text-primary text-center relative">
                <span className="relative z-[1] after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-button-gradient after:rounded">
                  Danh Sách Phim
                </span>
              </h2>
            </div>
          </div>

          <div className="mt-5 w-full">
            <div className="flex justify-center mb-10 gap-4">
              <Button
                className={`bg-transparent border-none text-lg font-semibold py-3 px-8 relative transition-all
                  ${
                    activeTab === "nowShowing"
                      ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-[3px] after:bg-button-gradient after:rounded-t"
                      : "text-text-secondary hover:text-primary-light"
                  }`}
                onClick={() => setActiveTab("nowShowing")}
              >
                Phim Đang Chiếu
              </Button>
              <Button
                className={`bg-transparent border-none text-lg font-semibold py-3 px-8 relative transition-all
                  ${
                    activeTab === "comingSoon"
                      ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-[3px] after:bg-button-gradient after:rounded-t"
                      : "text-text-secondary hover:text-primary-light"
                  }`}
                onClick={() => setActiveTab("comingSoon")}
              >
                Phim Sắp Chiếu
              </Button>
            </div>

            <div className="min-h-[400px] w-full">
              {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Spin>
                    <div className="min-h-[300px] flex items-center justify-center">
                      <span className="text-text-secondary">
                        Đang tải phim...
                      </span>
                    </div>
                  </Spin>
                </div>
              ) : moviesToShow.length ? (
                <MovieList movies={moviesToShow} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-text-secondary text-base">
                      {activeTab === "nowShowing"
                        ? "Không có phim đang chiếu"
                        : "Không có phim sắp chiếu"}
                    </span>
                  }
                  className="py-16"
                />
              )}
            </div>
          </div>
        </div>

        {/* Promotion Section */}
        <section className="promotions-section mb-12">
          <PromotionsPage />
        </section>
      </section>
    </div>
  );
};

export default HomePage;
