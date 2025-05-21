import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import hallService from "../../services/hallService";
import Pagination from "../Common/Pagination";

const HallList = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hallService.getList({
        pagination: { page: currentPage, perPage: itemsPerPage },
        sort: { field: "id", order: "ASC" },
        filter: { search: searchTerm },
      });

      if (response.data) {
        // Đảm bảo dữ liệu được sắp xếp theo ID
        const sortedHalls = response.data.data.sort((a, b) => a.id - b.id);
        setHalls(sortedHalls);
        setTotalItems(response.data.total || 0);
      } else {
        setHalls([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách phòng chiếu:", err);
      setError(
        err.message || "Không thể tải danh sách phòng chiếu. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng chiếu "${name}"?`)) {
      try {
        await hallService.delete(id);
        fetchData(); // Tải lại dữ liệu sau khi xóa
      } catch (err) {
        console.error("Lỗi khi xóa phòng chiếu:", err);
        setError(err.message || "Không thể xóa phòng chiếu");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Danh sách phòng chiếu
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Tổng số: {totalItems} phòng chiếu
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/halls/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Thêm phòng chiếu mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 pb-6">
        <div>
          <label htmlFor="search" className="sr-only">
            Tìm kiếm
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Tìm kiếm theo tên phòng chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Hall list */}
      {halls.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">
            Không tìm thấy phòng chiếu
          </h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Không có phòng chiếu nào phù hợp với tiêu chí tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark bg-white dark:bg-background-paper-dark shadow-card rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Mã phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Tên phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Tổng ghế
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Số hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Số cột
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Rạp chiếu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {halls.map((hall) => (
                  <tr
                    key={hall.id}
                    className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/halls/${hall.id}`}
                        className="text-primary hover:text-primary-dark hover:underline font-medium"
                      >
                        {hall.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {hall.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {hall.totalSeats}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {hall.rows}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {hall.columns}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {hall.cinema?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/halls/${hall.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
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
                          to={`/halls/${hall.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
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
                          onClick={() => handleDelete(hall.id, hall.name)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
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
          {/* Pagination */}
          {!loading && totalItems > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                maxPageButtons={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HallList;