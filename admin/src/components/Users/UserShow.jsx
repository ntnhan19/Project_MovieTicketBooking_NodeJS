// src/components/Users/UserShow.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import userService from "../../services/userService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const UserShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getOne(id);
        setUser(response.data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.name}"?`)) {
      try {
        await userService.delete(id);
        navigate("/users", {
          state: {
            successMessage: `Người dùng "${user.name}" đã được xóa thành công.`,
          },
        });
      } catch (err) {
        console.error("Lỗi khi xóa người dùng:", err);
        setError("Không thể xóa người dùng. Vui lòng thử lại sau.");
      }
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error || "Không tìm thấy người dùng hoặc đã có lỗi xảy ra."}</p>
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
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết người dùng
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            ID: {user.id}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/users"
            className="inline-flex items-center px-4 py-2 border border-border dark:border-border-dark rounded-md shadow-sm text-sm font-medium text-text-primary dark:text-text-primary-dark bg-white dark:bg-background-paper-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại danh sách
          </Link>
          <Link
            to={`/users/edit/${id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Xóa
          </button>
        </div>
      </div>

      {/* User Details Card */}
      <div className="bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
              Thông tin người dùng
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleClass(user.role)}`}>
              {user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Họ tên
              </dt>
              <dd className="mt-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                {user.name}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Email
              </dt>
              <dd className="mt-1 text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                {user.email}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Số điện thoại
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {user.phone || "Chưa cập nhật"}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Trạng thái
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đang hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Đã khóa
                  </span>
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Ngày tạo
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Lần cập nhật cuối
              </dt>
              <dd className="mt-1 text-text-primary dark:text-text-primary-dark">
                {format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Activity History */}
      <div className="mt-6 bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
            Lịch sử hoạt động
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            Thông tin lịch sử hoạt động sẽ được hiển thị tại đây khi tính năng được phát triển.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserShow;
