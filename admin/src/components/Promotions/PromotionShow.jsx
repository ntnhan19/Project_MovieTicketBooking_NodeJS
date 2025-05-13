// admin/src/components/Promotions/PromotionShow.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import promotionService from "../../services/promotionService";

const PromotionShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await promotionService.getOne(id);
        setPromotion(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin khuyến mãi:", err);
        setError("Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khuyến mãi "${promotion.code}"?`)) {
      try {
        await promotionService.delete(id);
        navigate("/promotions", {
          state: {
            successMessage: `Khuyến mãi "${promotion.code}" đã được xóa thành công.`
          }
        });
      } catch (err) {
        console.error("Lỗi khi xóa khuyến mãi:", err);
        setError("Không thể xóa khuyến mãi. Vui lòng thử lại sau.");
      }
    }
  };

  // Kiểm tra trạng thái hiện tại của khuyến mãi
  const getPromotionStatus = () => {
    if (!promotion) return "";
    
    const now = new Date();
    const startDate = new Date(promotion.validFrom);
    const endDate = new Date(promotion.validUntil);
    
    if (now < startDate) {
      return "Sắp diễn ra";
    } else if (now > endDate) {
      return "Đã kết thúc";
    } else {
      return "Đang hoạt động";
    }
  };

  // Trả về class cho thẻ status
  const getStatusClass = (status) => {
    switch(status) {
      case "Đang hoạt động":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Sắp diễn ra":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Đã kết thúc":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!promotion && !loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">Không tìm thấy khuyến mãi hoặc đã có lỗi xảy ra.</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate("/promotions")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const status = getPromotionStatus();
  const statusClass = getStatusClass(status);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Mã khuyến mãi: {promotion.code}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/promotions"
            className="inline-flex items-center px-4 py-2 border border-border dark:border-border-dark rounded-md shadow-sm text-sm font-medium text-text-primary dark:text-text-primary-dark bg-white dark:bg-background-paper-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-text-secondary dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại danh sách
          </Link>
          <Link
            to={`/promotions/edit/${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Xóa
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Promotion Details Card */}
      <div className="bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
              Thông tin khuyến mãi
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Mã khuyến mãi
              </dt>
              <dd className="mt-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                {promotion.code}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Phần trăm giảm giá
              </dt>
              <dd className="mt-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                {promotion.discount}%
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Ngày bắt đầu
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {new Date(promotion.validFrom).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Ngày kết thúc
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {new Date(promotion.validUntil).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>

            {promotion.title && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Tiêu đề
                </dt>
                <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                  {promotion.title}
                </dd>
              </div>
            )}
            
            {promotion.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Mô tả
                </dt>
                <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                  {promotion.description}
                </dd>
              </div>
            )}
            
            {promotion.type && (
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Loại khuyến mãi
                </dt>
                <dd className="mt-1 text-text-primary dark:text-text-primary-dark capitalize">
                  {promotion.type === 'percentage' ? 'Phần trăm' : promotion.type}
                </dd>
              </div>
            )}
            
            {promotion.isActive !== undefined && (
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Trạng thái kích hoạt
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    promotion.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {promotion.isActive ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
                  </span>
                </dd>
              </div>
            )}

            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Thời gian hiệu lực
              </dt>
              <dd className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  {(() => {
                    const now = new Date();
                    const start = new Date(promotion.validFrom);
                    const end = new Date(promotion.validUntil);
                    const total = end - start;
                    const progress = now - start;
                    const percentage = Math.max(0, Math.min(100, (progress / total) * 100));
                    
                    return (
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    );
                  })()}
                </div>
                <div className="flex justify-between text-xs mt-1 text-text-secondary dark:text-text-secondary-dark">
                  <span>{new Date(promotion.validFrom).toLocaleDateString('vi-VN')}</span>
                  <span>{new Date(promotion.validUntil).toLocaleDateString('vi-VN')}</span>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Usage Stats Card (Placeholder for future extension) */}
      <div className="mt-6 bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
            Thống kê sử dụng
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            Thông tin thống kê sử dụng khuyến mãi sẽ được hiển thị tại đây khi tính năng được phát triển.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PromotionShow;