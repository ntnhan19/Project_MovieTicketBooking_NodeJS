import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Descriptions, 
  Divider, 
  Button, 
  Row, 
  Col, 
  Spin, 
  Tag, 
  Alert,
  Typography,
  Space
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  CreditCardOutlined,
  TagOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ticketApi } from '../../api/ticketApi';

const { Title, Text } = Typography;

const TicketDetailModal = ({ visible, ticketId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [loadingQR, setLoadingQR] = useState(false);

  useEffect(() => {
    if (visible && ticketId) {
      fetchTicketDetails();
    } else {
      // Reset state khi modal đóng
      setQrCodeData('');
    }
  }, [visible, ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketData = await ticketApi.getTicketById(ticketId);
      setTicket(ticketData);
      // Sau khi lấy thông tin vé, tạo mã QR
      generateQRCode(ticketData.id);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin vé:', error);
      setError('Không thể tải thông tin vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo QR code cho vé sử dụng API mới
  const generateQRCode = async (ticketId) => {
    if (!ticketId) return;
    
    setLoadingQR(true);
    
    try {
      // Sử dụng API để tạo QR code
      const qrData = await ticketApi.generateTicketQR(ticketId);
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Lỗi khi tạo QR code:', error);
      // Nếu API thất bại, tạo QR code cục bộ
      generateLocalQRCode();
    } finally {
      setLoadingQR(false);
    }
  };

  // Tạo QR code cục bộ (dự phòng)
  const generateLocalQRCode = () => {
    if (!ticket) return;
    
    const qrData = JSON.stringify({
      id: ticket.id,
      movieTitle: ticket.showtime?.movie?.title,
      showtime: ticket.showtime?.startTime,
      cinema: ticket.showtime?.hall?.cinema?.name,
      hall: ticket.hall?.name,
      seat: ticket.seat?.row + ticket.seat?.column,
      status: ticket.status
    });
    
    setQrCodeData(qrData);
  };

  // Format date từ ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Format time từ ISO string
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Render tag trạng thái vé
  const renderStatus = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'confirmed': { color: 'green', text: 'Đã xác nhận' },
      'pending': { color: 'gold', text: 'Đang xử lý' },
      'cancelled': { color: 'red', text: 'Đã hủy' },
      'used': { color: 'blue', text: 'Đã sử dụng' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'default', text: status };
    
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Hàm tải vé PDF
  const handleDownloadPDF = async () => {
    const ticketElement = document.getElementById('ticket-content');
    
    if (!ticketElement) return;
    
    try {
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ve-phim-${ticket.id}.pdf`);
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
    }
  };

  // Hàm hủy vé
  const handleCancelTicket = async () => {
    try {
      setLoading(true);
      await ticketApi.cancelTicket(ticket.id);
      fetchTicketDetails(); // Tải lại thông tin vé
    } catch (error) {
      console.error('Lỗi khi hủy vé:', error);
      setError('Không thể hủy vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4}>Chi tiết vé</Title>}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
      className="ticket-detail-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Đang tải thông tin vé..." />
        </div>
      ) : error ? (
        <Alert type="error" message={error} />
      ) : ticket ? (
        <div>
          <div id="ticket-content" className="p-4 bg-white rounded-lg">
            <Row gutter={[24, 16]} className="mb-4">
              <Col xs={24} md={16}>
                <Title level={4} className="mb-1">{ticket.movie?.title}</Title>
                <Space>
                  {renderStatus(ticket.status)}
                  <Text type="secondary">ID: {ticket.id}</Text>
                </Space>
              </Col>
              <Col xs={24} md={8} className="flex justify-end">
                <div className="qr-code-container">
                  {loadingQR ? (
                    <Spin tip="Đang tạo mã QR..." />
                  ) : qrCodeData ? (
                    <QRCode 
                      value={qrCodeData}
                      size={120}
                      level="H"
                      includeMargin={true}
                      renderAs="svg"
                    />
                  ) : (
                    <Button onClick={() => generateQRCode(ticket.id)}>Tạo mã QR</Button>
                  )}
                </div>
              </Col>
            </Row>

            <Divider className="my-4" />

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small" className="mb-4">
                  <Descriptions.Item 
                    label={<><CalendarOutlined /> Ngày chiếu</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {formatDate(ticket.showtime?.startTime)}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><ClockCircleOutlined /> Giờ chiếu</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {formatTime(ticket.showtime?.startTime)} - {formatTime(ticket.showtime?.endTime)}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><EnvironmentOutlined /> Rạp</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.showtime?.hall?.cinema?.name}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><EnvironmentOutlined /> Phòng chiếu</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.showtime?.hall?.name}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small" className="mb-4">
                  <Descriptions.Item 
                    label={<><UserOutlined /> Ghế</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <Text strong>{ticket.seat?.row}{ticket.seat?.column}</Text>
                    {ticket.seat?.type === 'VIP' && <Tag color="gold" className="ml-2">VIP</Tag>}
                    {ticket.seat?.type === 'COUPLE' && <Tag color="pink" className="ml-2">Ghế đôi</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><CreditCardOutlined /> Thanh toán</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.payment?.status === 'COMPLETED' ? (
                      <Tag color="green">Đã thanh toán</Tag>
                    ) : (
                      <Tag color="orange">Chưa thanh toán</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><CreditCardOutlined /> Phương thức</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.payment?.method === 'VNPAY' ? 'VNPay' : 
                     ticket.payment?.method === 'MOMO' ? 'MoMo' : 
                     ticket.payment?.method || 'Không có'}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<><TagOutlined /> Giá vé</>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.price?.toLocaleString('vi-VN')}đ
                    {ticket.promotion && (
                      <Tag color="green" className="ml-2">Giảm giá {ticket.promotion.discount}%</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>

          <Divider className="my-4" />

          <div className="flex justify-between">
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              disabled={ticket.status === 'cancelled'}
            >
              Tải vé
            </Button>
            
            {(ticket.status === 'active' || ticket.status === 'pending') && (
              <Button 
                danger 
                onClick={handleCancelTicket}
                disabled={loading}
              >
                Hủy vé
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Alert type="warning" message="Không tìm thấy thông tin vé" />
      )}
    </Modal>
  );
};

export default TicketDetailModal;