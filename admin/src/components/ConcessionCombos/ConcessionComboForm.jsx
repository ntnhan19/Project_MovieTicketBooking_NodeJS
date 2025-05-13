// admin/src/components/ConcessionCombos/ConcessionComboForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import concessionItemService from "../../services/concessionItemService";

const ConcessionComboForm = ({ initialData, onSubmit, isSubmitting, formTitle }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPercent: 0,
    isAvailable: true,
    image: "", // Điều chỉnh theo Prisma schema
    items: [],
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.image || "");

  // Tải danh sách các mặt hàng bắp nước có sẵn
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await concessionItemService.getList({
          pagination: { page: 1, perPage: 100 },
          sort: { field: "name", order: "ASC" },
          filter: { isAvailable: true }, // Điều chỉnh theo trường isAvailable trong Prisma schema
        });
        setAvailableItems(response.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách mặt hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Xử lý thay đổi trường form chung
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (type === "checkbox") {
      processedValue = checked;
    } else if (name === "price" || name === "discountPercent") {
      processedValue = parseFloat(value) || 0;
    }

    // Cập nhật preview hình ảnh khi URL thay đổi
    if (name === "image") {
      setImagePreview(value);
    }

    setFormData({ ...formData, [name]: processedValue });
    
    // Xóa lỗi khi người dùng bắt đầu sửa trường
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Xử lý thêm item vào combo
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { itemId: "", quantity: 1 }
      ]
    });
  };

  // Xử lý thay đổi item trong combo
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    if (field === "itemId") {
      updatedItems[index].itemId = value;
    } else if (field === "quantity") {
      updatedItems[index].quantity = parseInt(value) || 1;
    }
    
    setFormData({ ...formData, items: updatedItems });
  };

  // Xử lý xóa item khỏi combo
  const handleRemoveItem = (indexToRemove) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, index) => index !== indexToRemove)
    });
  };

  // Xác thực form trước khi submit
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Tên combo không được để trống";
    }
    
    if (formData.price < 0) {
      newErrors.price = "Giá không được nhỏ hơn 0";
    }
    
    if (formData.discountPercent < 0 || formData.discountPercent > 100) {
      newErrors.discountPercent = "Phần trăm giảm giá phải từ 0 đến 100";
    }
    
    if (formData.items.length === 0) {
      newErrors.items = "Combo phải có ít nhất một mặt hàng";
    } else {
      for (let i = 0; i < formData.items.length; i++) {
        const item = formData.items[i];
        if (!item.itemId) {
          newErrors[`item_${i}`] = "Vui lòng chọn mặt hàng";
        } else if (item.quantity < 1) {
          newErrors[`item_${i}`] = "Số lượng phải lớn hơn 0";
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Lỗi khi lưu combo:", error);
        setErrors({ form: error.message || "Có lỗi xảy ra khi lưu combo" });
      }
    }
  };

  // Xử lý hủy và quay về trang danh sách
  const handleCancel = () => {
    navigate("/concession-combos");
  };

  // Tìm tên của item dựa vào id
  const getItemNameById = (itemId) => {
    const item = availableItems.find(item => item.id == itemId);
    return item ? item.name : 'Không tìm thấy';
  };

  // Tính tổng giá trị combo (không tính giảm giá)
  const calculateTotalPrice = () => {
    let total = 0;
    formData.items.forEach(item => {
      const foundItem = availableItems.find(i => i.id == item.itemId);
      if (foundItem) {
        total += foundItem.price * item.quantity;
      }
    });
    return total;
  };

  // Tính giá sau khi giảm giá
  const calculateDiscountedPrice = () => {
    const totalPrice = calculateTotalPrice();
    const discount = (totalPrice * formData.discountPercent) / 100;
    return totalPrice - discount;
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {formTitle || "Combo bắp nước"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
          Điền đầy đủ thông tin để tạo hoặc cập nhật combo bắp nước.
        </p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Combo đã được lưu thành công!</p>
        </div>
      )}

      {/* Error Message */}
      {errors.form && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên combo */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Tên combo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên combo"
              className={`w-full px-3 py-2 border ${
                errors.name
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label
              htmlFor="isAvailable"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Trạng thái
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary focus:ring-primary border-border dark:border-border-dark rounded"
                />
                <span className="ml-2 text-text-primary dark:text-text-primary-dark">
                  Có sẵn để bán
                </span>
              </label>
            </div>
          </div>

          {/* Giá gốc */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Giá combo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border ${
                  errors.price
                    ? "border-red-500 dark:border-red-500"
                    : "border-border dark:border-border-dark"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary dark:text-text-secondary-dark pointer-events-none">
                VND
              </div>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.price}
              </p>
            )}
          </div>

          {/* Phần trăm giảm giá */}
          <div>
            <label
              htmlFor="discountPercent"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Phần trăm giảm giá
            </label>
            <div className="relative">
              <input
                type="number"
                id="discountPercent"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                placeholder="0"
                min="0"
                max="100"
                step="1"
                className={`w-full px-3 py-2 border ${
                  errors.discountPercent
                    ? "border-red-500 dark:border-red-500"
                    : "border-border dark:border-border-dark"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary dark:text-text-secondary-dark pointer-events-none">
                %
              </div>
            </div>
            {errors.discountPercent && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.discountPercent}
              </p>
            )}
          </div>

          {/* Hình ảnh sản phẩm */}
          <div className="md:col-span-2">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Đường dẫn hình ảnh
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image || ""}
              onChange={handleChange}
              placeholder="https://example.com/combo-image.jpg"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Hình ảnh minh họa cho combo (không bắt buộc)
            </p>
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Xem trước combo"
                  className="h-24 w-auto object-contain border border-border dark:border-border-dark rounded-md"
                  onError={(e) => {
                    e.target.src = '/assets/images/placeholder.png';
                    e.target.alt = 'Hình ảnh không tồn tại';
                  }}
                />
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows="4"
              placeholder="Nhập mô tả cho combo"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            ></textarea>
          </div>
        </div>

        {/* Danh sách các mặt hàng trong combo */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
              Các mặt hàng trong combo <span className="text-red-500">*</span>
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
            >
              Thêm mặt hàng
            </button>
          </div>

          {errors.items && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 mb-3">
              {errors.items}
            </p>
          )}

          {formData.items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-border dark:border-border-dark rounded-md">
              <p className="text-text-secondary dark:text-text-secondary-dark">
                Chưa có mặt hàng nào trong combo. Vui lòng thêm ít nhất một mặt hàng.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border dark:border-border-dark rounded-md bg-gray-50 dark:bg-gray-800/40"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-grow">
                      <label
                        htmlFor={`item-${index}`}
                        className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
                      >
                        Mặt hàng
                      </label>
                      <select
                        id={`item-${index}`}
                        value={item.itemId}
                        onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                        className={`w-full px-3 py-2 border ${
                          errors[`item_${index}`]
                            ? "border-red-500 dark:border-red-500"
                            : "border-border dark:border-border-dark"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
                      >
                        <option value="">-- Chọn mặt hàng --</option>
                        {availableItems.map((availableItem) => (
                          <option key={availableItem.id} value={availableItem.id}>
                            {availableItem.name} - {availableItem.price.toLocaleString()} VND
                          </option>
                        ))}
                      </select>
                      {errors[`item_${index}`] && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors[`item_${index}`]}
                        </p>
                      )}
                    </div>
                    <div className="w-full md:w-32">
                      <label
                        htmlFor={`quantity-${index}`}
                        className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
                      >
                        Số lượng
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        min="1"
                        className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
                      />
                    </div>
                    <div className="self-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md focus:outline-none transition-colors duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thông tin tính toán */}
        {formData.items.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/40 border border-border dark:border-border-dark rounded-md">
            <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-3">
              Thông tin giá
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">Tổng giá trị mặt hàng:</span>
                <span className="font-medium text-text-primary dark:text-text-primary-dark">
                  {calculateTotalPrice().toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary dark:text-text-secondary-dark">Giảm giá ({formData.discountPercent}%):</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  -{((calculateTotalPrice() * formData.discountPercent) / 100).toLocaleString()} VND
                </span>
              </div>
              <div className="border-t border-border dark:border-border-dark pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-text-primary dark:text-text-primary-dark">Giá combo đã giảm:</span>
                  <span className="font-bold text-primary dark:text-primary-light">
                    {calculateDiscountedPrice().toLocaleString()} VND
                  </span>
                </div>
                <div className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                  <strong>Lưu ý:</strong> Nếu đặt giá combo ({formData.price.toLocaleString()} VND) khác với giá đã giảm ({calculateDiscountedPrice().toLocaleString()} VND), 
                  khách hàng sẽ nhìn thấy cả hai giá trị và hiểu rằng họ đang được giảm giá.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-border dark:border-border-dark pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              "Lưu combo"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcessionComboForm;