import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { showtimeService } from "../../services/showtimeService";
import Pagination from "../Common/Pagination";
import { debounce } from "lodash";
import { apiUrl } from "../../services/httpClient";

const ShowtimeList = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [filter, setFilter] = useState({ status: "all" });
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const perPage = 10;

  const fetchShowtimes = async () => {
  setLoading(true);
  setError(null);
  try {
    let filterWithSearch = { ...filter, showPast: "true" }; // Đảm bảo lấy tất cả suất chiếu

    // Xử lý tìm kiếm
    if (searchTerm) {
      filterWithSearch.q = searchTerm;
    }

    // Loại bỏ các trường không cần thiết
    delete filterWithSearch._sort;
    delete filterWithSearch._order;

    console.log("Filter sent to API:", filterWithSearch);
    const response = await showtimeService.getList({
      pagination: { page: currentPage, perPage },
      sort: { field: sortField, order: sortOrder },
      filter: filterWithSearch,
    });

    console.log("API Response:", response);
    // Xử lý dữ liệu từ phản hồi
    const data = response.data || [];
    const total = response.total || 0;
    const totalPages = response.totalPages || Math.ceil(total / perPage);

    setShowtimes(data);
    setTotalItems(total);
    setTotalPages(totalPages);

    // Nếu không có dữ liệu, hiển thị thông báo
    if (data.length === 0) {
      setError("Không tìm thấy suất chiếu nào phù hợp.");
    }
  } catch (err) {
    console.error("Lỗi khi tải danh sách suất chiếu:", err);
    setError(
      err.message || "Không thể tải danh sách suất chiếu. Vui lòng thử lại sau."
    );
    setShowtimes([]);
    setTotalItems(0);
    setTotalPages(0);
  } finally {
    setLoading(false);
  }
};

