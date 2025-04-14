// frontend/src/components/DatePicker.jsx
import React from "react";
import "../index.css"; // Import CSS
const DatePicker = ({ availableDays, selectedDate, onDateSelect }) => {
  return (
    <div className="date-picker-container">
      {availableDays.map((day, index) => (
        <div
          key={index}
          className={`date-box ${selectedDate === day.date ? "selected" : ""}`}
          onClick={() => onDateSelect(day.date)}
        >
          <span className="day-name">{day.name}</span>
          <span className="day-date">{day.date}</span>
        </div>
      ))}
    </div>
  );
};
export default DatePicker;
