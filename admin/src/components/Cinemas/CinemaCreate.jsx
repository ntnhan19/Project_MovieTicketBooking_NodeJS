// admin/src/components/Cinemas/CinemaCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CinemaForm from "./CinemaForm";
import cinemaService from "../../services/cinemaService";

const CinemaCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await cinemaService.create(formData);
      navigate("/cinemas"); // Chuyển về trang danh sách sau khi tạo thành công
    } catch (error) {
      console.error("Lỗi khi tạo rạp chiếu phim:", error);
      alert(`Lỗi khi tạo rạp chiếu phim: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Tạo rạp chiếu phim mới
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
          Thêm thông tin chi tiết về rạp chiếu phim mới vào hệ thống
        </p>
      </div>

      <CinemaForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default CinemaCreate;