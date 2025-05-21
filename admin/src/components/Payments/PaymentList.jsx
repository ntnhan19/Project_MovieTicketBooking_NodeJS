import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import paymentService from "../../services/paymentService";
import Pagination from "../Common/Pagination";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [filterMethod, setFilterMethod] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, filterMethod, filterStatus, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getList({
        pagination: { page: currentPage, perPage: itemsPerPage },
        sort: { field: "createdAt", order: "ASC" },
        filter: {
          search: searchTerm,
          method: filterMethod,
          status: filterStatus,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });

      if (response.data) {
        setPayments(response.data.data || []);
        setTotalItems(response.data.total || 0);
      } else {
        setPayments([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách thanh toán:", err);
      setError(
        err.message || "Không thể tải danh sách thanh toán. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckPaymentStatus = async (id) => {
    try {
      await paymentService.checkVNPayStatus(id);
      // Tải lại dữ liệu sau khi kiểm tra
      fetchData();
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      setError(err.message || "Không thể kiểm tra trạng thái thanh toán");
    }
  };

  const handleSimulateSuccess = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn mô phỏng thanh toán thành công cho giao dịch này?")) {
      try {
        await paymentService.simulatePaymentSuccess(id);
        fetchData(); // Tải lại dữ liệu sau khi mô phỏng
      } catch (err) {
        console.error("Lỗi khi mô phỏng thanh toán thành công:", err);
        setError(err.message || "Không thể mô phỏng thanh toán thành công");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      CREDIT_CARD: "Thẻ tín dụng",
      BANK_TRANSFER: "Chuyển khoản",
      E_WALLET: "Ví điện tử",
      CASH: "Tiền mặt",
      ZALOPAY: "ZaloPay",
      VNPAY: "VNPay",
      MOMO: "MoMo",
    };
    return methods[method] || method;
  };

  const getPaymentStatusLabel = (status) => {
    const statuses = {
      PENDING: "Đang chờ",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      FAILED: "Thất bại",
    };
    return statuses[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterMethod("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Danh sách thanh toán
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Tổng số: {totalItems} giao dịch
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Tìm kiếm
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Tìm kiếm theo ID giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
          </div>
        </div>

        <div>
          <label htmlFor="method" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Phương thức thanh toán
          </label>
          <select
            id="method"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          >
            <option value="">Tất cả</option>
            <option value="CREDIT_CARD">Thẻ tín dụng</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
            <option value="E_WALLET">Ví điện tử</option>
            <option value="CASH">Tiền mặt</option>
            <option value="ZALOPAY">ZaloPay</option>
            <option value="VNPAY">VNPay</option>
            <option value="MOMO">MoMo</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Trạng thái
          </label>
          <select
            id="status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Đang chờ</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full pl-3 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          />
        </div>
      </div>

      {/* Button to reset filters */}
      <div className="mb-6">
        <button
          onClick={resetFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Làm mới bộ lọc
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Payment list */}
      {payments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
          <svg
            className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">
            Không tìm thấy thanh toán
          </h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Không có thanh toán nào phù hợp với tiêu chí tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark bg-white dark:bg-background-paper-dark shadow-card rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Phương thức
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Mã giao dịch
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/payments/${payment.id}`}
                        className="text-primary hover:text-primary-dark hover:underline font-medium"
                      >
                        {payment.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {getPaymentMethodLabel(payment.method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(payment.status)}`}>
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {payment.transactionId || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/payments/${payment.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                          title="Xem chi tiết"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                        
                        {payment.method === "VNPAY" && payment.status === "PENDING" && (
                          <button
                            onClick={() => handleCheckPaymentStatus(payment.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                            title="Kiểm tra trạng thái VNPay"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        )}
                        
                        {payment.status === "PENDING" && (
                          <button
                            onClick={() => handleSimulateSuccess(payment.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                            title="Mô phỏng thanh toán thành công"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                maxPageButtons={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentList;