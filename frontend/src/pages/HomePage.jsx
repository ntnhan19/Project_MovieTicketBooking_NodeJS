import React from "react";
import { Divider } from "antd";
import Banner from "../components/Banner";
import MoviePage from "./MoviePage"; // Giữ nguyên MoviePage
import AppFooter from "../components/AppFooter";
import "../index.css";

const HomePage = () => {
  return (
    <div className="main-container">
      <Banner />

      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />

      {/* Hiển thị nội dung MoviePage mà không cần category */}
      <div style={{ flex: 1, padding: "0 40px", width: "90%" }}>
        <MoviePage /> {/* Hiển thị MoviePage mà không truyền props category */}
      </div>

      <Divider style={{ backgroundColor: "#ccc", height: "2px" }} />

      <AppFooter />
    </div>
  );
};

export default HomePage;
