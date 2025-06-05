import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { promotionApi } from "../../api/promotionApi";
import {
  FiCalendar,
  FiClock,
  FiCopy,
  FiChevronRight,
  FiGift,
} from "react-icons/fi";
import { Tooltip } from "antd";

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate(); // Khởi tạo useNavigate

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const data = await promotionApi.getAllPromotions();
        if (!Array.isArray(data)) {
          console.error("Dữ liệu nhận được không phải là mảng:", data);
          setPromotions([]);
          setError("Định dạng dữ liệu không đúng. Vui lòng kiểm tra lại API.");
          setLoading(false);
          return;
        }
        if (data.length === 0) {
          console.log("Không có khuyến mãi nào được tìm thấy");
          setPromotions([]);
          setLoading(false);
          return;
        }
        const now = new Date();
        const validPromotions = data.filter((promo) => {
          if (!promo.validFrom || !promo.validUntil) {
            return true;
          }
          const validUntil = new Date(promo.validUntil);
          return validUntil >= now;
        });
        setPromotions(validPromotions);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải khuyến mãi:", error);
        setError("Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  const getDiscountText = (promotion) => {
    if (promotion.type === "PERCENTAGE") {
      return `Giảm ${promotion.discount}%`;
    } else if (promotion.type === "FIXED") {
      return `Giảm ${promotion.discount.toLocaleString("vi-VN")}đ`;
    }
    return `Giảm ${promotion.discount}`;
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty("--ripple-x", `${e.clientX - btn.getBoundingClientRect().left}px`);
    btn.style.setProperty("--ripple-y", `${e.clientY - btn.getBoundingClientRect().top}px`);
  };

  const handleDetailClick = (promotionId) => {
    navigate(`/promotions/${promotionId}`); // Điều hướng thủ công
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-text-secondary dark:text-gray-300">Đang tải khuyến mãi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-4">
        <div className="text-primary text-xl font-semibold dark:text-white">{error}</div>
        <Link
          to="/"
          className="mt-4 btn-primary ripple-btn py-2 px-4 rounded-lg text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary transition-all duration-300"
          onClick={handleRipple}
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card mb-8 p-4 flex flex-wrap items-center justify-between relative z-10">
        <div className="font-semibold text-text-primary flex items-center dark:text-white">
          <FiGift className="mr-2 text-red-600" />
          <span>Ưu đãi hấp dẫn dành cho bạn</span>
        </div>
        <div className="flex items-center gap-4 text-text-secondary text-sm dark:text-gray-300">
          <div className="flex items-center">
            <FiCalendar className="mr-1 text-red-600" />
            <span>Cập nhật ngày: {format(new Date(), "dd/MM/yyyy", { locale: vi })}</span>
          </div>
          <Link
            to="/promotions"
            className="text-primary hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            Xem tất cả khuyến mãi
          </Link>
        </div>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-card">
          <div className="text-gray-500 dark:text-gray-300 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary dark:text-white">
            Hiện không có khuyến mãi nào
          </h3>
          <p className="mt-2 text-text-secondary dark:text-gray-300">
            Vui lòng quay lại sau để cập nhật các khuyến mãi mới nhất.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
          {promotions.map((promotion, index) => (
            <Link
              to={`/promotions/${promotion.id}`}
              key={promotion.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-card-hover border border-gray-100/50 dark:border-gray-600/50 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden pb-[100%] group">
                {promotion.image ? (
                  <img
                    src={promotion.image}
                    alt={promotion.title}
                    className="absolute top-0 left-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                      e.target.alt = "Hình ảnh không tồn tại";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/50 to-primary-dark/50 relative">
                    <div
                      className="absolute top-0 left-0 w-full h-full opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)",
                        backgroundSize: "15px 15px",
                      }}
                    ></div>
                    <span className="text-2xl font-bold text-white shadow-text">
                      {getDiscountText(promotion)}
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-semibold rounded-full shadow-lg">
                    {getDiscountText(promotion)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center text-xs text-text-secondary dark:text-gray-300">
                    <FiClock className="mr-1 text-red-600" />
                    <span>Hết hạn: {formatDate(promotion.validUntil)}</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-text-primary dark:text-white mb-2 line-clamp-2 h-12 hover:text-primary transition-colors duration-300">
                  {promotion.title}
                </h2>
                {promotion.description && (
                  <p className="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-2 h-12">
                    {promotion.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <Tooltip title="Nhấn để sao chép mã khuyến mãi">
                    <div
                      className="bg-light-bg-secondary dark:bg-gray-700 flex items-center px-3 py-1.5 rounded-lg font-mono text-sm border border-border-light dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:shadow-md"
                      onClick={(e) => {
                        e.preventDefault(); // Ngăn điều hướng khi sao chép mã
                        handleRipple(e);
                        copyPromoCode(promotion.code);
                      }}
                      role="button"
                      aria-label={`Sao chép mã ${promotion.code}`}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && copyPromoCode(promotion.code)}
                    >
                      <span className="mr-2">{promotion.code}</span>
                      <FiCopy className="text-red-600" />
                      {copiedCode === promotion.code && (
                        <span className="absolute mt-8 ml-2 bg-text-primary dark:bg-gray-700 text-white text-xs py-1 px-2 rounded transition-opacity duration-300">
                          Đã sao chép
                        </span>
                      )}
                    </div>
                  </Tooltip>
                  <button
                    className="btn-primary ripple-btn flex items-center py-1.5 px-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary transition-all duration-300 hover:shadow-lg text-sm"
                    onClick={(e) => {
                      e.preventDefault(); // Ngăn điều hướng mặc định
                      handleRipple(e);
                      handleDetailClick(promotion.id);
                    }}
                  >
                    Chi tiết <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromotionList;