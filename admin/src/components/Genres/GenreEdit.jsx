// src/components/Genres/GenreEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenreForm from "./GenreForm";
import genreService from "../../services/genreService";

const GenreEdit = () => {
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenre = async () => {
      try {
        const response = await genreService.getOne(id);
        setGenre(response.data);
      } catch (error) {
        setNotification({
          show: true,
          type: "error",
          message: "Không thể tải thông tin thể loại"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGenre();
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await genreService.update(id, formData);
      setNotification({
        show: true,
        type: "success",
        message: "Thể loại đã được cập nhật thành công"
      });
      setTimeout(() => {
        navigate("/genres");
      }, 2000);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Có lỗi xảy ra khi cập nhật thể loại"
      });
      setIsSubmitting(false);
    }
  };

  const handleBackToList = () => {
    navigate("/genres");
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark p-4 md:p-6 rounded-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="mt-2 text-text-secondary dark:text-text-secondary-dark">Đang tải...</span>
        </div>
      </div>
    );
  }

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
          {genre ? `Chỉnh sửa thể loại: ${genre.name}` : 'Chỉnh sửa thể loại'}
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Cập nhật thông tin của thể loại phim
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

      {/* ID Info Card */}
      <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-4 md:p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
            ID Thể loại
          </h2>
          <p className="mt-1 text-base text-text-primary dark:text-text-primary-dark">
            {genre?.id}
          </p>
        </div>
        
        <hr className="border-border dark:border-border-dark my-4" />
      </div>

      {/* Form */}
      <GenreForm 
        initialData={genre} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
};

export default GenreEdit;