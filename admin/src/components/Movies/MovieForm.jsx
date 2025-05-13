// admin/src/components/Movies/MovieForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getMovie, createMovie, updateMovie } from "../../services/movieService";

const MovieForm = ({ mode, id }) => {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();

  // State variables
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [posterPreview, setPosterPreview] = useState("");
  const [trailerPreview, setTrailerPreview] = useState("");

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      genreIds: [],
      duration: 90,
      description: "",
      poster: "",
      director: "",
      mainActors: "",
      trailerUrl: "",
      releaseDate: new Date().toISOString().split("T")[0],
    }
  });

  // Watch poster and trailer URL for preview
  const posterUrl = watch("poster");
  const trailerUrl = watch("trailerUrl");

  // Xử lý preview khi URL thay đổi
  useEffect(() => {
    if (posterUrl && posterUrl.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)) {
      setPosterPreview(posterUrl);
    } else {
      setPosterPreview("");
    }
  }, [posterUrl]);

  useEffect(() => {
    if (trailerUrl && trailerUrl.includes("youtube.com")) {
      setTrailerPreview(trailerUrl);
    } else {
      setTrailerPreview("");
    }
  }, [trailerUrl]);

  // Fetch genres + movie (nếu edit)
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/genres");
        const data = await res.json();
        setGenres(data);
      } catch (err) {
        console.error("Lỗi khi tải thể loại:", err);
      }
    };

    const fetchMovie = async () => {
      if (isEditMode && id) {
        setLoading(true);
        try {
          const movie = await getMovie(id);
          const genreIds = movie.genres?.map((g) => g.id) || [];

          // Điền dữ liệu vào form
          Object.entries(movie).forEach(([key, value]) => {
            if (key === "genres") {
              setValue("genreIds", genreIds);
            } else if (key === "releaseDate") {
              setValue(key, new Date(value).toISOString().split("T")[0]);
            } else {
              setValue(key, value);
            }
          });
          
          // Set poster preview if available
          if (movie.poster && movie.poster.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)) {
            setPosterPreview(movie.poster);
          }
          
          // Set trailer preview if available
          if (movie.trailerUrl && movie.trailerUrl.includes("youtube.com")) {
            setTrailerPreview(movie.trailerUrl);
          }
        } catch (err) {
          console.error(err);
          setError("Không thể tải thông tin phim");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGenres();
    fetchMovie();
  }, [isEditMode, id, setValue]);

  // Handle form submission
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Convert genre IDs to integers
      data.genreIds = data.genreIds.map(id => parseInt(id));
      
      // Process data for API
      const processedData = {
        ...data,
        duration: parseInt(data.duration),
      };

      if (isEditMode) {
        await updateMovie(id, processedData);
      } else {
        await createMovie(processedData);
      }
      
      setSubmitSuccess(true);
      
      if (!isEditMode) {
        // Navigate after short delay for better UX
        setTimeout(() => navigate("/movies"), 1500);
      }
    } catch (err) {
      console.error(err);
      setError(isEditMode ? "Cập nhật phim thất bại" : "Tạo phim thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !watch("title")) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          {isEditMode ? "Chỉnh sửa phim" : "Thêm phim mới"}
        </h2>
        {!isEditMode && (
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Điền đầy đủ thông tin để tạo phim mới.
          </p>
        )}
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">
            {isEditMode
              ? "Phim đã được cập nhật thành công!"
              : "Phim đã được tạo thành công!"}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên phim */}
          <div className="col-span-1 md:col-span-2">
            <label 
              htmlFor="title" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Tên phim <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              placeholder="Nhập tên phim"
              className={`w-full px-3 py-2 border ${
                errors.title
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("title", {
                required: "Vui lòng nhập tên phim",
                maxLength: {
                  value: 200,
                  message: "Tên phim không được vượt quá 200 ký tự",
                },
              })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Thời lượng */}
          <div>
            <label 
              htmlFor="duration" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Thời lượng (phút) <span className="text-red-500">*</span>
            </label>
            <input
              id="duration"
              type="number"
              placeholder="Nhập thời lượng"
              className={`w-full px-3 py-2 border ${
                errors.duration
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("duration", {
                required: "Vui lòng nhập thời lượng",
                min: {
                  value: 1,
                  message: "Thời lượng phải lớn hơn 0 phút",
                },
                max: {
                  value: 500,
                  message: "Thời lượng không được vượt quá 500 phút",
                },
              })}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Ngày phát hành */}
          <div>
            <label 
              htmlFor="releaseDate" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Ngày ra mắt <span className="text-red-500">*</span>
            </label>
            <input
              id="releaseDate"
              type="date"
              className={`w-full px-3 py-2 border ${
                errors.releaseDate
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("releaseDate", {
                required: "Vui lòng chọn ngày ra mắt",
              })}
            />
            {errors.releaseDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.releaseDate.message}
              </p>
            )}
          </div>

          {/* Đạo diễn */}
          <div>
            <label 
              htmlFor="director" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Đạo diễn <span className="text-red-500">*</span>
            </label>
            <input
              id="director"
              placeholder="Nhập tên đạo diễn"
              className={`w-full px-3 py-2 border ${
                errors.director
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("director", {
                required: "Vui lòng nhập tên đạo diễn",
                maxLength: {
                  value: 100,
                  message: "Tên đạo diễn không được vượt quá 100 ký tự",
                },
              })}
            />
            {errors.director && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.director.message}
              </p>
            )}
          </div>

          {/* Diễn viên chính */}
          <div>
            <label 
              htmlFor="mainActors" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Diễn viên chính
            </label>
            <input
              id="mainActors"
              placeholder="Nhập tên diễn viên chính"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("mainActors", {
                maxLength: {
                  value: 200,
                  message: "Tên diễn viên không được vượt quá 200 ký tự",
                },
              })}
            />
            {errors.mainActors && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.mainActors.message}
              </p>
            )}
          </div>

          {/* Trailer URL */}
          <div className="col-span-1 md:col-span-2">
            <label 
              htmlFor="trailerUrl" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              URL Trailer (YouTube)
            </label>
            <input
              id="trailerUrl"
              placeholder="Nhập URL trailer từ YouTube"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("trailerUrl", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be).+$/,
                  message: "Vui lòng nhập URL YouTube hợp lệ",
                },
              })}
            />
            {errors.trailerUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.trailerUrl.message}
              </p>
            )}
          </div>

          {/* Thể loại */}
          <div className="col-span-1 md:col-span-2">
            <label 
              htmlFor="genreIds" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Thể loại (giữ Ctrl để chọn nhiều) <span className="text-red-500">*</span>
            </label>
            <select
              id="genreIds"
              multiple
              className={`w-full px-3 py-2 border ${
                errors.genreIds
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              size={Math.min(5, genres.length)}
              {...register("genreIds", {
                required: "Vui lòng chọn ít nhất một thể loại",
                validate: value => value.length > 0 || "Vui lòng chọn ít nhất một thể loại"
              })}
            >
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {errors.genreIds && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.genreIds.message}
              </p>
            )}
          </div>

          {/* URL Poster */}
          <div className="col-span-1 md:col-span-2">
            <label 
              htmlFor="poster" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              URL Poster <span className="text-red-500">*</span>
            </label>
            <input
              id="poster"
              placeholder="Nhập URL hình ảnh poster"
              className={`w-full px-3 py-2 border ${
                errors.poster
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("poster", {
                required: "Vui lòng nhập URL poster",
                pattern: {
                  value: /^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/,
                  message: "URL không hợp lệ. Phải là đường dẫn đến file hình ảnh",
                },
              })}
            />
            {errors.poster && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.poster.message}
              </p>
            )}
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              Phải là URL hợp lệ của ảnh (jpg, png, gif, webp)
            </p>
          </div>

          {/* Mô tả */}
          <div className="col-span-1 md:col-span-2">
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              placeholder="Nhập mô tả cho phim"
              className={`w-full px-3 py-2 border ${
                errors.description
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              rows={4}
              {...register("description", {
                required: "Vui lòng nhập mô tả phim",
                minLength: {
                  value: 10,
                  message: "Mô tả phải có ít nhất 10 ký tự",
                },
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Previews Section */}
        {(posterPreview || trailerPreview) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Poster Preview */}
            {posterPreview && (
              <div className="border border-border dark:border-border-dark rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">Xem trước poster:</h3>
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="max-w-full max-h-80 object-contain rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Trailer Preview */}
            {trailerPreview && (
              <div className="border border-border dark:border-border-dark rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">Xem trước trailer:</h3>
                <div className="w-full aspect-video">
                  <iframe
                    src={trailerPreview.replace("watch?v=", "embed/")}
                    title="YouTube video player"
                    className="w-full h-full rounded-lg shadow-md"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-border dark:border-border-dark pt-6">
          <button
            type="button"
            onClick={() => navigate("/movies")}
            className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
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
            ) : isEditMode ? (
              "Cập nhật phim"
            ) : (
              "Tạo phim mới"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;