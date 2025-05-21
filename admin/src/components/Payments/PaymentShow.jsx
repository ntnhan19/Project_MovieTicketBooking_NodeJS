// admin/src/components/Payments/PaymentShow.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useNotify } from "react-admin";
import paymentService from "../../services/paymentService";
import BackButton from "../Common/BackButton";

const PaymentShow = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const notify = useNotify();

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await paymentService.getOne(id);
        setPayment(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin thanh toán:", error);
        setError(error.message || "Không thể tải thông tin thanh toán");
        notify("Không thể tải thông tin thanh toán", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, notify]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  const handleCheckVNPayStatus = async () => {
    if (!payment || payment.method !== "VNPAY") return;
    
    try {
      setLoading(true);
      await paymentService.checkVNPayStatus(id);
      // Tải lại dữ liệu sau khi kiểm tra
      const response = await paymentService.getOne(id);
      setPayment(response.data);
      notify("Đã cập nhật trạng thái từ VNPay", { type: "success" });
    } catch (err) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      notify(err.message || "Không thể kiểm tra trạng thái thanh toán", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Quản lý thanh toán", href: "/payments" },
    { label: `Chi tiết thanh toán #${id}` },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error || "Không tìm thấy thông tin thanh toán"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Chi tiết thanh toán #{payment.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Được tạo lúc {formatDate(payment.createdAt)}
          </p>
        </div>
        
        <div className="flex gap-2">
          {payment.method === "VNPAY" && (
            <button
              onClick={handleCheckVNPayStatus}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md disabled:opacity-50"
            >
              Kiểm tra VNPay
            </button>
          )}
          <Link
            to="/payments"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Quay lại
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Thông tin thanh toán
          </h2>
          <dl className="grid grid-cols-1 gap-4">
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số tiền</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(payment.amount)}
              </dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phương thức</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {getPaymentMethodLabel(payment.method)}
              </dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</dt>
              <dd className="text-sm">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full font-medium ${getPaymentStatusColor(payment.status)}`}>
                  {getPaymentStatusLabel(payment.status)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã giao dịch</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {payment.transactionId || "Chưa có"}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày thanh toán</dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {payment.paymentDate ? formatDate(payment.paymentDate) : "Chưa thanh toán"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Thông tin chi tiết đơn hàng */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Chi tiết đơn hàng
          </h2>
          {payment.tickets && payment.tickets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Vé</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {payment.tickets.map((ticket) => (
                  <li key={ticket.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Vé #{ticket.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {ticket.showtime?.movie?.title}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(ticket.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {payment.concessionOrders && payment.concessionOrders.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Đồ ăn & Thức uống
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {payment.concessionOrders.map((order) => (
                  <li key={order.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Đơn hàng #{order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.items?.length || 0} mặt hàng
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentShow;