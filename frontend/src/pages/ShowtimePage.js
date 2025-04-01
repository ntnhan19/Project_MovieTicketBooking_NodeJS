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

    // Đảm bảo format ngày giống với `showtimesByDate`
    let dateStr =
      nextDay.getDate() +
      "/" +
      (nextDay.getMonth() + 1) +
      "/" +
      nextDay.getFullYear();

    days.push({ name: dayName, date: dateStr });
  }
  return days;
};
const showtimesByDate = {
  "31/3/2025": [
    {
      id: 1,
      title: "Nhà Gia Tiên",
      image: "/images/img1.jpg",
      releaseDate: "21/02/2025",
      runtime: "1 giờ 57 phút",
      director: "Huỳnh Lập",
      cast: "Huỳnh Lập, Phương Mỹ Chi, NSƯT Hạnh Thúy, NSƯT Huỳnh Đông, Puka...",
      genre: "Supernatural, Family, Comedy - 2D",
      rating: "T18",
      description: "Bộ phim kể về câu chuyện bí ẩn trong một gia đình...",
      showtimes: {
        "CGV Vincom": {
          "21/02/2025": ["10:00", "13:30", "16:45", "19:00"],
          "22/02/2025": ["11:00", "14:15", "17:30", "20:45"],
        },
      },
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
