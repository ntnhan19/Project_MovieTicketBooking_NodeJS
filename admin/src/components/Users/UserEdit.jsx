// src/components/Users/UserEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import userService from "../../services/userService";
import UserForm from "./UserForm";

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          throw new Error("ID người dùng không hợp lệ");
        }

        // Chuyển đổi id thành số nếu là chuỗi
        const userId = typeof id === "string" ? parseInt(id) : id;
        if (isNaN(userId)) {
          throw new Error("ID người dùng không hợp lệ");
        }

        const response = await userService.getOne(userId);

        if (!response || !response.data) {
          throw new Error("Không tìm thấy dữ liệu người dùng");
        }

        setUser(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        setError(
          err.message ||
            "Không thể tải thông tin người dùng. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, location.pathname]);
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!id) {
        throw new Error("ID người dùng không hợp lệ");
      }

      // Chuyển đổi id thành số nếu là chuỗi
      const userId = typeof id === "string" ? parseInt(id) : id;
      if (isNaN(userId)) {
        throw new Error("ID người dùng không hợp lệ");
      }

      // Xóa trường password nếu không được cập nhật
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      // Sửa lại cách gọi userService.update
      await userService.update(userId, updateData); // Truyền id và data riêng biệt

      navigate("/users", {
        state: {
          successMessage: `Người dùng "${formData.name}" đã được cập nhật thành công.`,
        },
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật người dùng:", err);
      setError(
        err.message ||
          "Đã xảy ra lỗi khi cập nhật người dùng. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">
            {error || "Không tìm thấy người dùng hoặc đã có lỗi xảy ra."}
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate("/users")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Chỉnh sửa người dùng
        </h1>
        <div className="h-1 w-24 bg-primary mx-auto mt-2 rounded-full"></div>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
          Cập nhật thông tin người dùng: {user.name}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <UserForm
        initialData={user}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserEdit;
