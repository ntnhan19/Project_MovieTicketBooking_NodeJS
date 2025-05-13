// admin/src/components/ConcessionItems/ConcessionItemShow.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate, Link } from "react-router-dom";
import concessionItemService from "../../services/concessionItemService";
import concessionCategoryService from "../../services/concessionCategoryService";

const ConcessionItemShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Status label mapping
  const availabilityLabels = {
    true: { text: "Còn hàng", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    false: { text: "Hết hàng", className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Sản phẩm bắp nước", path: "/concession-items" },
    { label: "Chi tiết sản phẩm", path: null }
  ];

  // Fetch item and category data
  useEffect(() => {
    const fetchItemAndCategory = async () => {
      setLoading(true);
      try {
        const { data } = await concessionItemService.getOne(id);
        setItem(data);
        
        // Fetch category info if categoryId exists
        if (data.categoryId) {
          try {
            const categoryResponse = await concessionCategoryService.getOne(data.categoryId);
            setCategory(categoryResponse.data);
          } catch (catErr) {
            console.error("Lỗi khi tải thông tin danh mục:", catErr);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndCategory();
  }, [id]);

  // Handle toggle availability
  const handleToggleAvailability = async () => {
    try {
      await concessionItemService.toggleAvailability(id);
      // Refetch to update the UI
      const { data } = await concessionItemService.getOne(id);
      setItem(data);
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      setError("Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại sau.");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setDeletingItem(true);
    try {
      await concessionItemService.delete(id);
      navigate("/concession-items", { 
        state: { 
          successMessage: "Đã xóa sản phẩm bắp nước thành công!" 
        } 
      });
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      setError("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      setDeletingItem(false);
    }
  };

  // Breadcrumbs component
  const Breadcrumbs = ({ items }) => (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.path ? (
              <Link 
                to={item.path} 
                className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  // Loading spinner component
  const LoadingSpinner = ({ size = "md" }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };
    
    return (
      <div className="flex justify-center items-center">
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}></div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Chi tiết sản phẩm bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết sản phẩm bắp nước
          </h1>
          
          {!loading && item && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleToggleAvailability}
                className="px-4 py-2 border border-primary rounded-md text-sm font-medium text-primary dark:text-primary-light hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
              >
                {item.isAvailable ? "Đánh dấu hết hàng" : "Đánh dấu còn hàng"}
              </button>
              
              <Link
                to={`/concession-items/${id}/edit`}
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
          item && (
            <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
              {/* Item Details */}
              <div className="space-y-6">
                {/* Header Info */}
                <div className="pb-4 border-b border-border dark:border-border-dark">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                        {item.name}
                      </h2>
                      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
                        ID: {item.id}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${availabilityLabels[item.isAvailable]?.className}`}>
                        {availabilityLabels[item.isAvailable]?.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Image and Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image */}
                  <div className="md:col-span-1">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full aspect-square object-cover rounded-lg border border-border dark:border-border-dark"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg border border-border dark:border-border-dark flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Item Info */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price */}
                      <div>
                        <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                          Giá
                        </h3>
                        <p className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      
                      {/* Category */}
                      <div>
                        <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                          Danh mục
                        </h3>
                        {category ? (
                          <Link 
                            to={`/concession-categories/${category.id}`}
                            className="text-primary dark:text-primary-light hover:underline"
                          >
                            {category.name}
                          </Link>
                        ) : (
                          <p className="text-text-primary dark:text-text-primary-dark">
                            {item.categoryId ? "Đang tải..." : "Không có danh mục"}
                          </p>
                        )}
                      </div>
                      
                      {/* Description */}
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                          Mô tả
                        </h3>
                        <p className="text-text-primary dark:text-text-primary-dark">
                          {item.description || "Không có mô tả"}
                        </p>
                      </div>
                      
                      {/* Created At */}
                      {item.createdAt && (
                        <div>
                          <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                            Ngày tạo
                          </h3>
                          <p className="text-text-primary dark:text-text-primary-dark">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      )}
                      
                      {/* Updated At */}
                      {item.updatedAt && (
                        <div>
                          <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                            Cập nhật lần cuối
                          </h3>
                          <p className="text-text-primary dark:text-text-primary-dark">
                            {formatDate(item.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
                Bạn có chắc chắn muốn xóa sản phẩm "{item?.name}"? Hành động này không thể hoàn tác.
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
                  disabled={deletingItem}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingItem ? (
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

export default ConcessionItemShow;