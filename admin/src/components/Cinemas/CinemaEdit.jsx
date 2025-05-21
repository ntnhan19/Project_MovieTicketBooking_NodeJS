// src/components/Cinemas/CinemaEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CinemaForm from "./CinemaForm";
import cinemaService from "../../services/cinemaService";

const CinemaEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cinema, setCinema] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCinema = async () => {
      try {
        setIsLoading(true);
        const response = await cinemaService.getOne(id);
        setCinema(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin rạp chiếu phim:", err);
        setError("Không thể tải thông tin rạp chiếu phim. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCinema();
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await cinemaService.update(id, formData);
      navigate("/cinemas"); // Chuyển về trang danh sách sau khi cập nhật thành công
    } catch (err) {
      console.error("Lỗi khi cập nhật rạp chiếu phim:", err);
      alert(`Lỗi khi cập nhật rạp chiếu phim: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-600 dark:text-red-400">
        <p>{error}</p>
        <button 
          onClick={() => navigate("/cinemas")}
          className="mt-2 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Quay lại danh sách rạp chiếu phim
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Chỉnh sửa rạp chiếu phim
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
          Cập nhật thông tin rạp chiếu phim
        </p>
      </div>

      {cinema && (
        <CinemaForm 
          initialData={cinema} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
};

export default CinemaEdit;