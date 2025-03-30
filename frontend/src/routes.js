import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import ShowtimePage from "./pages/ShowtimePage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movies/:id" element={<MovieDetailPage />} />
      <Route path="/booking/:id" element={<BookingPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/showtimes" element={<ShowtimePage />} />
    </Routes>
  );
};

export default AppRoutes;
