// frontend/src/components/Booking/steps/Step4PaymentMethod.jsx
import React, { useState, useContext } from 'react';
import { Row, Col, Button, Typography, Card, Radio, Form, Input, Divider, message, Alert, Space } from 'antd';
import { CreditCardOutlined, WalletOutlined, GoogleOutlined } from '@ant-design/icons';
import { BookingContext } from '../../../context/BookingContext';
import { useBooking } from '../../../hooks/useBooking';

const { Title, Text } = Typography;

function Step4PaymentMethod() {
  const { bookingData } = useContext(BookingContext);
  const { processPayment, loading, error } = useBooking();
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [form] = Form.useForm();
  
  // Tính tổng tiền
  const calculateTotal = () => {
    const ticketsTotal = bookingData.seats.length * bookingData.ticketPrice;
    const snacksTotal = bookingData.snacks.reduce((total, snack) => 
      total + (snack.price * snack.quantity), 0);
    return ticketsTotal + snacksTotal;
  };
  
  // Xử lý khi chọn phương thức thanh toán
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  // Xử lý khi nhấn nút thanh toán
  const handleSubmit = async (values) => {
    let cardDetails = null;
    
    if (paymentMethod === 'credit_card') {
      cardDetails = {
        cardNumber: values.cardNumber,
        cardholderName: values.cardholderName,
        expiryDate: values.expiryDate,
        cvv: values.cvv
      };
    }
    
    await processPayment(paymentMethod, cardDetails);
  };
  
  // Thể hiện thông tin đặt chỗ
  const renderBookingSummary = () => (
    <Card title="Thông tin đặt vé" bordered={false}>
      <div className="summary-item">
        <Text strong>Phim:</Text>
        <Text>{bookingData.movie?.title}</Text>
      </div>
      <div className="summary-item">
        <Text strong>Suất chiếu:</Text>
        <Text>{bookingData.showtime?.date} - {bookingData.showtime?.time}</Text>
      </div>
      <div className="summary-item">
        <Text strong>Ghế:</Text>
        <Text>{bookingData.seats?.join(', ')}</Text>
      </div>
      <div className="summary-item">
        <Text strong>Giá vé:</Text>
        <Text>{bookingData.ticketPrice?.toLocaleString()} đ x {bookingData.seats?.length}</Text>
      </div>
      <div className="summary-item">
        <Text strong>Tổng tiền vé:</Text>
        <Text>{(bookingData.seats?.length * bookingData.ticketPrice).toLocaleString()} đ</Text>
      </div>
      
      {bookingData.snacks?.length > 0 && (
        <>
          <Divider />
          <Title level={5}>Đồ ăn</Title>
          {bookingData.snacks.map((snack, index) => (
            <div key={index} className="summary-item">
              <Text>{snack.name} x{snack.quantity}:</Text>
              <Text>{(snack.price * snack.quantity).toLocaleString()} đ</Text>
            </div>
          ))}
        </>
      )}
      
      <Divider />
      <div className="summary-item total">
        <Text strong>Tổng cộng:</Text>
        <Text strong style={{ fontSize: '18px', color: '#f5222d' }}>
          {calculateTotal().toLocaleString()} đ
        </Text>
      </div>
    </Card>
  );
  
  return (
    <div className="payment-container">
      <Title level={3}>Thanh toán</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          {renderBookingSummary()}
        </Col>
        
        <Col xs={24} md={14}>
          <Card title="Phương thức thanh toán" bordered={false}>
            {error && (
              <Alert
                message="Lỗi thanh toán"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}
            
            <Radio.Group 
              value={paymentMethod} 
              onChange={handlePaymentMethodChange}
              style={{ width: '100%', marginBottom: '20px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Radio.Button value="credit_card" style={{ height: 'auto', padding: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCardOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
                    <div>
                      <div>Thẻ tín dụng / Ghi nợ</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Visa, Mastercard, JCB</div>
                    </div>
                  </div>
                </Radio.Button>
                
                <Radio.Button value="paypal" style={{ height: 'auto', padding: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <WalletOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
                    <div>
                      <div>Ví điện tử</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Momo, ZaloPay, VNPay</div>
                    </div>
                  </div>
                </Radio.Button>
                
                <Radio.Button value="google_pay" style={{ height: 'auto', padding: '10px', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GoogleOutlined style={{ fontSize: '24px', marginRight: '10px' }} />
                    <div>
                      <div>Google Pay</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Thanh toán nhanh chóng với Google Pay</div>
                    </div>
                  </div>
                </Radio.Button>
              </Space>
            </Radio.Group>
            
            {paymentMethod === 'credit_card' && (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="cardNumber"
                  label="Số thẻ"
                  rules={[{ required: true, message: 'Vui lòng nhập số thẻ' }]}
                >
                  <Input placeholder="1234 5678 9012 3456" maxLength={19} />
                </Form.Item>
                
                <Form.Item
                  name="cardholderName"
                  label="Tên chủ thẻ"
                  rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ' }]}
                >
                  <Input placeholder="NGUYEN VAN A" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="expiryDate"
                      label="Ngày hết hạn"
                      rules={[{ required: true, message: 'Vui lòng nhập ngày hết hạn' }]}
                    >
                      <Input placeholder="MM/YY" maxLength={5} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="cvv"
                      label="CVV"
                      rules={[{ required: true, message: 'Vui lòng nhập mã CVV' }]}
                    >
                      <Input placeholder="123" maxLength={3} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    size="large"
                  >
                    Thanh toán {calculateTotal().toLocaleString()} đ
                  </Button>
                </Form.Item>
              </Form>
            )}
            
            {(paymentMethod === 'paypal' || paymentMethod === 'google_pay') && (
              <div style={{ textAlign: 'center' }}>
                <p>
                  {paymentMethod === 'paypal' 
                    ? 'Bạn sẽ được chuyển đến trang thanh toán của ví điện tử để hoàn tất giao dịch.' 
                    : 'Bạn sẽ được chuyển đến trang thanh toán của Google Pay để hoàn tất giao dịch.'}
                </p>
                <Button 
                  type="primary" 
                  onClick={() => handleSubmit({})}
                  loading={loading}
                  block
                  size="large"
                  style={{ marginTop: '20px' }}
                >
                  Tiếp tục thanh toán {calculateTotal().toLocaleString()} đ
                </Button>
              </div>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Text type="secondary">
                Thông tin thanh toán của bạn được bảo mật và mã hóa.
                <br />
                Bạn sẽ nhận được email xác nhận sau khi thanh toán thành công.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
      
      <div className="payment-notice" style={{ marginTop: '20px' }}>
        <Alert
          message="Lưu ý"
          description="Vé sẽ được giữ trong vòng 15 phút. Sau thời gian này, nếu bạn chưa hoàn tất thanh toán, hệ thống sẽ tự động hủy đặt vé."
          type="info"
          showIcon
        />
      </div>
    </div>
  );
}

export default Step4PaymentMethod;