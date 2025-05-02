import React, { useState, useEffect } from "react";
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

const { TextArea } = Input;

const MovieReviews = ({ movieId }) => {
  // Auth context và navigate
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // States
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
  const reviewsPerPage = 5;
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Hàm fetching reviews data
  useEffect(() => {
    const fetchReviewData = async () => {
      if (!movieId) return;

      setLoadingReviews(true);

      try {
        // Lấy danh sách reviews (public data, không cần xác thực)
        const reviewsResponse = await reviewApi.getReviewsByMovie(
          movieId,
          currentPage,
          reviewsPerPage
        );

        // Lấy thống kê đánh giá (public data, không cần xác thực)
        const statsResponse = await reviewApi.getReviewStatsByMovie(movieId);

        // Cập nhật state cho dữ liệu công khai
        setReviews(reviewsResponse.data || []);
        setTotalReviews(reviewsResponse.total || 0);
        setReviewStats(
          statsResponse || {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }
        );

        // Kiểm tra user đăng nhập
        if (currentUser && localStorage.getItem("token")) {
          setCheckingEligibility(true);
          try {
            // Kiểm tra quyền đánh giá
            const eligibilityResponse = await reviewApi.checkReviewEligibility(
              movieId
            );

            // Log để kiểm tra giá trị trả về
            console.log("Eligibility response:", eligibilityResponse);

            // Đảm bảo đọc đúng giá trị từ response
            setCanReview(
              eligibilityResponse?.canReview === true ||
                eligibilityResponse?.hasTicket === true ||
                eligibilityResponse?.hasWatched === true
            );

            // Lấy review của người dùng hiện tại
            if (currentUser.id) {
              const myReviewsResponse = await reviewApi.getMyReviews();

              // Tìm review cho phim hiện tại
              const myReviewForThisMovie = Array.isArray(myReviewsResponse)
                ? myReviewsResponse.find((review) => review.movieId === movieId)
                : null;

              setUserReview(myReviewForThisMovie || null);

              if (myReviewForThisMovie) {
                setNewReviewRating(myReviewForThisMovie.rating);
                setNewReviewComment(myReviewForThisMovie.comment || "");
              } else {
                // Reset form khi không có review
                setNewReviewRating(0);
                setNewReviewComment("");
              }
            }
          } catch (authError) {
            console.error(
              "Error fetching authenticated review data:",
              authError
            );
            // Default user không có quyền đánh giá
            setCanReview(false);
            setUserReview(null);
          } finally {
            setCheckingEligibility(false);
          }
        } else {
          // Nếu không đăng nhập, đặt giá trị mặc định
          setCanReview(false);
          setUserReview(null);
        }
      } catch (error) {
        console.error("Error fetching review data:", error);
        notification.error({
          message: "Lỗi",
          description: "Không thể tải đánh giá. Vui lòng thử lại sau.",
        });
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviewData();
  }, [movieId, currentPage, currentUser]);

  // Hàm xử lý gửi review mới
  const handleSubmitReview = async () => {
    if (!currentUser) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để đánh giá phim",
      });
      return;
    }

    if (newReviewRating === 0) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng chọn số sao đánh giá",
      });
      return;
    }

    try {
      const key = "submittingReview";
      notification.open({
        key,
        message: "Đang xử lý",
        description: userReview
          ? "Đang cập nhật đánh giá..."
          : "Đang gửi đánh giá...",
        duration: 0,
      });
  
      const reviewData = {
        movieId: movieId,
        rating: newReviewRating,
        comment: newReviewComment,
      };
  
      if (userReview) {
        await reviewApi.updateReview(userReview.id, reviewData);
      } else {
        await reviewApi.createReview(reviewData);
      }
  
      notification.close(key);
      notification.success({
        message: "Thành công",
        description: userReview
          ? "Đã cập nhật đánh giá"
          : "Đã gửi đánh giá thành công",
      });
  
      setIsReviewModalVisible(false);
  
      // Reset về page 1 để reload từ đầu (cái này QUAN TRỌNG)
      setCurrentPage(1);
  
      // Gọi reload sau khi đã chắc chắn modal đóng
      setTimeout(() => {
        fetchReviewData();
      }, 300); // chờ modal animation xong rồi fetch
    } catch (error) {
      console.error("Error submitting review:", error);
      notification.error({
        message: "Lỗi",
        description:
          error?.response?.data?.message || error?.message || "Không thể gửi đánh giá. Vui lòng thử lại sau.",
      });
    }
  };

  // Hàm tải lại dữ liệu sau khi thao tác
  const fetchReviewData = async () => {
    try {
      // Lấy danh sách reviews
      const reviewsResponse = await reviewApi.getReviewsByMovie(
        movieId,
        currentPage,
        reviewsPerPage
      );
      // Lấy thống kê đánh giá
      const statsResponse = await reviewApi.getReviewStatsByMovie(movieId);

      setReviews(reviewsResponse.data || []);
      setTotalReviews(reviewsResponse.total || 0);
      setReviewStats(
        statsResponse || {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      );

      // Nếu đã đăng nhập, cập nhật thông tin review của user
      if (currentUser) {
        try {
          // Kiểm tra quyền đánh giá
          const eligibilityResponse = await reviewApi.checkReviewEligibility(
            movieId
          );
          setCanReview(
            eligibilityResponse?.canReview === true ||
              eligibilityResponse?.hasTicket === true ||
              eligibilityResponse?.hasWatched === true
          );

          const myReviewsResponse = await reviewApi.getMyReviews();
          const myReviewForThisMovie = Array.isArray(myReviewsResponse)
            ? myReviewsResponse.find((review) => review.movieId === movieId)
            : null;

          setUserReview(myReviewForThisMovie || null);

          if (myReviewForThisMovie) {
            setNewReviewRating(myReviewForThisMovie.rating);
            setNewReviewComment(myReviewForThisMovie.comment || "");
          } else {
            setNewReviewRating(0);
            setNewReviewComment("");
          }
        } catch (error) {
          console.error("Error checking review eligibility:", error);
        }
      }
    } catch (error) {
      console.error("Error refreshing review data:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật dữ liệu đánh giá.",
      });
    }
  };

  // Hàm xóa review
  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      await reviewApi.deleteReview(userReview.id);

      notification.success({
        message: "Thành công",
        description: "Đã xóa đánh giá của bạn",
      });

      // Tải lại dữ liệu
      await fetchReviewData();
    } catch (error) {
      console.error("Error deleting review:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa đánh giá. Vui lòng thử lại sau.",
      });
    }
  };

  // Xử lý chuyển hướng để đặt vé
  const handleBookTicket = () => {
    navigate(`/movies/${movieId}`);
  };

  // Xử lý đăng nhập để đánh giá
  const handleLoginToReview = () => {
    notification.info({
      message: "Yêu cầu đăng nhập",
      description: "Vui lòng đăng nhập để đánh giá phim này.",
    });
    // Hiển thị modal đăng nhập thay vì chuyển hướng
    // (Cần xử lý ở component cha hoặc context)
  };

  // Định dạng ngày
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

  // Hiển thị phân phối đánh giá
  const renderRatingDistribution = () => {
    if (!reviewStats || reviewStats.totalReviews === 0) return null;

    return (
      <div className="space-y-2 mt-4">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.ratingDistribution[star] || 0;
          const percentage = reviewStats.totalReviews
            ? Math.round((count / reviewStats.totalReviews) * 100)
            : 0;

          return (
            <div key={star} className="flex items-center">
              <span className="w-10 text-right mr-3">{star} sao</span>
              <Progress
                percent={percentage}
                size="small"
                format={() => `${count}`}
                strokeColor="#e71a0f"
                className="flex-1"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="movie-reviews-section">
      {loadingReviews ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg mb-8">
            <div className="review-stats text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold text-primary">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <Rate
                  disabled
                  allowHalf
                  value={reviewStats.averageRating}
                  className="text-yellow-400 text-lg my-2"
                />
                <div className="text-gray-500">
                  ({reviewStats.totalReviews} đánh giá)
                </div>
              </div>

              {renderRatingDistribution()}
            </div>

            <div className="user-review-actions flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold mb-2">
                  Chia sẻ đánh giá của bạn
                </h3>
                <p className="text-gray-500 mb-4">
                  {!currentUser
                    ? "Bạn cần đăng nhập để đánh giá"
                    : canReview
                    ? "Hãy chia sẻ cảm nhận của bạn về bộ phim này"
                    : "Bạn cần xem phim để đánh giá"}
                </p>

                <Rate
                  disabled={!currentUser || !canReview}
                  value={userReview?.rating || 0}
                  className="text-2xl mb-6"
                />
              </div>

              {checkingEligibility ? (
                <Spin />
              ) : !currentUser ? (
                <Button
                  type="primary"
                  size="large"
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary border-none"
                  onClick={handleLoginToReview}
                >
                  Đăng nhập để đánh giá
                </Button>
              ) : canReview ? (
                userReview ? (
                  <div className="space-x-3">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsReviewModalVisible(true)}
                      className="bg-primary hover:bg-primary-dark"
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
                          onOk: handleDeleteReview,
                        });
                      }}
                    >
                      Xóa đánh giá
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    onClick={() => setIsReviewModalVisible(true)}
                    size="large"
                    className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary border-none"
                    icon={<StarOutlined />}
                  >
                    Viết đánh giá
                  </Button>
                )
              ) : (
                <Button
                  type="primary"
                  size="large"
                  className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary border-none"
                  onClick={handleBookTicket}
                >
                  Đặt vé để đánh giá
                </Button>
              )}
            </div>
          </div>

          <Divider>
            <span className="text-lg font-semibold text-primary">
              Bình luận từ người xem
            </span>
          </Divider>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  variant="outlined"
                  className="shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start">
                    <Avatar
                      icon={<UserOutlined />}
                      src={review.user?.avatar}
                      size={48}
                      className="mt-1"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-lg">
                        {review.user?.fullName || "Người dùng ẩn danh"}
                      </div>
                      <div className="flex items-center">
                        <Rate
                          disabled
                          value={review.rating}
                          className="text-sm"
                        />
                        <span className="text-gray-500 text-sm ml-2">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <div className="mt-3 text-text-secondary">
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
                <span className="text-gray-500">
                  Chưa có đánh giá nào cho phim này
                </span>
              }
              className="py-12"
            />
          )}

          <Modal
            title={userReview ? "Cập nhật đánh giá" : "Viết đánh giá"}
            open={isReviewModalVisible}
            onCancel={() => setIsReviewModalVisible(false)}
            onOk={handleSubmitReview}
            okText={userReview ? "Cập nhật" : "Gửi đánh giá"}
            cancelText="Hủy"
            okButtonProps={{
              className: "bg-primary border-primary hover:bg-primary-dark",
              disabled: newReviewRating === 0,
            }}
          >
            <div className="mb-6">
              <div className="mb-2 font-medium">Đánh giá phim:</div>
              <Rate
                value={newReviewRating}
                onChange={(value) => setNewReviewRating(value)}
                className="text-3xl"
              />
              {newReviewRating === 0 && (
                <div className="text-red-500 mt-1">
                  Vui lòng chọn số sao đánh giá
                </div>
              )}
            </div>
            <div>
              <div className="mb-2 font-medium">Bình luận:</div>
              <TextArea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về phim này..."
                autoSize={{ minRows: 4, maxRows: 8 }}
                className="border-gray-300 hover:border-primary focus:border-primary"
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default MovieReviews;
