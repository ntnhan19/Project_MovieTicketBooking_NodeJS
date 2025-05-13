// admin/src/components/ConcessionCategories/ConcessionCategoryList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import concessionCategoryService from "../../services/concessionCategoryService";
import Pagination from "../Common/Pagination";
import { debounce } from "lodash";

const ConcessionCategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [filter, setFilter] = useState({});
  const perPage = 10;

  // Tải danh sách danh mục bắp nước
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterWithSearch = searchTerm
        ? { ...filter, q: searchTerm }
        : filter;

      const response = await concessionCategoryService.getList({
        pagination: { page: currentPage, perPage },
        sort: { field: sortField, order: sortOrder },
        filter: filterWithSearch,
      });

      setCategories(response.data);
      // Tính toán số trang dựa trên tổng số items và số items mỗi trang
      const calculatedTotalPages = Math.ceil(response.total / perPage) || 1;
      setTotalPages(calculatedTotalPages);
      setTotalItems(response.total);
    } catch (err) {
      console.error("Lỗi khi tải danh sách danh mục:", err);
      setError(
        "Không thể tải danh sách danh mục bắp nước. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component được mount hoặc khi các dependencies thay đổi
  useEffect(() => {
    fetchCategories();
  }, [currentPage, sortField, sortOrder, filter]);

  // Xử lý tìm kiếm với debounce
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    fetchCategories();
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Xử lý thay đổi trạng thái danh mục
  const handleToggleStatus = async (id) => {
    try {
      await concessionCategoryService.toggleStatus(id);
      // Cập nhật lại danh sách sau khi thay đổi trạng thái
      fetchCategories();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      setError("Không thể thay đổi trạng thái danh mục. Vui lòng thử lại sau.");
    }
  };

  // Xử lý xóa danh mục
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      try {
        await concessionCategoryService.delete(id);
        // Cập nhật lại danh sách sau khi xóa
        fetchCategories();
      } catch (err) {
        console.error("Lỗi khi xóa danh mục:", err);
        setError("Không thể xóa danh mục bắp nước. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý thay đổi sắp xếp
  const handleSort = (field) => {
    const newOrder =
      field === sortField && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortField(field);
    setSortOrder(newOrder);
  };

  // Xử lý lọc theo trạng thái
  const handleFilterChange = (status) => {
    if (status === "ALL") {
      setFilter({});
    } else {
      setFilter({ status });
    }
    setCurrentPage(1);
  };

  // Format trạng thái hiển thị
  const renderStatus = (status) => {
    // Nếu status là boolean thì chuyển đổi trực tiếp
    if (typeof status === "boolean") {
      return status ? (
        <span className="status-active">Hoạt động</span>
      ) : (
        <span className="status-inactive">Không hoạt động</span>
      );
    }

    // Nếu status là string "ACTIVE"/"INACTIVE"
    switch (status) {
      case "ACTIVE":
        return <span className="status-active">Hoạt động</span>;
      case "INACTIVE":
        return <span className="status-inactive">Không hoạt động</span>;
      default:
        // Trường hợp status có giá trị true/false nhưng ở dạng chuỗi
        if (status === "true" || status === true) {
          return <span className="status-active">Hoạt động</span>;
        } else if (status === "false" || status === false) {
          return <span className="status-inactive">Không hoạt động</span>;
        }
        return <span className="text-gray-500">Không xác định</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Danh mục bắp nước
        </h1>

        {/* Thanh công cụ */}
        <div className="flex items-center space-x-4">
          <Link
            to="/concession-categories/create"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Thêm danh mục mới
          </Link>
        </div>
      </div>

      {/* Filter và Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-grow max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleFilterChange("ALL")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
              Object.keys(filter).length === 0
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-secondary-dark/20 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-secondary-dark/30"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => handleFilterChange("ACTIVE")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
              filter.status === "ACTIVE"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-secondary-dark/20 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-secondary-dark/30"
            }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => handleFilterChange("INACTIVE")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
              filter.status === "INACTIVE"
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-secondary-dark/20 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-secondary-dark/30"
            }`}
          >
            Không hoạt động
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-secondary-dark/10 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark">
            Không tìm thấy danh mục bắp nước nào.
          </p>
          <Link
            to="/concession-categories/create"
            className="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Thêm danh mục mới
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border dark:divide-border-dark">
            <thead>
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    {sortField === "id" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tên danh mục</span>
                    {sortField === "name" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Mô tả</span>
                    {sortField === "description" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {category.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    <Link
                      to={`/concession-categories/${category.id}`}
                      className="hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary dark:text-text-primary-dark max-w-xs truncate">
                    {category.description || "---"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {renderStatus(category.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/concession-categories/${category.id}`}
                        className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
                        title="Xem chi tiết"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                      <Link
                        to={`/concession-categories/${category.id}/edit`}
                        className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
                        title="Chỉnh sửa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(category.id)}
                        className="text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400"
                        title={
                          category.status === "ACTIVE"
                            ? "Tạm ngưng"
                            : "Kích hoạt"
                        }
                      >
                        {category.status === "ACTIVE" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Xóa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && categories.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={perPage}
          />
        </div>
      )}
    </div>
  );
};

export default ConcessionCategoryList;
