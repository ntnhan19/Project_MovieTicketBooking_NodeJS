// src/components/Genres/GenreCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenreForm from "./GenreForm";
import genreService from "../../services/genreService";

const GenreCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await genreService.create(formData);
      setNotification({
        show: true,
        type: "success",
        message: "Thể loại đã được tạo thành công"
      });
      setTimeout(() => {
        navigate("/genres");
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Có lỗi xảy ra khi tạo thể loại"
      });
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    navigate("/genres");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark p-4 md:p-6 rounded-lg animate-fadeIn">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded-md ${notification.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400"}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Thêm thể loại phim mới
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Tạo thể loại phim mới cho hệ thống rạp chiếu phim
        </p>
      </div>

      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Quay lại danh sách
        </button>
      </div>

      {/* Form */}
      <GenreForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default GenreCreate;