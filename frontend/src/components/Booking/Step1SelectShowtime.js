// Step1SelectShowtime.js
import React, { useState, useMemo, useEffect } from "react";
import { Radio, Space, Typography, Button } from "antd";

const { Title } = Typography;

const Step1SelectShowtime = ({ onSelectShowtime }) => {
  // Dữ liệu giả lập về ngày và giờ chiếu của phim
  const movieShowtimes = useMemo(
    () => ({
      "07/04/2025": {
        1: ["10:00", "13:30", "16:45", "20:00", "23:15"],
      },

      "08/04/2025": {
        1: ["09:00", "11:30", "15:00", "18:30", "22:00"],
      },
    }),
    []
  );

  const dates = Object.keys(movieShowtimes); // Lấy các ngày chiếu từ dữ liệu

  const [selectedDate, setSelectedDate] = useState(dates[0] || ""); // Mặc định chọn ngày đầu tiên
  const [selectedTime, setSelectedTime] = useState(""); // Mặc định không chọn giờ

  useEffect(() => {
    // Nếu không có dữ liệu về suất chiếu cho phim, reset lại
    if (!movieShowtimes[selectedDate]) {
      setSelectedDate("");
      setSelectedTime("");
    }
  }, [selectedDate, movieShowtimes]);

  const handleSelectShowtime = () => {
    if (selectedDate && selectedTime) {
      const showtime = `${selectedDate} ${selectedTime}`;
      onSelectShowtime(showtime); // Gọi hàm truyền từ cha để cập nhật dữ liệu suất chiếu
    }
  };

  return (
    <div>
      <Title level={4}>Chọn ngày chiếu:</Title>
      <Radio.Group
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value); // Cập nhật ngày chiếu khi chọn
          setSelectedTime(""); // Reset giờ khi thay đổi ngày
        }}
      >
        <Space direction="vertical">
          {dates.map((date) => (
            <Radio key={date} value={date}>
              {new Date(date).toLocaleDateString("vi-VN")}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {selectedDate && (
        <>
          <Title level={4} style={{ marginTop: 20 }}>
            Chọn giờ chiếu:
          </Title>
          <Radio.Group
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)} // Cập nhật giờ khi chọn
          >
            <Space wrap>
              {movieShowtimes[selectedDate] &&
                Object.entries(movieShowtimes[selectedDate]).map(
                  ([movieId, times]) => (
                    <div key={movieId}>
                      <h4>{movieId}:</h4>
                      {times.map((time) => (
                        <Radio.Button key={time} value={time}>
                          {time}
                        </Radio.Button>
                      ))}
                    </div>
                  )
                )}
            </Space>
          </Radio.Group>

          <Button
            type="primary"
            block
            onClick={handleSelectShowtime}
            disabled={!selectedTime}
          >
            Xác nhận suất chiếu
          </Button>
        </>
      )}
    </div>
  );
};

export default Step1SelectShowtime;
