import React, { useState, useEffect } from "react";
import {
  Tabs,
  Spin,
  Empty,
  Pagination,
  Input,
  Select,
  Drawer,
  Badge,
  Skeleton,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SortAscendingOutlined,
  StarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CloseOutlined,
  FireFilled,
  CalendarOutlined,
} from "@ant-design/icons";
import useMovies from "../hooks/useMovies";
import MovieList from "../components/Movies/MovieList";
import { genreApi } from "../api/genreApi";

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
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  // State cho responsive
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch danh sách thể loại từ API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const response = await genreApi.getAllGenres();
        if (response && Array.isArray(response)) {
          // Thêm option "Tất cả thể loại" vào đầu danh sách
          setGenres([
            { id: "all", name: "Tất cả thể loại" },
            ...response
          ]);
        } else {
          console.error("Dữ liệu thể loại không hợp lệ:", response);
          setGenres([{ id: "all", name: "Tất cả thể loại" }]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thể loại:", error);
        setGenres([{ id: "all", name: "Tất cả thể loại" }]);
      } finally {
        setLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Dùng để kiểm tra responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Lọc và cập nhật danh sách phim hiển thị
  useEffect(() => {
    let movies = activeTab === "nowShowing" ? nowShowing : comingSoon;
    
    if (!movies) return;

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
          movie.genres.some((g) => {
            const genreId = typeof g === "object" ? g.id : g;
            return genreId === genre;
          })
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
      case "rating-desc":
        movies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
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

  // Reset bộ lọc
  const resetFilters = () => {
    setSearchTerm("");
    setGenre("all");
    setSortBy("latest");
    setCurrentPage(1);
    if (isMobile) {
      setIsFilterDrawerOpen(false);
    }
  };

  // Render bộ lọc
  const renderFilters = () => (
    <div className="filter-container">
      {/* Ô tìm kiếm */}
      <div className="filter-item w-full mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Tìm kiếm
        </label>
        <Input
          placeholder="Nhập tên phim..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchTerm}
          onChange={handleSearch}
          className="h-12 rounded-lg shadow-sm border-gray-200 hover:border-primary focus:border-primary"
          allowClear
        />
      </div>

      {/* Lọc theo thể loại */}
      <div className="filter-item w-full mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Thể loại
        </label>
        {loadingGenres ? (
          <Skeleton.Input active size="large" className="w-full h-12" />
        ) : (
          <Select
            placeholder="Chọn thể loại"
            value={genre}
            onChange={handleGenreChange}
            className="w-full h-12"
            suffixIcon={<GlobalOutlined className="text-primary" />}
            popupClassName="rounded-lg shadow-card"
            optionFilterProp="children"
          >
            {genres.map((g) => (
              <Option key={g.id} value={g.id}>
                {g.name}
              </Option>
            ))}
          </Select>
        )}
      </div>

      {/* Sắp xếp */}
      <div className="filter-item w-full mb-4">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Sắp xếp theo
        </label>
        <Select
          value={sortBy}
          onChange={handleSortChange}
          className="w-full h-12"
          suffixIcon={<SortAscendingOutlined className="text-primary" />}
          popupClassName="rounded-lg shadow-card"
        >
          <Option value="latest">
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-primary" />
              Mới nhất
            </div>
          </Option>
          <Option value="oldest">
            <div className="flex items-center">
              <ClockCircleOutlined className="mr-2 text-text-secondary" />
              Cũ nhất
            </div>
          </Option>
          <Option value="name-asc">
            <div className="flex items-center">
              <ArrowUpOutlined className="mr-2 text-green-500" />
              Tên A-Z
            </div>
          </Option>
          <Option value="name-desc">
            <div className="flex items-center">
              <ArrowDownOutlined className="mr-2 text-blue-500" />
              Tên Z-A
            </div>
          </Option>
          <Option value="rating-desc">
            <div className="flex items-center">
              <StarOutlined className="mr-2 text-yellow-500" />
              Đánh giá cao nhất
            </div>
          </Option>
        </Select>
      </div>

      {/* Nút reset filter */}
      <div className="filter-item w-full">
        <button
          onClick={resetFilters}
          className="w-full py-3 px-6 bg-light-bg-secondary hover:bg-gray-200 text-text-primary font-medium rounded-lg transition-all flex items-center justify-center"
        >
          <CloseOutlined className="mr-2" />
          Đặt lại bộ lọc
        </button>
      </div>
    </div>
  );

  return (
    <div className="main-content pb-16 animate-fadeIn">
      {/* Header phần trang phim - Đã chỉnh sửa để nhỏ gọn hơn */}
      <div className="movie-page-header py-8 md:py-12 bg-gradient-to-r from-primary-dark via-primary to-primary-light relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-20"></div>
        <div className="container mx-auto relative z-10 px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center drop-shadow-sm">
            Phim Chiếu Rạp
          </h1>
          <div className="h-1 w-16 bg-white mx-auto mt-3 rounded-full"></div>
          <p className="text-center text-white text-opacity-90 mt-4 max-w-xl mx-auto leading-relaxed px-4 text-sm md:text-base">
            Khám phá những bộ phim mới nhất và hấp dẫn nhất đang chiếu và sắp
            chiếu tại rạp
          </p>
        </div>
      </div>

      {/* Phần chính của trang */}
      <div className="container max-w-7xl mx-auto mt-8 px-4">
        {/* Tab phim đang chiếu và sắp chiếu */}
        <div className="movie-tabs mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            className="custom-tabs"
            centered
            items={[
              {
                key: "nowShowing",
                label: (
                  <div className="px-4 py-2 font-medium text-base md:text-lg flex items-center">
                    <FireFilled className="mr-2 text-primary" />
                    Phim Đang Chiếu
                  </div>
                ),
              },
              {
                key: "comingSoon",
                label: (
                  <div className="px-4 py-2 font-medium text-base md:text-lg flex items-center">
                    <CalendarOutlined className="mr-2 text-primary" />
                    Phim Sắp Chiếu
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* Container cho bộ lọc và danh sách phim */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bộ lọc desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl shadow-card p-5 border border-gray-100 hover:shadow-card-hover transition-all">
              <h3 className="text-lg font-bold mb-5 pb-2 border-b border-gray-100 flex items-center">
                <FilterOutlined className="mr-2 text-primary" /> Bộ lọc
              </h3>
              {renderFilters()}
            </div>
          </div>

          {/* Bộ lọc mobile */}
          {isMobile && (
            <div className="filter-button-container mb-4">
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="w-full py-3 bg-white shadow-card rounded-lg flex items-center justify-center font-medium text-text-primary hover:shadow-card-hover transition-all"
              >
                <FilterOutlined className="mr-2 text-primary" /> Bộ lọc
                {(searchTerm || genre !== "all" || sortBy !== "latest") && (
                  <Badge count="!" className="ml-2" />
                )}
              </button>

              <Drawer
                title={
                  <div className="flex items-center text-lg font-bold">
                    <FilterOutlined className="mr-2 text-primary" /> Bộ lọc phim
                  </div>
                }
                placement="right"
                onClose={() => setIsFilterDrawerOpen(false)}
                open={isFilterDrawerOpen}
                width={300}
                className="filter-drawer"
                closeIcon={<CloseOutlined className="text-lg" />}
                footer={
                  <div className="flex justify-between">
                    <button
                      onClick={resetFilters}
                      className="flex-1 mr-2 py-2 px-4 bg-gray-100 text-text-primary rounded-lg"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="flex-1 ml-2 py-2 px-4 bg-primary text-white rounded-lg"
                    >
                      Áp dụng
                    </button>
                  </div>
                }
              >
                {renderFilters()}
              </Drawer>
            </div>
          )}

          {/* Danh sách phim */}
          <div className="lg:col-span-3">
            {/* Hiển thị kết quả tìm kiếm */}
            <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-3 shadow-sm">
              <div className="text-text-secondary">
                {loading ? (
                  <Skeleton.Input active size="small" className="w-24" />
                ) : (
                  <>
                    <span className="font-medium">{filteredMovies.length}</span>{" "}
                    phim tìm thấy
                    {(searchTerm || genre !== "all" || sortBy !== "latest") && (
                      <span className="ml-2 text-sm">
                        (đang lọc
                        {searchTerm && <span className="ml-1">theo từ khóa</span>}
                        {genre !== "all" && <span className="ml-1">theo thể loại</span>}
                        {sortBy !== "latest" && <span className="ml-1">và sắp xếp</span>})
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Sort select mobile/tablet */}
              {isMobile && (
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-44"
                  suffixIcon={<SortAscendingOutlined />}
                  bordered={true}
                  size="middle"
                  options={[
                    { value: "latest", label: "Mới nhất" },
                    { value: "oldest", label: "Cũ nhất" },
                    { value: "name-asc", label: "Tên A-Z" },
                    { value: "name-desc", label: "Tên Z-A" },
                    { value: "rating-desc", label: "Đánh giá cao" },
                  ]}
                />
              )}
            </div>

            {/* Hiển thị phim */}
            <div className="movies-list min-h-[500px]">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg overflow-hidden shadow-card border border-gray-100">
                      <Skeleton.Image active className="w-full h-64" />
                      <div className="p-4">
                        <Skeleton active paragraph={{ rows: 1 }} />
                        <Skeleton.Button active size="large" className="w-full mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentMovies.length > 0 ? (
                <>
                  <MovieList movies={currentMovies} />

                  {/* Phân trang */}
                  {filteredMovies.length > moviesPerPage && (
                    <div className="pagination-container flex justify-center mt-10">
                      <Pagination
                        current={currentPage}
                        pageSize={moviesPerPage}
                        total={filteredMovies.length}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        className="custom-pagination"
                      />
                    </div>
                  )}
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center">
                      <p className="text-lg text-text-secondary mb-2">
                        {searchTerm || genre !== "all"
                          ? "Không tìm thấy phim phù hợp với bộ lọc"
                          : activeTab === "nowShowing"
                          ? "Không có phim đang chiếu"
                          : "Không có phim sắp chiếu"}
                      </p>
                      {(searchTerm || genre !== "all" || sortBy !== "latest") && (
                        <button
                          onClick={resetFilters}
                          className="mt-4 py-2 px-6 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-button hover:shadow-button-hover"
                        >
                          <CloseOutlined className="mr-2" />
                          Đặt lại bộ lọc
                        </button>
                      )}
                    </div>
                  }
                  className="py-16"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePage;