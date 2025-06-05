import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, Button, Carousel, Typography } from "antd";
import { RightOutlined, LeftOutlined, FireOutlined, CalendarOutlined } from "@ant-design/icons";
import useMovies from "../hooks/useMovies";
import { movieApi } from "../api/movieApi";
import MovieList from "../components/Movies/MovieList";
import QuickBookingWidget from "../components/common/QuickBookingWidget";
import PromotionList from "../components/Promotions/PromotionList";
import { motion } from "framer-motion";

const { Title } = Typography;

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("nowShowing");
  const { nowShowing, comingSoon, loading } = useMovies();
  const [loadingHeroBanner, setLoadingHeroBanner] = useState(true);
  const [bannerMovies, setBannerMovies] = useState([]);
  const navigate = useNavigate();

  const moviesToShow = activeTab === "nowShowing" ? nowShowing : comingSoon;

  useEffect(() => {
    const fetchBannerMovies = async () => {
      try {
        setLoadingHeroBanner(true);
        const data = await movieApi.getNowShowing();
        const topMovies = data
          .filter((movie) => movie.bannerImage)
          .slice(0, 6)
          .map((movie) => ({
            id: movie.id,
            bannerImage: movie.bannerImage,
          }));

        if (topMovies.length > 0) {
          setBannerMovies(topMovies);
        } else {
          setBannerMovies([]);
        }
        setLoadingHeroBanner(false);
      } catch (error) {
        console.error("Error fetching banner movies:", error);
        setLoadingHeroBanner(false);
      }
    };

    fetchBannerMovies();
  }, []);

  const handleCinemaChange = (cinemaId) => {
    console.log("Cinema selected:", cinemaId);
  };

  const NextArrow = (props) => {
    const { style, onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute right-5 top-1/2 z-10 -translate-y-1/2 w-11 h-11 rounded-full bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-white"
        style={{ ...style }}
      >
        <RightOutlined />
      </button>
    );
  };

  const PrevArrow = (props) => {
    const { style, onClick } = props;
    return (
      <button
        onClick={onClick}
        className="absolute left-5 top-1/2 z-10 -translate-y-1/2 w-11 h-11 rounded-full bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center text-white"
        style={{ ...style }}
      >
        <LeftOutlined />
      </button>
    );
  };

  const carouselSettings = {
    autoplay: true,
    effect: "fade",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplaySpeed: 5000,
    dots: true,
    arrows: true,
  };

  const handleBannerClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="home-page-container">
      {/* Hero Banner Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-[550px] relative overflow-hidden mb-10"
      >
        {loadingHeroBanner ? (
          <div className="w-full h-full flex justify-center items-center bg-light-bg-secondary">
            <Spin size="large" />
          </div>
        ) : bannerMovies.length > 0 ? (
          <div className="w-full h-full">
            <Carousel {...carouselSettings} className="w-full h-full">
              {bannerMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="w-full h-[550px] relative cursor-pointer"
                  onClick={() => handleBannerClick(movie.id)}
                >
                  <div className="absolute inset-0">
                    <img
                      src={movie.bannerImage}
                      alt={`Banner for movie ${movie.id}`}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = "/assets/images/placeholder.png";
                        e.target.alt = "Hình ảnh không tồn tại";
                      }}
                    />
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không có banner phim để hiển thị"
              className="p-12"
            />
          </div>
        )}
      </motion.section>

      {/* Quick Booking Widget Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center w-full relative z-10 -mt-[100px] mb-[90px] px-4"
      >
        <div className="w-full content-card mx-auto max-w-7xl hover:shadow-card-hover transition-all hover:-translate-y-1">
          <QuickBookingWidget onCinemaChange={handleCinemaChange} />
        </div>
      </motion.section>

      {/* Main Content Container */}
      <div className="bg-light-bg dark:bg-dark-bg py-12">
        <div className="main-content relative z-[1] max-w-7xl mx-auto px-4">
          {/* Movie List Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full relative mb-16"
          >
            <div className="flex justify-center mb-8">
              <div className="w-full md:w-2/3">
                <Title level={2} className="text-center movie-section-title relative mb-6">
                  <span className="relative z-[1] font-bold after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-button-gradient after:rounded dark:text-white">
                    Danh Sách Phim
                  </span>
                </Title>
              </div>
            </div>

            <div className="mt-5 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center mb-10 gap-4 movie-tab-buttons"
              >
                <Button
                  icon={<FireOutlined />}
                  className={`movie-tab-btn bg-transparent border-none text-lg font-semibold py-3 px-8 relative transition-all duration-300
                    ${
                      activeTab === "nowShowing"
                        ? "text-red-600 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-[3px] after:bg-button-gradient after:rounded-t dark:text-red-400"
                        : "text-text-secondary hover:text-red-600 !hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                    }`}
                  onClick={() => setActiveTab("nowShowing")}
                >
                  Phim Đang Chiếu
                </Button>
                <Button
                  icon={<CalendarOutlined />}
                  className={`movie-tab-btn bg-transparent border-none text-lg font-semibold py-3 px-8 relative transition-all duration-300
                    ${
                      activeTab === "comingSoon"
                        ? "text-red-600 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-10 after:h-[3px] after:bg-button-gradient after:rounded-t dark:text-red-400"
                        : "text-text-secondary hover:text-red-600 !hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                    }`}
                  onClick={() => setActiveTab("comingSoon")}
                >
                  Phim Sắp Chiếu
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="min-h-[400px] w-full"
              >
                {loading ? (
                  <div className="flex justify-center items-center min-h-[300px]">
                    <Spin>
                      <div className="min-h-[300px] flex items-center justify-center">
                        <span className="text-text-secondary dark:text-gray-300">
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
                      <span className="text-text-secondary text-base dark:text-gray-300">
                        {activeTab === "nowShowing"
                          ? "Không có phim đang chiếu"
                          : "Không có phim sắp chiếu"}
                      </span>
                    }
                    className="py-16"
                  />
                )}
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Promotion Section */}
      <div className="bg-light-bg dark:bg-dark-bg py-12 border-t border-gray-100/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="promotions-section mb-12"
          >
            <div className="flex justify-center mb-8">
              <div className="w-full md:w-2/3">
                <Title level={2} className="text-center movie-section-title relative mb-6">
                  <span className="relative z-[1] font-bold after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-1 after:bg-button-gradient after:rounded dark:text-white">
                    Khuyến Mãi Đặc Biệt
                  </span>
                </Title>
              </div>
            </div>
            <PromotionList />
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;