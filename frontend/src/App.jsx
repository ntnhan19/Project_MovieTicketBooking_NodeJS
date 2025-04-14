//frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import ShowtimePage from "./pages/ShowtimePage";
import BookingPage from "./pages/BookingPage";
import UserAccountPage from "./pages/UserAccountPage";
import UserProfilePage from "./pages/UserProfilePage";
import PrivateRoute from "./components/common/PrivateRoute";
import "./index.css";

function App() {
  return (
    <BookingProvider>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies/:id" element={<MoviePage />} />
            <Route path="/showtime/:id" element={<ShowtimePage />} />
            <Route path="/login" element={<UserAccountPage />} />
            <Route path="/user/account" element={<UserAccountPage />} />

            {/* Protected route cho BookingPage */}
            <Route
              path="/booking/*"
              element={
                <PrivateRoute>
                  <BookingPage />
                </PrivateRoute>
              }
            />
            
            <Route 
              path="/user/profile" 
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </BookingProvider>
  );
}

export default App;