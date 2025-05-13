// admin/src/components/Promotions/PromotionEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import promotionService from "../../services/promotionService";
import PromotionForm from "./PromotionForm";

const PromotionEdit = () => {
  // Lấy ID từ URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let promotionId = extractIdFromPath(id, location.pathname);
        
        if (!promotionId) {
          throw new Error("ID khuyến mãi không hợp lệ");
        }
        
        const response = await promotionService.getOne(promotionId);
        
        if (!response || !response.data) {
          throw new Error("Không tìm thấy dữ liệu khuyến mãi");
        }
        
        // Định dạng lại dữ liệu để phù hợp với PromotionForm
        const formattedData = {
          ...response.data,
          // Đảm bảo các trường ngày tháng được định dạng đúng cách
          validFrom: response.data.validFrom ? new Date(response.data.validFrom).toISOString().split('T')[0] : "",
          validUntil: response.data.validUntil ? new Date(response.data.validUntil).toISOString().split('T')[0] : "",
          // Đảm bảo type được chuyển đổi chính xác từ enum của Prisma
          type: response.data.type === 'PERCENTAGE' ? 'percentage' : 'fixed',
        };
        
        setPromotion(formattedData);
      } catch (err) {
        console.error("Lỗi khi tải thông tin khuyến mãi:", err);
        setError(
          err.message || 
          "Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id, location.pathname]);

  // Hàm trích xuất ID từ path
  const extractIdFromPath = (paramId, pathname) => {
    // Trước tiên kiểm tra ID từ tham số URL
    if (paramId && paramId !== "edit" && !isNaN(Number(paramId))) {
      return paramId;
    }
    
    // Nếu không có ID hợp lệ từ tham số, tìm trong pathname
    const pathParts = pathname.split('/');
    for (const part of pathParts) {
      // Tìm phần tử là số trong pathname
      if (part && !isNaN(Number(part))) {
        return part;
      }
    }
    
    // Nếu không tìm thấy ID hợp lệ
    return null;
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Sử dụng cùng một hàm để trích xuất ID
      const promotionId = extractIdFromPath(id, location.pathname);
      
      if (!promotionId) {
        throw new Error("ID khuyến mãi không hợp lệ");
      }
      
      // Chuẩn bị dữ liệu để gửi đến API
      // Chuyển đổi giá trị type để phù hợp với enum PromoType của Prisma
      let promoType = formData.type;
      if (formData.type === 'percentage') {
        promoType = 'PERCENTAGE';
      } else if (formData.type === 'fixed') {
        promoType = 'FIXED_AMOUNT';
      }
      
      const updateData = {
        ...formData,
        // Cập nhật type
        type: promoType,
        // Đảm bảo các trường số được chuyển đổi đúng
        discount: parseFloat(formData.discount),
        // Đảm bảo trường boolean được chuyển đổi đúng
        isActive: Boolean(formData.isActive),
        // Đảm bảo định dạng ngày tháng đúng
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      };
      
      // Sử dụng ID đã xử lý
      await promotionService.update({ id: promotionId, data: updateData });
      
      navigate("/promotions", {
        state: {
          successMessage: `Khuyến mãi "${formData.title}" đã được cập nhật thành công.`
        }
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật khuyến mãi:", err);
      setError(
        err.message || 
        "Đã xảy ra lỗi khi cập nhật khuyến mãi. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
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
          <p className="font-medium">{error || "Không tìm thấy khuyến mãi hoặc đã có lỗi xảy ra."}</p>
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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Chỉnh sửa khuyến mãi
        </h1>
        <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          Cập nhật thông tin khuyến mãi: {promotion.title}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <PromotionForm 
        initialData={promotion}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PromotionEdit;