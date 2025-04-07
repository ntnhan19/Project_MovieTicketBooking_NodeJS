import React, { useState } from "react";
import { Button, Tag } from "antd";

const rows = 6;
const cols = 10;

const generateSeats = () => {
  const seats = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isVIP = row < 2;
      const isCouple = col % 5 === 0 && row >= 4;
      seats.push({
        id: `${String.fromCharCode(65 + row)}${col + 1}`,
        type: isCouple ? "couple" : isVIP ? "vip" : "regular",
        status: "available", // available | booked
      });
    }
  }
  return seats;
};

const seatPrices = {
  regular: 80000,
  vip: 120000,
  couple: 150000,
};

const Step2SelectSeats = ({ onSeatSelect }) => {
  const [seats] = useState(generateSeats);
  const [selected, setSelected] = useState([]);

  const toggleSeat = (seatId) => {
    if (selected.includes(seatId)) {
      setSelected(selected.filter((s) => s !== seatId));
    } else {
      setSelected([...selected, seatId]);
    }
  };

  const getSeatInfo = (id) => seats.find((s) => s.id === id);

  const total = selected.reduce((sum, id) => {
    const seat = getSeatInfo(id);
    return sum + seatPrices[seat.type];
  }, 0);

  const handleContinue = () => {
    onSeatSelect(selected);
  };

  return (
    <div>
      <div className="screen">MÀN HÌNH</div>
      <div className="seats-grid">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`seat ${seat.type} ${seat.status} ${
              selected.includes(seat.id) ? "selected" : ""
            }`}
            onClick={() => seat.status !== "booked" && toggleSeat(seat.id)}
          >
            {seat.id}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <p>Ghế đã chọn: {selected.join(", ")}</p>
        <p>Tổng tiền: {total.toLocaleString()} đ</p>
        <Button
          type="primary"
          disabled={!selected.length}
          onClick={handleContinue}
        >
          Tiếp tục
        </Button>
      </div>

      <div style={{ marginTop: 20 }}>
        <Tag color="blue">Ghế thường</Tag>
        <Tag color="volcano">Ghế VIP</Tag>
        <Tag color="magenta">Ghế đôi</Tag>
        <Tag color="green">Đang chọn</Tag>
        <Tag color="gray">Đã đặt</Tag>
      </div>
    </div>
  );
};

export default Step2SelectSeats;
