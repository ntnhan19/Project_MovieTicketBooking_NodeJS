// admin/src/components/ConcessionCombos/ConcessionComboCreate.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import ConcessionComboForm from "./ConcessionComboForm";
import concessionComboService from "../../services/concessionComboService";

const ConcessionComboCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await concessionComboService.create(formData);
      // Chuyển hướng đến trang chi tiết combo vừa tạo
      navigate(`/concession-combos/${response.data.id}`, {
        state: { successMessage: "Đã tạo combo bắp nước thành công!" }
      });
    } catch (err) {
      console.error("Lỗi khi tạo combo:", err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi tạo combo bắp nước.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tạo combo bắp nước mới | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Tạo combo bắp nước mới
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Điền thông tin để tạo combo bắp nước mới
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Component */}
        <ConcessionComboForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          formTitle="Tạo combo bắp nước mới"
        />
      </div>
    </>
  );
};

export default ConcessionComboCreate;