import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import useMovies from "../hooks/useMovies";
import MovieList from "../components/Movies/MovieList";
import {
  Skeleton,
  Input,
  Select,
  Carousel,
  Empty,
  Modal,
  Tooltip,
  Badge,
} from "antd";
import {
  SearchOutlined,
  SortAscendingOutlined,
  CloseOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  ArrowDownOutlined,
  StarOutlined,
  FireFilled,
  CalendarOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const MoviePage = () => {
  const { nowShowing, comingSoon, loading } = useMovies();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("nowShowing");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [setIsFilterDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bannerMovies, setBannerMovies] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const allMovies = [...(nowShowing || []), ...(comingSoon || [])];
    const fixedBannerMovies = allMovies
      .filter((movie) => movie.bannerImage)
      .slice(0, 6);
    setBannerMovies(fixedBannerMovies);

    let movies = activeTab === "nowShowing" ? nowShowing : comingSoon;
    if (!movies) return;
    if (searchTerm) {
      movies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case "latest":
        movies = [...movies].sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        break;
      case "oldest":
        movies = [...movies].sort(
          (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)
        );
        break;
      case "name-asc":
        movies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        movies = [...movies].sort((a, b) => b.title.localeCompare(b.title));
        break;
      case "rating-desc":
        movies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    setFilteredMovies(movies);
  }, [activeTab, nowShowing, comingSoon, searchTerm, sortBy]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchTerm("");
    setSortBy("latest");
    setIsFilterDrawerOpen(false);
    const createRipple = (event) => {
      const button = event.currentTarget;
      button.style.setProperty(
        "--ripple-x",
        `${event.clientX - button.getBoundingClientRect().left}px`
      );
      button.style.setProperty(
        "--ripple-y",
        `${event.clientY - button.getBoundingClientRect().top}px`
      );
    };
    const buttonElement = document.getElementById(`tab-${key}`);
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      const event = {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        currentTarget: buttonElement,
      };
      createRipple(event);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty(
      "--ripple-x",
      `${e.clientX - btn.getBoundingClientRect().left}px`
    );
    btn.style.setProperty(
      "--ripple-y",
      `${e.clientY - btn.getBoundingClientRect().top}px`
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("latest");
    if (isMobile) {
      setIsFilterDrawerOpen(false);
    }
  };

  const getNowShowingCount = () => {
    return nowShowing ? nowShowing.length : 0;
  };

  const getComingSoonCount = () => {
    return comingSoon ? comingSoon.length : 0;
  };

  const handleBannerClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <div
      className={`main-content py-8 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      <div className="container mx-auto">
        <div className="page-header relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 overflow-hidden">
          <div className="absolute inset-0 animated-gradient rounded-xl opacity-50"></div>
          <div className="flex flex-col gap-6 mb-4 text-center relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-800 bg-clip-text text-transparent drop-shadow-md animate-slideUp dark:text-white">
              Danh Sách Phim
            </h1>
            <div className="text-gray-600 text-sm italic animate-fadeIn dark:text-gray-300">
              Khám phá các bộ phim hot nhất tuần này! 🎬
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div
              className={`text-gray-700 text-lg flex items-center justify-center gap-2 animate-fadeIn ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {loading ? (
                <Skeleton.Input active size="small" className="w-24" />
              ) : (
                <>
                  <span className="font-semibold text-red-600">
                    {filteredMovies.length}
                  </span>{" "}
                  <span>phim</span>
                  <span
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {searchTerm ? "được tìm thấy" : "hiện có"}
                  </span>
                  {(searchTerm || sortBy !== "latest") && (
                    <span className="ml-2 text-sm">
                      {searchTerm && (
                        <span className="ml-1">
                          (đang lọc theo từ khóa "{searchTerm}")
                        </span>
                      )}
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="flex-grow relative">
                <Input
                  placeholder="Tìm kiếm phim..."
                  prefix={
                    <SearchOutlined
                      className={`text-xl ${
                        theme === "dark" ? "text-gray-100" : "text-gray-600"
                      }`}
                    />
                  }
                  value={searchTerm}
                  onChange={handleSearch}
                  className={`h-14 rounded-xl shadow-lg border-0 text-lg font-medium ${
                    theme === "dark"
                      ? "text-gray-100 bg-gray-800"
                      : "text-gray-800 bg-gray-200"
                  } hover:border-red-500 focus:border-red-500 focus:shadow-xl transition-all pl-5`}
                  allowClear={{
                    clearIcon: (
                      <CloseOutlined
                        className={`${
                          theme === "dark"
                            ? "text-gray-300 hover:text-gray-100"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      />
                    ),
                  }}
                  size="large"
                />
                {searchTerm && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <Badge
                      count={filteredMovies.length}
                      className="bg-red-600 text-white"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={`min-w-52 h-12 rounded-xl transition-all hover:shadow-xl ${
                    theme === "dark"
                      ? "bg-gray-800 text-gray-100"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  size="large"
                  suffixIcon={
                    <SortAscendingOutlined
                      className={`${
                        theme === "dark" ? "text-gray-100" : "text-gray-600"
                      } dark:text-gray-300`}
                    />
                  }
                  popupClassName="rounded-xl shadow-card dark:bg-gray-800 dark:text-white"
                  dropdownStyle={{
                    borderRadius: "12px",
                    backgroundColor: "var(--antd-background, #fff)",
                    color: "var(--antd-color-text, #000)",
                  }}
                >
                  <Option value="latest">
                    <div className="flex items-center">
                      <ClockCircleOutlined
                        className={`mr-2 ${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                      Mới nhất
                    </div>
                  </Option>
                  <Option value="oldest">
                    <div className="flex items-center">
                      <ClockCircleOutlined
                        className={`mr-2 ${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                      Cũ nhất
                    </div>
                  </Option>
                  <Option value="name-asc">
                    <div className="flex items-center">
                      <ArrowUpOutlined
                        className={`mr-2 ${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                      Tên A-Z
                    </div>
                  </Option>
                  <Option value="name-desc">
                    <div className="flex items-center">
                      <ArrowDownOutlined
                        className={`mr-2 ${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                      Tên Z-A
                    </div>
                  </Option>
                  <Option value="rating-desc">
                    <div className="flex items-center">
                      <StarOutlined
                        className={`mr-2 ${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                      Đánh giá cao nhất
                    </div>
                  </Option>
                </Select>
                {(searchTerm || sortBy !== "latest") && (
                  <Tooltip title="Đặt lại bộ lọc">
                    <button
                      onClick={(e) => {
                        handleRipple(e);
                        resetFilters();
                      }}
                      className={`ml-2 h-12 w-12 flex items-center justify-center rounded-xl shadow-lg transition-all hover:shadow-xl ripple-btn ${
                        theme === "dark"
                          ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      <CloseOutlined
                        className={`${
                          theme === "dark" ? "text-gray-100" : "text-gray-600"
                        } dark:text-gray-300`}
                      />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 justify-center relative z-10">
            <div className="movie-tabs-container">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 border border-gray-200 dark:border-gray-600">
                <button
                  id="tab-nowShowing"
                  onClick={(e) => {
                    handleRipple(e);
                    handleTabChange("nowShowing");
                  }}
                  aria-label="Xem phim đang chiếu"
                  aria-selected={activeTab === "nowShowing"}
                  className={`tab-btn-ripple flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-200 z-10 ripple-btn ${
                    activeTab === "nowShowing"
                      ? "bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <FireFilled
                    className={`text-xl ${
                      activeTab === "nowShowing"
                        ? "text-white animate-pulse"
                        : "text-red-600 dark:text-gray-200"
                    }`}
                  />
                  <span>Đang Chiếu</span>
                  {!loading && getNowShowingCount() > 0 && (
                    <span
                      className={`flex items-center justify-center w-6 h-6 text-sm font-bold rounded-full ${
                        activeTab === "nowShowing"
                          ? "bg-white text-red-600"
                          : "bg-red-600 dark:bg-red-500 text-white"
                      }`}
                    >
                      {getNowShowingCount()}
                    </span>
                  )}
                </button>
                <button
                  id="tab-comingSoon"
                  onClick={(e) => {
                    handleRipple(e);
                    handleTabChange("comingSoon");
                  }}
                  aria-label="Xem phim sắp chiếu"
                  aria-selected={activeTab === "comingSoon"}
                  className={`tab-btn-ripple flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-200 z-10 ripple-btn ${
                    activeTab === "comingSoon"
                      ? "bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  <CalendarOutlined
                    className={`text-xl ${
                      activeTab === "comingSoon"
                        ? "text-white animate-pulse"
                        : "text-red-600 dark:text-gray-200"
                    }`}
                  />
                  <span>Sắp Chiếu</span>
                  {!loading && getComingSoonCount() > 0 && (
                    <span
                      className={`flex items-center justify-center w-6 h-6 text-sm font-bold rounded-full ${
                        activeTab === "comingSoon"
                          ? "bg-white text-red-600"
                          : "bg-red-600 dark:bg-red-500 text-white"
                      }`}
                    >
                      {getComingSoonCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {bannerMovies.length > 0 && (
          <Carousel
            autoplay
            autoplaySpeed={3000}
            className="mb-8 rounded-xl overflow-hidden dark:bg-gray-800"
          >
            {bannerMovies.map((movie) => (
              <div
                key={movie.id}
                className="relative h-64 cursor-pointer"
                onClick={() => handleBannerClick(movie.id)}
              >
                <img
                  src={
                    movie.bannerImage ||
                    movie.poster ||
                    "https://via.placeholder.com/1200x300"
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </Carousel>
        )}
        <div className="movies-list min-h-[500px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card border border-gray-100 dark:border-gray-600/50 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <Skeleton.Image active className="w-full h-[450px]" />
                  <div className="p-5">
                    <Skeleton active paragraph={{ rows: 1 }} />
                    <div className="flex gap-2 mt-4">
                      <Skeleton.Button active size="large" className="flex-1" />
                      <Skeleton.Button active size="large" className="flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="movie-grid-container animate-fadeIn">
              <MovieList
                movies={filteredMovies}
                maxDisplay={1000}
                showTrailerButton={true}
                showTicketButton={true}
                cardClassName="movie-card-enhanced h-full bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover border border-gray-100/50 dark:border-gray-600/50"
                imageClassName="w-full h-[450px] object-cover object-center transition-transform duration-500 hover:scale-105"
                contentClassName="p-5"
                titleClassName="text-xl font-bold mb-2 line-clamp-1 dark:text-white"
                buttonContainerClassName="flex gap-3 mt-4"
                trailerButtonClassName="btn-primary ripple-btn py-3 px-4 rounded-lg font-medium flex-1 flex items-center justify-center"
                ticketButtonClassName="btn-outline ripple-btn py-3 px-4 rounded-lg font-medium flex-1 flex items-center justify-center"
                gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div
                  className={`text-center py-16 ${
                    theme === "dark" ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div className="mb-6 text-6xl opacity-50 dark:text-gray-300">
                    🎬
                  </div>
                  <p className="text-xl text-text-secondary dark:text-gray-300 mb-4">
                    {searchTerm
                      ? "Không tìm thấy phim phù hợp với từ khóa"
                      : activeTab === "nowShowing"
                      ? "Không có phim đang chiếu"
                      : "Không có phim sắp chiếu"}
                  </p>
                  {searchTerm && (
                    <p className="text-base text-text-secondary dark:text-gray-300 mb-4">
                      Thử tìm kiếm với từ khóa khác hoặc xem phim đang chiếu!
                    </p>
                  )}
                  {(searchTerm || sortBy !== "latest") && (
                    <button
                      onClick={(e) => {
                        handleRipple(e);
                        resetFilters();
                      }}
                      className="mt-4 py-3 px-8 btn-primary ripple-btn text-white rounded-xl hover:bg-primary-dark transition-all shadow-button hover:shadow-button-hover"
                    >
                      <CloseOutlined className="mr-2" />
                      Đặt lại bộ lọc
                    </button>
                  )}
                </div>
              }
              className="py-16"
            />
          )}
        </div>
        <Modal
          open={!!selectedMovie}
          onCancel={() => setSelectedMovie(null)}
          footer={null}
          title={
            <span className="text-2xl dark:text-white">
              {selectedMovie?.title}
            </span>
          }
          className="rounded-xl"
          bodyStyle={{
            backgroundColor:
              theme === "dark" ? "#1f2a44" : "var(--antd-background, #fff)",
            color: "var(--antd-color-text, #000)",
          }}
        >
          <div
            className={`dark:bg-gray-800 dark:text-gray-300 p-4 rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            {selectedMovie?.image && (
              <img
                src={selectedMovie.image}
                alt={selectedMovie.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            )}
            <p className="text-lg mb-4">
              {selectedMovie?.description || "Không có mô tả."}
            </p>
            <p className="mb-4">
              <strong>Ngày phát hành:</strong> {selectedMovie?.releaseDate}
            </p>
            <p className="mb-4">
              <strong>Đánh giá:</strong>{" "}
              {selectedMovie?.rating
                ? `${selectedMovie.rating}/10`
                : "Chưa có đánh giá"}
            </p>
            <div className="flex gap-4">
              <button
                className="btn-primary ripple-btn py-2 px-4 rounded-lg flex-1"
                onClick={(e) => {
                  handleRipple(e); /* Logic mở trailer nếu có */
                }}
              >
                Xem trailer
              </button>
              <button
                className="btn-outline ripple-btn py-2 px-4 rounded-lg flex-1"
                onClick={(e) => {
                  handleRipple(e); /* Logic đặt vé */
                }}
              >
                Đặt vé
              </button>
            </div>
          </div>
        </Modal>
      </div>
      {showBackToTop && (
        <button
          onClick={(e) => {
            handleRipple(e);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-8 right-8 bg-primary dark:bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-dark dark:hover:bg-red-600 transition-all ripple-btn"
        >
          <ArrowUpOutlined className="text-xl" />
        </button>
      )}
    </div>
  );
};

export default MoviePage;