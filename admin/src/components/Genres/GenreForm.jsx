// src/components/Genres/GenreForm.jsx
import React, { useState } from "react";

const GenreForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: (initialData && initialData.name) || "",
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
      newErrors.name = "Tên thể loại không được để trống";
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
            Thông tin thể loại
          </h3>
          <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền thông tin thể loại phim
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Name field */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tên thể loại <span className="text-red-500">*</span>
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
              placeholder="Nhập tên thể loại"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
              Tên thể loại sẽ được hiển thị trong phần phim và tìm kiếm
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
              initialData.id ? "Lưu thay đổi" : "Tạo thể loại"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default GenreForm;