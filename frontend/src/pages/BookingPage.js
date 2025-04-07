import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Steps, Button, Spin } from "antd";
import movies from "../data/movies";
import Step1SelectShowtime from "../components/Booking/Step1SelectShowtime";
import Step2SelectSeats from "../components/Booking/Step2SelectSeats";
import Step3SelectSnacks from "../components/Booking/Step3SelectSnacks";
import Step4Payment from "../components/Booking/Step4Payment";
import Step5Succes from "../components/Booking/Step5Success";

const steps = [
  { title: "Chọn suất", content: <Step1SelectShowtime /> },
  { title: "Chọn ghế", content: <Step2SelectSeats /> },
  { title: "Bắp nước", content: <Step3SelectSnacks /> },
  { title: "Thanh toán", content: <Step4Payment /> },
  { title: "Xác nhận", content: <Step5Succes /> },
];

const BookingPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [current, setCurrent] = useState(0);

  // State lưu thông tin chọn suất, ghế và bắp nước
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState([]);

  useEffect(() => {
    const selected = movies.find((m) => m.id === Number(id));
    setMovie(selected);
  }, [id]);

  if (!movie) return <Spin tip="Đang tải thông tin phim..." />;

  // Hàm để lưu thông tin suất chiếu
  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
    setCurrent(1); // Tiến đến bước chọn ghế
  };

  // Hàm để lưu thông tin ghế đã chọn
  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    setCurrent(2); // Tiến đến bước chọn bắp nước
  };

  // Hàm để lưu thông tin bắp nước đã chọn
  const handleSnackSelect = (snacks) => {
    setSelectedSnacks(snacks);
    setCurrent(3); // Tiến đến bước thanh toán
  };

  // Hàm để chuyển sang bước tiếp theo
  const nextStep = () => {
    setCurrent(current + 1);
  };

  // Hàm để quay lại bước trước
  const prevStep = () => {
    setCurrent(current - 1);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <img
            src={movie.image}
            alt={movie.title}
            style={{ width: 200, borderRadius: 8 }}
          />
          <div>
            <h1>{movie.title}</h1>
            <p>
              <b>Thời lượng:</b> {movie.runtime}
            </p>
            <p>
              <b>Thể loại:</b> {movie.genre}
            </p>
            <p>
              <b>Giới hạn độ tuổi:</b> {movie.rating}
            </p>
            <p>
              <b>Ngày công chiếu:</b> {movie.releaseDate}
            </p>
            <p>
              <b>Đạo diễn:</b> {movie.director}
            </p>
          </div>
        </div>

        <Steps current={current} style={{ marginBottom: 24 }}>
          {steps.map((step) => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>

        {/* Truyền dữ liệu cho các bước */}
        <div>
          {current === 0 && (
            <Step1SelectShowtime onShowtimeSelect={handleShowtimeSelect} />
          )}
          {current === 1 && (
            <Step2SelectSeats onSeatSelect={handleSeatSelect} />
          )}
          {current === 2 && (
            <Step3SelectSnacks onSnackSelect={handleSnackSelect} />
          )}
          {current === 3 && (
            <Step4Payment
              selectedSeats={selectedSeats}
              selectedSnacks={selectedSnacks}
            />
          )}
          {current === 4 && (
            <Step5Succes
              selectedShowtime={selectedShowtime}
              selectedSeats={selectedSeats}
              selectedSnacks={selectedSnacks}
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          {current > 0 && <Button onClick={prevStep}>Quay lại</Button>}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={nextStep}>
              Tiếp tục
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
