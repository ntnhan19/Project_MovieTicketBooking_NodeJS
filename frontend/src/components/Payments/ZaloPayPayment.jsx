import React, { useState, useEffect } from 'react';
import { Card, Button, Result, Spin, Typography, QRCode, Space, Alert, Modal, List } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MobileOutlined, LoadingOutlined, SyncOutlined, FileTextOutlined } from '@ant-design/icons';
import { paymentApi } from '../../api/paymentApi';
import './ZaloPayPayment.css';

const { Title, Text, Paragraph } = Typography;

const ZaloPayPayment = ({ payment, ticket, onPaymentComplete, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(payment?.status || 'PENDING');
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);
  const [remainingTime, setRemainingTime] = useState(900); // 15 phút tính bằng giây
  const [debugMode, setDebugMode] = useState(false); // Chế độ debug để theo dõi dữ liệu
  const [ticketsInfo, setTicketsInfo] = useState([]);

  // Hiển thị thông tin debug
  useEffect(() => {
    console.log("Dữ liệu payment nhận được:", payment);
    console.log("Payment URL:", payment?.paymentUrl);
    console.log("Dữ liệu tickets nhận được:", ticket);
    
    // Xử lý thông tin vé để hiển thị
    if (ticket && ticket.tickets && Array.isArray(ticket.tickets)) {
      setTicketsInfo(ticket.tickets);
    }
  }, [payment, ticket]);

  // Effect để tạo đồng hồ đếm ngược
  useEffect(() => {
    if (paymentStatus === 'PENDING' && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus, remainingTime]);

  // Effect để kiểm tra trạng thái thanh toán định kỳ
  useEffect(() => {
    // Chỉ thiết lập kiểm tra nếu đã có ID thanh toán và URL hợp lệ
    if (payment?.id && payment?.paymentUrl && paymentStatus === 'PENDING') {
      // Thiết lập kiểm tra trạng thái 5 giây một lần
      const interval = setInterval(async () => {
        try {
          // Sử dụng API tùy chỉnh nếu đang test
          const statusResponse = await paymentApi.checkZaloPayStatus(payment.id)
            .catch(error => {
              console.warn("Lỗi kiểm tra API:", error);
              // Nếu có lỗi 403, hiển thị thông báo nhưng không dừng kiểm tra
              if (error.response?.status === 403) {
                setError("Không có quyền kiểm tra trạng thái tự động. Vui lòng kiểm tra thủ công.");
                return { status: 'PENDING' }; // Giả định vẫn đang chờ
              }
              throw error;
            });
          
          console.log('Kiểm tra trạng thái thanh toán:', statusResponse);
          
          if (statusResponse.status !== 'PENDING') {
            setPaymentStatus(statusResponse.status);
            
            // Xử lý các trạng thái khác PENDING
            if (statusResponse.status === 'COMPLETED') {
              onPaymentComplete(true, statusResponse);
              clearInterval(interval);
            } else if (['FAILED', 'CANCELLED'].includes(statusResponse.status)) {
              setError('Thanh toán đã bị hủy hoặc thất bại');
              onPaymentComplete(false, statusResponse);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Lỗi khi kiểm tra trạng thái thanh toán:', error);
          // Không dừng kiểm tra nếu có lỗi tạm thời
        }
      }, 5000);
      
      setStatusCheckInterval(interval);
      
      // Xóa interval khi component unmount
      return () => {
        if (interval) clearInterval(interval);
      };
    }
    
    // Nếu trạng thái không phải PENDING, không cần kiểm tra nữa
    if (paymentStatus !== 'PENDING' && statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
  }, [payment?.id, payment?.paymentUrl, paymentStatus, onPaymentComplete]);

  // Hiển thị thời gian định dạng mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Xử lý khi người dùng muốn mở trang thanh toán ZaloPay
  const handleOpenZaloPay = () => {
    if (payment?.paymentUrl) {
      window.open(payment.paymentUrl, '_blank');
    } else {
      setError("Không tìm thấy URL thanh toán ZaloPay");
    }
  };

  // Xử lý kiểm tra lại trạng thái thanh toán
  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const statusResponse = await paymentApi.checkZaloPayStatus(payment.id);
      setPaymentStatus(statusResponse.status);
      
      if (statusResponse.status === 'COMPLETED') {
        onPaymentComplete(true, statusResponse);
      } else if (['FAILED', 'CANCELLED'].includes(statusResponse.status)) {
        setError('Thanh toán đã bị hủy hoặc thất bại');
        onPaymentComplete(false, statusResponse);
      } else if (statusResponse.status === 'PENDING') {
        setError(null); // Xóa lỗi nếu có
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái:', error);
      
      // Xử lý lỗi 403 cụ thể
      if (error.response?.status === 403) {
        setError('Không có quyền kiểm tra trạng thái thanh toán. Vui lòng sử dụng chức năng giả lập thanh toán trong môi trường test.');
      } else {
        setError('Không thể kiểm tra trạng thái thanh toán. ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị kết quả thành công
  const renderSuccessResult = () => (
    <Result
      status="success"
      icon={<CheckCircleOutlined />}
      title="Thanh toán thành công!"
      subTitle={`Cảm ơn bạn đã thanh toán. Mã giao dịch: ${payment?.transactionId || payment?.appTransId || 'N/A'}`}
      extra={[
        <Button type="primary" key="continue" onClick={() => onPaymentComplete(true, payment)}>
          Tiếp tục
        </Button>
      ]}
    />
  );

  // Hiển thị kết quả thất bại
  const renderFailedResult = () => (
    <Result
      status="error"
      icon={<CloseCircleOutlined />}
      title="Thanh toán thất bại"
      subTitle={error || "Đã xảy ra lỗi trong quá trình thanh toán"}
      extra={[
        <Button type="primary" key="retry" onClick={() => window.location.reload()}>
          Thử lại
        </Button>,
        <Button key="back" onClick={onBack}>
          Quay lại
        </Button>
      ]}
    />
  );

  // Chức năng giả lập thanh toán thành công (chỉ dùng cho test)
  const handleSimulateSuccess = () => {
    // Hiển thị modal xác nhận
    Modal.confirm({
      title: 'Giả lập thanh toán thành công',
      content: 'Chức năng này chỉ dùng cho mục đích test. Bạn có muốn giả lập thanh toán thành công không?',
      onOk: () => {
        onPaymentComplete(true, {
          status: 'COMPLETED',
          transactionId: `DEMO-${Date.now()}`,
          ...payment
        });
      }
    });
  };

  // Hiển thị thông tin gỡ lỗi
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const renderDebugInfo = () => {
    if (!debugMode) return null;

    return (
      <Alert
        type="info"
        message="Thông tin debug"
        description={
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            <pre>{JSON.stringify(payment, null, 2)}</pre>
            <pre>{JSON.stringify(ticket, null, 2)}</pre>
          </div>
        }
        closable
      />
    );
  };

  // Hiển thị danh sách vé
  const renderTicketsInfo = () => {
    if (!ticketsInfo || ticketsInfo.length === 0) return null;

    return (
      <div className="tickets-info">
        <Paragraph>
          <Text strong>Thông tin vé:</Text>
        </Paragraph>
        <List
          size="small"
          bordered
          dataSource={ticketsInfo}
          renderItem={(ticket) => (
            <List.Item>
              <FileTextOutlined /> Vé #{ticket.id} - Ghế: {ticket.seat?.row}{ticket.seat?.number || ticket.seat?.column}
            </List.Item>
          )}
        />
      </div>
    );
  };

  // Hiển thị quá trình thanh toán
  const renderPaymentProcess = () => (
    <Card className="zalopay-payment-card">
      <div className="zalopay-payment-header">
        <img src="/zalopay-logo.png" alt="ZaloPay" className="zalopay-logo" />
        <Title level={4}>Thanh toán qua ZaloPay</Title>
      </div>
      
      {error && (
        <Alert 
          message="Thông báo" 
          description={error} 
          type="error" 
          showIcon 
          closable 
          className="payment-alert"
        />
      )}
      
      <div className="payment-amount">
        <Text>Số tiền thanh toán:</Text>
        <Title level={3}>{payment?.amount?.toLocaleString('vi-VN')}đ</Title>
      </div>
      
      {/* Hiển thị thông tin vé */}
      {renderTicketsInfo()}
      
      <div className="payment-info">
        <div className="payment-qr">
          {payment?.paymentUrl ? (
            <>
              <QRCode 
                value={payment.paymentUrl}
                size={200}
                bordered={false}
                status={remainingTime <= 0 ? "expired" : "active"}
                errorLevel="H"
              />
              <Text className="countdown-timer">
                {remainingTime > 0 ? formatTime(remainingTime) : "Đã hết hạn"}
              </Text>
            </>
          ) : (
            <Alert
              message="Không có mã QR"
              description="Không thể tạo mã QR do không có URL thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
              type="warning"
              showIcon
            />
          )}
        </div>
        
        <div className="payment-instructions">
          <Title level={5}>Hướng dẫn thanh toán</Title>
          <Space direction="vertical">
            <Text>1. Mở ứng dụng ZaloPay trên điện thoại</Text>
            <Text>2. Chọn "Quét mã QR"</Text>
            <Text>3. Quét mã QR bên trái</Text>
            <Text>4. Xác nhận thanh toán trên ZaloPay</Text>
          </Space>
          
          <Button 
            type="primary" 
            icon={<MobileOutlined />} 
            onClick={handleOpenZaloPay} 
            className="open-zalopay-btn"
            disabled={!payment?.paymentUrl}
          >
            Mở ZaloPay để thanh toán
          </Button>
        </div>
      </div>
      
      <div className="payment-actions">
        <Button 
          icon={<SyncOutlined spin={loading} />} 
          onClick={handleCheckStatus} 
          loading={loading}
          disabled={loading || remainingTime <= 0 || !payment?.id}
        >
          Kiểm tra trạng thái thanh toán
        </Button>
        
        <Button onClick={onBack} disabled={loading}>
          Hủy thanh toán
        </Button>

        {/* Nút giả lập thanh toán thành công - chỉ dùng cho môi trường test */}
        <Button 
          type="dashed" 
          onClick={handleSimulateSuccess}
          style={{ marginLeft: '10px' }}
        >
          Giả lập thanh toán thành công (Test)
        </Button>
        
        <Button 
          type="link" 
          onClick={toggleDebugMode}
          size="small"
        >
          {debugMode ? 'Ẩn thông tin debug' : 'Hiển thị thông tin debug'}
        </Button>
      </div>
      
      {remainingTime <= 0 && (
        <Alert 
          message="Thanh toán đã hết hạn" 
          description="Thời gian thanh toán đã hết. Vui lòng thử lại." 
          type="warning" 
          showIcon 
          className="payment-alert"
        />
      )}
      
      {renderDebugInfo()}
    </Card>
  );

  // Render theo trạng thái thanh toán
  const renderContent = () => {
    if (paymentStatus === 'COMPLETED') {
      return renderSuccessResult();
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      return renderFailedResult();
    } else {
      return renderPaymentProcess();
    }
  };

  return (
    <div className="zalopay-payment-container">
      {!payment ? (
        <div className="loading-container">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <Text>Đang khởi tạo thanh toán...</Text>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default ZaloPayPayment;