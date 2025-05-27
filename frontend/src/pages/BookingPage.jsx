import React, { useState, useContext, useCallback } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { Card, Row, Col, Spin, Typography, Divider, App } from "antd"; // Thêm import App
import { HomeOutlined, VideoCameraOutlined, TagOutlined } from "@ant-design/icons";
import QuickBookingForm from "../components/common/QuickBookingForm";
import moment from "moment";

const { Title, Text } = Typography;

const BookingPage = () => {
  const { theme } = useContext(ThemeContext);
  const { notification } = App.useApp(); // Lấy notification từ App.useApp
  const [loading] = useState(false);
  const [selectedData, setSelectedData] = useState({
    movie: null,
    cinema: null,
    date: null,
    showtime: null,
  });

  const handleSelectionChange = useCallback((data) => {
    setSelectedData({
      movie: data.movie || null,
      cinema: data.cinema || null,
      date: data.date || null,
      showtime: data.showtime || null,
    });
  }, []);

  const formatShowtime = (showtime) => {
    if (!showtime) return "";
    return (
      moment(showtime.startTime).format("HH:mm") +
      ` - ${showtime.hallName || showtime.hall?.name || "Unknown Hall"}`
    );
  };

  const BreadcrumbNavigation = () => (
    <div className="breadcrumb-container mb-6">
      <div
        className={`flex items-center py-3 px-4 rounded-lg shadow-sm ${
          theme === "dark" ? "bg-dark-bg-secondary" : "bg-light-bg-secondary"
        }`}
      >
        <div className="flex items-center text-red-500 dark:text-red-400">
          <HomeOutlined className="mr-2" />
          <a href="/" className="text-red-500 dark:text-red-400 hover:underline font-medium">
            Trang chủ
          </a>
        </div>
        <div className="mx-2 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center text-red-500 dark:text-red-400">
          <VideoCameraOutlined className="mr-2" />
          <a
            href="/movies"
            className="text-red-500 dark:text-red-400 hover:underline font-medium"
          >
            Phim
          </a>
        </div>
        <div className="mx-2 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
        <div className="flex items-center font-medium">
          <TagOutlined className="mr-2 text-red-500 dark:text-red-400" />
          <span
            className={`${
              theme === "dark" ? "text-dark-text-primary" : "text-gray-700"
            }`}
          >
            Đặt vé
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-dark-bg" : "bg-light-bg"}`}>
      <div className="w-full mx-auto px-4 py-6 max-w-7xl">
        <BreadcrumbNavigation />
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8} className="order-1 lg:order-1">
            <div className="sticky top-24 z-40">
              <Card
                className={`content-card shadow-md mb-6 border ${
                  theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
                }`}
              >
                {selectedData.movie && selectedData.cinema && selectedData.date && selectedData.showtime ? (
                  <div className="flex flex-col">
                    <div className="flex items-start">
                      <div className="w-1/3 mr-4">
                        <img
                          src={
                            selectedData.movie.poster ||
                            selectedData.movie.posterUrl ||
                            selectedData.movie.image ||
                            "/fallback.jpg"
                          }
                          alt={selectedData.movie.title}
                          className="w-full rounded-lg shadow-sm object-cover"
                          style={{ aspectRatio: "2/3" }}
                        />
                      </div>
                      <div className="w-2/3">
                        <h3
                          className={`text-lg font-bold mb-3 line-clamp-2 ${
                            theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                          }`}
                        >
                          {selectedData.movie.title || "Unknown Movie"}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <span
                              className={`font-medium w-20 ${
                                theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                              }`}
                            >
                              Rạp:
                            </span>
                            <span
                              className={`flex-1 ${
                                theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                              }`}
                            >
                              {selectedData.cinema?.name || "Unknown Cinema"}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span
                              className={`font-medium w-20 ${
                                theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                              }`}
                            >
                              Phòng:
                            </span>
                            <span
                              className={`flex-1 ${
                                theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                              }`}
                            >
                              {selectedData.showtime?.hallName || selectedData.showtime?.hall?.name || "Unknown Hall"}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span
                              className={`font-medium w-20 ${
                                theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                              }`}
                            >
                              Suất chiếu:
                            </span>
                            <span
                              className={`flex-1 ${
                                theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                              }`}
                            >
                              {selectedData.date.format("DD/MM/YYYY")}
                            </span>
                          </div>
                          <div className="flex items-start">
                            <span
                              className={`font-medium w-20 ${
                                theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                              }`}
                            >
                              Thời gian:
                            </span>
                            <span
                              className={`flex-1 ${
                                theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                              }`}
                            >
                              {formatShowtime(selectedData.showtime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Text
                      className={`${
                        theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                      }`}
                    >
                      Vui lòng chọn đầy đủ rạp, ngày, phim và suất chiếu để xem thông tin
                    </Text>
                  </div>
                )}
              </Card>
            </div>
          </Col>
          <Col xs={24} lg={16} className="order-2 lg:order-2">
            <Card
              className={`content-card shadow-md border ${
                theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
              }`}
            >
              <Title
                level={2}
                className={`mb-6 ${
                  theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                }`}
              >
                Đặt Vé Xem Phim
              </Title>
              <Divider className="my-4" />
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spin size="large" className="loading-spinner" />
                  <Text
                    className={`mt-6 ${
                      theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                    }`}
                  >
                    Đang tải...
                  </Text>
                </div>
              ) : (
                <QuickBookingForm
                  onSelectionChange={handleSelectionChange}
                  notification={notification} // Truyền notification qua props
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default BookingPage;