import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import concessionOrderService from "../../services/concessionOrderService";
import concessionItemService from "../../services/concessionItemService";

const ConcessionOrderForm = ({ 
  initialData = null, 
  onSubmit, 
  submitButtonText = "Lưu đơn hàng", 
  isCreate = false 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [concessionItems, setConcessionItems] = useState([]);
  const [orderItems, setOrderItems] = useState(initialData?.items || []);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Tùy chọn trạng thái và phương thức thanh toán
  const orderStatusOptions = concessionOrderService.getOrderStatusOptions();
  const paymentMethodOptions = concessionOrderService.getPaymentMethodOptions();
  
  // Khởi tạo react-hook-form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      status: "PENDING",
      paymentMethod: "CASH",
      userId: "",
      notes: "",
      items: []
    }
  });

  // Lấy danh sách các món ăn khi component được mount
  useEffect(() => {
    const fetchConcessionItems = async () => {
      try {
        // Giả định rằng concessionItemService có phương thức getList với cấu trúc tương tự concessionOrderService
        const response = await concessionItemService.getList({
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'name', order: 'ASC' },
          filter: { status: 'ACTIVE' }
        });
        setConcessionItems(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách món ăn:", err);
        setError("Không thể tải danh sách món ăn. Vui lòng thử lại sau.");
      }
    };

    fetchConcessionItems();
    
    // Nếu có dữ liệu ban đầu, thiết lập các mục đơn hàng
    if (initialData && initialData.items) {
      setOrderItems(initialData.items);
    }
  }, [initialData]);

  // Tính tổng tiền đơn hàng
  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Xử lý thêm món vào đơn hàng
  const handleAddItem = () => {
    if (!selectedItemId || selectedQuantity <= 0) return;
    
    const selectedItem = concessionItems.find(item => item.id === parseInt(selectedItemId));
    if (!selectedItem) return;
    
    // Kiểm tra xem món đã có trong đơn hàng chưa
    const existingItemIndex = orderItems.findIndex(item => item.concessionItemId === parseInt(selectedItemId));
    
    if (existingItemIndex >= 0) {
      // Cập nhật số lượng nếu món đã tồn tại
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += parseInt(selectedQuantity);
      setOrderItems(updatedItems);
    } else {
      // Thêm món mới vào đơn hàng
      const newItem = {
        concessionItemId: parseInt(selectedItemId),
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: parseInt(selectedQuantity),
        subtotal: selectedItem.price * parseInt(selectedQuantity)
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    // Reset form
    setSelectedItemId("");
    setSelectedQuantity(1);
  };

  // Xử lý xóa món khỏi đơn hàng
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Xử lý cập nhật số lượng món
  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) return;
    
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = parseInt(newQuantity);
    updatedItems[index].subtotal = updatedItems[index].price * parseInt(newQuantity);
    setOrderItems(updatedItems);
  };

  // Xử lý submit form
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    
    if (orderItems.length === 0) {
      setError("Vui lòng thêm ít nhất một món ăn vào đơn hàng");
      setLoading(false);
      return;
    }

    try {
      // Chuẩn bị dữ liệu để gửi lên server
      const formData = {
        ...data,
        totalAmount: calculateTotalAmount(),
        items: orderItems.map(item => ({
          concessionItemId: item.concessionItemId,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      // Gọi hàm onSubmit được truyền vào từ component cha
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Reset form nếu là trang tạo mới
      if (isCreate) {
        reset();
        setOrderItems([]);
      }
    } catch (err) {
      console.error("Lỗi khi lưu đơn hàng:", err);
      setError(err.message || "Không thể lưu đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {isCreate ? "Tạo đơn hàng đồ ăn mới" : "Chỉnh sửa đơn hàng đồ ăn"}
        </h2>
        {isCreate && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin và thêm các món ăn vào đơn hàng.
          </p>
        )}
      </div>
      
      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Đơn hàng đã được lưu thành công!</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Mã khách hàng (tùy chọn)
            </label>
            <input
              type="text"
              id="userId"
              placeholder="Nhập mã khách hàng nếu có"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("userId")}
            />
          </div>
          
          {/* Order Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Trạng thái đơn hàng
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("status", { required: "Vui lòng chọn trạng thái đơn hàng" })}
            >
              {orderStatusOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
            )}
          </div>
          
          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Phương thức thanh toán
            </label>
            <select
              id="paymentMethod"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("paymentMethod", { required: "Vui lòng chọn phương thức thanh toán" })}
            >
              {paymentMethodOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.paymentMethod.message}</p>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
              Ghi chú
            </label>
            <textarea
              id="notes"
              rows="3"
              placeholder="Nhập ghi chú cho đơn hàng nếu có"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("notes")}
            ></textarea>
          </div>
        </div>
        
        {/* Order Items Section */}
        <div className="border-t border-border dark:border-border-dark pt-6">
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">
            Các món ăn trong đơn hàng
          </h3>
          
          {/* Add Item Form */}
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="flex-grow">
              <label htmlFor="selectedItemId" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Chọn món ăn
              </label>
              <select
                id="selectedItemId"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              >
                <option value="">-- Chọn món ăn --</option>
                {concessionItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-24">
              <label htmlFor="selectedQuantity" className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                Số lượng
              </label>
              <input
                type="number"
                id="selectedQuantity"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              />
            </div>
            
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!selectedItemId}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm món
            </button>
          </div>
          
          {/* Order Items List */}
          {orderItems.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-secondary-dark/10 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                Chưa có món ăn nào trong đơn hàng này.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Tên món ăn
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Thành tiền
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark">
                  {orderItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 focus:outline-none"
                          title="Xóa khỏi đơn hàng"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-secondary-dark/10">
                    <td colSpan="4" className="px-4 py-3 text-right text-sm font-bold text-text-primary dark:text-text-primary-dark">
                      Tổng tiền:
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-primary dark:text-primary-light">
                      {formatCurrency(calculateTotalAmount())}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-border dark:border-border-dark pt-6">
          <button
            type="button"
            onClick={() => navigate("/concession-orders")}
            className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcessionOrderForm;