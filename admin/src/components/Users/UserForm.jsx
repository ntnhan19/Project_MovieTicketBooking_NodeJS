// src/components/Users/UserForm.jsx
import React, { useState } from "react";

const UserForm = ({ initialData = {}, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "", 
    password: "", // Don't set initial password even in edit mode
    phone: initialData.phone || "",
    role: initialData.role || "USER",
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
    
    if (!formData.name) {
      newErrors.name = "Tên người dùng không được để trống";
    }
    
    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!initialData.id && !formData.password) {
      newErrors.password = "Mật khẩu không được để trống khi tạo mới";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
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
            Thông tin người dùng
          </h3>
          <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin người dùng
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name field */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Tên người dùng <span className="text-red-500">*</span>
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
              placeholder="Nguyen Van A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.email ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Mật khẩu {!initialData.id && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.password ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder={initialData.id ? "••••••••" : "Nhập mật khẩu"}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
            {initialData.id && (
              <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary-dark">
                Để trống nếu không muốn thay đổi mật khẩu
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label 
              htmlFor="phone" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Số điện thoại
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-3 border ${
                errors.phone ? "border-red-500" : "border-border dark:border-border-dark"
              } rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              placeholder="0123456789"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Role field */}
          <div>
            <label 
              htmlFor="role" 
              className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Vai trò <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-border dark:border-border-dark rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            >
              <option value="USER">Khách hàng</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            {formData.role === 'ADMIN' && (
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                Cảnh báo: Người dùng này sẽ có toàn quyền quản trị hệ thống
              </p>
            )}
          </div>

          {/* Active status */}
          <div>
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
                <label htmlFor="isActive" className="font-medium text-text-primary dark:text-text-primary-dark">
                  Kích hoạt tài khoản
                </label>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  Người dùng chỉ có thể đăng nhập khi tài khoản được kích hoạt
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </div>
            ) : (
              "Lưu thông tin"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserForm;