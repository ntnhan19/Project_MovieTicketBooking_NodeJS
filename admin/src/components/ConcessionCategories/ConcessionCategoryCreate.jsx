// admin/src/components/ConcessionCategories/ConcessionCategoryCreate.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import concessionCategoryService from "../../services/concessionCategoryService";
import ConcessionCategoryForm from "./ConcessionCategoryForm";

const ConcessionCategoryCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      await concessionCategoryService.create(data);
      // Navigate to list after successful creation
      navigate("/concession-categories", { 
        state: { 
          successMessage: "Đã tạo danh mục bắp nước thành công!" 
        } 
      });
    } catch (err) {
      console.error("Lỗi khi tạo danh mục bắp nước:", err);
      setError(err.message || "Không thể tạo danh mục bắp nước. Vui lòng thử lại sau.");
      throw err; // Re-throw for form error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Tạo danh mục bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Tạo danh mục bắp nước mới
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <ConcessionCategoryForm 
          onSubmit={handleSubmit}
          isCreate={true}
          submitButtonText="Tạo danh mục"
        />
      </div>
    </>
  );
};

export default ConcessionCategoryCreate;