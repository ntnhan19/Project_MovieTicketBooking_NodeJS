import React from "react";
import { Card, Row, Col, Tabs } from "antd";
import { Link } from "react-router-dom";
import Banner from "../components/Banner";
import BookingOptions from "../components/BookingOptions";

const { TabPane } = Tabs;

// Danh sách phim
const movies = {
  nowShowing: [
    {
      id: 1,
      title: "Avengers: Endgame",
      image: "/images/avengers.jpg",
      releaseDate: "26/04/2019",
    },
    {
      id: 2,
      title: "The Batman",
      image: "/images/batman.jpg",
      releaseDate: "04/03/2022",
    },
    {
      id: 3,
      title: "Spider-Man: No Way Home",
      image: "/images/spiderman.jpg",
      releaseDate: "17/12/2021",
    },
    {
      id: 4,
      title: "Doctor Strange 2",
      image: "/images/doctorstrange.jpg",
      releaseDate: "06/05/2022",
    },
  ],
  comingSoon: [
    {
      id: 5,
      title: "Avatar 3",
      image: "/images/avatar3.jpg",
      releaseDate: "18/12/2025",
    },
    {
      id: 6,
      title: "Fast & Furious 11",
      image: "/images/fast11.jpg",
      releaseDate: "22/06/2026",
    },
  ],
};

const HomePage = () => {
  return (
    <div className="p-10">
      <Banner />
      <BookingOptions />

      {/* TABS PHIM ĐANG CHIẾU / PHIM SẮP CHIẾU */}
      <Tabs defaultActiveKey="1" centered>
        {/* TAB 1: Phim Đang Chiếu */}
        <TabPane
          tab={<span style={styles.activeTab}>Phim Đang Chiếu</span>}
          key="1"
        >
          <Row gutter={[16, 16]} justify="center">
            {movies.nowShowing.map((movie) => (
              <Col key={movie.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={movie.title}
                      src={movie.image}
                      style={styles.image}
                    />
                  }
                >
                  <Card.Meta title={movie.title} />
                  <p style={styles.date}>Khởi chiếu: {movie.releaseDate}</p>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="text-blue-500 block mt-2"
                  >
                    Xem Chi Tiết
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        {/* TAB 2: Phim Sắp Chiếu */}
        <TabPane
          tab={<span style={styles.inactiveTab}>Phim Sắp Chiếu</span>}
          key="2"
        >
          <Row gutter={[16, 16]} justify="center">
            {movies.comingSoon.map((movie) => (
              <Col key={movie.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={movie.title}
                      src={movie.image}
                      style={styles.image}
                    />
                  }
                >
                  <Card.Meta title={movie.title} />
                  <p style={styles.date}>Khởi chiếu: {movie.releaseDate}</p>
                  <Link
                    to={`/movie/${movie.id}`}
                    className="text-blue-500 block mt-2"
                  >
                    Xem Chi Tiết
                  </Link>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

// CSS INLINE
const styles = {
  image: { height: "320px", objectFit: "cover" },
  date: { fontSize: "14px", color: "#666", marginTop: "5px" },
  activeTab: {
    backgroundColor: "red",
    color: "white",
    padding: "5px 15px",
    borderRadius: "5px",
  },
  inactiveTab: {
    backgroundColor: "#333",
    color: "white",
    padding: "5px 15px",
    borderRadius: "5px",
  },
};

export default HomePage;
