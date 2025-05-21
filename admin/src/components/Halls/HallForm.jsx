// admin/src/components/Halls/HallForm.jsx
import React, { useState, useEffect } from "react";

const HallForm = ({ initialData = {}, onSubmit, isSubmitting, cinemas = [] }) => {
  const [formData, setFormData] = useState({
    name: (initialData && initialData.name) || "",
    totalSeats: (initialData && initialData.totalSeats) || "",
    rows: (initialData && initialData.rows) || "",
    columns: (initialData && initialData.columns) || "",
    cinemaId: (initialData && initialData.cinemaId) || "",
  });

  const [errors, setErrors] = useState({});

  // Cập nhật totalSeats khi rows hoặc columns thay đổi
  useEffect(() => {
    if (formData.rows && formData.columns) {
      const calculatedTotalSeats = formData.rows * formData.columns;
      setFormData(prev => ({
        ...prev,
        totalSeats: calculatedTotalSeats
      }));
    }
  }, [formData.rows, formData.columns]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = ["rows", "columns", "totalSeats"].includes(name) 
      ? value === "" ? "" : parseInt(value, 10) || 0
      : value;

    setFormData({
      ...formData,
      [name]: newValue,
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
      newErrors.name = "Tên phòng chiếu không được để trống";
    }
    
    if (!formData.rows || formData.rows <= 0) {
      newErrors.rows = "Số hàng phải lớn hơn 0";
    }
    
    if (!formData.columns || formData.columns <= 0) {
      newErrors.columns = "Số ghế mỗi hàng phải lớn hơn 0";
    }
    
    if (!formData.cinemaId) {
      newErrors.cinemaId = "Vui lòng chọn rạp chiếu";
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
            Thông tin phòng chiếu
          </h3>
          <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền thông tin chi tiết về phòng chiếu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên phòng chiếu */}
          <div className="md:col-span-2">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tên phòng chiếu <span className="text-red-500">*</span>
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
              placeholder="Nhập tên phòng chiếu"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Tên phòng chiếu sẽ được hiển thị trong lịch chiếu và khi đặt vé
            </p>
          </div>

          {/* Số hàng */}
          <div>
            <label 
              htmlFor="rows" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Số hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="rows"
              name="rows"
              min="1"
              value={formData.rows}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.rows ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Nhập số hàng ghế"
            />
            {errors.rows && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rows}</p>
            )}
          </div>

          {/* Số ghế mỗi hàng */}
          <div>
            <label 
              htmlFor="columns" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Số ghế mỗi hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="columns"
              name="columns"
              min="1"
              value={formData.columns}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.columns ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="Nhập số ghế mỗi hàng"
            />
            {errors.columns && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.columns}</p>
            )}
          </div>

          {/* Tổng số ghế (readonly - tự tính) */}
          <div>
            <label 
              htmlFor="totalSeats" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tổng số ghế
            </label>
            <input
              type="number"
              id="totalSeats"
              name="totalSeats"
              value={formData.totalSeats}
              readOnly
              className="w-full p-3 border border-border dark:border-border-dark rounded-md bg-gray-50 dark:bg-secondary-dark/10 text-text-primary dark:text-text-primary-dark"
              placeholder="Được tính tự động"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Được tính tự động dựa trên số hàng và số ghế mỗi hàng
            </p>
          </div>

          {/* Chọn rạp chiếu */}
          <div>
            <label 
              htmlFor="cinemaId" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Rạp chiếu <span className="text-red-500">*</span>
            </label>
            <select
              id="cinemaId"
              name="cinemaId"
              value={formData.cinemaId}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.cinemaId ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            >
              <option value="">-- Chọn rạp chiếu --</option>
              {cinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </option>
              ))}
            </select>
            {errors.cinemaId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cinemaId}</p>
            )}
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
              initialData.id ? "Lưu thay đổi" : "Tạo phòng chiếu"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default HallForm;