// Cập nhật useEffect để áp dụng bộ lọc mặc định
useEffect(() => {
  setFilter({ status: "all", showPast: "true" }); // Mặc định lấy tất cả suất chiếu
  fetchShowtimes();
}, [currentPage, sortField, sortOrder]);

  const fetchRelatedData = async () => {
    setLoadingRelated(true);
    try {
      const token = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth")).token
        : null;

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const [moviesResponse, hallsResponse, cinemasResponse] =
        await Promise.all([
          fetch(`${apiUrl}/movies?limit=1000`, { headers }).then((res) =>
            res.json()
          ),
          fetch(`${apiUrl}/halls?limit=100`, { headers }).then((res) =>
            res.json()
          ),
          fetch(`${apiUrl}/cinemas?limit=100`, { headers }).then((res) =>
            res.json()
          ),
        ]);

      setMovies(moviesResponse.data || moviesResponse || []);
      setHalls(hallsResponse.data || hallsResponse || []);
      setCinemas(cinemasResponse.data || cinemasResponse || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu liên quan:", err);
      setError("Không thể tải đầy đủ thông tin phim và rạp.");
    } finally {
      setLoadingRelated(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, [currentPage, sortField, sortOrder, filter]);

  useEffect(() => {
    fetchRelatedData();
  }, []);

  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchShowtimes();
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này không?")) {
      try {
        await showtimeService.delete(id);
        fetchShowtimes();
      } catch (err) {
        console.error("Lỗi khi xóa suất chiếu:", err);
        setError("Không thể xóa suất chiếu. Vui lòng thử lại sau.");
      }
    }
  };

  const handleSort = (field) => {
    const newOrder =
      field === sortField && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortField(field);
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  const handleFilterByMovie = (movieId) => {
    if (movieId === "all") {
      const { movieId, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      setFilter({ ...filter, movieId });
    }
    setCurrentPage(1);
  };

  const handleFilterByHall = (hallId) => {
    if (hallId === "all") {
      const { hallId, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      setFilter({ ...filter, hallId });
    }
    setCurrentPage(1);
  };

  const handleFilterByStatus = (status) => {
    if (status === "all") {
      const { status, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      setFilter({ ...filter, status });
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilter({ status: "all" });
    setSearchTerm("");
    setCurrentPage(1);
    document.getElementById("search-input").value = "";
    fetchShowtimes();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error, dateString);
      return "---";
    }
  };

  const getMovieTitle = (movieId) => {
    if (!movieId) return "---";
    const movie = movies.find(
      (m) => m.id === movieId || m.id === Number(movieId)
    );
    return movie ? movie.title || movie.name || "---" : "---";
  };

  const getHallName = (hallId) => {
    if (!hallId) return "---";
    const hall = halls.find((h) => h.id === hallId || h.id === Number(hallId));
    return hall ? hall.name || "---" : "---";
  };

  const getCinemaName = (hallId) => {
    if (!hallId) return "---";
    const hall = halls.find((h) => h.id === hallId || h.id === Number(hallId));
    if (!hall) return "---";
    const cinemaId = hall.cinemaId;
    if (!cinemaId) return "---";
    const cinema = cinemas.find(
      (c) => c.id === cinemaId || c.id === Number(cinemaId)
    );
    return cinema ? cinema.name || "---" : "---";
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "---";
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

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
            Danh sách suất chiếu
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Tổng số: {totalItems} suất chiếu
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/showtimes/create")}
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
            Thêm suất chiếu mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pb-6">
        <div className="md:col-span-1">
          <label htmlFor="search-input" className="sr-only">
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
              id="search-input"
              placeholder="Tìm kiếm suất chiếu..."
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
          </div>
        </div>

        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            onChange={(e) => handleFilterByMovie(e.target.value)}
            value={filter.movieId || "all"}
            disabled={loadingRelated || movies.length === 0}
          >
            <option value="all">Tất cả phim</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title || movie.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            onChange={(e) => handleFilterByHall(e.target.value)}
            value={filter.hallId || "all"}
            disabled={loadingRelated || halls.length === 0}
          >
            <option value="all">Tất cả phòng chiếu</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name} ({getCinemaName(hall.id)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            onChange={(e) => handleFilterByStatus(e.target.value)}
            value={filter.status || "all"}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="playing">Đang chiếu</option>
            <option value="upcoming">Sắp chiếu</option>
            <option value="ended">Hết chiếu</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={handleClearFilters}
          className="px-3 py-2 bg-gray-100 dark:bg-secondary-dark/20 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-secondary-dark/30 rounded-md transition-colors duration-300"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading Message for Related Data */}
      {loadingRelated && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Đang tải thông tin phim và rạp...</p>
        </div>
      )}

      {/* Table */}
      {showtimes.length === 0 ? (
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
            Không tìm thấy suất chiếu
          </h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Không có suất chiếu nào phù hợp với tiêu chí tìm kiếm của bạn.
          </p>
          <Link
            to="/showtimes/create"
            className="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Thêm suất chiếu mới
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark bg-white dark:bg-background-paper-dark shadow-card rounded-lg">
              <thead>
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
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
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("movieId")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Phim</span>
                      {sortField === "movieId" && (
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
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("hallId")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Phòng chiếu</span>
                      {sortField === "hallId" && (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Rạp
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("startTime")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Thời gian bắt đầu</span>
                      {sortField === "startTime" && (
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
                    className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Giá vé</span>
                      {sortField === "price" && (
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {showtimes.map((showtime) => (
                  <tr
                    key={showtime.id}
                    className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/showtimes/${showtime.id}`}
                        className="text-primary hover:text-primary-dark hover:underline font-medium"
                      >
                        {showtime.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {getMovieTitle(showtime.movieId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {getHallName(showtime.hallId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {getCinemaName(showtime.hallId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {formatDateTime(showtime.startTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-text-primary dark:text-text-primary-dark">
                        {formatPrice(showtime.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/showtimes/${showtime.id}`}
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
                          to={`/showtimes/${showtime.id}/edit`}
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
                          onClick={() => handleDelete(showtime.id)}
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
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={perPage}
                maxPageButtons={7}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ShowtimeList;
