// src/components/Cinemas/CinemaForm.jsx
import React, { useState } from "react";

const CinemaForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: (initialData && initialData.name) || "",
    address: (initialData && initialData.address) || "",
    image: (initialData && initialData.image) || "",
    mapUrl: (initialData && initialData.mapUrl) || "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    
    if (!formData.name) {
      newErrors.name = "Tên rạp chiếu phim không được để trống";
    }
    
    if (!formData.address) {
      newErrors.address = "Địa chỉ không được để trống";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full animate-fadeIn">
      <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
            Thông tin rạp chiếu phim
          </h3>
          <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền thông tin về rạp chiếu phim
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên rạp */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tên rạp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.name ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Nhập tên rạp chiếu phim"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Tên rạp sẽ được hiển thị trên trang chọn rạp và vé xem phim
            </p>
          </div>

          {/* Địa chỉ */}
          <div>
            <label 
              htmlFor="address" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.address ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Nhập địa chỉ rạp"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Địa chỉ chi tiết của rạp chiếu phim
            </p>
          </div>

          {/* URL hình ảnh */}
          <div>
            <label 
              htmlFor="image" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              URL Hình ảnh
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full p-3 border border-border dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              placeholder="Nhập URL hình ảnh rạp (không bắt buộc)"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Đường dẫn đến hình ảnh đại diện của rạp
            </p>
          </div>

          {/* URL bản đồ */}
          <div>
            <label 
              htmlFor="mapUrl" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              URL Bản đồ
            </label>
            <input
              type="text"
              id="mapUrl"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleChange}
              className="w-full p-3 border border-border dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              placeholder="Nhập URL Google Maps (không bắt buộc)"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Đường dẫn đến vị trí của rạp trên Google Maps
            </p>
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              initialData.id ? "Lưu thay đổi" : "Tạo rạp chiếu phim"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CinemaForm;