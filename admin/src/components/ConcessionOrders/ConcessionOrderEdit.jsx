// admin/src/components/ConcessionOrders/ConcessionOrderEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ConcessionOrderForm from "./ConcessionOrderForm";
import concessionOrderService from "../../services/concessionOrderService";

const ConcessionOrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(location.state?.message || null);

  // Tải dữ liệu đơn hàng khi component được mount
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await concessionOrderService.getOne(id);
        setOrder(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin đơn hàng:", err);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Xử lý cập nhật đơn hàng
  const handleUpdateOrder = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await concessionOrderService.update(id, formData);
      
      // Hiển thị thông báo thành công
      setUpdateMessage("Đơn hàng đã được cập nhật thành công!");
      
      // Cập nhật dữ liệu order trong state
      setOrder(response.data);
      
      return response;
    } catch (err) {
      console.error("Lỗi khi cập nhật đơn hàng:", err);
      setError(err.message || "Không thể cập nhật đơn hàng. Vui lòng thử lại sau.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => navigate("/concession-orders")}
            className="mt-2 text-sm font-medium text-red-700 dark:text-red-400 hover:underline"
          >
            Quay lại danh sách đơn hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chỉnh sửa đơn hàng #{id}
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Cập nhật thông tin và danh sách món ăn trong đơn hàng.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate(`/concession-orders/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* Hiển thị thông báo cập nhật thành công nếu có */}
      {updateMessage && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{updateMessage}</p>
        </div>
      )}

      {order && (
        <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6">
          <ConcessionOrderForm
            initialData={order}
            onSubmit={handleUpdateOrder}
            submitButtonText="Cập nhật đơn hàng"
            isCreate={false}
          />
        </div>
      )}
    </div>
  );
};

export default ConcessionOrderEdit;