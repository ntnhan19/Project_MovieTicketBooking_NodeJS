// frontend/src/components/Promotions/PromotionDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { promotionApi } from '../../api/promotionApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiCalendar, FiTag, FiPercent } from 'react-icons/fi';

const PromotionDetails = () => {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      try {
        setLoading(true);
        const data = await promotionApi.getPromotionById(id);
        setPromotion(data);
        setLoading(false);
      } catch {
        setError('Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchPromotionDetails();
  }, [id]);

  const copyToClipboard = () => {
    if (promotion) {
      navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const isPromotionValid = () => {
    if (!promotion) return false;
    
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);
    
    return promotion.isActive && now >= validFrom && now <= validUntil;
  };

  const getDiscountText = () => {
    if (!promotion) return '';
    
    if (promotion.type === 'PERCENTAGE') {
      return `${promotion.discount}%`;
    } else if (promotion.type === 'FIXED') {
      return `${promotion.discount.toLocaleString('vi-VN')}đ`;
    }
    return `${promotion.discount}`;
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
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <Link to="/promotions" className="text-blue-500 hover:underline">
          Quay lại trang khuyến mãi
        </Link>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-xl mb-4">Không tìm thấy khuyến mãi</div>
        <Link to="/promotions" className="text-blue-500 hover:underline">
          Quay lại trang khuyến mãi
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/promotions" className="text-blue-500 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách khuyến mãi
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Banner/Image */}
          {promotion.image && (
            <div className="w-full h-40 sm:h-56 md:h-64 bg-gray-200">
              <img
                src={promotion.image}
                alt={promotion.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Promotion Status Badge */}
          <div className="px-4 py-1 bg-gray-100 flex justify-end">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPromotionValid() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isPromotionValid() ? 'Đang hoạt động' : 'Không khả dụng'}
            </span>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{promotion.title}</h1>
            
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <FiCalendar className="mr-1" />
              <span>Hiệu lực từ {formatDate(promotion.validFrom)} đến {formatDate(promotion.validUntil)}</span>
            </div>

            {promotion.description && (
              <div className="prose text-gray-600 mb-6">
                <p>{promotion.description}</p>
              </div>
            )}

            {/* Promotion Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FiTag className="text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Loại khuyến mãi</p>
                    <p className="font-medium">
                      {promotion.type === 'PERCENTAGE' ? 'Giảm theo phần trăm' : 'Giảm giá cố định'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FiPercent className="text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Giá trị</p>
                    <p className="font-medium">{getDiscountText()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Mã khuyến mãi</p>
              <div className="flex">
                <div className="flex-1 bg-gray-100 border border-gray-300 rounded-l-md p-3 font-mono text-lg">
                  {promotion.code}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-md flex items-center justify-center transition-colors"
                >
                  {copied ? 'Đã sao chép!' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-6">
              <Link 
                to="/tickets" 
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
              >
                Đặt vé ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Điều khoản và điều kiện</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Mã giảm giá chỉ áp dụng cho đơn hàng đặt vé trực tuyến.</li>
            <li>Mỗi mã giảm giá chỉ được sử dụng một lần cho mỗi khách hàng.</li>
            <li>Không áp dụng đồng thời với các chương trình khuyến mãi khác.</li>
            <li>Khuyến mãi có hiệu lực trong thời gian từ {formatDate(promotion.validFrom)} đến {formatDate(promotion.validUntil)}.</li>
            <li>Công ty có quyền thay đổi điều khoản mà không cần thông báo trước.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetails;