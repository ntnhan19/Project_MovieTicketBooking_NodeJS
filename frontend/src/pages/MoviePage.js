// MoviePage.jsx
import React from "react";
import { Tabs } from "antd";
import BookingOptions from "../components/BookingOptions";
import MovieList from "../components/MovieList";

const MoviePage = () => {
  return (
    <div className="p-10">
      <BookingOptions />
      <Tabs
        defaultActiveKey="nowShowing"
        centered
        className="mt-5"
        size="large"
      >
        <Tabs.TabPane tab=" Phim Đang Chiếu" key="nowShowing">
          <MovieList category="nowShowing" />
        </Tabs.TabPane>

        <Tabs.TabPane tab=" Phim Sắp Chiếu" key="comingSoon">
          <MovieList category="comingSoon" />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default MoviePage;
