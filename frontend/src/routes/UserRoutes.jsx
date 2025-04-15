// frontend/src/routes/UserRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "../App";

const UserRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/*" element={<App />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default UserRoutes;