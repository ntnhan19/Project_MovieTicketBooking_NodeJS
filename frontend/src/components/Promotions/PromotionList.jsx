import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { promotionApi } from "../../api/promotionApi";
import {
  FiTag,
  FiCalendar,
  FiClock,
  FiCopy,
  FiChevronRight,
  FiGift,
} from "react-icons/fi";
import { Modal, Tooltip, Empty, Spin } from "antd";

const PromotionList = () => {
  const { theme } = useContext(ThemeContext);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

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
    btn.style.setProperty(
      "--ripple-x",
      `${e.clientX - btn.getBoundingClientRect().left}px`
    );
    btn.style.setProperty(
      "--ripple-y",
      `${e.clientY - btn.getBoundingClientRect().top}px`
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        <p className="mt-4 text-text-secondary dark:text-gray-300">
          Đang tải khuyến mãi...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-4">
        <div className="text-primary text-xl font-semibold dark:text-white">
          {error}
        </div>
        <Link
          to="/"
          className="mt-4 btn-primary ripple-btn py-2 px-4 rounded-lg"
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
        <div className="flex items-center text-text-secondary text-sm dark:text-gray-300">
          <FiCalendar className="mr-1 text-red-600" />
          <span>
            Cập nhật ngày: {format(new Date(), "dd/MM/yyyy", { locale: vi })}
          </span>
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
            <div
              key={promotion.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover border border-gray-100/50 dark:border-gray-600/50 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-48 relative overflow-hidden group">
                {promotion.image ? (
                  <div
                    className="w-full h-full bg-gradient-to-r from-primary-dark to-primary flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500"
                    style={{
                      backgroundImage: promotion.image
                        ? `url(${promotion.image})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!promotion.image && (
                      <span className="text-xl font-bold text-white shadow-text">
                        {promotion.title}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-button-gradient relative">
                    <div
                      className="absolute top-0 left-0 w-full h-full opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)",
                        backgroundSize: "15px 15px",
                      }}
                    ></div>
                    <span className="text-3xl font-bold text-white shadow-text">
                      {getDiscountText(promotion)}
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full shadow-button">
                    {getDiscountText(promotion)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-xs text-text-secondary dark:text-gray-300">
                    <FiClock className="mr-1 text-red-600" />
                    <span>Hết hạn: {formatDate(promotion.validUntil)}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2 line-clamp-2 h-14">
                  {promotion.title}
                </h2>
                {promotion.description && (
                  <p className="text-text-secondary dark:text-gray-300 text-sm mb-4 line-clamp-2 h-10">
                    {promotion.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <Tooltip title="Nhấn để sao chép mã khuyến mãi">
                    <div
                      className="bg-light-bg-secondary dark:bg-gray-700 flex items-center px-3 py-2 rounded-lg font-mono text-sm border border-border-light dark:border-gray-600 cursor-pointer hover:bg-gray-bg dark:hover:bg-gray-600 transition-all hover:shadow-md ripple-btn"
                      onClick={(e) => {
                        handleRipple(e);
                        copyPromoCode(promotion.code);
                      }}
                      role="button"
                      aria-label={`Sao chép mã ${promotion.code}`}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && copyPromoCode(promotion.code)
                      }
                    >
                      <span className="mr-2">{promotion.code}</span>
                      <FiCopy className="text-red-600" />
                      {copiedCode === promotion.code && (
                        <span className="absolute mt-8 ml-2 bg-text-primary dark:bg-gray-700 text-white text-xs py-1 px-2 rounded">
                          Đã sao chép
                        </span>
                      )}
                    </div>
                  </Tooltip>
                  <button
                    className="btn-primary ripple-btn flex items-center py-2 px-4 rounded-lg"
                    onClick={(e) => {
                      handleRipple(e);
                      setSelectedPromo(promotion);
                    }}
                  >
                    Chi tiết <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!selectedPromo}
        onCancel={() => setSelectedPromo(null)}
        footer={null}
        title={
          <span className="text-2xl dark:text-white">
            {selectedPromo?.title}
          </span>
        }
        className="rounded-xl"
        bodyStyle={{
          backgroundColor:
            theme === "dark" ? "#1f2a44" : "var(--antd-background, #fff)",
          color: "var(--antd-color-text, #000)",
        }}
      >
        <div className="dark:bg-gray-800 dark:text-gray-300 p-4 rounded-xl">
          {selectedPromo?.image && (
            <img
              src={selectedPromo.image}
              alt={selectedPromo.title}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
          )}
          <p className="text-lg mb-4">{selectedPromo?.description}</p>
          <p className="mb-4">
            <strong>Hết hạn:</strong>{" "}
            {selectedPromo && formatDate(selectedPromo.validUntil)}
          </p>
          <p className="mb-4">
            <strong>Mã khuyến mãi:</strong> {selectedPromo?.code}
          </p>
          <div className="flex gap-4">
            <button
              className="btn-primary ripple-btn py-2 px-4 rounded-lg flex-1"
              onClick={(e) => {
                handleRipple(e);
                copyPromoCode(selectedPromo?.code);
              }}
            >
              Sao chép mã
            </button>
            <Link
              to={`/promotions/${selectedPromo?.id}`}
              className="btn-outline ripple-btn py-2 px-4 rounded-lg flex-1 text-center"
              onClick={handleRipple}
            >
              Xem chi tiết đầy đủ
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PromotionList;