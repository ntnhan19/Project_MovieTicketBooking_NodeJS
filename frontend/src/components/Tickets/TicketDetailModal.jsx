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
      setQrCodeData('');
    }
  }, [visible, ticketId]);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketData = await ticketApi.getTicketById(ticketId);
      setTicket(ticketData);
      generateQRCode(ticketData.id);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin vé:', error);
      setError('Không thể tải thông tin vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (ticketId) => {
    if (!ticketId) return;
    
    setLoadingQR(true);
    
    try {
      const qrData = await ticketApi.generateTicketQR(ticketId);
      setQrCodeData(qrData);
    } catch (error) {
      console.error('Lỗi khi tạo QR code:', error);
      generateLocalQRCode();
    } finally {
      setLoadingQR(false);
    }
  };

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

  const renderStatus = (status) => {
    if (!status) return null;
    
    const statusMap = {
      'confirmed': { color: 'green', text: 'Đã xác nhận' },
      'pending': { color: 'gold', text: 'Đang xử lý' },
      'cancelled': { color: 'red', text: 'Đã hủy' },
      'used': { color: 'blue', text: 'Đã sử dụng' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'default', text: status };
    
    return <Tag color={statusInfo.color} className="text-text-primary dark:text-dark-text-primary">{statusInfo.text}</Tag>;
  };

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

  const handleCancelTicket = async () => {
    try {
      setLoading(true);
      await ticketApi.cancelTicket(ticket.id);
      fetchTicketDetails();
    } catch (error) {
      console.error('Lỗi khi hủy vé:', error);
      setError('Không thể hủy vé. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<Title level={4} className="text-text-primary dark:text-dark-text-primary">Chi tiết vé</Title>}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={null}
      className="custom-modal popup-animation"
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Đang tải thông tin vé..." className="text-text-primary dark:text-dark-text-primary" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} className="text-text-primary dark:text-dark-text-primary" />
      ) : ticket ? (
        <div>
          <div id="ticket-content" className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <Row gutter={[24, 16]} className="mb-4">
              <Col xs={24} md={16}>
                <Title level={4} className="mb-1 text-text-primary dark:text-dark-text-primary">{ticket.movie?.title}</Title>
                <Space>
                  {renderStatus(ticket.status)}
                  <Text type="secondary" className="text-text-secondary dark:text-dark-text-secondary">ID: {ticket.id}</Text>
                </Space>
              </Col>
              <Col xs={24} md={8} className="flex justify-end">
                <div className="qr-code-container p-2 bg-light-bg-secondary dark:bg-gray-700 rounded-lg">
                  {loadingQR ? (
                    <Spin tip="Đang tạo mã QR..." className="text-text-primary dark:text-dark-text-primary" />
                  ) : qrCodeData ? (
                    <QRCode 
                      value={qrCodeData}
                      size={120}
                      level="H"
                      includeMargin={true}
                      renderAs="svg"
                      className="bg-white dark:bg-gray-800 p-2 rounded-lg"
                    />
                  ) : (
                    <Button 
                      onClick={() => generateQRCode(ticket.id)}
                      className="ripple-btn border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                    >
                      Tạo mã QR
                    </Button>
                  )}
                </div>
              </Col>
            </Row>

            <Divider className="my-4 border-gray-200 dark:border-gray-600" />

            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small" className="mb-4">
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><CalendarOutlined className="mr-2" /> Ngày chiếu</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">{formatDate(ticket.showtime?.startTime)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><ClockCircleOutlined className="mr-2" /> Giờ chiếu</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">{formatTime(ticket.showtime?.startTime)} - {formatTime(ticket.showtime?.endTime)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><EnvironmentOutlined className="mr-2" /> Rạp</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">{ticket.showtime?.hall?.cinema?.name}</span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><EnvironmentOutlined className="mr-2" /> Phòng chiếu</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">{ticket.showtime?.hall?.name}</span>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Descriptions column={1} size="small" className="mb-4">
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><UserOutlined className="mr-2" /> Ghế</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <Text strong className="text-text-primary dark:text-dark-text-primary">{ticket.seat?.row}{ticket.seat?.column}</Text>
                    {ticket.seat?.type === 'VIP' && <Tag color="gold" className="ml-2 text-text-primary dark:text-dark-text-primary">VIP</Tag>}
                    {ticket.seat?.type === 'COUPLE' && <Tag color="pink" className="ml-2 text-text-primary dark:text-dark-text-primary">Ghế đôi</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><CreditCardOutlined className="mr-2" /> Thanh toán</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {ticket.payment?.status === 'COMPLETED' ? (
                      <Tag color="green" className="text-text-primary dark:text-dark-text-primary">Đã thanh toán</Tag>
                    ) : (
                      <Tag color="orange" className="text-text-primary dark:text-dark-text-primary">Chưa thanh toán</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><CreditCardOutlined className="mr-2" /> Phương thức</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">
                      {ticket.payment?.method === 'VNPAY' ? 'VNPay' : 
                       ticket.payment?.method === 'MOMO' ? 'MoMo' : 
                       ticket.payment?.method || 'Không có'}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={<span className="flex items-center text-text-primary dark:text-dark-text-primary"><TagOutlined className="mr-2" /> Giá vé</span>}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    <span className="text-text-primary dark:text-dark-text-primary">{ticket.price?.toLocaleString('vi-VN')}đ</span>
                    {ticket.promotion && (
                      <Tag color="green" className="ml-2 text-text-primary dark:text-dark-text-primary">Giảm giá {ticket.promotion.discount}%</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>

          <Divider className="my-4 border-gray-200 dark:border-gray-600" />

          <div className="flex justify-between">
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              disabled={ticket.status === 'cancelled'}
              className="ripple-btn bg-button-gradient hover:bg-button-gradient-hover transition-all"
            >
              Tải vé
            </Button>
            
            {(ticket.status === 'active' || ticket.status === 'pending') && (
              <Button 
                danger 
                onClick={handleCancelTicket}
                disabled={loading}
                className="ripple-btn border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all"
              >
                Hủy vé
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Alert type="warning" message="Không tìm thấy thông tin vé" className="text-text-primary dark:text-dark-text-primary" />
      )}
    </Modal>
  );
};

export default TicketDetailModal;