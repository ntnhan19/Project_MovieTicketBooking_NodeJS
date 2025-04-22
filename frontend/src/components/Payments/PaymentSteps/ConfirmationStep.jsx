// frontend/src/components/Payments/PaymentSteps/ConfirmationStep.jsx
import React from 'react';
import { Row, Col, Typography, Divider, List } from 'antd';

const { Title, Text } = Typography;

const ConfirmationStep = ({ showtimeDetails, seatDetails, totalPrice }) => {
  // Hiển thị thông tin ghế đã chọn
  const renderSelectedSeats = () => {
    if (!seatDetails.length) return "Không có ghế nào được chọn";

    return (
      <List
        dataSource={seatDetails}
        renderItem={(seat, index) => (
          <List.Item key={seat.id} className="seat-item">
            <div className="seat-info">
              <Text>{index + 1}. Ghế {seat.row}{seat.column || seat.number}</Text>
            </div>
            <div className="seat-price">
              <Text>{seat.price?.toLocaleString("vi-VN") || "0"}đ</Text>
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="confirmation-step">
      <div className="confirmation-header">
        <Title level={4}>Xác nhận thông tin đặt vé</Title>
      </div>

      {showtimeDetails && (
        <>
          <div className="movie-info">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8} className="movie-poster">
                {showtimeDetails.movie.posterUrl && (
                  <img
                    src={showtimeDetails.movie.posterUrl}
                    alt={showtimeDetails.movie.title}
                    className="poster-image"
                  />
                )}
              </Col>

              <Col xs={24} sm={16} className="movie-details">
                <Title level={4}>{showtimeDetails.movie.title}</Title>
                <Text className="movie-meta">
                  Thời lượng: {showtimeDetails.movie.duration} phút
                </Text>
                <div className="showtime-info">
                  <Text>
                    Rạp: {showtimeDetails.hall.cinema.name}
                  </Text>
                  <br />
                  <Text>
                    Phòng: {showtimeDetails.hall.name}
                  </Text>
                  <br />
                  <Text>
                    Suất chiếu:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    -{" "}
                    {new Date(showtimeDetails.endTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                  <br />
                  <Text>
                    Ngày:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          <div className="seat-selection">
            <Title level={5}>Ghế đã chọn</Title>
            {renderSelectedSeats()}
          </div>

          <Divider />

          <div className="price-summary">
            <Row justify="space-between" className="price-row">
              <Col>
                <Text>Tổng tiền vé</Text>
              </Col>
              <Col>
                <Text>{totalPrice.toLocaleString("vi-VN")}đ</Text>
              </Col>
            </Row>

            <Row justify="space-between" className="price-row">
              <Col>
                <Text>Phí dịch vụ</Text>
              </Col>
              <Col>
                <Text>0đ</Text>
              </Col>
            </Row>
            
            <Row justify="space-between" className="price-row total">
              <Col>
                <Text strong>Tổng cộng</Text>
              </Col>
              <Col>
                <Text strong className="total-price">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </Text>
              </Col>
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

export default ConfirmationStep;