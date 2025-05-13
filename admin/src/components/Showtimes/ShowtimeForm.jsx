// src/components/Showtimes/ShowtimeForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Định nghĩa múi giờ Việt Nam 
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

const ShowtimeForm = ({
  initialData = null,
  onSubmit,
  movies = [],
  halls = [],
  cinemas = [],
  submitButtonText = "Lưu suất chiếu",
  isCreate = false,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Format date-time string to local format for inputs - đồng bộ với showtimeService
  const formatDateTimeForInput = (dateTime) => {
    if (!dateTime) return '';
    // Đảm bảo dateTime được hiểu theo múi giờ VN và hiển thị đúng trên form
    return dayjs(dateTime).tz(VIETNAM_TIMEZONE).format('YYYY-MM-DDTHH:mm');
  };

  // Format initialData if exists
  const formattedInitialData = initialData
    ? {
        ...initialData,
        startTime: formatDateTimeForInput(initialData.startTime),
        endTime: formatDateTimeForInput(initialData.endTime),
      }
    : {
        movieId: "",
        hallId: "",
        startTime: "",
        endTime: "",
        price: ""
      };

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: formattedInitialData
  });

  // Watch values để tính toán thời gian kết thúc
  const watchMovieId = watch("movieId");
  const watchStartTime = watch("startTime");

  // Lấy thông tin phim được chọn
  const selectedMovie = movies.find(movie => movie.id.toString() === watchMovieId?.toString());

  // Tính thời gian kết thúc dựa vào phim và thời gian bắt đầu
  useEffect(() => {
    if (selectedMovie && watchStartTime) {
      const durationInMinutes = selectedMovie.duration;
      if (!durationInMinutes) return;

      // Sử dụng múi giờ VN khi tính toán thời gian kết thúc
      const calculatedEndTime = dayjs(watchStartTime)
        .tz(VIETNAM_TIMEZONE)
        .add(durationInMinutes, "minute")
        .format('YYYY-MM-DDTHH:mm');

      setValue("endTime", calculatedEndTime);
    }
  }, [selectedMovie, watchStartTime, setValue]);

  // Function lấy rạp phim của phòng chiếu
  const getCinemaForHall = (hallId) => {
    if (!halls || !cinemas || !hallId) return null;
    const hall = halls.find(h => h.id.toString() === hallId.toString());
    if (!hall || !hall.cinemaId) return null;
    return cinemas.find(c => c.id === hall.cinemaId);
  };

  // Handle form submission
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Chuyển đổi dữ liệu
      const transformedData = {
        ...data,
        movieId: parseInt(data.movieId, 10),
        hallId: parseInt(data.hallId, 10),
        price: parseFloat(data.price),
        // Chuyển đổi thời gian theo đúng cách mà showtimeService mong muốn
        startTime: data.startTime ? dayjs(data.startTime).tz(VIETNAM_TIMEZONE).toDate() : null,
        endTime: data.endTime ? dayjs(data.endTime).tz(VIETNAM_TIMEZONE).toDate() : null
      };

      await onSubmit(transformedData);
      setSubmitSuccess(true);

      // Reset form nếu đang tạo mới
      if (isCreate) {
        reset({
          movieId: "",
          hallId: "",
          startTime: "",
          endTime: "",
          price: ""
        });
      }
    } catch (err) {
      console.error("Lỗi khi lưu suất chiếu:", err);
      setError(err.message || "Không thể lưu suất chiếu. Vui lòng thử lại sau.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-md p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {isCreate ? "Thêm suất chiếu mới" : "Chỉnh sửa suất chiếu"}
        </h2>
        {isCreate && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Vui lòng điền đầy đủ thông tin suất chiếu
          </p>
        )}
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Suất chiếu đã được lưu thành công!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phim */}
          <div>
            <label htmlFor="movieId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phim <span className="text-red-500">*</span>
            </label>
            <select
              id="movieId"
              className={`w-full px-3 py-2 border ${
                errors.movieId
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              {...register("movieId", {
                required: "Vui lòng chọn phim",
              })}
            >
              <option value="" disabled>Chọn phim</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title} {movie.duration ? `(${movie.duration} phút)` : ''}
                </option>
              ))}
            </select>
            {errors.movieId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.movieId.message}
              </p>
            )}
          </div>

          {/* Phòng chiếu */}
          <div>
            <label htmlFor="hallId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phòng chiếu <span className="text-red-500">*</span>
            </label>
            <select
              id="hallId"
              className={`w-full px-3 py-2 border ${
                errors.hallId
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              {...register("hallId", {
                required: "Vui lòng chọn phòng chiếu",
              })}
            >
              <option value="" disabled>Chọn phòng chiếu</option>
              {halls.map((hall) => {
                const cinema = getCinemaForHall(hall.id);
                return (
                  <option key={hall.id} value={hall.id}>
                    {hall.name} {cinema ? `(${cinema.name})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.hallId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.hallId.message}
              </p>
            )}
          </div>

          {/* Thời gian bắt đầu */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startTime"
              className={`w-full px-3 py-2 border ${
                errors.startTime
                  ? "border-red-500 dark:border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
              {...register("startTime", {
                required: "Vui lòng chọn thời gian bắt đầu",
              })}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.startTime.message}
              </p>
            )}
          </div>

          {/* Thời gian kết thúc (disabled) */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thời gian kết thúc
            </label>
            <input
              type="datetime-local"
              id="endTime"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              disabled
              {...register("endTime")}
            />
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Tự động tính dựa vào thời lượng phim
            </p>
          </div>

          {/* Giá vé */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Giá vé (VND) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                placeholder="Nhập giá vé"
                className={`w-full px-3 py-2 border ${
                  errors.price
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                {...register("price", {
                  required: "Vui lòng nhập giá vé",
                  min: { value: 0, message: "Giá vé không được âm" }
                })}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">VND</span>
              </div>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            type="button"
            onClick={() => navigate("/showtimes")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShowtimeForm;