// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import ShowtimePage from "./pages/ShowtimePage";
import BookingPage from "./pages/BookingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from "./components/common/PrivateRoute";
import { AuthProvider } from './context/AuthContext';
import { authApi } from './api/authApi'; 
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
              <Route path="/user/account" element={<Navigate to="/login" replace />} />

              {/* Protected route cho BookingPage */}
              <Route
                path="/booking/*"
                element={
                  <PrivateRoute>
                    <BookingPage />
                  </PrivateRoute>
                }
              />

              {/* Nếu chưa đăng nhập thì redirect về Login */}
              <Route
                path="/user/profile"
                element={
                  user ? (
                    <PrivateRoute>
                      {/* Hiển thị trang Profile */}
                    </PrivateRoute>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Thêm route redirect cho logout */}
              <Route path="/logout" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
