import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Rate,
  Button,
  Modal,
  Input,
  notification,
  Pagination,
  Card,
  Avatar,
  Divider,
  Spin,
  Progress,
  Empty,
  Checkbox,
  ConfigProvider,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
} from "@ant-design/icons";
import reviewApi from "../../api/reviewApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

const { TextArea } = Input;

const MovieReviews = ({ movieId }) => {
  const { currentUser, openAuthModal } = useAuth();
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const openLoginModal = useCallback(() => {
    openAuthModal('1');
  }, [openAuthModal]);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const reviewsPerPage = 5;

  const antdTheme = {
    token: {
      colorPrimary: "#e71a0f",
      fontFamily:
        "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      colorBgContainer: theme === "dark" ? "#1f2937" : "#ffffff",
      colorText: theme === "dark" ? "#d1d5db" : "#000000",
      colorTextSecondary: theme === "dark" ? "#d1d5db" : "#666666",
      colorBorder: theme === "dark" ? "#374151" : "rgba(0, 0, 0, 0.1)",
      colorTextPlaceholder: theme === "dark" ? "#a0aec0" : "#999999",
    },
    components: {
      Modal: {
        borderRadius: 12,
        colorBgContainer: theme === "dark" ? "#1f2937" : "#ffffff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      },
      Input: {
        borderRadius: 12,
        colorBgContainer: theme === "dark" ? "#374151" : "#ffffff",
        paddingBlock: 10,
        paddingInline: 12,
        colorText: theme === "dark" ? "#ffffff" : "#000000",
        hoverBorderColor: theme === "dark" ? "#e71a0f" : "#c41208",
        activeBorderColor: theme === "dark" ? "#e71a0f" : "#c41208",
      },
      Button: {
        borderRadius: 12,
        paddingBlock: 10,
      },
    },
  };

  const fetchReviewData = useCallback(async () => {
    if (!movieId) return;

    setLoadingReviews(true);

    try {
      const reviewsResponse = await reviewApi.getReviewsByMovie(
        movieId,
        currentPage,
        reviewsPerPage
      );
      const statsResponse = await reviewApi.getReviewStatsByMovie(movieId);

      setReviews(reviewsResponse.data || []);
      setTotalReviews(reviewsResponse.meta?.total || 0);
      setReviewStats(statsResponse || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      });

      if (currentUser && localStorage.getItem("token")) {
        setCheckingEligibility(true);
        try {
          const eligibilityResponse = await reviewApi.checkReviewEligibility(movieId);
          setCanReview(
            eligibilityResponse?.canReview === true ||
            eligibilityResponse?.hasTicket === true ||
            eligibilityResponse?.hasWatched === true
          );

          if (currentUser.id) {
            const myReviews = await reviewApi.getMyReviews();
            const myReview = Array.isArray(myReviews)
              ? myReviews.find(r => r.movieId === movieId)
              : null;

            setUserReview(myReview);
            if (myReview) {
              setNewReviewRating(myReview.rating);
              setNewReviewComment(myReview.comment || "");
              setIsAnonymous(myReview.isAnonymous || false);
            } else {
              setNewReviewRating(0);
              setNewReviewComment("");
              setIsAnonymous(false);
            }
          }
        } catch (error) {
          console.error("Error checking eligibility:", error);
          setCanReview(false);
          setUserReview(null);
        } finally {
          setCheckingEligibility(false);
        }
      }
    } catch (error) {
      console.error("Error fetching review data:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [
    movieId,
    currentPage,
    reviewsPerPage,
    currentUser,
  ]);

  useEffect(() => {
    fetchReviewData();
  }, [movieId, currentPage, currentUser, reviewsPerPage, fetchReviewData]);

  const handleSubmitReview = async () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    if (newReviewRating === 0) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá",
      });
      return;
    }

    const key = `submittingReview-${Date.now()}`;
    notification.open({
      key,
      message: "Đang xử lý",
      description: userReview ? "Đang cập nhật đánh giá..." : "Đang gửi đánh giá...",
      duration: 0,
    });

    try {
      const reviewData = {
        movieId: movieId,
        rating: newReviewRating,
        comment: newReviewComment,
        isAnonymous: isAnonymous,
      };

      if (userReview) {
        await reviewApi.updateReview(userReview.id, reviewData);
      } else {
        await reviewApi.createReview(reviewData);
      }

      notification.success({
        message: "Thành công",
        description: userReview ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!",
        duration: 3,
      });

      setIsReviewModalVisible(false);
      fetchReviewData();
    } catch (error) {
      notification.error({
        key,
        message: "Lỗi",
        description: error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá",
        duration: 3,
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewApi.deleteReview(reviewId);
      notification.success({
        message: "Thành công",
        description: "Đã xóa đánh giá",
      });
      fetchReviewData();
    } catch (error) {
      console.error("Error deleting review:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa đánh giá. Vui lòng thử lại sau.",
      });
    }
  };

  const handleEditReview = (review) => {
    setUserReview(review);
    setNewReviewRating(review.rating);
    setNewReviewComment(review.comment || "");
    setIsAnonymous(review.isAnonymous || false);
    setIsReviewModalVisible(true);
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderRatingDistribution = () => {
    if (!reviewStats || reviewStats.totalReviews === 0) return null;

    return (
      <div className="space-y-3 mt-4">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.ratingDistribution[star] || 0;
          const percentage = reviewStats.totalReviews
            ? Math.round((count / reviewStats.totalReviews) * 100)
            : 0;

          return (
            <div key={star} className="flex items-center">
              <span className="w-12 text-right mr-3 text-text-primary dark:text-dark-text-primary">{star} sao</span>
              <Progress
                percent={percentage}
                size="small"
                format={() => `${count}`}
                strokeColor="#e71a0f"
                trailColor={theme === "dark" ? "#4b5563" : "#e5e7eb"}
                className="flex-1"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleBookTicket = () => {
    navigate(`/movies/${movieId}`);
  };

  return (
    <div className="movie-reviews-section">
      {loadingReviews ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-card p-6 mb-8 animate-fadeIn">
            <div className="review-stats text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold text-red-500 dark:text-red-400">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <Rate
                  disabled
                  allowHalf
                  value={reviewStats.averageRating}
                  className="text-yellow-400 text-xl my-3"
                />
                <div className="text-text-secondary dark:text-dark-text-secondary">
                  ({reviewStats.totalReviews} đánh giá)
                </div>
              </div>
              {renderRatingDistribution()}
            </div>

            <div className="user-review-actions flex flex-col items-center justify-center p-4">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-semibold mb-2 text-text-primary dark:text-dark-text-primary">
                  Chia sẻ đánh giá của bạn
                </h3>
                <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                  {!currentUser
                    ? "Bạn cần đăng nhập để đánh giá"
                    : canReview
                    ? "Hãy chia sẻ cảm nhận của bạn về bộ phim này"
                    : "Bạn cần xem phim để đánh giá"}
                </p>
                <Rate
                  disabled={!currentUser || !canReview}
                  value={userReview?.rating || 0}
                  className="text-3xl mb-6 text-yellow-400"
                />
              </div>

              {checkingEligibility ? (
                <Spin />
              ) : !currentUser ? (
                <Button
                  type="primary"
                  size="large"
                  className="btn-primary"
                  onClick={openLoginModal}
                >
                  Đăng nhập để đánh giá
                </Button>
              ) : canReview ? (
                userReview ? (
                  <div className="flex gap-3">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEditReview(userReview)}
                      className="btn-primary"
                    >
                      Sửa đánh giá
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận xóa",
                          content: "Bạn có chắc chắn muốn xóa đánh giá này?",
                          okText: "Xóa",
                          cancelText: "Hủy",
                          okButtonProps: { danger: true },
                          onOk: () => handleDeleteReview(userReview.id),
                        });
                      }}
                      className="btn-outline"
                    >
                      Xóa đánh giá
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => setIsReviewModalVisible(true)}
                    size="large"
                    className="btn-primary"
                    icon={<StarOutlined />}
                  >
                    Viết đánh giá
                  </Button>
                )
              ) : (
                <Button
                  type="primary"
                  size="large"
                  className="btn-primary"
                  onClick={handleBookTicket}
                >
                  Đặt vé để đánh giá
                </Button>
              )}
            </div>
          </div>

          <Divider>
            <span className="text-xl font-semibold text-red-500 dark:text-red-400">
              Bình luận từ người xem
            </span>
          </Divider>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="content-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start">
                    <Avatar
                      icon={<UserOutlined />}
                      src={review.user?.avatar}
                      size={48}
                      className="mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-lg text-text-primary dark:text-dark-text-primary">
                            {review.isAnonymous ? "Người dùng ẩn danh" : (review.user?.name || "Người dùng")}
                          </div>
                          <div className="flex items-center">
                            <Rate
                              disabled
                              value={review.rating}
                              className="text-sm text-yellow-400"
                            />
                            <span className="text-text-secondary dark:text-dark-text-secondary text-sm ml-2">
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        {currentUser && ((review.user && currentUser.id === review.user.id) || currentUser.id === review.userId) && (
                          <div className="flex gap-2">
                            <Button
                              size="small"
                              type="primary"
                              icon={<EditOutlined />}
                              onClick={() => handleEditReview(review)}
                              className="btn-primary"
                            >
                              Sửa
                            </Button>
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                Modal.confirm({
                                  title: "Xác nhận xóa",
                                  content: "Bạn có chắc chắn muốn xóa đánh giá này?",
                                  okText: "Xóa",
                                  cancelText: "Hủy",
                                  okButtonProps: { danger: true },
                                  onOk: () => handleDeleteReview(review.id),
                                });
                              }}
                              className="btn-outline"
                            >
                              Xóa
                            </Button>
                          </div>
                        )}
                      </div>
                      {review.comment && (
                        <div className="mt-3 text-text-secondary dark:text-dark-text-secondary">
                          {review.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              <Pagination
                current={currentPage}
                pageSize={reviewsPerPage}
                total={totalReviews}
                onChange={(page) => setCurrentPage(page)}
                className="text-center mt-8"
              />
            </div>
          ) : (
            <Empty
              description={
                <span className="text-text-secondary dark:text-dark-text-secondary">
                  Chưa có đánh giá nào cho phim này
                </span>
              }
              className="py-12"
            />
          )}

          <ConfigProvider theme={antdTheme}>
            <Modal
              title={userReview ? "Cập nhật đánh giá" : "Viết đánh giá"}
              open={isReviewModalVisible}
              onCancel={() => {
                setIsReviewModalVisible(false);
                if (!userReview) {
                  setNewReviewRating(0);
                  setNewReviewComment("");
                  setIsAnonymous(false);
                }
              }}
              onOk={handleSubmitReview}
              okText={userReview ? "Cập nhật" : "Gửi đánh giá"}
              cancelText="Hủy"
              okButtonProps={{
                className: "btn-primary",
                disabled: newReviewRating === 0,
              }}
              cancelButtonProps={{
                className: "btn-outline",
              }}
              wrapClassName="custom-modal"
              getContainer={false}
              styles={{
                content: {
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  border: "none",
                },
                header: {
                  backgroundColor: "transparent",
                  borderBottom: "none",
                  padding: "16px 24px",
                },
                body: {
                  padding: "0 24px 16px 24px", // Giảm padding dưới để loại bỏ khoảng trống thừa
                  backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                  color: theme === "dark" ? "#d1d5db" : "#000000",
                },
                footer: {
                  padding: "16px 24px",
                },
              }}
            >
              <div className="mb-4"> {/* Giảm margin-bottom để giảm khoảng trống */}
                <div className="mb-2 font-medium text-text-primary dark:text-dark-text-primary">Đánh giá phim:</div>
                <Rate
                  value={newReviewRating}
                  onChange={(value) => setNewReviewRating(value)}
                  className="text-3xl text-yellow-400"
                />
                {newReviewRating === 0 && (
                  <div className="text-red-500 mt-1">
                    Vui lòng chọn số sao đánh giá
                  </div>
                )}
              </div>
              <div className="mb-4"> {/* Giảm margin-bottom */}
                <div className="mb-2 font-medium text-text-primary dark:text-dark-text-primary">Bình luận:</div>
                <TextArea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn về phim này..."
                  autoSize={{ minRows: 4, maxRows: 8 }}
                  className="form-input"
                />
              </div>
              <div className="mb-0"> {/* Loại bỏ margin-bottom ở phần cuối */}
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="text-text-primary dark:text-dark-text-primary"
                >
                  Đánh giá ẩn danh
                </Checkbox>
              </div>
            </Modal>
          </ConfigProvider>
        </>
      )}
    </div>
  );
};

export default MovieReviews;