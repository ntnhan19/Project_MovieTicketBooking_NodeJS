// admin/src/components/ConcessionItems/ConcessionItemCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConcessionItemForm from "./ConcessionItemForm";
import concessionItemService from "../../services/concessionItemService";

const ConcessionItemCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      await concessionItemService.create(data);
      navigate("/concession-items", { 
        state: { 
          notification: {
            type: "success",
            message: "Sản phẩm đã được tạo thành công!"
          }
        }
      });
    } catch (err) {
      console.error("Lỗi khi tạo sản phẩm:", err);
      setError(err.message || "Không thể tạo sản phẩm. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Tạo Sản Phẩm Bắp Nước Mới
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
          Điền thông tin để tạo một sản phẩm bắp nước mới.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <ConcessionItemForm
        onSubmit={handleSubmit}
        submitButtonText="Tạo sản phẩm"
        isCreate={true}
      />
    </div>
  );
};

export default ConcessionItemCreate;