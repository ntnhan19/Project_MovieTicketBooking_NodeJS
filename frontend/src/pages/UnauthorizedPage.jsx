// UnauthorizedPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-lg mb-6">
        Bạn không có quyền truy cập trang này.
      </p>
      <Link to="/" className="text-blue-500 hover:underline">
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
