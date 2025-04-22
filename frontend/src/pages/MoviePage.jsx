// frontend/src/pages/MoviePage.jsx
import React from "react";
import { Tabs } from "antd";
import QuickBookingWidget from "../components/Payments/QuickBookingWidget";
import MovieList from "../components/Movies/MovieList";

const MoviePage = () => {
  return (
    <div className="p-10">
      <QuickBookingWidget />
      <Tabs
        defaultActiveKey="nowShowing"
        centered
        className="mt-5"
        size="large"
        items={[
          {
            label: "Phim Đang Chiếu",
            key: "nowShowing",
            children: <MovieList category="nowShowing" />,
          },
          {
            label: "Phim Sắp Chiếu",
            key: "comingSoon",
            children: <MovieList category="comingSoon" />,
          },
        ]}
      />
    </div>
  );
};

export default MoviePage;
