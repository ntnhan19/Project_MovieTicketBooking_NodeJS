// admin/src/components/ConcessionCategories/ConcessionCategoryShow.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate, Link } from "react-router-dom";
import concessionCategoryService from "../../services/concessionCategoryService";

const ConcessionCategoryShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);  

  // Status label mapping
  const statusLabels = {
    ACTIVE: { text: "Hoạt động", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    INACTIVE: { text: "Không hoạt động", className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
  };

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

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      await concessionCategoryService.toggleStatus(id);
      // Refetch to update the UI
      const { data } = await concessionCategoryService.getOne(id);
      setCategory(data);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      setError("Không thể thay đổi trạng thái danh mục. Vui lòng thử lại sau.");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeletingCategory(true);
    try {
      await concessionCategoryService.delete(id);
      navigate("/concession-categories", { 
        state: { 
          successMessage: "Đã xóa danh mục bắp nước thành công!" 
        } 
      });
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err);
      setError("Không thể xóa danh mục. Vui lòng thử lại sau.");
      setDeletingCategory(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Chi tiết danh mục bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết danh mục bắp nước
          </h1>
          
          {!loading && category && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleToggleStatus}
                className="px-4 py-2 border border-primary rounded-md text-sm font-medium text-primary dark:text-primary-light hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
              >
                {category.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
              </button>
              
              <Link
                to={`/concession-categories/${id}/edit`}
                className="px-4 py-2 border border-primary bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
              >
                Chỉnh sửa
              </Link>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-500 text-red-500 dark:text-red-400 dark:border-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
              >
                Xóa
              </button>
            </div>
          )}
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
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          category && (
            <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
              {/* Category Details */}
              <div className="space-y-6">
                {/* Header Info */}
                <div className="pb-4 border-b border-border dark:border-border-dark">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                        {category.name}
                      </h2>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                        ID: {category.id}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[category.status]?.className}`}>
                        {statusLabels[category.status]?.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                      Mô tả
                    </h3>
                    <p className="text-text-primary dark:text-text-primary-dark">
                      {category.description || "Không có mô tả"}
                    </p>
                  </div>
                  
                  {/* Created At */}
                  {category.createdAt && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                        Ngày tạo
                      </h3>
                      <p className="text-text-primary dark:text-text-primary-dark">
                        {formatDate(category.createdAt)}
                      </p>
                    </div>
                  )}
                  
                  {/* Updated At */}
                  {category.updatedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                        Cập nhật lần cuối
                      </h3>
                      <p className="text-text-primary dark:text-text-primary-dark">
                        {formatDate(category.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                Bạn có chắc chắn muốn xóa danh mục "{category?.name}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingCategory}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingCategory ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConcessionCategoryShow;