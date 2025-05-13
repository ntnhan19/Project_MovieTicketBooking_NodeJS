import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConcessionOrderForm from "./ConcessionOrderForm";
import concessionOrderService from "../../services/concessionOrderService";

const ConcessionOrderCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Xử lý tạo đơn hàng mới
  const handleCreateOrder = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await concessionOrderService.create(formData);
      
      // Chuyển hướng tới trang chi tiết đơn hàng sau khi tạo thành công
      navigate(`/concession-orders/${response.data.id}`, { 
        state: { message: "Đơn hàng đã được tạo thành công!" } 
      });
      
      return response;
    } catch (err) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      setError(err.message || "Không thể tạo đơn hàng. Vui lòng thử lại sau.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Tạo đơn hàng đồ ăn mới
        </h1>
        <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
          Điền đầy đủ thông tin để tạo đơn hàng đồ ăn mới.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <ConcessionOrderForm
        onSubmit={handleCreateOrder}
        submitButtonText="Tạo đơn hàng"
        isCreate={true}
      />
    </div>
  );
};

export default ConcessionOrderCreate;