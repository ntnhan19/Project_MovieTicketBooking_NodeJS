// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Spin, message, Empty } from "antd";
import MovieList from "../components/Movies/MovieList";
import BookingOptions from "../components/Booking/BookingOptions";
import AppHeader from "../components/common/AppHeader.jsx";
import Footer from "../components/common/Footer";
import { movieApi } from "../api/movieApi";
import "../styles/HomePage.css";

const HomePage = () => {
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nowShowing");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const nowShowing = await movieApi.getNowShowing();
        const comingSoon = await movieApi.getComingSoon();

        // Kiểm tra và đảm bảo ảnh là URL đầy đủ
        const addFullPosterUrl = (movies) =>
          movies.map((movie) => ({
            ...movie,
            poster: movie.poster?.startsWith("http")
              ? movie.poster
              : `${import.meta.env.VITE_BACKEND_URL}/${movie.poster}`, // hoặc cấu hình URL phù hợp
          }));

        setNowShowingMovies(addFullPosterUrl(nowShowing));
        setComingSoonMovies(addFullPosterUrl(comingSoon));
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        message.error("Không thể tải danh sách phim. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const handleCinemaChange = (cinemaId) => {
    console.log("Cinema đã chọn:", cinemaId);
    // Có thể set state để lọc lại suất chiếu nếu muốn
  };

  const renderMovies = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <Spin tip="Đang tải danh sách phim..." size="large">
            <div style={{ height: "200px" }} />
          </Spin>
        </div>
      );
    }

    const currentMovies =
      activeTab === "nowShowing" ? nowShowingMovies : comingSoonMovies;

    if (currentMovies.length === 0) {
      return (
        <Empty
          description={
            activeTab === "nowShowing"
              ? "Không có phim đang chiếu"
              : "Không có phim sắp chiếu"
          }
        />
      );
    }

    return <MovieList movies={currentMovies} />;
  };

  return (
    <div className="home-page">
      <AppHeader />

      <main className="main-content">
        <section className="booking-section">
          <div className="booking-container">
            <BookingOptions onCinemaChange={handleCinemaChange} />
          </div>
        </section>

        <section className="movies-section">
          <h2 className="section-title">Danh sách phim</h2>

          <div className="movie-tabs">
            <div className="tab-header">
              <button
                className={`tab-button ${
                  activeTab === "nowShowing" ? "active" : ""
                }`}
                onClick={() => handleTabChange("nowShowing")}
              >
                Phim Đang Chiếu
              </button>
              <button
                className={`tab-button ${
                  activeTab === "comingSoon" ? "active" : ""
                }`}
                onClick={() => handleTabChange("comingSoon")}
              >
                Phim Sắp Chiếu
              </button>
            </div>

            <div className="tab-content">{renderMovies()}</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
