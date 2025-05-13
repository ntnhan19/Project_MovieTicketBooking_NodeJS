// admin/src/components/ConcessionCategories/ConcessionCategoryEdit.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import concessionCategoryService from "../../services/concessionCategoryService";
import ConcessionCategoryForm from "./ConcessionCategoryForm";

const ConcessionCategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const { data } = await concessionCategoryService.getOne(id);
        setCategory(data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu danh mục:", err);
        setError("Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await concessionCategoryService.update(id, data);
      // Navigate to list after successful update
      navigate("/concession-categories", { 
        state: { 
          successMessage: "Đã cập nhật danh mục bắp nước thành công!" 
        } 
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật danh mục bắp nước:", err);
      setError(err.message || "Không thể cập nhật danh mục bắp nước. Vui lòng thử lại sau.");
      throw err; // Re-throw for form error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa danh mục bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chỉnh sửa danh mục bắp nước
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          /* Form */
          category && (
            <ConcessionCategoryForm 
              initialData={category}
              onSubmit={handleSubmit}
              isCreate={false}
              submitButtonText="Cập nhật danh mục"
            />
          )
        )}
      </div>
    </>
  );
};

export default ConcessionCategoryEdit;