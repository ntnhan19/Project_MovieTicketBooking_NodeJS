import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { promotionApi } from '../../api/promotionApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiArrowLeft, FiClock, FiCalendar, FiInfo, FiCopy, FiCheckCircle, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
        <span className="bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          Đã hết hạn
        </span>
      );
    } else if (isNotStarted()) {
      return (
        <span className="bg-yellow-500/20 text-yellow-600 dark:bg-yellow-500/30 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          Sắp diễn ra
        </span>
      );
    } else {
      return (
        <span className="bg-green-500/20 text-green-600 dark:bg-green-500/30 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold shadow-md">
          Đang diễn ra
        </span>
      );
    }
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty('--ripple-x', `${e.clientX - btn.getBoundingClientRect().left}px`);
    btn.style.setProperty('--ripple-y', `${e.clientY - btn.getBoundingClientRect().top}px`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center min-h-screen bg-light-bg dark:bg-dark-bg"
      >
        <div className="loading-spinner"></div>
        <p className="mt-4 text-text-secondary dark:text-dark-text-secondary text-base">Đang tải thông tin khuyến mãi...</p>
      </motion.div>
    );
  }

  if (error || !promotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-light-bg dark:bg-dark-bg"
      >
        <div className="text-primary text-xl font-semibold mb-6 dark:text-dark-text-primary">
          {error || 'Không tìm thấy thông tin khuyến mãi'}
        </div>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={(e) => { handleRipple(e); navigate(-1); }} 
            className="btn-secondary py-2 px-4 rounded-xl flex items-center text-text-primary dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-gray-700 ripple-btn"
          >
            <FiArrowLeft className="mr-2" /> Quay lại
          </button>
          <a 
            href="/promotions" 
            className="btn-primary py-2 px-4 rounded-xl text-white text-center ripple-btn"
          >
            Xem khuyến mãi khác
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-light-bg dark:bg-dark-bg py-6 px-2 sm:px-4 md:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <button 
            onClick={(e) => { handleRipple(e); navigate(-1); }} 
            className="flex items-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-light transition-colors ripple-btn btn-secondary py-2 px-4 rounded-xl"
          >
            <FiArrowLeft className="mr-2" /> Quay lại danh sách khuyến mãi
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="content-card bg-white dark:bg-gray-800 rounded-xl shadow-card transform transition-all hover:shadow-card-hover border border-gray-100/50 dark:border-gray-600/50"
        >
          {/* Header */}
          <div className="relative h-48 sm:h-56 md:h-72 lg:h-96">
            {promotion.image ? (
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{ backgroundImage: `url(${promotion.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center animated-gradient">
                <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)',
                  backgroundSize: '20px 20px'
                }}></div>
                <span className="text-3xl sm:text-4xl font-bold text-white shadow-text">{getDiscountText(promotion)}</span>
              </div>
            )}
            {/* Badge overlay */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              {getStatusBadge()}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary dark:text-dark-text-primary mr-0 sm:mr-4 line-clamp-2">{promotion.title}</h1>
              <div className="mt-2 sm:mt-0">
                <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-button hover:bg-red-600 transition-all">
                  {getDiscountText(promotion)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
              <div className="flex items-center text-text-secondary dark:text-dark-text-secondary">
                <FiCalendar className="mr-2 sm:mr-3 text-xl sm:text-2xl text-primary dark:text-primary-light" />
                <span className="text-base sm:text-lg">Có hiệu lực từ: {formatDate(promotion.validFrom)}</span>
              </div>
              <div className="flex items-center text-text-secondary dark:text-dark-text-secondary">
                <FiClock className="mr-2 sm:mr-3 text-xl sm:text-2xl text-primary dark:text-primary-light" />
                <span className="text-base sm:text-lg">Hết hạn: {formatDate(promotion.validUntil)}</span>
              </div>
            </div>

            {/* Mã khuyến mãi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 sm:p-6 rounded-xl mb-4 sm:mb-8 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <div className="text-text-secondary dark:text-dark-text-secondary mb-1 text-base sm:text-lg">Mã khuyến mãi của bạn:</div>
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-primary dark:text-primary-light">{promotion.code}</div>
                </div>
                <button
                  onClick={(e) => { handleRipple(e); copyPromoCode(); }}
                  disabled={isExpired()}
                  className={`flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold transition-all ripple-btn ${
                    isExpired() 
                      ? 'bg-gray-200 text-text-secondary dark:bg-gray-700 dark:text-dark-text-secondary cursor-not-allowed' 
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheckCircle className="mr-1 sm:mr-2" /> Đã sao chép
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-1 sm:mr-2" /> Sao chép mã
                    </>
                  )}
                </button>
              </div>
              
              {isExpired() && (
                <div className="mt-2 text-red-500 dark:text-red-400 flex items-center text-sm">
                  <FiX className="mr-1 sm:mr-2" /> Mã khuyến mãi này đã hết hạn
                </div>
              )}
              
              {isNotStarted() && (
                <div className="mt-2 text-yellow-600 dark:text-yellow-400 flex items-center text-sm">
                  <FiInfo className="mr-1 sm:mr-2" /> Mã khuyến mãi này chưa có hiệu lực
                </div>
              )}
            </motion.div>

            {/* Mô tả */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-4 sm:mb-8"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-text-primary dark:text-dark-text-primary">Mô tả</h2>
              <div className="prose text-text-secondary dark:text-dark-text-secondary text-base sm:text-lg leading-relaxed">
                {promotion.description ? (
                  <p>{promotion.description}</p>
                ) : (
                  <p>Không có thông tin chi tiết về khuyến mãi này.</p>
                )}
              </div>
            </motion.div>

            {/* Điều kiện và điều khoản */}
            {promotion.terms && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mb-4 sm:mb-8"
              >
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-text-primary dark:text-dark-text-primary">Điều kiện & Điều khoản</h2>
                <div className="prose text-text-secondary dark:text-dark-text-secondary text-base sm:text-lg leading-relaxed">
                  <p>{promotion.terms}</p>
                </div>
              </motion.div>
            )}

            {/* Thông tin bổ sung */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 sm:p-6 rounded-xl mb-4 sm:mb-8 shadow-md"
            >
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-4 text-text-primary dark:text-dark-text-primary">Thông tin bổ sung</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promotion.minPurchase && (
                  <div>
                    <div className="text-text-secondary dark:text-dark-text-secondary text-sm">Giá trị đơn hàng tối thiểu:</div>
                    <div className="font-semibold text-base sm:text-lg">{promotion.minPurchase.toLocaleString('vi-VN')}đ</div>
                  </div>
                )}
                
                {promotion.maxDiscount && (
                  <div>
                    <div className="text-text-secondary dark:text-dark-text-secondary text-sm">Giảm tối đa:</div>
                    <div className="font-semibold text-base sm:text-lg">{promotion.maxDiscount.toLocaleString('vi-VN')}đ</div>
                  </div>
                )}
                
                {promotion.usageLimit && (
                  <div>
                    <div className="text-text-secondary dark:text-dark-text-secondary text-sm">Giới hạn sử dụng:</div>
                    <div className="font-semibold text-base sm:text-lg">{promotion.usageLimit} lần/người dùng</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-4 sm:mt-6"
            >
              <a 
                href="/booking" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleRipple}
                className="btn-primary py-2 px-4 sm:py-3 sm:px-6 rounded-xl text-base sm:text-lg font-semibold text-white text-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all ripple-btn shadow-button hover:shadow-button-hover"
              >
                Đặt vé ngay
              </a>
              <a 
                href="/promotions" 
                onClick={handleRipple}
                className="btn-secondary py-2 px-4 sm:py-3 sm:px-6 rounded-xl text-base sm:text-lg font-semibold text-text-primary dark:text-dark-text-primary text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all ripple-btn shadow-button hover:shadow-button-hover"
              >
                Xem khuyến mãi khác
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PromotionDetails;