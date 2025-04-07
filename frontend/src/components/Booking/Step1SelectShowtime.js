import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import showtimesData from "../../data/showtimesData";
import { Radio, Space, Typography } from "antd";

const { Title } = Typography;

const Step1SelectShowtime = () => {
  const { id } = useParams(); // Lấy id từ URL
  const movieShowtimes = useMemo(() => showtimesData[id] || {}, [id]); // Dữ liệu suất chiếu theo id phim
  const dates = Object.keys(movieShowtimes); // Lấy các ngày chiếu từ dữ liệu

  const [selectedDate, setSelectedDate] = useState(dates[0] || ""); // Mặc định chọn ngày đầu tiên
  const [selectedTime, setSelectedTime] = useState(""); // Mặc định không chọn giờ

  useEffect(() => {
    // Nếu không có dữ liệu về suất chiếu cho phim, reset lại
    if (!movieShowtimes[selectedDate]) {
      setSelectedDate("");
      setSelectedTime("");
    }
  }, [selectedDate, movieShowtimes]); // Chỉ phụ thuộc vào selectedDate

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
              {new Date(date).toLocaleDateString("vi-VN")} {/* Hiển thị ngày */}
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
                      <h4>Phim {movieId}:</h4> {/* Hiển thị ID phim */}
                      {times.map((time) => (
                        <Radio.Button key={time} value={time}>
                          {time} {/* Hiển thị giờ chiếu */}
                        </Radio.Button>
                      ))}
                    </div>
                  )
                )}
            </Space>
          </Radio.Group>
        </>
      )}
    </div>
  );
};

export default Step1SelectShowtime;
