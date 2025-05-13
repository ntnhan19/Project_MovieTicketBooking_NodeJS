// frontend/src/components/Promotions/PromotionDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { promotionApi } from '../../api/promotionApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiArrowLeft, FiClock, FiCalendar, FiInfo, FiCopy, FiCheckCircle, FiX } from 'react-icons/fi';

const PromotionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPromotionDetail = async () => {
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

    fetchPromotionDetail();
  }, [id]);

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

  const copyPromoCode = () => {
    if (promotion && promotion.code) {
      navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const isExpired = () => {
    if (!promotion) return false;
    const now = new Date();
    const validUntil = new Date(promotion.validUntil);
    return validUntil < now;
  };

  const isNotStarted = () => {
    if (!promotion) return false;
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    return validFrom > now;
  };

  const getStatusBadge = () => {
    if (isExpired()) {
      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
          Đã hết hạn
        </span>
      );
    } else if (isNotStarted()) {
      return (
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
          Sắp diễn ra
        </span>
      );
    } else {
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
          Đang diễn ra
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-text-secondary">Đang tải thông tin khuyến mãi...</p>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-light-bg">
        <div className="text-primary text-xl font-semibold mb-4">
          {error || 'Không tìm thấy thông tin khuyến mãi'}
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn-secondary py-2 px-4 rounded-lg flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Quay lại
          </button>
          <Link to="/promotions" className="btn-primary py-2 px-4 rounded-lg">
            Xem khuyến mãi khác
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Quay lại danh sách khuyến mãi
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="relative h-56 md:h-72">
            {promotion.image ? (
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${promotion.image})` }}
              ></div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-button-gradient">
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)',
                  backgroundSize: '15px 15px'
                }}></div>
                <span className="text-4xl font-bold text-white shadow-text">{getDiscountText(promotion)}</span>
              </div>
            )}

            {/* Badge overlay */}
            <div className="absolute top-4 right-4">
              {getStatusBadge()}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mr-4">{promotion.title}</h1>
              <div className="mt-2 md:mt-0">
                <div className="inline-block px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-button">
                  {getDiscountText(promotion)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-text-secondary">
                <FiCalendar className="mr-2 text-primary" />
                <span>Có hiệu lực từ: {formatDate(promotion.validFrom)}</span>
              </div>
              <div className="flex items-center text-text-secondary">
                <FiClock className="mr-2 text-primary" />
                <span>Hết hạn: {formatDate(promotion.validUntil)}</span>
              </div>
            </div>

            {/* Mã khuyến mãi */}
            <div className="bg-light-bg-secondary p-5 rounded-xl mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-3 md:mb-0">
                  <div className="text-text-secondary mb-1">Mã khuyến mãi của bạn:</div>
                  <div className="font-mono text-2xl font-bold text-primary">{promotion.code}</div>
                </div>
                <button
                  onClick={copyPromoCode}
                  disabled={isExpired()}
                  className={`flex items-center justify-center px-5 py-2 rounded-lg transition-all ${
                    isExpired() 
                      ? 'bg-gray-200 text-text-secondary cursor-not-allowed' 
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheckCircle className="mr-2" /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-2" /> Sao chép mã
                    </>
                  )}
                </button>
              </div>
              
              {isExpired() && (
                <div className="mt-3 text-red-500 flex items-center text-sm">
                  <FiX className="mr-1" /> Mã khuyến mãi này đã hết hạn
                </div>
              )}
              
              {isNotStarted() && (
                <div className="mt-3 text-yellow-600 flex items-center text-sm">
                  <FiInfo className="mr-1" /> Mã khuyến mãi này chưa có hiệu lực
                </div>
              )}
            </div>

            {/* Điều kiện áp dụng */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">Mô tả</h2>
              <div className="prose text-text-secondary">
                {promotion.description ? (
                  <p>{promotion.description}</p>
                ) : (
                  <p>Không có thông tin chi tiết về khuyến mãi này.</p>
                )}
              </div>
            </div>

            {/* Điều kiện và điều khoản */}
            {promotion.terms && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">Điều kiện & Điều khoản</h2>
                <div className="prose text-text-secondary">
                  <p>{promotion.terms}</p>
                </div>
              </div>
            )}

            {/* Thông tin bổ sung */}
            <div className="bg-light-bg-secondary p-5 rounded-xl mb-6">
              <h2 className="text-lg font-semibold mb-3 text-text-primary">Thông tin bổ sung</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotion.minPurchase && (
                  <div>
                    <div className="text-text-secondary text-sm">Giá trị đơn hàng tối thiểu:</div>
                    <div className="font-semibold">{promotion.minPurchase.toLocaleString('vi-VN')}đ</div>
                  </div>
                )}
                
                {promotion.maxDiscount && (
                  <div>
                    <div className="text-text-secondary text-sm">Giảm tối đa:</div>
                    <div className="font-semibold">{promotion.maxDiscount.toLocaleString('vi-VN')}đ</div>
                  </div>
                )}
                
                {promotion.usageLimit && (
                  <div>
                    <div className="text-text-secondary text-sm">Giới hạn sử dụng:</div>
                    <div className="font-semibold">{promotion.usageLimit} lần/người dùng</div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link 
                to="/tickets" 
                className="btn-primary py-3 px-6 rounded-lg text-center"
              >
                Đặt vé ngay
              </Link>
              <Link 
                to="/promotions" 
                className="btn-secondary py-3 px-6 rounded-lg text-center"
              >
                Xem khuyến mãi khác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetails;