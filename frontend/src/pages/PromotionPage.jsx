import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionApi } from '../api/promotionApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiClock, FiChevronRight } from 'react-icons/fi';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        // Chỉ lấy các khuyến mãi đang hoạt động (isActive = true)
        const data = await promotionApi.getAllPromotions(true);
        
        // Lọc các khuyến mãi còn hạn sử dụng
        const now = new Date();
        const validPromotions = data.filter(promo => {
          const validUntil = new Date(promo.validUntil);
          const validFrom = new Date(promo.validFrom);
          return validUntil >= now && validFrom <= now;
        });
        
        setPromotions(validPromotions);
        setLoading(false);
      } catch {
        setError('Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const getDiscountText = (promotion) => {
    if (promotion.type === 'PERCENTAGE') {
      return `Giảm ${promotion.discount}%`;
    } else if (promotion.type === 'FIXED') {
      return `Giảm ${promotion.discount.toLocaleString('vi-VN')}đ`;
    }
    return `Giảm ${promotion.discount}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Khuyến mãi hấp dẫn</h1>
          <p className="text-gray-600">Khám phá các ưu đãi đặc biệt dành cho bạn</p>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Hiện không có khuyến mãi nào</h3>
            <p className="mt-2 text-gray-500">Vui lòng quay lại sau để cập nhật các khuyến mãi mới.</p>
            <div className="mt-6">
              <Link to="/" className="text-blue-500 hover:underline">Về trang chủ</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {promotions.map((promotion) => (
              <Link 
                to={`/promotions/${promotion.id}`}
                key={promotion.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200">
                  {promotion.image ? (
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <span className="text-3xl font-bold text-blue-500">{getDiscountText(promotion)}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {getDiscountText(promotion)}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="mr-1" />
                      <span>Hết hạn: {formatDate(promotion.validUntil)}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{promotion.title}</h2>
                  
                  {promotion.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promotion.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                      {promotion.code}
                    </div>
                    <span className="text-blue-500 flex items-center">
                      Chi tiết <FiChevronRight className="ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link 
            to="/tickets" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
          >
            Đặt vé ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;