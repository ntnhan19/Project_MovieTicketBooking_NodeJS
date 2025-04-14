// frontend/src/components/Booking/Step2SelectSeats.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Typography, Tag, message, Spin } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { showtimeApi } from '../../../api/showtimeApi';
import { useParams, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

const Step2SeatSelection = ({ onSelectSeats, selectedSeats }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cinema = searchParams.get('cinema');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  
  // Cấu hình ghế
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  
  useEffect(() => {
    const fetchSeatsData = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy trạng thái ghế
        const seatsData = await showtimeApi.getSeatsStatus(id, cinema, date, time);
        setBookedSeats(seatsData.bookedSeats || []);
        
        // Tạo mảng ghế
        const allSeats = [];
        for (let i = 0; i < rows.length; i++) {
          for (let j = 1; j <= seatsPerRow; j++) {
            const seatId = `${rows[i]}${j}`;
            const isVIP = rows[i] === 'E' || rows[i] === 'F'; // Hàng E, F là ghế VIP
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
      } catch (error) {
        console.error("Không thể tải thông tin ghế:", error);
        message.error("Không thể tải thông tin ghế. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeatsData();
  }, [id, cinema, date, time]);
  
  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      onSelectSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      onSelectSeats([...selectedSeats, seatId]);
    }
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  const getSeatColor = (seat) => {
    if (seat.isBooked) return '#d9d9d9'; // Đã đặt - màu xám
    if (selectedSeats.includes(seat.id)) return '#52c41a'; // Đã chọn - màu xanh
    if (seat.isVIP) return '#faad14'; // Ghế VIP - màu vàng
    return '#1890ff'; // Ghế thường - màu xanh dương
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <Title level={4}>Chọn ghế</Title>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#1890ff', marginRight: '5px', borderRadius: '4px' }}></div>
          <Text>Ghế thường</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#faad14', marginRight: '5px', borderRadius: '4px' }}></div>
          <Text>Ghế VIP</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#52c41a', marginRight: '5px', borderRadius: '4px' }}></div>
          <Text>Đã chọn</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#d9d9d9', marginRight: '5px', borderRadius: '4px' }}></div>
          <Text>Đã đặt</Text>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ width: '80%', height: '10px', backgroundColor: '#f0f0f0', margin: '0 auto', borderRadius: '5px' }}></div>
        <Text style={{ display: 'block', marginTop: '5px' }}>Màn hình</Text>
      </div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {rows.map((row) => (
          <Row key={row} style={{ marginBottom: '10px' }} gutter={[8, 8]} justify="center">
            <Col span={2}>
              <Text strong>{row}</Text>
            </Col>
            {seats
              .filter(seat => seat.row === row)
              .map(seat => (
                <Col key={seat.id} span={1}>
                  <Button
                    size="small"
                    type={selectedSeats.includes(seat.id) ? "primary" : "default"}
                    style={{
                      width: '30px',
                      height: '30px',
                      padding: 0,
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
    </div>
  );
};

export default Step2SeatSelection;