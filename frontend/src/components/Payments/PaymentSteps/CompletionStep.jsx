import React, { useState } from 'react';
import { Result, Button, Typography, Row, Col, Divider, List, Empty, Space } from 'antd';
import { CheckCircleOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
      <div className="ticket-info-card bg-white rounded-lg shadow-card p-4 mb-6 border border-border-light">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <div className="movie-info-card bg-light-bg-secondary rounded-lg p-4">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={5} className="m-0 mb-2 text-text-primary">{showtimeDetails.movie?.title || 'Phim không xác định'}</Title>
                  <Text strong className="block mb-1">Rạp: {showtimeDetails.hall.cinema.name}</Text>
                  <Text strong className="block mb-1">Phòng: {showtimeDetails.hall.name}</Text>
                  <Text strong className="block mb-1">
                    Suất chiếu:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                  <Text strong className="block mb-1">
                    Ngày:{" "}
                    {new Date(showtimeDetails.startTime).toLocaleDateString(
                      "vi-VN"
                    )}
                  </Text>
                  <Text strong className="block mb-1">Ghế: {getSeatInfo()}</Text>
                  {ticket.price && (
                    <Text strong className="block mt-2 text-primary">
                      Giá: {ticket.price.toLocaleString('vi-VN')}đ
                    </Text>
                  )}
                </Col>
              </Row>
            </div>
          </Col>

          <Col xs={24} md={7} className="flex flex-col items-center justify-center">
            <div className="qr-code bg-white p-4 rounded-lg shadow-sm border border-border-light mb-4">
              <div className="ticket-qr w-48 h-48 mx-auto">
                {/* QRCode component sẽ được thay bằng một div placeholder */}
                <div className="bg-gray-100 w-full h-full flex items-center justify-center">
                  <Text className="text-text-secondary">Mã QR: {ticketCode}</Text>
                </div>
              </div>
            </div>
            <Text className="booking-code text-center mb-4" copyable>
              {ticketCode}
            </Text>
            <Space direction="vertical" align="center" className="w-full">
              <Button icon={<PrinterOutlined />} className="btn-outline w-full">In vé</Button>
            </Space>
          </Col>
        </Row>
      </div>
    );
  };

  // Render danh sách vé
  const renderTicketsList = () => {
    if (tickets.length <= 1) return null;

    return (
      <div className="tickets-list bg-white p-4 rounded-lg shadow-sm border border-border-light">
        <Title level={5} className="mb-4">Danh sách vé của bạn</Title>
        <List
          size="small"
          bordered
          dataSource={tickets}
          renderItem={(ticket, index) => (
            <List.Item 
              className={`${index === activeTicketIndex ? 'bg-primary-light/10 border-l-4 border-l-primary' : ''} hover:bg-gray-50 transition-colors`}
              onClick={() => setActiveTicketIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <FileTextOutlined className={index === activeTicketIndex ? 'text-primary' : 'text-text-secondary'} /> 
              <span className="ml-2">
                {ticket.seat ? `Vé #${ticket.id} - Ghế ${ticket.seat.row}${ticket.seat.column || ticket.seat.number}` : `Vé #${ticket.id}`}
              </span>
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
        <div className="payment-summary bg-light-bg-secondary p-4 rounded-lg mb-6">
          <Row justify="space-between" className="mb-2">
            <Col>
              <Text strong>Tổng thanh toán:</Text>
            </Col>
            <Col>
              <Text strong className="text-primary">{paymentInfo.totalAmount.toLocaleString('vi-VN')}đ</Text>
            </Col>
          </Row>
          <Row justify="space-between" className="mb-2">
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
        </div>

        <Title level={4} className="ticket-title text-center mb-6 text-primary">
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
    <div className="completion-step animate-fadeIn">
      <Result
        icon={paymentSuccess ? <CheckCircleOutlined style={{ color: '#e71a0f' }} /> : undefined}
        status={paymentSuccess ? "success" : "error"}
        title={
          <span className={`${paymentSuccess ? 'text-primary' : ''}`}>
            {paymentSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </span>
        }
        subTitle={
          paymentSuccess && ticketData
            ? `Mã đặt vé: ${tickets.length > 1 ? `${tickets.length} vé` : getTicketCode(tickets[0])}`
            : paymentError
        }
        extra={[
          <Button type="primary" key="home" onClick={onFinish} className="btn-primary">
            Về trang chủ
          </Button>,
          !paymentSuccess && (
            <Button type="default" key="retry" onClick={onRetry}>
              Thử lại
            </Button>
          ),
        ]}
        className="mb-8"
      />

      {paymentSuccess && (
        <div className="ticket-card content-card p-6">
          {renderSuccessContent()}
        </div>
      )}
    </div>
  );
};

export default CompletionStep;