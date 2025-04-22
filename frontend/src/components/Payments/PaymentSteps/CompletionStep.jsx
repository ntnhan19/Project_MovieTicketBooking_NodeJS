import React, { useState } from 'react';
import { Result, Button, Card, Typography, Row, Col, QRCode, Divider, Tabs, List, Empty, Space } from 'antd';
import { CheckCircleOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CompletionStep = ({ 
  paymentSuccess, 
  ticketData, 
  paymentError, 
  showtimeDetails,
  seatDetails,
  onFinish,
  onRetry
}) => {
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);

  // Xử lý để lấy danh sách vé từ ticketData
  const getTicketsList = () => {
    if (!ticketData) return [];
    if (ticketData.tickets && Array.isArray(ticketData.tickets)) {
      return ticketData.tickets;
    }
    // Nếu không có danh sách vé, tạo một mảng với 1 vé
    return [ticketData];
  };

  const tickets = getTicketsList();
  const currentTicket = tickets.length > 0 ? tickets[activeTicketIndex] : null;

  // Chuyển đổi bookingCode hoặc tạo mã vé duy nhất
  const getTicketCode = (ticket) => {
    if (ticket.bookingCode) return ticket.bookingCode;
    if (ticket.code) return ticket.code;
    return `T${ticket.id}`;
  };

  // Render thông tin một vé
  const renderTicketInfo = (ticket) => {
    if (!ticket || !showtimeDetails) return <Empty description="Không có thông tin vé" />;

    // Xử lý thông tin ghế từ vé
    const getSeatInfo = () => {
      if (ticket.seat) {
        return `${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
      }
      // Tìm ghế tương ứng trong seatDetails
      const matchingSeat = seatDetails.find(seat => seat.id === ticket.seatId || (ticket.seat && seat.id === ticket.seat.id));
      return matchingSeat ? `${matchingSeat.row}${matchingSeat.column || matchingSeat.number}` : 'Không xác định';
    };

    const ticketCode = getTicketCode(ticket);

    return (
      <Card className="ticket-info-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card className="movie-info-card">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5}>{showtimeDetails.movie?.title || 'Phim không xác định'}</Title>
                  <Text strong>Rạp: {showtimeDetails.hall.cinema.name}</Text>
                  <br />
                  <Text strong>Phòng: {showtimeDetails.hall.name}</Text>
                  <br />
                  <Text strong>
                    Suất chiếu:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                  <br />
                  <Text strong>
                    Ngày:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Text>
                  <br />
                  <Text strong>Ghế: {getSeatInfo()}</Text>
                  {ticket.price && (
                    <>
                      <br />
                      <Text strong>Giá: {ticket.price.toLocaleString('vi-VN')}đ</Text>
                    </>
                  )}
                </Col>
              </Row>
            </Card>
          </Col>

          <Divider type="vertical" style={{ height: '100%' }} />

          <Col xs={24} md={7} className="qr-code-container">
            <QRCode
              value={ticketCode}
              size={200}
              bordered={false}
              className="ticket-qr"
            />
            <Text className="booking-code" copyable>
              {ticketCode}
            </Text>
            <Space direction="vertical" align="center" style={{ marginTop: 16 }}>
              <Button icon={<PrinterOutlined />}>In vé</Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  // Render danh sách vé
  const renderTicketsList = () => {
    if (tickets.length <= 1) return null;

    return (
      <div className="tickets-list">
        <Title level={5}>Danh sách vé của bạn</Title>
        <List
          size="small"
          bordered
          dataSource={tickets}
          renderItem={(ticket, index) => (
            <List.Item 
              className={index === activeTicketIndex ? 'active-ticket' : ''}
              onClick={() => setActiveTicketIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <FileTextOutlined /> {ticket.seat ? `Vé #${ticket.id} - Ghế ${ticket.seat.row}${ticket.seat.column || ticket.seat.number}` : `Vé #${ticket.id}`}
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Render kết quả thanh toán thành công
  const renderSuccessContent = () => {
    if (!ticketData || !showtimeDetails) return null;

    const paymentInfo = {
      totalAmount: ticketData.totalAmount || tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0),
      method: ticketData.paymentMethod || 'Không xác định',
      transactionId: ticketData.transactionId || ticketData.payment?.transactionId || 'Không xác định'
    };

    return (
      <>
        <Card className="payment-summary">
          <Row justify="space-between">
            <Col>
              <Text strong>Tổng thanh toán:</Text>
            </Col>
            <Col>
              <Text strong>{paymentInfo.totalAmount.toLocaleString('vi-VN')}đ</Text>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Text>Phương thức thanh toán:</Text>
            </Col>
            <Col>
              <Text>{paymentInfo.method}</Text>
            </Col>
          </Row>
          <Row justify="space-between">
            <Col>
              <Text>Mã giao dịch:</Text>
            </Col>
            <Col>
              <Text copyable>{paymentInfo.transactionId}</Text>
            </Col>
          </Row>
        </Card>

        <Title level={4} className="ticket-title">
          Vui lòng xuất trình mã QR khi đến rạp
        </Title>

        {tickets.length > 1 && (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              {renderTicketsList()}
            </Col>
            <Col xs={24} md={18}>
              {renderTicketInfo(currentTicket)}
            </Col>
          </Row>
        )}

        {tickets.length <= 1 && renderTicketInfo(currentTicket)}
      </>
    );
  };

  return (
    <div className="completion-step">
      <Result
        icon={paymentSuccess ? <CheckCircleOutlined /> : undefined}
        status={paymentSuccess ? "success" : "error"}
        title={
          paymentSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"
        }
        subTitle={
          paymentSuccess && ticketData
            ? `Mã đặt vé: ${tickets.length > 1 ? `${tickets.length} vé` : getTicketCode(tickets[0])}`
            : paymentError
        }
        extra={[
          <Button type="primary" key="home" onClick={onFinish}>
            Về trang chủ
          </Button>,
          !paymentSuccess && (
            <Button type="default" key="retry" onClick={onRetry}>
              Thử lại
            </Button>
          ),
        ]}
      />

      {paymentSuccess && (
        <Card className="ticket-card">
          {renderSuccessContent()}
        </Card>
      )}
    </div>
  );
};

export default CompletionStep;