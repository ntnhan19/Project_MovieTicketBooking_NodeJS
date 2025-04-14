// frontend/src/components/Booking/Step1SelectShowtime.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Radio, Space, Typography, Button, Skeleton, Alert } from "antd";
import { useBooking } from "../../../hooks/useBooking";
import { movieApi } from "../../../api/movieApi";
import { showtimeApi } from "../../../api/showtimeApi";
import { BookingContext } from "../../../context/BookingContext";

const { Title } = Typography;

const Step1SelectShowtime = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { updateBookingData } = useContext(BookingContext);
  const { selectShowtime } = useBooking();
  
  // States
  const [movie, setMovie] = useState(null);
  const [dates, setDates] = useState([]);
  const [timesByDate, setTimesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie and available dates
  useEffect(() => {
    const fetchMovieAndDates = async () => {
      setLoading(true);
      try {
        if (!movieId) {
          navigate('/movies');
          return;
        }
        
        // Fetch movie details
        const movieData = await movieApi.getMovieById(movieId);
        setMovie(movieData);
        
        // Fetch available dates
        const availableDates = await showtimeApi.getAvailableDates(movieId);
        setDates(availableDates);
        
        // Set default selected date
        if (availableDates.length > 0) {
          setSelectedDate(availableDates[0]);
        }
      } catch (err) {
        setError("Failed to load movie or showtimes. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndDates();
  }, [movieId, navigate]);

  // Fetch available times when selected date changes
  useEffect(() => {
    const fetchTimes = async () => {
      if (!selectedDate || !movieId) return;
      
      setLoading(true);
      try {
        const times = await showtimeApi.getTimesByDate(movieId, selectedDate);
        setTimesByDate(prevState => ({
          ...prevState,
          [selectedDate]: times
        }));
      } catch (err) {
        setError("Failed to load showtimes. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have the times for this date already
    if (!timesByDate[selectedDate]) {
      fetchTimes();
    }
  }, [selectedDate, movieId, timesByDate]);

  const handleSelectShowtime = async () => {
    if (selectedDate && selectedTime) {
      // Get showtime ID from the selection
      const showtimeId = timesByDate[selectedDate]?.find(t => t.time === selectedTime)?.id;
      
      if (!showtimeId) {
        setError("Invalid showtime selection");
        return;
      }
      
      // Store movie info in context
      updateBookingData({
        movie: {
          id: movie.id,
          title: movie.title,
          image: movie.image
        }
      });
      
      // Use the hook to select showtime and navigate
      const showtime = `${selectedDate} ${selectedTime}`;
      const success = await selectShowtime(movie.id, showtimeId, showtime);
      
      if (!success) {
        setError("Failed to select showtime. Please try again.");
      }
    }
  };

  if (loading && !movie) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div className="showtime-selection-container">
      {movie && <Title level={3}>{movie.title}</Title>}
      
      <Title level={4}>Chọn ngày chiếu:</Title>
      <Radio.Group
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setSelectedTime(""); // Reset time when date changes
        }}
      >
        <Space direction="vertical">
          {dates.map((date) => (
            <Radio key={date} value={date}>
              {new Date(date).toLocaleDateString("vi-VN", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {selectedDate && timesByDate[selectedDate] && (
        <>
          <Title level={4} style={{ marginTop: 20 }}>
            Chọn giờ chiếu:
          </Title>
          <Radio.Group
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              // Find the showtime ID for the selected time
              const showtimeObj = timesByDate[selectedDate].find(
                t => t.time === e.target.value
              );
            }}
          >
            <Space wrap>
              {timesByDate[selectedDate].map((timeObj) => (
                <Radio.Button key={timeObj.id} value={timeObj.time}>
                  {timeObj.time}
                </Radio.Button>
              ))}
            </Space>
          </Radio.Group>

          <Button
            type="primary"
            block
            onClick={handleSelectShowtime}
            disabled={!selectedTime}
            style={{ marginTop: 20 }}
          >
            Xác nhận suất chiếu
          </Button>
        </>
      )}
    </div>
  );
};

export default Step1SelectShowtime;