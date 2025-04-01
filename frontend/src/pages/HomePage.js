import React from "react";
import { Tabs, Divider } from "antd";
import Banner from "../components/Banner";
import MoviePage from "./MoviePage";
import AppFooter from "../components/AppFooter";
import "../index.css";

const { TabPane } = Tabs;

const HomePage = () => {
  return (
    <div className="main-container">
      <Banner />

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
            <MoviePage category="nowShowing" />
          </TabPane>
          <TabPane tab="Phim Sắp Chiếu" key="2">
            <MoviePage category="comingSoon" />
          </TabPane>
        </Tabs>
      </div>
      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />
      <AppFooter />
    </div>
  );
};

export default HomePage;
