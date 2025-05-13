// admin/src/components/ConcessionItems/ConcessionItemForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import concessionCategoryService from "../../services/concessionCategoryService";

const ConcessionItemForm = ({
  initialData = null,
  onSubmit,
  submitButtonText = "Lưu sản phẩm",
  isCreate = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      image: "",
      isAvailable: true,
      size: "",
    },
  });

  const watchImage = watch("image");

  // Tải danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await concessionCategoryService.getList({
          pagination: { page: 1, perPage: 100 },
          sort: { field: "name", order: "ASC" },
          filter: { isActive: true },
        });
        setCategories(response.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách danh mục:", err);
        setError(
          "Không thể tải danh sách danh mục. Vui lòng thử lại sau."
        );
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);
    // Convert price to number
    data.price = Number(data.price);

    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      // Reset form if creating new
      if (isCreate) {
        reset({
          name: "",
          description: "",
          price: 0,
          categoryId: "",
          image: "",
          isAvailable: true,
          size: "",
        });
      }
    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      setError(err.message || "Không thể lưu sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {isCreate ? "Tạo sản phẩm bắp nước mới" : "Chỉnh sửa sản phẩm bắp nước"}
        </h2>
        {isCreate && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin để tạo sản phẩm bắp nước mới.
          </p>
        )}
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Sản phẩm đã được lưu thành công!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên sản phẩm */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="Nhập tên sản phẩm"
              className={`w-full px-3 py-2 border ${
                errors.name
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("name", {
                required: "Vui lòng nhập tên sản phẩm",
                maxLength: {
                  value: 100,
                  message: "Tên sản phẩm không được vượt quá 100 ký tự",
                },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              disabled={loadingCategories}
              className={`w-full px-3 py-2 border ${
                errors.categoryId
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("categoryId", {
                required: "Vui lòng chọn danh mục",
              })}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {loadingCategories && (
              <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
                Đang tải danh mục...
              </p>
            )}
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Giá */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Giá (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              placeholder="Nhập giá sản phẩm"
              className={`w-full px-3 py-2 border ${
                errors.price
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("price", {
                required: "Vui lòng nhập giá sản phẩm",
                min: {
                  value: 0,
                  message: "Giá không được nhỏ hơn 0",
                },
                valueAsNumber: true,
              })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Kích thước */}
          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Kích thước
            </label>
            <input
              type="text"
              id="size"
              placeholder="Ví dụ: Nhỏ, Vừa, Lớn hoặc S, M, L"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("size")}
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Kích thước của sản phẩm (không bắt buộc)
            </p>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              Tình trạng
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  className="w-4 h-4 text-primary border-border dark:border-border-dark rounded focus:ring-primary bg-white dark:bg-background-paper-dark"
                  {...register("isAvailable")}
                />
                <label
                  htmlFor="isAvailable"
                  className="ml-2 text-text-primary dark:text-text-primary-dark"
                >
                  Có sẵn để bán
                </label>
              </div>
            </div>
          </div>

          {/* Hình ảnh sản phẩm */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="image"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Đường dẫn hình ảnh
            </label>
            <input
              type="text"
              id="image"
              placeholder="https://example.com/product-image.jpg"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("image")}
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Hình ảnh minh họa cho sản phẩm (không bắt buộc)
            </p>
            {watchImage && (
              <div className="mt-3">
                <img
                  src={watchImage}
                  alt="Xem trước sản phẩm"
                  className="h-24 w-auto object-contain border border-border dark:border-border-dark rounded-md"
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
              Mô tả sản phẩm
            </label>
            <textarea
              id="description"
              rows="4"
              placeholder="Nhập mô tả sản phẩm"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("description", {
                maxLength: {
                  value: 1000,
                  message: "Mô tả không được vượt quá 1000 ký tự",
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
            onClick={() => navigate("/concession-items")}
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

export default ConcessionItemForm;