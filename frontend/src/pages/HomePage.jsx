// frontend/src/pages/HomePage.jsx
import React, { useState } from "react";
import { Spin, Empty } from "antd";
import useMovies from "../hooks/useMovies";
import MovieList from "../components/Movies/MovieList";
import BookingOptions from "../components/Booking/BookingOptions";
import AppHeader from "../components/common/AppHeader";
import Footer from "../components/common/Footer";
import "../styles/HomePage.css";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("nowShowing");
  const { nowShowing, comingSoon, loading } = useMovies();

  const moviesToShow = activeTab === "nowShowing" ? nowShowing : comingSoon;

  const handleCinemaChange = (cinemaId) => {
    console.log("Cinema selected:", cinemaId);
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
              {["nowShowing", "comingSoon"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "nowShowing" ? "Phim Đang Chiếu" : "Phim Sắp Chiếu"}
                </button>
              ))}
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
                <Empty description={activeTab === "nowShowing" ? "Không có phim đang chiếu" : "Không có phim sắp chiếu"} />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;