//frontend/src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import BookingPage from "./pages/BookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import ShowtimePage from "./pages/ShowtimePage";
import UserAccountPage from "./pages/UserAccountPage";
import MovieDetails from "./components/MovieDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movies" element={<MoviePage />} />
      <Route path="/movies/:id/booking" element={<BookingPage />} />
      <Route path="/movies/:id" element={<MovieDetails />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/showtimes" element={<ShowtimePage />} />
      <Route path="/login-register" element={<UserAccountPage />} />
    </Routes>
  );
};

export default AppRoutes;
