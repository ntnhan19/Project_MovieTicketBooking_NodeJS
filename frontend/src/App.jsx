// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import MovieDetailPage from "./components/Movies/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import PromotionPage from "./pages/PromotionPage";
import PromotionDetails from "./components/Promotions/PromotionDetails";
import PaymentPage from "./pages/PaymentPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import EmailVerificationPage from "./pages/EmailVerificationPage"; 
import ConcessionPage from "./pages/ConcessionPage";

// Components
import PrivateRoute from "./components/common/PrivateRoute";
import SeatSelectionPage from "./components/Payments/SeatSelectionPage";
import AppHeader from "./components/common/AppHeader";
import Footer from "./components/common/Footer";
import AuthModal from "./components/common/AuthModal";

// Styles
import "./index.css";
import "./styles/auth-styles.css";

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <div className="app-container">
          <AppHeader />
          <main className="main-content-wrapper pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/movies" element={<MoviePage />} />
              <Route path="/movies/:id" element={<MovieDetailPage />} />
              <Route path="/promotions" element={<PromotionPage />} />
              <Route path="/promotions/:id" element={<PromotionDetails />} />
              <Route path="/concessions" element={<ConcessionPage />} />
              <Route path="/concessions/:id" element={<ConcessionPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              {/* Thêm route cho xác thực email */}
              <Route path="/verify-email/:token" element={<EmailVerificationPage />} />

              {/* Protected Routes */}
              <Route
                path="/booking"
                element={
                  <PrivateRoute>
                    <BookingPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking/seats/:showtimeId"
                element={
                  <PrivateRoute>
                    <SeatSelectionPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking/payment"
                element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/user/profile"
                element={
                  <PrivateRoute>
                    <UserProfilePage />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <Navigate to="http://localhost:3001" replace />
                  </PrivateRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          {/* Thêm AuthModal vào đây */}
          <AuthModal />
        </div>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;