// admin/src/components/Movies/MovieForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import movieService from "../../services/movieService";
import genreService from "../../services/genreService";

const MovieForm = ({ mode, movieId, onSubmit, submitButtonText }) => {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();

  // State variables
  const [formData, setFormData] = useState({
    title: "",
    genreIds: [],
    duration: 90,
    description: "",
    poster: "",
    director: "",
    mainActors: "",
    trailerUrl: "",
    releaseDate: new Date().toISOString().split("T")[0],
  });

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [posterPreview, setPosterPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [trailerPreview, setTrailerPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch genres + movie (nếu edit)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch genres using genreService
        const genresResponse = await genreService.getList({
          pagination: { page: 1, perPage: 100 }, // Lấy tất cả genres
          sort: { field: "id", order: "ASC" },
        });
        setGenres(genresResponse.data.data || []);

        // Fetch movie if in edit mode
        if (isEditMode && movieId) {
          const movieResponse = await movieService.getOne(movieId);
          const movieData = movieResponse.data;

          if (movieData) {
            // Parse genreIds từ movieData
            const genreIds = movieData.genres?.map((g) => g.id) || [];

            setFormData({
              title: movieData.title || "",
              genreIds: genreIds,
              duration: movieData.duration || 90,
              description: movieData.description || "",
              poster: movieData.poster || "",
              bannerImage: movieData.bannerImage || "",
              director: movieData.director || "",
              mainActors: movieData.mainActors || "",
              trailerUrl: movieData.trailerUrl || "",
              releaseDate: movieData.releaseDate
                ? new Date(movieData.releaseDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            });

            // Set previews
            if (movieData.poster) setPosterPreview(movieData.poster);
            if (movieData.bannerImage) setBannerPreview(movieData.bannerImage);
            if (movieData.trailerUrl) setTrailerPreview(movieData.trailerUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrors((prev) => ({
          ...prev,
          form: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, movieId]);

  // Xử lý thay đổi trường form chung
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;
    if (type === "checkbox") {
      processedValue = checked;
    } else if (name === "duration") {
      processedValue = parseInt(value) || 0;
    }

    // Cập nhật preview khi URL thay đổi
    if (name === "poster") {
      if (value && value.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)) {
        setPosterPreview(value);
      } else {
        setPosterPreview("");
      }
    }

    if (name === "bannerImage") {
      // Thêm logic preview cho bannerImage
      if (value && value.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)) {
        setBannerPreview(value);
      } else {
        setBannerPreview("");
      }
    }

    if (name === "trailerUrl") {
      if (value && value.includes("youtube.com")) {
        setTrailerPreview(value);
      } else {
        setTrailerPreview("");
      }
    }

    setFormData({ ...formData, [name]: processedValue });

    // Xóa lỗi khi người dùng bắt đầu sửa trường
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Xử lý thay đổi thể loại phim (multiple select)
  const handleGenreChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData({ ...formData, genreIds: selectedOptions });

    // Xóa lỗi khi người dùng bắt đầu sửa trường
    if (errors.genreIds) {
      setErrors({ ...errors, genreIds: null });
    }
  };

  // Xác thực form trước khi submit
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Vui lòng nhập tên phim";
    }

    if (formData.duration < 1) {
      newErrors.duration = "Thời lượng phải lớn hơn 0 phút";
    }

    if (formData.duration > 500) {
      newErrors.duration = "Thời lượng không được vượt quá 500 phút";
    }

    if (!formData.director || formData.director.trim() === "") {
      newErrors.director = "Vui lòng nhập tên đạo diễn";
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = "Vui lòng chọn ngày ra mắt";
    }

    if (!formData.poster || formData.poster.trim() === "") {
      newErrors.poster = "Vui lòng nhập URL poster";
    } else if (
      !formData.poster.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)
    ) {
      newErrors.poster =
        "URL không hợp lệ. Phải là đường dẫn đến file hình ảnh";
    }

    // Xác thực bannerImage (không bắt buộc)
    if (
      formData.bannerImage &&
      !formData.bannerImage.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/)
    ) {
      newErrors.bannerImage =
        "URL không hợp lệ. Phải là đường dẫn đến file hình ảnh";
    }

    if (formData.trailerUrl && !formData.trailerUrl.includes("youtube.com")) {
      newErrors.trailerUrl = "Vui lòng nhập URL YouTube hợp lệ";
    }

    if (!formData.description || formData.description.trim() === "") {
      newErrors.description = "Vui lòng nhập mô tả phim";
    } else if (formData.description.length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }

    if (!formData.genreIds || formData.genreIds.length === 0) {
      newErrors.genreIds = "Vui lòng chọn ít nhất một thể loại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setErrors({});

      try {
        // Process data for API
        const processedData = {
          ...formData,
          duration: parseInt(formData.duration),
          genreIds: formData.genreIds.filter(
            (id) => id !== null && id !== undefined
          ),
        };

        await onSubmit(processedData);

        setSubmitSuccess(true);

        if (!isEditMode) {
          setTimeout(() => navigate("/movies"), 1500);
        }
      } catch (err) {
        console.error(err);
        setErrors({
          form: isEditMode ? "Cập nhật phim thất bại" : "Tạo phim thất bại",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading && isEditMode && !formData.title) {
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
      {errors.form && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tên phim"
              className={`w-full px-3 py-2 border ${
                errors.title
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
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
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="Nhập thời lượng"
              min="1"
              max="500"
              className={`w-full px-3 py-2 border ${
                errors.duration
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.duration}
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
              name="releaseDate"
              type="date"
              value={formData.releaseDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${
                errors.releaseDate
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.releaseDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.releaseDate}
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
              name="director"
              value={formData.director}
              onChange={handleChange}
              placeholder="Nhập tên đạo diễn"
              className={`w-full px-3 py-2 border ${
                errors.director
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.director && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.director}
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
              name="mainActors"
              value={formData.mainActors || ""}
              onChange={handleChange}
              placeholder="Nhập tên diễn viên chính"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
            {errors.mainActors && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.mainActors}
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
              name="trailerUrl"
              value={formData.trailerUrl || ""}
              onChange={handleChange}
              placeholder="Nhập URL trailer từ YouTube"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
            {errors.trailerUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.trailerUrl}
              </p>
            )}
          </div>

          {/* Thể loại */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="genreIds"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Thể loại (giữ Ctrl để chọn nhiều){" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              id="genreIds"
              name="genreIds"
              multiple
              value={formData.genreIds}
              onChange={handleGenreChange}
              className={`w-full px-3 py-2 border ${
                errors.genreIds
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              size={Math.min(5, genres.length)}
            >
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {errors.genreIds && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.genreIds}
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
              name="poster"
              value={formData.poster || ""}
              onChange={handleChange}
              placeholder="Nhập URL hình ảnh poster (tỷ lệ dọc, ví dụ: 3:4)"
              className={`w-full px-3 py-2 border ${
                errors.poster
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.poster && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.poster}
              </p>
            )}
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              Phải là URL hợp lệ của ảnh (jpg, png, gif, webp), tỷ lệ dọc để
              hiển thị tốt trong danh sách phim.
            </p>
          </div>

          {/* URL Banner Image */}
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="bannerImage"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              URL Banner Image (không bắt buộc)
            </label>
            <input
              id="bannerImage"
              name="bannerImage"
              value={formData.bannerImage || ""}
              onChange={handleChange}
              placeholder="Nhập URL hình ảnh banner (tỷ lệ ngang, ví dụ: 16:9 hoặc 1200x300px)"
              className={`w-full px-3 py-2 border ${
                errors.bannerImage
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
            />
            {errors.bannerImage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.bannerImage}
              </p>
            )}
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              Phải là URL hợp lệ của ảnh (jpg, png, gif, webp), tỷ lệ ngang để
              hiển thị tốt trong carousel banner.
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
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Nhập mô tả cho phim"
              className={`w-full px-3 py-2 border ${
                errors.description
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Previews Section */}
        {(posterPreview || bannerPreview || trailerPreview) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Poster Preview */}
            {posterPreview && (
              <div className="border border-border dark:border-border-dark rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">
                  Xem trước poster:
                </h3>
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="max-w-full max-h-80 object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = "/assets/images/placeholder.png";
                    e.target.alt = "Hình ảnh không tồn tại";
                  }}
                />
              </div>
            )}

            {/* Banner Preview */}
            {bannerPreview && (
              <div className="border border-border dark:border-border-dark rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">
                  Xem trước banner:
                </h3>
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="max-w-full max-h-80 object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.src = "/assets/images/placeholder.png";
                    e.target.alt = "Hình ảnh không tồn tại";
                  }}
                />
              </div>
            )}

            {/* Trailer Preview */}
            {trailerPreview && (
              <div className="border border-border dark:border-border-dark rounded-lg p-4 flex flex-col items-center">
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3">
                  Xem trước trailer:
                </h3>
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
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              submitButtonText ||
              (isEditMode ? "Cập nhật phim" : "Tạo phim mới")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
