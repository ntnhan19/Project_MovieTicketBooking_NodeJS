// frontend/src/pages/PaymentMethod.jsx
import React, { useState } from 'react';
import { Radio, Card, Form, Input, Button, Typography, Row, Col, Divider, Spin } from 'antd';
import { 
  CreditCardOutlined, 
  BankOutlined, 
  WalletOutlined,
  QrcodeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PaymentMethod = ({ onPayment, loading }) => {
  const [method, setMethod] = useState('credit');
  const [form] = Form.useForm();
  
  const handleSubmit = () => {
    if (method === 'credit') {
      form.validateFields()
        .then(() => {
          onPayment(method);
        })
        .catch(() => {
          // Form validation failed
        });
    } else {
      // No strict validation for other payment methods
      onPayment(method);
    }
  };
  
  const renderPaymentForm = () => {
    switch (method) {
      case 'credit':
        return (
          <Form form={form} layout="vertical">
            <Form.Item 
              label="Tên chủ thẻ" 
              name="cardHolder" 
              rules={[{ required: true, message: 'Vui lòng nhập tên chủ thẻ' }]}
            >
              <Input placeholder="Nhập tên chủ thẻ" />
            </Form.Item>
            <Form.Item 
              label="Số thẻ" 
              name="cardNumber" 
              rules={[
                { required: true, message: 'Vui lòng nhập số thẻ' },
                { pattern: /^\d{16}$/, message: 'Số thẻ phải có 16 chữ số' }
              ]}
            >
              <Input placeholder="Nhập số thẻ" maxLength={16} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="Ngày hết hạn" 
                  name="expiry" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập ngày hết hạn' },
                    { pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Định dạng MM/YY' }
                  ]}
                >
                  <Input placeholder="MM/YY" maxLength={5} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="CVV" 
                  name="cvv" 
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã CVV' },
                    { pattern: /^\d{3}$/, message: 'CVV phải có 3 chữ số' }
                  ]}
                >
                  <Input placeholder="Nhập CVV" maxLength={3} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );
      case 'bank':
        return (
          <div className="bank-transfer-info">
            <Title level={5}>Chuyển khoản ngân hàng</Title>
            <Text>Vui lòng chuyển khoản đến số tài khoản sau:</Text>
            <div className="bank-details">
              <Row>
                <Col span={8}><Text strong>Ngân hàng:</Text></Col>
                <Col span={16}><Text>BIDV</Text></Col>
              </Row>
              <Row>
                <Col span={8}><Text strong>Số tài khoản:</Text></Col>
                <Col span={16}><Text>123456789012</Text></Col>
              </Row>
              <Row>
                <Col span={8}><Text strong>Chủ tài khoản:</Text></Col>
                <Col span={16}><Text>GALAXY CINEMA</Text></Col>
              </Row>
              <Row>
                <Col span={8}><Text strong>Nội dung:</Text></Col>
                <Col span={16}><Text>[Mã đặt vé sẽ được cung cấp sau]</Text></Col>
              </Row>
            </div>
            <Text type="secondary">Vui lòng nhấn "Xác nhận thanh toán" sau khi đã chuyển khoản.</Text>
          </div>
        );
      case 'ewallet':
        return (
          <div className="ewallet-selection">
            <Title level={5}>Thanh toán qua ví điện tử</Title>
            <Row gutter={[16, 16]} className="wallet-options">
              <Col xs={24} sm={8}>
                <Card hoverable className="wallet-card momo">
                  <div className="wallet-logo">M</div>
                  <Text>MoMo</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable className="wallet-card zalopay">
                  <div className="wallet-logo">Z</div>
                  <Text>ZaloPay</Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable className="wallet-card vnpay">
                  <div className="wallet-logo">V</div>
                  <Text>VNPay</Text>
                </Card>
              </Col>
            </Row>
            <Text type="secondary" className="wallet-instruction">
              Chọn ví điện tử và nhấn "Xác nhận thanh toán" để tiếp tục.
            </Text>
          </div>
        );
      case 'qr':
        return (
          <div className="qr-payment">
            <Title level={5}>Quét mã QR để thanh toán</Title>
            <div className="qr-code-container">
              <div className="qr-code">
                <div className="qr-placeholder"></div>
              </div>
            </div>
            <Text type="secondary">
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR và hoàn tất thanh toán.
              Sau khi thanh toán thành công, nhấn "Xác nhận thanh toán".
            </Text>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="payment-method-container">
      <Title level={4}>Chọn phương thức thanh toán</Title>
      
      <Radio.Group 
        value={method} 
        onChange={(e) => setMethod(e.target.value)}
        className="payment-method-selector"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Radio.Button value="credit" className="payment-option">
              <CreditCardOutlined className="payment-icon" />
              <span>Thẻ tín dụng</span>
            </Radio.Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Radio.Button value="bank" className="payment-option">
              <BankOutlined className="payment-icon" />
              <span>Chuyển khoản</span>
            </Radio.Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Radio.Button value="ewallet" className="payment-option">
              <WalletOutlined className="payment-icon" />
              <span>Ví điện tử</span>
            </Radio.Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Radio.Button value="qr" className="payment-option">
              <QrcodeOutlined className="payment-icon" />
              <span>Quét mã QR</span>
            </Radio.Button>
          </Col>
        </Row>
      </Radio.Group>
      
      <Divider />
      
      <div className="payment-form">
        {renderPaymentForm()}
      </div>
      
      <div className="payment-action">
        <Button 
          type="primary" 
          size="large" 
          onClick={handleSubmit} 
          loading={loading}
          block
        >
          Xác nhận thanh toán
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethod;