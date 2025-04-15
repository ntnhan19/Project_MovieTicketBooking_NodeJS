// frontend/src/routes/AdminRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminApp from "../../../admin/src/App"; // Điều chỉnh đường dẫn nếu cần

const AdminRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AdminRoutes;