// admin/src/components/ConcessionCombos/ConcessionComboEdit.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";
import ConcessionComboForm from "./ConcessionComboForm";
import concessionComboService from "../../services/concessionComboService";

const ConcessionComboEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tải thông tin combo cần chỉnh sửa
  useEffect(() => {
    const fetchCombo = async () => {
      setLoading(true);
      try {
        const { data } = await concessionComboService.getOne(id);
        setInitialData(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin combo:", err);
        setError(err.response?.data?.message || err.message || "Không thể tải thông tin combo");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCombo();
    }
  }, [id]);

  // Xử lý cập nhật combo
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await concessionComboService.update(id, formData);
      // Chuyển hướng đến trang chi tiết combo sau khi cập nhật
      navigate(`/concession-combos/${id}`, {
        state: { successMessage: "Đã cập nhật combo bắp nước thành công!" }
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật combo:", err);
      setError(err.response?.data?.message || err.message || "Có lỗi xảy ra khi cập nhật combo bắp nước.");
      setIsSubmitting(false);
    }
  };

  // Xử lý quay lại
  const handleBack = () => {
    navigate(`/concession-combos/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
        <p className="font-medium">{error}</p>
        <button
          onClick={() => navigate("/concession-combos")}
          className="mt-2 text-sm underline hover:text-red-800 dark:hover:text-red-300"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa combo bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chỉnh sửa combo bắp nước
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Cập nhật thông tin combo bắp nước
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form Component */}
        {initialData && (
          <ConcessionComboForm 
            initialData={initialData} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            formTitle={`Chỉnh sửa combo: ${initialData.name}`}
          />
        )}
      </div>
    </>
  );
};

export default ConcessionComboEdit;