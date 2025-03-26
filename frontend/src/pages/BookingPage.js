import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, message } from "antd";

const seats = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  booked: Math.random() > 0.8, // Giả lập ghế đã đặt (20% ghế bị khóa)
}));

const BookingPage = () => {
  const { id } = useParams(); // Lấy ID phim từ URL
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seatId) => {
    if (seats.find((s) => s.id === seatId).booked) return; // Không thể chọn ghế đã đặt

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  const confirmBooking = () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế!");
      return;
    }
    message.success(`Bạn đã đặt ${selectedSeats.length} ghế thành công!`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chọn ghế cho phim ID: {id}</h1>
      <div className="grid grid-cols-8 gap-2 mb-4">
        {seats.map((seat) => (
          <button
            key={seat.id}
            className={`w-10 h-10 rounded ${
              seat.booked
                ? "bg-gray-400 cursor-not-allowed"
                : selectedSeats.includes(seat.id)
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
            disabled={seat.booked}
            onClick={() => toggleSeat(seat.id)}
          >
            {seat.id}
          </button>
        ))}
      </div>
      <Button type="primary" onClick={confirmBooking}>
        Xác nhận đặt vé
      </Button>
    </div>
  );
};

export default BookingPage;
