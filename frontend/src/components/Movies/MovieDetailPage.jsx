import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Spin,
  Button,
  Rate,
  Tag,
  Tabs,
  Modal,
  Divider,
  Typography,
  Select,
  Empty,
  notification,
  Card,
  message,
} from "antd";
import {
  PlayCircleOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  TeamOutlined,
  StarOutlined,
  CloseOutlined,
  TagOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { movieApi } from "../../api/movieApi";
import { showtimeApi } from "../../api/showtimeApi";
import { cinemaApi } from "../../api/cinemaApi";
import { genreApi } from "../../api/genreApi";
import MovieList from "./MovieList";
import MovieReviews from "../../components/Movies/MovieReviews";
import { useAuth } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { theme } = useContext(ThemeContext);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [otherNowShowingMovies, setOtherNowShowingMovies] = useState([]);
  const [trailerModal, setTrailerModal] = useState({ visible: false, url: "" });
  const [activeTab, setActiveTab] = useState("1");

  // Các state cho phần đặt vé
  const [cinemas, setCinemas] = useState([]);
  const [genreDetails, setGenreDetails] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Lấy thông tin phim từ API
  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        setLoading(true);
        const movieData = await movieApi.getMovieById(id);
        setMovie(movieData);

        // Fetch chi tiết thể loại nếu genres là mảng ID
        if (movieData.genres && Array.isArray(movieData.genres)) {
          if (typeof movieData.genres[0] !== "object") {
            const genrePromises = movieData.genres.map((genreId) =>
              genreApi.getGenreById(genreId).catch((err) => {
                console.error(
                  `Lỗi khi lấy thông tin thể loại ${genreId}:`,
                  err
                );
                return null;
              })
            );
            const genreResults = await Promise.all(genrePromises);
            const validGenres = genreResults.filter((genre) => genre !== null);
            setGenreDetails(validGenres);
          } else {
            setGenreDetails(movieData.genres);
          }

          try {
            const nowShowingData = await movieApi.getNowShowing();
            const otherNowShowingMovies = nowShowingData
              .filter((m) => m.id !== id) // Loại bỏ phim hiện tại
              .slice(0, 4); // Giới hạn 4 phim
            setOtherNowShowingMovies(otherNowShowingMovies);

            if (movieData.genres && movieData.genres.length > 0) {
              const firstGenreId =
                typeof movieData.genres[0] === "object"
                  ? movieData.genres[0].id
                  : movieData.genres[0];
              const { data: similarMoviesData } =
                await movieApi.filterMoviesByGenre(firstGenreId);
              const filteredSimilarMovies = similarMoviesData.filter(
                (m) => m.id !== id
              );
              setSimilarMovies(filteredSimilarMovies.slice(0, 4));
            } else {
              setSimilarMovies([]);
            }
          } catch (error) {
            console.error(
              "Lỗi khi tải phim đang chiếu hoặc phim tương tự:",
              error
            );
            setSimilarMovies([]);
            setOtherNowShowingMovies([]);
          }
        }

        try {
          const cinemasData = await cinemaApi.getAllCinemas();
          setCinemas(cinemasData || []);
        } catch (error) {
          console.error("Error fetching cinemas:", error);
          setCinemas([]);
          notification.error({
            message: "Lỗi",
            description: "Không thể tải danh sách rạp. Vui lòng thử lại sau.",
          });
        }
      } catch (error) {
        console.error("Error fetching movie detail:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông tin phim. Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
      window.scrollTo(0, 0);
    }
  }, [id]);

  // Effect khi chọn rạp, lấy ngày có suất chiếu
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!selectedCinema || !id) return;

      try {
        setLoadingShowtimes(true);
        const dates = await showtimeApi.getAvailableDates(id, selectedCinema);
        setAvailableDates(dates || []);
        if (dates && dates.length > 0) {
          setSelectedDate(dates[0]);
        } else {
          setSelectedDate(null);
        }
      } catch (error) {
        console.error("Error fetching available dates:", error);
        const today = new Date();
        const mockDates = [
          today.toISOString().split("T")[0],
          new Date(today.setDate(today.getDate() + 1))
            .toISOString()
            .split("T")[0],
          new Date(today.setDate(today.getDate() + 1))
            .toISOString()
            .split("T")[0],
        ];
        setAvailableDates(mockDates);
        setSelectedDate(mockDates[0]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchAvailableDates();
  }, [selectedCinema, id]);

  // Effect khi chọn ngày, lấy danh sách suất chiếu
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!selectedCinema || !selectedDate || !id) return;

      try {
        setLoadingShowtimes(true);
        const showtimesData = await showtimeApi.getShowtimesByFilters(
          id,
          selectedCinema,
          selectedDate
        );
        if (showtimesData && Array.isArray(showtimesData)) {
          setShowtimes(showtimesData);
        } else {
          setShowtimes([]);
          notification.warning({
            message: "Thông báo",
            description: "Không có suất chiếu nào trong ngày đã chọn.",
          });
        }
      } catch (error) {
        console.error("Error fetching showtimes:", error);
        setShowtimes([]);
        notification.error({
          message: "Lỗi",
          description:
            "Không thể tải danh sách suất chiếu. Vui lòng thử lại sau.",
        });
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, selectedCinema, id]);

  // Hàm xử lý hiển thị trailer
  const showTrailer = (url) => {
    if (!url) return;

    let embedUrl = url;
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1].split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    setTrailerModal({
      visible: true,
      url: embedUrl,
    });
  };

  const closeTrailer = () => {
    setTrailerModal({
      visible: false,
      url: "",
    });
  };

  const handleCinemaChange = (cinemaId) => {
    setSelectedCinema(cinemaId);
    setSelectedDate(null);
    setShowtimes([]);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSelectShowtime = (showtimeId) => {
    if (!isAuthenticated) {
      openAuthModal("1", `/booking/seats/${showtimeId}`);
      message.warning("Vui lòng đăng nhập để đặt vé");
      return;
    }
    navigate(`/booking/seats/${showtimeId}`);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Chưa cập nhật";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs > 0 ? `${hrs} giờ ` : ""}${mins > 0 ? `${mins} phút` : ""}`;
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const weekdays = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const weekday = weekdays[date.getDay()];
    return `${weekday}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const tabItems = [
    {
      key: "1",
      label: <span>Tổng quan</span>,
      children: (
        <div className="p-4">
          <Title level={3} className="mb-6 font-bold text-red-500">
            Nội dung phim
          </Title>
          <Paragraph className="text-base leading-relaxed">
            {movie?.description ||
              movie?.overview ||
              "Chưa có thông tin nội dung phim."}
          </Paragraph>

          {movie?.cast && movie?.cast.length > 0 && (
            <>
              <Divider />
              <Title level={3} className="mb-6 font-bold text-red-500">
                Diễn viên chính
              </Title>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movie.cast.map((actor, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 mx-auto shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <img
                        src={actor.image || "/default-avatar.jpg"}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Text strong className="block text-base">
                      {actor.name}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {actor.character}
                    </Text>
                  </div>
                ))}
              </div>
            </>
          )}

          {(!movie?.cast || movie?.cast.length === 0) && movie?.mainActors && (
            <>
              <Divider />
              <Title level={3} className="mb-6 font-bold text-red-500">
                Diễn viên chính
              </Title>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movie.mainActors.split(",").map((actor, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-24 h-24 rounded-full overflow-hidden mb-3 mx-auto shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 bg-gray-100 flex items-center justify-center">
                      <UserOutlined style={{ fontSize: 32, color: "#ccc" }} />
                    </div>
                    <Text strong className="block text-base">
                      {actor.trim()}
                    </Text>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: <span>Lịch chiếu & Đặt vé</span>,
      children: (
        <div className="p-4">
          <Title level={3} className="mb-6 font-bold text-red-500">
            Đặt vé xem phim
          </Title>

          <div className="mb-6">
            <Text strong className="block mb-2 text-lg">
              Chọn rạp
            </Text>
            <Select
              showSearch
              placeholder="Chọn rạp phim"
              optionFilterProp="children"
              className="w-full booking-select"
              onChange={handleCinemaChange}
              value={selectedCinema}
              size="large"
              listHeight={400}
              popupMatchSelectWidth={false}
              styles={{
                popup: {
                  root: { minWidth: "400px", maxWidth: "90vw" },
                },
              }}
              getPopupContainer={(trigger) => trigger.parentElement}
            >
              {cinemas.map((cinema) => (
                <Option key={cinema.id} value={cinema.id}>
                  <div className="py-2 px-2 flex flex-col booking-option-item">
                    <div className="font-medium text-base mb-1 truncate">
                      {cinema.name}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {selectedCinema && (
            <div className="mb-6">
              <Text strong className="block mb-2 text-lg">
                Chọn ngày
              </Text>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {loadingShowtimes ? (
                  <div className="col-span-full flex justify-center py-8">
                    <div className="text-center">
                      <Spin size="large" />
                      <div className="mt-2">Đang tải lịch chiếu...</div>
                    </div>
                  </div>
                ) : availableDates.length > 0 ? (
                  availableDates.map((date, index) => (
                    <Button
                      key={index}
                      type={selectedDate === date ? "primary" : "default"}
                      onClick={() => handleDateChange(date)}
                      className={`h-auto py-2 flex flex-col items-center justify-center booking-date-btn ${
                        selectedDate === date ? "border-red-500" : ""
                      }`}
                    >
                      <div className="font-bold">
                        {formatDisplayDate(date).split(",")[0]}
                      </div>
                      <div>{formatDisplayDate(date).split(",")[1]}</div>
                    </Button>
                  ))
                ) : (
                  <div className="col-span-full py-6 text-center">
                    <Empty description="Không có lịch chiếu cho phim này tại rạp đã chọn" />
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedDate && (
            <div className="mb-6">
              <Text strong className="block mb-4 text-lg">
                Chọn suất chiếu
              </Text>
              {loadingShowtimes ? (
                <div className="flex justify-center py-8">
                  <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-2">Đang tải suất chiếu...</div>
                  </div>
                </div>
              ) : showtimes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {showtimes.map((showtime) => (
                    <Card
                      key={showtime.id}
                      hoverable
                      className="text-center border border-gray-200 hover:border-red-500 hover:shadow-md transition-all duration-300 booking-showtime-card"
                      onClick={() => handleSelectShowtime(showtime.id)}
                    >
                      <div className="font-bold text-lg">{showtime.time}</div>
                      <div className="text-xs text-gray-500">
                        {showtime.room}
                      </div>
                      <Tag color="blue" className="mt-2">
                        {showtime.format}
                      </Tag>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <Empty description="Không có suất chiếu vào ngày đã chọn" />
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "3",
      label: <span>Bình luận & Đánh giá</span>,
      children: (
        <div className="p-4">
          <Title level={3} className="mb-6 font-bold text-red-500">
            Bình luận & Đánh giá
          </Title>
          <MovieReviews movieId={id} onChangeTab={setActiveTab} />
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-2">Đang tải suất chiếu...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <Empty
          description="Không tìm thấy thông tin phim"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Link to="/movies" className="mt-6">
          <Button type="primary" size="large">
            Quay lại danh sách phim
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="relative">
        <div
          className="relative w-full h-96 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              movie.poster ||
              movie.posterUrl ||
              movie.backdropUrl ||
              movie.backdrop ||
              "/movie-backdrop-default.jpg"
            })`,
            backgroundPosition: "center 20%",
          }}
        >
          <div className="absolute inset-0 bg-banner-overlay"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {movie.trailerUrl && (
              <Button
                onClick={() => showTrailer(movie.trailerUrl)}
                className="trailer-btn flex items-center justify-center gap-2 px-8 py-3 bg-red-500 text-white rounded-full border-none shadow-button hover:shadow-button-hover transition-all transform hover:scale-105 hover:-translate-y-1"
              >
                <PlayCircleOutlined className="text-xl" />
                <span className="text-lg font-medium">Xem Trailer</span>
              </Button>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row -mt-32 relative z-10">
            <div className="md:w-1/4 flex-shrink-0 mb-6 md:mb-0">
              <div
                className={`w-full aspect-[2/3] ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-xl overflow-hidden`}
              >
                <img
                  src={
                    movie.poster ||
                    movie.posterUrl ||
                    "/movie-poster-default.jpg"
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-3/4 md:pl-8 md:pt-32 bg-transparent">
              <div
                className={`rounded-lg shadow-lg p-6 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
                {movie.originalTitle && (
                  <h2 className="text-xl mb-4">{movie.originalTitle}</h2>
                )}
                {movie.rating && (
                  <div className="flex items-center mb-4">
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={movie.rating / 2}
                      className="text-yellow-400 text-lg"
                    />
                    <span className="ml-2 text-lg font-medium">
                      {movie.rating}/10
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                  <div className="flex items-center">
                    <CalendarOutlined className="text-lg mr-3 text-red-500" />
                    <span className="mr-2 font-medium">Khởi chiếu:</span>
                    <span>{formatReleaseDate(movie.releaseDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <FieldTimeOutlined className="text-lg mr-3 text-red-500" />
                    <span className="mr-2 font-medium">Thời lượng:</span>
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <TeamOutlined className="text-lg mr-3 text-red-500" />
                    <span className="mr-2 font-medium">Đạo diễn:</span>
                    <span>{movie.director || "Chưa cập nhật"}</span>
                  </div>
                  {movie.mainActors && (
                    <div className="flex items-center">
                      <UserOutlined className="text-lg mr-3 text-red-500" />
                      <span className="mr-2 font-medium">Diễn viên:</span>
                      <span className="truncate">{movie.mainActors}</span>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <TagOutlined className="text-lg mr-3 text-red-500" />
                    <span className="font-medium mr-2">Thể loại:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 movie-detail-tags">
                    {genreDetails && genreDetails.length > 0 ? (
                      genreDetails.map((genre, index) => (
                        <Tag
                          key={index}
                          className="px-3 py-1.5 text-sm rounded-full"
                        >
                          {genre.name}
                        </Tag>
                      ))
                    ) : movie.genres && movie.genres.length > 0 ? (
                      movie.genres.map((genre, index) => (
                        <Tag
                          key={index}
                          className="px-3 py-1.5 text-sm rounded-full"
                        >
                          {typeof genre === "object" ? genre.name : genre}
                        </Tag>
                      ))
                    ) : (
                      <span>Chưa cập nhật</span>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="line-clamp-3">
                    {movie?.description ||
                      movie?.overview ||
                      "Chưa có thông tin nội dung phim."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto py-12 px-4" id="booking-section">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className={`movie-detail-tabs ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-800"
              } rounded-lg shadow-lg p-4 animate-fadeIn`}
              items={tabItems}
            />
          </Col>
          <Col xs={24} lg={8}>
            <div
              className={`bg-${
                theme === "dark" ? "gray-800" : "white"
              } rounded-lg shadow-lg p-6 mb-6 animate-fadeIn`}
            >
              <Title level={4} className="mb-4 text-red-500 font-bold">
                Phim cùng thể loại
              </Title>
              {similarMovies.length > 0 ? (
                <div className="space-y-4">
                  {similarMovies.map((movie) => (
                    <Link to={`/movies/${movie.id}`} key={movie.id}>
                      <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="w-16 h-24 overflow-hidden rounded-md flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                          <img
                            src={
                              movie.poster ||
                              movie.posterUrl ||
                              "/movie-poster-default.jpg"
                            }
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="font-bold group-hover:text-red-500 transition-colors">
                            {movie.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {movie.genres && movie.genres.length > 0
                              ? movie.genres
                                  .map((genre) =>
                                    typeof genre === "object"
                                      ? genre.name
                                      : genre
                                  )
                                  .slice(0, 2)
                                  .join(", ")
                              : "Chưa cập nhật"}
                          </div>
                          {movie.rating && (
                            <div className="flex items-center mt-1">
                              <StarOutlined className="text-yellow-400 mr-1 text-xs" />
                              <span className="text-xs">{movie.rating}/10</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty description="Không có phim tương tự" />
              )}
              <div className="mt-4 text-center">
                <Link to="/movies">
                  <Button type="default" className="mt-4 text-red-500">
                    Xem tất cả phim
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <Title level={3} className="mb-0 font-bold text-red-500">
              Phim đang chiếu khác
            </Title>
            <Link to="/movies">
              <Button type="link" className="text-red-500">
                Xem tất cả
              </Button>
            </Link>
          </div>
          {otherNowShowingMovies.length > 0 ? (
            <MovieList movies={otherNowShowingMovies} />
          ) : (
            <div className="text-center py-12">
              <Empty description="Không có phim đang chiếu khác hiện tại" />
            </div>
          )}
        </div>
      </div>
      <Modal
        title={null}
        open={trailerModal.visible}
        onCancel={closeTrailer}
        afterClose={() => setTrailerModal((prev) => ({ ...prev, url: "" }))}
        footer={null}
        width="80%"
        centered
        className="trailer-modal"
        closeIcon={
          <Button
            type="default"
            shape="circle"
            icon={<CloseOutlined />}
            className="bg-white/20 text-white hover:bg-white/40 hover:text-white border-none"
          />
        }
        destroyOnHidden={true}
        styles={{ body: { padding: 0 } }}
      >
        <div
          className="responsive-iframe-container"
          style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
        >
          {trailerModal.url && (
            <iframe
              title="Movie Trailer"
              src={`${trailerModal.url}?autoplay=1`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MovieDetailPage;
