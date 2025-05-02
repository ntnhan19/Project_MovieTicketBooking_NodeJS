// frontend/src/pages/MoviePage.jsx
import React, { useState, useEffect } from "react";
import { Tabs, Spin, Empty, Pagination, Input, Select, Radio } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import useMovies from "../hooks/useMovies";
import MovieList from "../components/Movies/MovieList";
import AppHeader from "../components/common/AppHeader";
import Footer from "../components/common/Footer";

const { TabPane } = Tabs;
const { Option } = Select;

const MoviePage = () => {
  // Lấy dữ liệu phim từ custom hook
  const { nowShowing, comingSoon, loading } = useMovies();

  // State cho việc lọc và hiển thị
  const [activeTab, setActiveTab] = useState("nowShowing");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [moviesPerPage] = useState(8); // Số phim hiển thị trên một trang
  const [genre, setGenre] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  // Danh sách thể loại phim (có thể lấy từ API hoặc định nghĩa sẵn)
  const genres = [
    { value: "all", label: "Tất cả thể loại" },
    { value: "action", label: "Hành động" },
    { value: "comedy", label: "Hài" },
    { value: "drama", label: "Tâm lý" },
    { value: "horror", label: "Kinh dị" },
    { value: "romance", label: "Tình cảm" },
    { value: "animation", label: "Hoạt hình" },
    { value: "adventure", label: "Phiêu lưu" },
  ];

  // Xử lý khi tab thay đổi
  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1); // Reset về trang đầu tiên khi chuyển tab
    setSearchTerm(""); // Reset tìm kiếm
    setGenre("all"); // Reset bộ lọc thể loại
    setSortBy("latest"); // Reset sắp xếp
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  };

  // Xử lý chọn thể loại
  const handleGenreChange = (value) => {
    setGenre(value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi thể loại
  };

  // Xử lý sắp xếp
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Lọc và cập nhật danh sách phim hiển thị
  useEffect(() => {
    let movies = activeTab === "nowShowing" ? nowShowing : comingSoon;

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      movies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo thể loại
    if (genre && genre !== "all") {
      movies = movies.filter(
        (movie) =>
          movie.genres &&
          movie.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    // Sắp xếp
    switch (sortBy) {
      case "latest":
        movies = [...movies].sort(
          (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)
        );
        break;
      case "oldest":
        movies = [...movies].sort(
          (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate)
        );
        break;
      case "name-asc":
        movies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        movies = [...movies].sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    setFilteredMovies(movies);
  }, [activeTab, nowShowing, comingSoon, searchTerm, genre, sortBy]);

  // Phân trang
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top khi đổi trang
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="main-content pb-16">
      <div className="movie-page-header py-16 bg-light-bg-primary">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-text-primary text-center">
            Phim Chiếu Rạp
          </h1>
          <div className="h-1 w-20 bg-button-gradient mx-auto mt-4 rounded"></div>
        </div>
      </div>

      <div className="container mx-auto mt-12">
        {/* Phần bộ lọc và tìm kiếm */}
        <div className="filter-search-container bg-white shadow-card rounded-lg mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ô tìm kiếm */}
            <div className="filter-item">
              <Input
                placeholder="Tìm kiếm phim..."
                suffix={<SearchOutlined />}
                value={searchTerm}
                onChange={handleSearch}
                className="h-11 rounded-md"
              />
            </div>

            {/* Lọc theo thể loại */}
            <div className="filter-item">
              <Select
                placeholder="Chọn thể loại"
                value={genre}
                onChange={handleGenreChange}
                className="w-full h-11"
                suffixIcon={<FilterOutlined />}
              >
                {genres.map((g) => (
                  <Option key={g.value} value={g.value}>
                    {g.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Sắp xếp */}
            <div className="filter-item col-span-1 md:col-span-2">
              <Radio.Group
                value={sortBy}
                onChange={handleSortChange}
                className="flex flex-wrap gap-2"
              >
                <Radio.Button value="latest" className="h-11 flex items-center">
                  Mới nhất
                </Radio.Button>
                <Radio.Button value="oldest" className="h-11 flex items-center">
                  Cũ nhất
                </Radio.Button>
                <Radio.Button
                  value="name-asc"
                  className="h-11 flex items-center"
                >
                  A-Z
                </Radio.Button>
                <Radio.Button
                  value="name-desc"
                  className="h-11 flex items-center"
                >
                  Z-A
                </Radio.Button>
              </Radio.Group>
            </div>
          </div>
        </div>

        {/* Tab phim đang chiếu và sắp chiếu */}
        <div className="movie-tabs mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            className="custom-tabs"
            centered
          >
            <TabPane tab="Phim Đang Chiếu" key="nowShowing" />
            <TabPane tab="Phim Sắp Chiếu" key="comingSoon" />
          </Tabs>
        </div>

        {/* Danh sách phim */}
        <div className="movies-list min-h-[500px]">
          {loading ? (
            <div className="flex justify-center items-center h-[500px]">
              <Spin size="large" />
            </div>
          ) : currentMovies.length > 0 ? (
            <>
              <MovieList movies={currentMovies} />

              {/* Phân trang */}
              <div className="pagination-container flex justify-center mt-12">
                <Pagination
                  current={currentPage}
                  pageSize={moviesPerPage}
                  total={filteredMovies.length}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-lg text-text-secondary">
                  {searchTerm
                    ? "Không tìm thấy phim phù hợp"
                    : activeTab === "nowShowing"
                    ? "Không có phim đang chiếu"
                    : "Không có phim sắp chiếu"}
                </span>
              }
              className="py-12"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePage;
