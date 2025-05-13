// admin/src/components/Showtimes/ShowtimeShow.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate, Link } from "react-router-dom";
import { showtimeService, formatShowtimeDisplayData } from "../../services/showtimeService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft as ArrowLeftIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Video as VideoIcon,
  Home as HomeIcon,
  DollarSign as DollarSignIcon,
  Edit as EditIcon,
  Trash2 as TrashIcon
} from "lucide-react";

// Components
const Breadcrumbs = ({ items }) => (
  <nav className="flex" aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-text-secondary dark:text-text-secondary-dark">/</span>
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="text-text-secondary dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary-light transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary dark:text-text-primary-dark font-medium">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  
  return (
    <div className="flex justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]}`}></div>
    </div>
  );
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch (error) {
    console.error("Lỗi định dạng ngày:", error);
    return dateString || "N/A";
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "N/A";
  return new Intl.NumberFormat('vi-VN').format(amount) + " VND";
};

const ShowtimeShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [hall, setHall] = useState(null);
  const [cinema, setCinema] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingShowtime, setDeletingShowtime] = useState(false);
  
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Suất chiếu", href: "/showtimes" },
    { label: `Suất chiếu #${id}` }
  ];
  
  // Fetch Showtime data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch showtime
        const { data: showtimeData } = await showtimeService.getOne(id);
        setShowtime(showtimeData);
        
        // Fetch movie
        if (showtimeData.movieId) {
          try {
            const { data: movieData } = await fetch(`/api/movies/${showtimeData.movieId}`).then(res => res.json());
            setMovie(movieData);
          } catch (movieError) {
            console.error("Không thể tải dữ liệu phim:", movieError);
          }
        }
        
        // Fetch hall
        if (showtimeData.hallId) {
          try {
            const { data: hallData } = await fetch(`/api/halls/${showtimeData.hallId}`).then(res => res.json());
            setHall(hallData);
            
            // Fetch cinema
            if (hallData.cinemaId) {
              try {
                const { data: cinemaData } = await fetch(`/api/cinemas/${hallData.cinemaId}`).then(res => res.json());
                setCinema(cinemaData);
              } catch (cinemaError) {
                console.error("Không thể tải dữ liệu rạp chiếu:", cinemaError);
              }
            }
          } catch (hallError) {
            console.error("Không thể tải dữ liệu phòng chiếu:", hallError);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu suất chiếu:", error);
        setError("Không thể tải dữ liệu suất chiếu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleDelete = async () => {
    setDeletingShowtime(true);
    try {
      await showtimeService.delete(id);
      navigate('/showtimes', { 
        state: { 
          successMessage: "Đã xóa suất chiếu thành công!" 
        } 
      });
    } catch (error) {
      console.error("Lỗi khi xóa suất chiếu:", error);
      setError("Không thể xóa suất chiếu. Vui lòng thử lại sau.");
      setDeletingShowtime(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Chi tiết suất chiếu | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết suất chiếu
          </h1>
          
          {!loading && showtime && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/showtimes/${id}/edit`}
                className="px-4 py-2 border border-primary bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
              >
                <div className="flex items-center gap-1">
                  <EditIcon size={16} />
                  <span>Chỉnh sửa</span>
                </div>
              </Link>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 border border-red-500 text-red-500 dark:text-red-400 dark:border-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
              >
                <div className="flex items-center gap-1">
                  <TrashIcon size={16} />
                  <span>Xóa</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          showtime && (
            <div className="animate-fadeIn">
              {/* Movie Info Card */}
              {movie && (
                <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/5 to-light-bg dark:from-primary-dark/10 dark:to-background-paper-dark p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Movie Poster */}
                      <div className="w-full md:w-1/4 lg:w-1/5">
                        <div className="rounded-lg overflow-hidden shadow-md h-full">
                          {movie.posterUrl ? (
                            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="bg-gray-200 dark:bg-gray-700 w-full h-64 flex items-center justify-center">
                              <VideoIcon className="text-gray-400 dark:text-gray-500" size={64} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Movie Details */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-primary dark:text-primary-light mb-2">
                          {movie.title}
                        </h2>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {movie.categories && movie.categories.map((category, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-light text-xs font-medium rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                          
                          {movie.duration && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-text-secondary-dark text-xs font-medium rounded-full flex items-center gap-1">
                              <ClockIcon size={12} />
                              {movie.duration} phút
                            </span>
                          )}
                        </div>
                        
                        <p className="text-text-secondary dark:text-text-secondary-dark mb-4">
                          {movie.description || "Không có mô tả"}
                        </p>
                        
                        <Link
                          to={`/movies/${movie.id}`}
                          className="inline-flex items-center text-primary dark:text-primary-light hover:underline"
                        >
                          Xem chi tiết phim
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Showtime Details Card */}
              <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
                {/* Header */}
                <div className="p-6 border-b border-border dark:border-border-dark">
                  <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                    Thông tin suất chiếu #{showtime.id}
                  </h2>
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                        <CalendarIcon size={16} />
                        <span>Thời gian bắt đầu</span>
                      </div>
                      <p className="text-text-primary dark:text-text-primary-dark font-medium">
                        {formatDateTime(showtime.startTime)}
                      </p>
                    </div>

                    {/* End Time */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                        <ClockIcon size={16} />
                        <span>Thời gian kết thúc</span>
                      </div>
                      <p className="text-text-primary dark:text-text-primary-dark font-medium">
                        {formatDateTime(showtime.endTime)}
                      </p>
                    </div>

                    {/* Hall */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                        <VideoIcon size={16} />
                        <span>Phòng chiếu</span>
                      </div>
                      <p className="text-text-primary dark:text-text-primary-dark font-medium">
                        {hall ? hall.name : "N/A"}
                      </p>
                    </div>

                    {/* Cinema */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                        <HomeIcon size={16} />
                        <span>Rạp chiếu</span>
                      </div>
                      <div>
                        <p className="text-text-primary dark:text-text-primary-dark font-medium">
                          {cinema ? cinema.name : "N/A"}
                        </p>
                        {cinema && cinema.address && (
                          <p className="text-text-secondary dark:text-text-secondary-dark text-sm mt-1">
                            {cinema.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg md:col-span-2">
                      <div className="flex items-center gap-2 mb-2 text-text-secondary dark:text-text-secondary-dark text-sm font-medium">
                        <DollarSignIcon size={16} />
                        <span>Giá vé</span>
                      </div>
                      <p className="text-primary dark:text-primary-light text-lg font-bold">
                        {formatCurrency(showtime.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {(showtime.createdAt || showtime.updatedAt) && (
                  <div className="p-6 border-t border-border dark:border-border-dark text-xs text-text-secondary dark:text-text-secondary-dark">
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {showtime.createdAt && (
                        <p>Ngày tạo: {formatDateTime(showtime.createdAt)}</p>
                      )}
                      {showtime.updatedAt && (
                        <p>Cập nhật lần cuối: {formatDateTime(showtime.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-border dark:border-border-dark">
                  <div className="flex justify-end gap-3">
                    <Link
                      to="/showtimes"
                      className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                    >
                      <div className="flex items-center gap-1">
                        <ArrowLeftIcon size={16} />
                        <span>Quay lại</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                Bạn có chắc chắn muốn xóa suất chiếu #{showtime.id}? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingShowtime}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingShowtime ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ShowtimeShow;