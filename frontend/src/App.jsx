import { Routes, Route, Navigate } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { App as AntApp, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN"; 
import { ErrorBoundary } from "react-error-boundary";

// Pages
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import MovieDetailPage from "./components/Movies/MovieDetailPage";
import BookingPage from "./pages/BookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import PromotionPage from "./pages/PromotionPage";
import PromotionDetails from "./components/Promotions/PromotionDetails";
import PaymentPage from "./pages/PaymentPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ConcessionPage from "./pages/ConcessionPage";
import PaymentCompletionPage from "./pages/PaymentCompletionPage";

// Components
import PrivateRoute from "./components/common/PrivateRoute";
import SeatSelectionPage from "./components/Payments/SeatSelectionPage";
import AppHeader from "./components/common/AppHeader";
import Footer from "./components/common/Footer";
import AuthModal from "./components/common/AuthModal";

// Styles
import "./index.css";
import "./styles/auth-styles.css";

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Đã có lỗi xảy ra
        </h2>
        <p className="text-gray-600 mb-6">
          Xin lỗi, ứng dụng gặp sự cố. Vui lòng thử lại.
        </p>
        <div className="space-y-4">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Chi tiết lỗi (Dev only)
            </summary>
            <pre className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("App Error:", error, errorInfo);
        // Có thể gửi lỗi lên monitoring service ở đây
      }}
    >
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {
            colorPrimary: "#ef4444", // Red-500
            colorLink: "#ef4444",
            colorSuccess: "#22c55e",
            colorWarning: "#f59e0b",
            colorError: "#ef4444",
            borderRadius: 8,
          },
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <BookingProvider>
              <AntApp>
                <div className="app-container min-h-screen flex flex-col">
                  <AppHeader className="fixed top-0 left-0 right-0 z-50" />
                  <main className="main-content-wrapper flex-grow">
                    <ErrorBoundary
                      FallbackComponent={({ resetErrorBoundary }) => (
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center p-8">
                            <h3 className="text-xl font-bold text-red-600 mb-4">
                              Lỗi tải trang
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Không thể tải nội dung. Vui lòng thử lại.
                            </p>
                            <button
                              onClick={resetErrorBoundary}
                              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
                            >
                              Thử lại
                            </button>
                          </div>
                        </div>
                      )}
                    >
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/movies" element={<MoviePage />} />
                        <Route
                          path="/movies/:id"
                          element={<MovieDetailPage />}
                        />
                        <Route path="/promotions" element={<PromotionPage />} />
                        <Route
                          path="/promotions/:id"
                          element={<PromotionDetails />}
                        />
                        <Route
                          path="/concessions"
                          element={<ConcessionPage />}
                        />
                        <Route
                          path="/concessions/:id"
                          element={<ConcessionPage />}
                        />
                        <Route
                          path="/reset-password/:token"
                          element={<ResetPasswordPage />}
                        />
                        <Route
                          path="/unauthorized"
                          element={<UnauthorizedPage />}
                        />
                        <Route
                          path="/verify-email/:token"
                          element={<EmailVerificationPage />}
                        />

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
                        <Route
                          path="/payment-completion"
                          element={
                            <PrivateRoute>
                              <PaymentCompletionPage />
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
                    </ErrorBoundary>
                  </main>
                  <Footer />
                  <AuthModal />
                </div>
              </AntApp>
            </BookingProvider>
          </AuthProvider>
        </ThemeProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
