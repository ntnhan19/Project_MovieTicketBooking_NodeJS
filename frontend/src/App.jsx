// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import "@ant-design/compatible";
import { Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import ShowtimePage from "./pages/ShowtimePage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserProfilePage from "./pages/UserProfilePage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import PrivateRoute from "./components/common/PrivateRoute";
import SeatSelectionPage from "./components/Payments/SeatSelectionPage";
import PaymentPage from "./pages/PaymentPage";
import { AuthProvider } from "./context/AuthContext";
import { authApi } from "./api/authApi";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng nếu đã đăng nhập
    const userData = authApi.getCurrentUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  return (
    <AuthProvider>
      <BookingProvider>
        <div className="app-container">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movies/:id" element={<MoviePage />} />
              <Route path="/showtime/:id" element={<ShowtimePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Chuyển hướng từ user/account sang login */}
              <Route
                path="/user/account"
                element={<Navigate to="/login" replace />}
              />

              {/* Protected route cho BookingPage */}
              <Route
                path="/booking/*"
                element={
                  <PrivateRoute>
                    <Routes>
                      <Route path="/" element={<BookingPage />} />
                      <Route
                        path="seats/:showtimeId"
                        element={<SeatSelectionPage />}
                      />
                      <Route path="payment" element={<PaymentPage />} />
                    </Routes>
                  </PrivateRoute>
                }
              />

              {/* Nếu chưa đăng nhập thì redirect về Login */}
              <Route
                path="/user/profile"
                element={
                  user ? (
                    <PrivateRoute>
                      <UserProfilePage />
                    </PrivateRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/user/bookings"
                element={
                  user ? (
                    <PrivateRoute>
                      <BookingHistoryPage />
                    </PrivateRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/user/settings"
                element={
                  user ? (
                    <PrivateRoute>
                      <UserSettingsPage />
                    </PrivateRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Thêm route redirect cho logout */}
              <Route
                path="/logout"
                element={<Navigate to="/login" replace />}
              />
            </Routes>
          </main>
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
