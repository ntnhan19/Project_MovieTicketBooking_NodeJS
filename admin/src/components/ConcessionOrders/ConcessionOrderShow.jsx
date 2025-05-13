// admin/src/components/ConcessionOrders/ConcessionOrderShow.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import concessionOrderService from "../../services/concessionOrderService";

const ConcessionOrderShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);

  // Lấy thông tin đơn hàng khi component được mount
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

  // Xử lý xóa đơn hàng
  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${id}?`)) {
      try {
        await concessionOrderService.delete(id);
        navigate("/concession-orders", {
          state: { message: "Đơn hàng đã được xóa thành công!" }
        });
      } catch (err) {
        console.error("Lỗi khi xóa đơn hàng:", err);
        setError("Không thể xóa đơn hàng. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý cập nhật trạng thái đơn hàng
  const handleStatusChange = async (newStatus) => {
    try {
      await concessionOrderService.updateStatus(id, newStatus);
      // Cập nhật state sau khi thay đổi trạng thái thành công
      setOrder(prevOrder => ({ ...prevOrder, status: newStatus }));
      setMessage("Trạng thái đơn hàng đã được cập nhật thành công!");
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
      setError("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Lấy tên trạng thái đơn hàng
  const getStatusName = (statusCode) => {
    const orderStatusOptions = concessionOrderService.getOrderStatusOptions();
    const status = orderStatusOptions.find(opt => opt.id === statusCode);
    return status ? status.name : statusCode;
  };

  // Lấy tên phương thức thanh toán
  const getPaymentMethodName = (methodCode) => {
    const paymentMethodOptions = concessionOrderService.getPaymentMethodOptions();
    const method = paymentMethodOptions.find(opt => opt.id === methodCode);
    return method ? method.name : methodCode;
  };

  // Trả về class cho thẻ status
  const getStatusClass = (status) => {
    switch(status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "PAID":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PREPARING":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "READY":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Trả về class cho phương thức thanh toán
  const getPaymentMethodClass = (method) => {
    switch(method) {
      case "CREDIT_CARD":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "BANK_TRANSFER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "E_WALLET":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "CASH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "ZALOPAY":
      case "VNPAY":
      case "MOMO":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mx-4 my-6">
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => navigate("/concession-orders")}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết đơn hàng #{id}
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Thông tin chi tiết về đơn hàng và các món ăn đã đặt.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => navigate(`/concession-orders/edit/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Xóa đơn hàng
          </button>
        </div>
      </div>

      {/* Notification Messages */}
      {message && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {order && (
        <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card overflow-hidden">
          {/* Order Details Section */}
          <div className="border-b border-border dark:border-border-dark px-6 py-5">
            <h2 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">Thông tin đơn hàng</h2>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">ID đơn hàng</dt>
                <dd className="mt-1 text-base text-text-primary dark:text-text-primary-dark">#{order.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Khách hàng</dt>
                <dd className="mt-1 text-base text-text-primary dark:text-text-primary-dark">
                  {order.user?.name || `Khách hàng #${order.userId || 'Không có thông tin'}`}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Ngày tạo</dt>
                <dd className="mt-1 text-base text-text-primary dark:text-text-primary-dark">
                  {formatDate(order.createdAt)}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Tổng tiền</dt>
                <dd className="mt-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                  {formatCurrency(order.totalAmount)}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Trạng thái</dt>
                <dd className="mt-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`text-sm font-medium px-3 py-1 rounded-md border-0 ${getStatusClass(order.status)}`}
                  >
                    {concessionOrderService.getOrderStatusOptions().map(option => (
                      <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                  </select>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Phương thức thanh toán</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodClass(order.paymentMethod)}`}>
                    {getPaymentMethodName(order.paymentMethod)}
                  </span>
                </dd>
              </div>
              
              {order.notes && (
                <div className="col-span-1 md:col-span-2">
                  <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Ghi chú</dt>
                  <dd className="mt-1 text-base text-text-primary dark:text-text-primary-dark bg-gray-50 dark:bg-secondary-dark/10 p-3 rounded-md">
                    {order.notes}
                  </dd>
                </div>
              )}
            </div>
          </div>

          {/* Order Items Section */}
          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">Danh sách món ăn</h2>
            
            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                        Tên món ăn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                        Đơn giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                        Số lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-border-dark">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-secondary-dark/10">
                      <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium text-text-primary dark:text-text-primary-dark">
                        Tổng cộng:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-text-primary dark:text-text-primary-dark">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-secondary-dark/10 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-base font-medium text-text-primary dark:text-text-primary-dark">Không có món ăn nào trong đơn hàng này</h3>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-secondary-dark/10 border-t border-border dark:border-border-dark flex justify-between">
            <button 
              onClick={() => navigate("/concession-orders")}
              className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
            >
              Quay lại danh sách
            </button>
            <div className="flex space-x-3">
              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleStatusChange(order.status === 'PENDING' ? 'PREPARING' : 'COMPLETED')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                >
                  {order.status === 'PENDING' ? 'Bắt đầu chuẩn bị' : 'Hoàn thành đơn hàng'}
                </button>
              )}

              {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcessionOrderShow;