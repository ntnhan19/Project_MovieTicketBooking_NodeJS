// Step4Payment.js
import React from "react";
import { Button, Divider, Tag } from "antd";

const seatPrices = {
  regular: 80000,
  vip: 120000,
  couple: 150000,
};

const Step4Payment = ({
  selectedShowtime,
  selectedSeats = [],
  selectedSnacks = [],
}) => {
  const getSeatInfo = (id) => {
    const row = id.charAt(0);
    const col = parseInt(id.charAt(1)) - 1;
    const isVIP = row < "C";
    const isCouple = col % 5 === 0 && row >= "E";
    return isCouple ? "couple" : isVIP ? "vip" : "regular";
  };

  const seatTotal = selectedSeats.reduce((total, seatId) => {
    const seatType = getSeatInfo(seatId);
    return total + seatPrices[seatType];
  }, 0);

  const snackPrices = {
    popcorn: 25000,
    drink: 20000,
  };

  const snackTotal = selectedSnacks.reduce((total, snack) => {
    return total + snackPrices[snack];
  }, 0);

  const totalAmount = seatTotal + snackTotal;

  return (
    <div>
      <h2>Thông tin thanh toán</h2>

      <div>
        <h3>Suất chiếu: {selectedShowtime}</h3>
        <Divider />

        <h3>Ghế đã chọn:</h3>
        <div>
          {selectedSeats.map((seat) => (
            <Tag key={seat}>{seat}</Tag>
          ))}
        </div>
        <Divider />

        <h3>Bắp nước đã chọn:</h3>
        <div>
          {selectedSnacks.map((snack) => (
            <Tag key={snack}>{snack}</Tag>
          ))}
        </div>
        <Divider />

        <h3>Tổng tiền: {totalAmount.toLocaleString()} đ</h3>
        <Divider />

        <Button type="primary" block>
          Thanh toán
        </Button>
      </div>
    </div>
  );
};

export default Step4Payment;
