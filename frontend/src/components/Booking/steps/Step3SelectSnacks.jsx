// frontend/src/components/Booking/Step3SelectSnacks.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, InputNumber, Skeleton, Alert, Row, Col, Typography, Divider } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { BookingContext } from "../../../context/BookingContext";
import { useBooking } from "../../../hooks/useBooking";

const { Title, Text } = Typography;

const Step3SelectSnacks = () => {
  const navigate = useNavigate();
  const { bookingData } = useContext(BookingContext);
  const { selectSnacks } = useBooking();
  
  const [snacks, setSnacks] = useState([
    { id: 1, name: "Popcorn (Large)", price: 60000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 2, name: "Popcorn (Medium)", price: 45000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 3, name: "Coke (Large)", price: 30000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 4, name: "Coke (Medium)", price: 25000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 5, name: "Nachos", price: 40000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 6, name: "Hot Dog", price: 35000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 7, name: "Combo 1 (Popcorn + 2 Cokes)", price: 90000, quantity: 0, image: "/api/placeholder/100/100" },
    { id: 8, name: "Combo 2 (Nachos + 2 Cokes)", price: 85000, quantity: 0, image: "/api/placeholder/100/100" },
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user came from the seats selection step
  useEffect(() => {
    if (!bookingData.seats || bookingData.seats.length === 0) {
      navigate('/booking/seats');
    }
    
    // Load snacks data from API (simulated)
    const loadSnacks = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch snacks from your API
        // const snacksData = await snacksApi.getSnacks();
        // setSnacks(snacksData);
        
        // For now, we'll use the hardcoded data and just simulate a loading state
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Failed to load snacks. Please try again.");
        setLoading(false);
      }
    };
    
    loadSnacks();
  }, [bookingData.seats, navigate]);

  const handleQuantityChange = (id, value) => {
    setSnacks(
      snacks.map((snack) =>
        snack.id === id ? { ...snack, quantity: value } : snack
      )
    );
  };

  const calculateTotal = () => {
    return snacks.reduce((total, snack) => {
      return total + snack.price * snack.quantity;
    }, 0);
  };

  const handleContinue = () => {
    // Filter only snacks with quantity > 0
    const selectedSnacks = snacks.filter((snack) => snack.quantity > 0);
    selectSnacks(selectedSnacks);
  };

  const handleSkip = () => {
    selectSnacks([]);
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div className="snacks-selection-container">
      <div className="booking-info">
        <Title level={3}>Bắp nước & Đồ ăn</Title>
        <Text>Movie: {bookingData.movie?.title}</Text>
        <br />
        <Text>
          Showtime: {bookingData.showtime?.date} - {bookingData.showtime?.time}
        </Text>
        <br />
        <Text>Seats: {bookingData.seats?.join(", ")}</Text>
      </div>

      <Divider />

      <Row gutter={[16, 16]} className="snacks-grid">
        {snacks.map((snack) => (
          <Col xs={24} sm={12} md={8} lg={6} key={snack.id}>
            <Card
              hoverable
              className="snack-card"
              cover={<img alt={snack.name} src={snack.image} />}
            >
              <Card.Meta 
                title={snack.name} 
                description={`${snack.price.toLocaleString()} đ`} 
              />
              <div className="quantity-control">
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => handleQuantityChange(snack.id, Math.max(0, snack.quantity - 1))}
                  disabled={snack.quantity === 0}
                />
                <InputNumber
                  min={0}
                  max={10}
                  value={snack.quantity}
                  onChange={(value) => handleQuantityChange(snack.id, value)}
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleQuantityChange(snack.id, snack.quantity + 1)}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="snacks-footer">
        <div className="total-container">
          <Text strong>Tổng cộng:</Text>
          <Text strong>{calculateTotal().toLocaleString()} đ</Text>
        </div>
        
        <div className="buttons-container">
          <Button onClick={handleSkip}>Bỏ qua</Button>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={snacks.every((snack) => snack.quantity === 0)}
            size="large"
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3SelectSnacks;