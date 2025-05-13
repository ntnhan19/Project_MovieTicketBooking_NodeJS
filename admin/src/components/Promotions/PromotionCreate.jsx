// admin/src/components/Promotions/PromotionCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import promotionService from "../../services/promotionService";
import PromotionForm from "./PromotionForm";

const PromotionCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Chuyển đổi giá trị type để phù hợp với enum PromoType của Prisma
      let promoType = formData.type;
      if (formData.type === 'percentage') {
        promoType = 'PERCENTAGE';
      } else if (formData.type === 'fixed') {
        promoType = 'FIXED_AMOUNT';
      }
      
      // Gửi dữ liệu tạo khuyến mãi mới
      const promotionData = {
        title: formData.title,
        description: formData.description || `Giảm giá ${formData.discount}${formData.type === 'percentage' ? '%' : 'đ'} cho đơn hàng`,
        type: promoType, // Sử dụng giá trị đã chuyển đổi
        code: formData.code,
        discount: parseFloat(formData.discount),
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
        image: formData.image || null,
        isActive: formData.isActive
      };
      
      await promotionService.create(promotionData);
      
      navigate("/promotions", {
        state: {
          successMessage: `Khuyến mãi "${formData.code}" đã được tạo thành công.`
        }
      });
    } catch (err) {
      console.error("Lỗi khi tạo khuyến mãi:", err);
      setError(
        err.message || 
        "Đã xảy ra lỗi khi tạo khuyến mãi. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Thêm khuyến mãi mới
        </h1>
        <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          Tạo khuyến mãi mới cho hệ thống
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <PromotionForm 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PromotionCreate;