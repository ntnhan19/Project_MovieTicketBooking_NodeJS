// Step5Success.js
import React from "react";
import { Button, Divider, Tag, Result } from "antd";

const Step5Success = ({ selectedShowtime, selectedSeats, selectedSnacks }) => {
  // Tổng tiền cho ghế đã chọn
  const seatPrices = {
    regular: 80000,
    vip: 120000,
    couple: 150000,
  };

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
      <h2>Xác nhận đặt vé</h2>

      <Result
        status="success"
        title="Đặt vé thành công"
        subTitle="Chúc bạn có một buổi xem phim vui vẻ!"
        extra={[
          <Button type="primary" key="console">
            Hoàn tất
          </Button>,
        ]}
      />

      <Divider />
      <h3>Suất chiếu: {selectedShowtime}</h3>

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
    </div>
  );
};

export default Step5Success;
