// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import AdminApp from "../../admin/src/App"; // Đường dẫn tới App của admin
import "./index.css";
import Root from "./routes/Root";

// Component cho Admin Routes
const AdminRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </BrowserRouter>
);

// Component cho User Routes
const UserRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

// Component cho Default Routes (người dùng chưa đăng nhập)
const DefaultRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

// Render ứng dụng
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);