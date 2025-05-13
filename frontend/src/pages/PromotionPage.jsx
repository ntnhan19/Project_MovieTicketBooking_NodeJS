import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { promotionApi } from '../api/promotionApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiClock, FiChevronRight, FiTag, FiCalendar, FiCopy } from 'react-icons/fi';

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      
      const data = await promotionApi.getAllPromotions();
      
      if (!Array.isArray(data)) {
        console.error('Dữ liệu nhận được không phải là mảng:', data);
        setPromotions([]);
        setError('Định dạng dữ liệu không đúng. Vui lòng kiểm tra lại API.');
        setLoading(false);
        return;
      }
      
      // Nếu không có khuyến mãi nào
      if (data.length === 0) {
        console.log('Không có khuyến mãi nào được tìm thấy');
        setPromotions([]);
        setLoading(false);
        return;
      }

      // Áp dụng logic lọc nếu cần
      const now = new Date();
      
      const validPromotions = data.filter(promo => {
        // Kiểm tra có đầy đủ thông tin validFrom và validUntil
        if (!promo.validFrom || !promo.validUntil) {
          return true; // Vẫn hiển thị nếu thiếu thông tin ngày
        }
        
        const validUntil = new Date(promo.validUntil);
        
        // Chỉ kiểm tra ngày hết hạn, hiển thị cả khuyến mãi sắp diễn ra
        return validUntil >= now;
      });
      
      console.log(`Đã lọc: ${data.length} khuyến mãi -> ${validPromotions.length} hợp lệ`);
      setPromotions(validPromotions);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải khuyến mãi:', error);
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

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-text-secondary">Đang tải khuyến mãi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-light-bg">
        <div className="text-primary text-xl font-semibold">{error}</div>
        <Link to="/" className="mt-4 btn-primary py-2 px-4 rounded-lg">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-10 shadow-card">
          <div className="absolute inset-0 bg-banner-overlay"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-button-gradient opacity-80"></div>
          {/* Sử dụng div với background gradient thay vì hình ảnh dự phòng */}
          <div className="w-full h-64 bg-button-gradient flex items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
              {/* Pattern overlay */}
              <div className="w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center text-white p-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 shadow-text text-center">Khuyến Mãi Hấp Dẫn</h1>
            <p className="text-lg md:text-xl text-center shadow-text max-w-2xl">
              Tận hưởng những ưu đãi đặc biệt cho trải nghiệm điện ảnh của bạn
            </p>
          </div>
        </div>

        {/* Filter Section - Để phát triển trong tương lai */}
        <div className="bg-white rounded-xl shadow-card mb-8 p-4 flex flex-wrap items-center justify-between">
          <div className="font-semibold text-text-primary flex items-center">
            <FiTag className="mr-2 text-primary" /> 
            <span>Tất cả khuyến mãi đang diễn ra</span>
          </div>
          <div className="flex items-center text-text-secondary text-sm">
            <FiCalendar className="mr-1 text-primary" /> 
            <span>Cập nhật ngày: {format(new Date(), 'dd/MM/yyyy', { locale: vi })}</span>
          </div>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-card">
            <div className="text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary">Hiện không có khuyến mãi nào</h3>
            <p className="mt-2 text-text-secondary">Vui lòng quay lại sau để cập nhật các khuyến mãi mới nhất.</p>
            <div className="mt-8">
              <Link to="/" className="btn-primary py-3 px-6 rounded-lg inline-block">
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-popIn"
              >
                <div className="h-48 relative overflow-hidden group">
                  {promotion.image ? (
                    <div 
                      className="w-full h-full bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500"
                      style={{
                        backgroundImage: promotion.image ? `url(${promotion.image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!promotion.image && <span className="text-xl font-bold text-white shadow-text">{promotion.title}</span>}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-button-gradient relative">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)',
                        backgroundSize: '15px 15px'
                      }}></div>
                      <span className="text-3xl font-bold text-white shadow-text">{getDiscountText(promotion)}</span>
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-button">
                      {getDiscountText(promotion)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-xs text-text-secondary">
                      <FiClock className="mr-1 text-primary" />
                      <span>Hết hạn: {formatDate(promotion.validUntil)}</span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-text-primary mb-2 line-clamp-2 h-14">{promotion.title}</h2>
                  
                  {promotion.description && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2 h-10">{promotion.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mt-4">
                    <div 
                      className="bg-light-bg-secondary flex items-center px-3 py-2 rounded-lg font-mono text-sm border border-border-light cursor-pointer hover:bg-gray-bg transition-colors"
                      onClick={() => copyPromoCode(promotion.code)}
                    >
                      <span className="mr-2">{promotion.code}</span>
                      <FiCopy className="text-primary" />
                      {copiedCode === promotion.code && (
                        <span className="absolute mt-8 ml-2 bg-text-primary text-white text-xs py-1 px-2 rounded">
                          Đã sao chép
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      to={`/promotions/${promotion.id}`}
                      className="btn-primary flex items-center py-2 px-4 rounded-lg"
                    >
                      Chi tiết <FiChevronRight className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-16 text-center bg-white rounded-xl shadow-card p-8">
          <h3 className="text-2xl font-bold text-text-primary mb-4">Bạn đã sẵn sàng?</h3>
          <p className="text-text-secondary mb-6">Đặt vé ngay để tận hưởng những ưu đãi đặc biệt</p>
          <Link 
            to="/tickets" 
            className="btn-primary inline-block py-3 px-8 rounded-lg text-lg font-semibold shadow-button hover:shadow-button-hover transition-all duration-300 transform hover:-translate-y-1"
          >
            Đặt vé ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromotionsPage;