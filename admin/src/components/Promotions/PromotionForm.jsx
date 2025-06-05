// admin/src/components/Promotions/PromotionForm.jsx
import React, { useState } from "react";

const PromotionForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    type: initialData.type || "percentage",
    code: initialData.code || "",
    discount: initialData.discount || "",
    validFrom: initialData.validFrom
      ? new Date(initialData.validFrom).toISOString().split("T")[0]
      : "",
    validUntil: initialData.validUntil
      ? new Date(initialData.validUntil).toISOString().split("T")[0]
      : "",
    image: initialData.image || "",
    isActive: initialData.isActive !== undefined ? initialData.isActive : true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) {
      newErrors.title = "Tiêu đề khuyến mãi không được để trống";
    }

    if (!formData.code) {
      newErrors.code = "Mã khuyến mãi không được để trống";
    }

    if (!formData.type) {
      newErrors.type = "Loại khuyến mãi không được để trống";
    }

    if (!formData.discount) {
      newErrors.discount = "Giá trị giảm giá không được để trống";
    } else if (isNaN(formData.discount) || formData.discount < 0) {
      newErrors.discount = "Giá trị giảm giá phải là số dương";
    } else if (formData.type === "percentage" && formData.discount > 100) {
      newErrors.discount = "Phần trăm giảm giá phải từ 0-100";
    }

    if (!formData.validFrom) {
      newErrors.validFrom = "Ngày bắt đầu không được để trống";
    }

    if (!formData.validUntil) {
      newErrors.validUntil = "Ngày kết thúc không được để trống";
    } else if (
      formData.validFrom &&
      formData.validUntil &&
      new Date(formData.validFrom) > new Date(formData.validUntil)
    ) {
      newErrors.validUntil = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const processedData = {
        ...formData,
        discount: parseFloat(formData.discount),
        // Đảm bảo type được gửi đúng
        type: formData.type === "fixed" ? "fixed" : "percentage", // Giữ nguyên giá trị từ form
      };
      console.log("Dữ liệu gửi đi:", processedData); // Kiểm tra log
      onSubmit(processedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fadeIn">
      <div className="bg-background-paper dark:bg-background-paper-dark rounded-lg shadow-card p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            Thông tin khuyến mãi
          </h3>
          <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin về khuyến mãi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title field */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tiêu đề khuyến mãi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.title
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Giảm giá mùa hè 2025"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description field */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-border dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              placeholder="Mô tả chi tiết về khuyến mãi"
            />
          </div>

          {/* Type field */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Loại khuyến mãi <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.type
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            >
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VNĐ)</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.type}
              </p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              {formData.type === "percentage"
                ? "Giảm giá theo phần trăm đơn hàng"
                : "Giảm giá một số tiền cố định"}
            </p>
          </div>

          {/* Code field */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Mã khuyến mãi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.code
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Ví dụ: SUMMER2025"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.code}
              </p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Mã khuyến mãi nên viết liền, không dấu và không khoảng trắng
            </p>
          </div>

          {/* Discount field */}
          <div>
            <label
              htmlFor="discount"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              {formData.type === "percentage"
                ? "Phần trăm giảm giá (%)"
                : "Số tiền giảm giá (VNĐ)"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              min="0"
              max={formData.type === "percentage" ? "100" : null}
              value={formData.discount}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.discount
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder={formData.type === "percentage" ? "10" : "50000"}
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.discount}
              </p>
            )}
          </div>

          {/* Valid From field */}
          <div>
            <label
              htmlFor="validFrom"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="validFrom"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.validFrom
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.validFrom && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.validFrom}
              </p>
            )}
          </div>

          {/* Valid Until field */}
          <div>
            <label
              htmlFor="validUntil"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.validUntil
                  ? "border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.validUntil && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.validUntil}
              </p>
            )}
          </div>

          {/* Image URL field */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Đường dẫn hình ảnh
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-3 border border-border dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              placeholder="https://example.com/promotion-image.jpg"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Hình ảnh minh họa cho khuyến mãi (không bắt buộc)
            </p>
          </div>

          {/* Active status */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="focus:ring-primary h-4 w-4 text-primary border-border dark:border-border-dark rounded dark:bg-background-paper-dark"
                />
              </div>
              <div className="ml-3 text-sm">
                <label
                  htmlFor="isActive"
                  className="font-medium text-text-primary dark:text-text-primary-dark"
                >
                  Kích hoạt khuyến mãi
                </label>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  Khuyến mãi chỉ có hiệu lực khi được kích hoạt
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="py-2 px-4 border border-border dark:border-border-dark rounded-md shadow-sm text-sm font-medium text-text-primary dark:text-text-primary-dark bg-white dark:bg-background-paper-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              "Lưu khuyến mãi"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromotionForm;
