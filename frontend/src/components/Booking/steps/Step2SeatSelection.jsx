// ✅ Đã refactor để đồng bộ logic với backend showtime (bookedSeats qua API)
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Typography, message, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { BookingContext } from '../../../context/BookingContext';
import { showtimeApi } from '../../../api/showtimeApi';

const { Title, Text } = Typography;

const Step2SeatSelection = ({ onSelectSeats, selectedSeats: initialSelectedSeats }) => {
  const { bookingData } = useContext(BookingContext);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(initialSelectedSeats || []);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;

  useEffect(() => {
    const fetchSeatsData = async () => {
      try {
        setLoading(true);
        const showtimeId = bookingData?.showtime?.id;
        if (!showtimeId) throw new Error('Missing showtime ID');

        const response = await showtimeApi.getSeatsStatus(showtimeId);
        setBookedSeats(response.bookedSeats || []);
      } catch (error) {
        console.error('Lỗi khi fetch booked seats:', error);
        message.error('Không thể tải thông tin ghế. Dữ liệu mẫu sẽ được sử dụng.');
        setBookedSeats(['A1', 'A2', 'B5', 'C7', 'D10', 'E8', 'F3', 'G12']);
      } finally {
        setLoading(false);
      }
    };

    fetchSeatsData();
  }, [bookingData?.showtime?.id]);

  useEffect(() => {
    const allSeats = [];
    for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= seatsPerRow; j++) {
        const seatId = `${rows[i]}${j}`;
        const isVIP = ['E', 'F'].includes(rows[i]);
        allSeats.push({
          id: seatId,
          row: rows[i],
          number: j,
          isVIP,
          isBooked: bookedSeats.includes(seatId)
        });
      }
    }
    setSeats(allSeats);
  }, [bookedSeats]);

  useEffect(() => {
    if (initialSelectedSeats?.length > 0) {
      setSelectedSeats(initialSelectedSeats);
    } else if (bookingData?.seats?.length > 0) {
      setSelectedSeats(bookingData.seats);
    }
  }, [initialSelectedSeats, bookingData?.seats]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    const updatedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter(s => s !== seatId)
      : [...selectedSeats, seatId];
    setSelectedSeats(updatedSeats);
    onSelectSeats?.(updatedSeats);
  };

  const getSeatColor = (seat) => {
    if (seat.isBooked) return '#d9d9d9';
    if (selectedSeats.includes(seat.id)) return '#52c41a';
    if (seat.isVIP) return '#faad14';
    return '#1890ff';
  };

  const ticketPrice = bookingData?.ticketPrice || 90000;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <Title level={4}>Chọn ghế</Title>
      <div style={{ marginBottom: 20 }}>
        <Text strong>Phim: </Text><Text>{bookingData?.movie?.title}</Text><br />
        <Text strong>Suất chiếu: </Text><Text>{bookingData?.showtime?.date} {bookingData?.showtime?.time}</Text>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        {[
          { label: 'Ghế thường', color: '#1890ff' },
          { label: 'Ghế VIP', color: '#faad14' },
          { label: 'Đã chọn', color: '#52c41a' },
          { label: 'Đã đặt', color: '#d9d9d9' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', marginRight: 20 }}>
            <div style={{ width: 20, height: 20, backgroundColor: color, marginRight: 5, borderRadius: 4 }} />
            <Text>{label}</Text>
          </div>
        ))}
      </div>

      {/* Screen */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div style={{ width: '80%', height: 10, backgroundColor: '#f0f0f0', margin: '0 auto', borderRadius: 5 }}></div>
        <Text style={{ display: 'block', marginTop: 5 }}>Màn hình</Text>
      </div>

      {/* Seats Grid */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {rows.map(row => (
          <Row key={row} gutter={[8, 8]} justify="center" style={{ marginBottom: 10 }}>
            <Col span={2}><Text strong>{row}</Text></Col>
            {seats.filter(seat => seat.row === row).map(seat => (
              <Col key={seat.id} span={1}>
                <Button
                  size="small"
                  type={selectedSeats.includes(seat.id) ? 'primary' : 'default'}
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: getSeatColor(seat),
                    borderColor: getSeatColor(seat),
                    color: 'white',
                    cursor: seat.isBooked ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleSeatClick(seat.id)}
                  disabled={seat.isBooked}
                  icon={selectedSeats.includes(seat.id) ? <CheckOutlined /> : null}
                >
                  {!selectedSeats.includes(seat.id) && seat.number}
                </Button>
              </Col>
            ))}
          </Row>
        ))}
      </div>

      {/* Selected & Price */}
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <div style={{ marginBottom: 15 }}>
          <Text strong>Đã chọn: </Text>
          <Text>{selectedSeats.length ? selectedSeats.join(', ') : 'Chưa chọn ghế'}</Text>
        </div>
        <div style={{ marginBottom: 15 }}>
          <Text strong>Tổng tiền: </Text>
          <Text>{(selectedSeats.length * ticketPrice).toLocaleString()} VND</Text>
        </div>
      </div>
    </div>
  );
};

export default Step2SeatSelection;
