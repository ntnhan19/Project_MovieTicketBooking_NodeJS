//src/components/Movies/MovieForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovie, createMovie, updateMovie } from "../../services/moviesApi";

const MovieForm = ({ mode, id }) => {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    genreIds: [],
    duration: "",
    description: "",
    poster: "",
    director: "",
    mainActors: "",
    releaseDate: new Date().toISOString().split("T")[0],
  });

  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

          setFormData({
            ...movie,
            genreIds,
            releaseDate: new Date(movie.releaseDate).toISOString().split("T")[0],
          });
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
  }, [isEditMode, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value));
    setFormData((prev) => ({ ...prev, genreIds: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      isEditMode ? await updateMovie(id, formData) : await createMovie(formData);
      navigate("/movies");
      window.location.reload(); // Có thể bỏ nếu dùng state quản lý smart hơn
    } catch (err) {
      console.error(err);
      setError(isEditMode ? "Cập nhật thất bại" : "Tạo phim thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-4">Đang tải...</div>;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow-lg max-w-lg mx-auto"
    >
      <h2 className="text-xl font-bold text-center">
        {isEditMode ? "Chỉnh sửa phim" : "Thêm phim mới"}
      </h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}

      {[
        { name: "title", placeholder: "Tên phim" },
        { name: "duration", placeholder: "Thời lượng (phút)", type: "number" },
        { name: "releaseDate", type: "date" },
        { name: "director", placeholder: "Đạo diễn" },
        { name: "mainActors", placeholder: "Diễn viên chính" },
        { name: "poster", placeholder: "URL Poster phim" },
      ].map(({ name, placeholder, type = "text" }) => (
        <div key={name}>
          <input
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            type={type}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thể loại (giữ Ctrl để chọn nhiều)
        </label>
        <select
          name="genreIds"
          multiple
          value={formData.genreIds}
          onChange={handleGenreChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          size={Math.min(5, genres.length)}
          required
        >
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      {formData.poster?.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/) && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500 mb-1">Xem trước:</p>
          <img
            src={formData.poster}
            alt="Poster preview"
            className="mx-auto max-w-xs max-h-96 object-contain border"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật phim" : "Tạo phim mới"}
      </button>
    </form>
  );
};

export default MovieForm;
