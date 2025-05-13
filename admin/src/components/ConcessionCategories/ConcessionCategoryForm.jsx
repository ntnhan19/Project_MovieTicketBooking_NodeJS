// admin/src/components/ConcessionCategories/ConcessionCategoryForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const ConcessionCategoryForm = ({
  initialData = null,
  onSubmit,
  submitButtonText = "Lưu danh mục",
  isCreate = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const mapIsActiveToStatus = (isActive) => {
    if (typeof isActive === "boolean") {
      return isActive ? "ACTIVE" : "INACTIVE";
    }
    return isActive; // Nếu đã là chuỗi thì giữ nguyên
  };

  // Status options
  const statusOptions = [
    { id: "ACTIVE", name: "Hoạt động" },
    { id: "INACTIVE", name: "Không hoạt động" },
  ];

  // Initialize react-hook-form
  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  defaultValues: initialData ? {
    ...initialData,
    // Chuyển đổi isActive thành status nếu có
    status: initialData.status || mapIsActiveToStatus(initialData.isActive)
  } : {
    name: "",
    description: "",
    status: "ACTIVE",
  },
});

  // Handle form submission
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Chuyển đổi dữ liệu form trước khi gửi đi
      const formattedData = {
        ...data,
        // Chuyển status thành boolean isActive nếu cần
        isActive: data.status === "ACTIVE",
      };

      await onSubmit(formattedData);
      setSubmitSuccess(true);

      // Reset form if creating new
      if (isCreate) {
        reset({
          name: "",
          description: "",
          status: "ACTIVE",
        });
      }
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err);
      setError(err.message || "Không thể lưu danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {isCreate
            ? "Tạo danh mục bắp nước mới"
            : "Chỉnh sửa danh mục bắp nước"}
        </h2>
        {isCreate && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin để tạo danh mục bắp nước mới.
          </p>
        )}
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Danh mục đã được lưu thành công!</p>
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
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Nhập tên danh mục"
              className={`w-full px-3 py-2 border ${
                errors.name
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("name", {
                required: "Vui lòng nhập tên danh mục",
                maxLength: {
                  value: 100,
                  message: "Tên danh mục không được vượt quá 100 ký tự",
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Order Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Trạng thái
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("status", {
                required: "Vui lòng chọn trạng thái",
              })}
            >
              {statusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              rows="4"
              placeholder="Nhập mô tả cho danh mục"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("description", {
                maxLength: {
                  value: 500,
                  message: "Mô tả không được vượt quá 500 ký tự",
                },
              })}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-border dark:border-border-dark pt-6">
          <button
            type="button"
            onClick={() => navigate("/concession-categories")}
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

export default ConcessionCategoryForm;
