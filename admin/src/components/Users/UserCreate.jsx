// src/components/Users/UserCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import UserForm from "./UserForm";

const UserCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Gửi dữ liệu tạo người dùng mới
      await userService.create(formData);
      
      navigate("/users", {
        state: {
          successMessage: `Người dùng "${formData.name}" đã được tạo thành công.`
        }
      });
    } catch (err) {
      console.error("Lỗi khi tạo người dùng:", err);
      setError(
        err.message || 
        "Đã xảy ra lỗi khi tạo người dùng. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Thêm người dùng mới
        </h1>
        <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          Tạo tài khoản người dùng mới cho hệ thống
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <UserForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserCreate;