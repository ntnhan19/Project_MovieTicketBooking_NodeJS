import React from "react";
import { Tabs, Divider } from "antd";
import Banner from "../components/Banner";
import BookingOptions from "../components/BookingOptions";
import MovieList from "../components/MovieList";
import AppFooter from "../components/AppFooter";
import "../index.css"; // Import CSS

const { TabPane } = Tabs;

const HomePage = () => {
  return (
    <div className="main-container">
      <Banner />
      <BookingOptions />
      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />
      {/* Tabs */}
      <div style={{ flex: 1, padding: "0 40px", width: "90%" }}>
        <Tabs
          defaultActiveKey="1"
          centered
          tabBarStyle={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#015c92",
          }}
        >
          <TabPane tab="Phim Đang Chiếu" key="1">
            <MovieList category="nowShowing" />
          </TabPane>
          <TabPane tab="Phim Sắp Chiếu" key="2">
            <MovieList category="comingSoon" />
          </TabPane>
        </Tabs>
      </div>
      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />
      <AppFooter />
    </div>
  );
};

export default HomePage;
