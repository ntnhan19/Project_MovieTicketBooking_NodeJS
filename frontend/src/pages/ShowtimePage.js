// ShowtimePage.js
import React, { useState } from "react";
import DatePicker from "../components/DatePicker";
import MovieDetails from "../components/MovieDetails";
import "../index.css";

const getNextDays = (numDays) => {
  const days = [];
  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  let today = new Date();

  for (let i = 0; i < numDays; i++) {
    let nextDay = new Date();
    nextDay.setDate(today.getDate() + i);
    let dayName = weekdays[nextDay.getDay()];
    let dateStr = nextDay.toLocaleDateString("vi-VN");
    days.push({ name: dayName, date: dateStr });
  }
  return days;
};

const showtimesByDate = {
  "30/3/2025": [
    {
      id: 1,
      title: "Âm Dương Lộ",
      poster: "/images/img7.jpg",
      genre: "Kinh dị, Hài",
      director: "Hoàng Tuấn Cường",
      actors: "Bạch Công Khanh, Lan Thy, Minh Hoàng, Tuấn Dũng, Đại Nghĩa",
      description:
        "Vì mưu sinh, một cử nhân thất nghiệp lên cha chở một thi thể nữ về Tây Nguyên ngay giữa đêm khuya...",
      ageRating: "T16",
      formats: ["2D"],
      times: [
        "08:55",
        "10:45",
        "12:55",
        "14:00",
        "16:10",
        "18:20",
        "20:30",
        "22:40",
      ],
    },
  ],
};

const ShowtimePage = () => {
  const availableDays = getNextDays(7);
  const [selectedDate, setSelectedDate] = useState(availableDays[0].date);

  return (
    <div className="showtime-page">
      <DatePicker
        availableDays={availableDays}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      <div className="movie-details-container">
        {showtimesByDate[selectedDate] ? (
          showtimesByDate[selectedDate].map((movie) => (
            <MovieDetails key={movie.id} movie={movie} />
          ))
        ) : (
          <p>Không có lịch chiếu cho ngày này.</p>
        )}
      </div>
    </div>
  );
};

export default ShowtimePage;
