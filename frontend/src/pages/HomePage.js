import React from "react";
import { Tabs, Divider } from "antd";
import Banner from "../components/Banner";
import BookingOptions from "../components/BookingOptions";
import MovieList from "../components/MovieList"; // IMPORT COMPONENT
import AppFooter from "../components/AppFooter";

const { TabPane } = Tabs;

const HomePage = () => {
  return (
    <div className="p-10">
      <Banner />
      <BookingOptions />
      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />

      {/* Tabs */}
      <Tabs defaultActiveKey="1" centered>
        <TabPane tab="Phim Đang Chiếu" key="1">
          <MovieList category="nowShowing" />
        </TabPane>
        <TabPane tab="Phim Sắp Chiếu" key="2">
          <MovieList category="comingSoon" />
        </TabPane>
      </Tabs>

      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />
      <AppFooter />
    </div>
  );
};

export default HomePage;
