// frontend/src/components/Payments/PaymentSteps/PaymentMethodStep.jsx
import React from 'react';
import { 
  Radio, 
  Form, 
  Input, 
  Button, 
  Alert, 
  Card, 
  Typography,
  Space
} from 'antd';
import {
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const PaymentMethodStep = ({ 
  paymentMethod, 
  onPaymentMethodChange, 
  onPaymentConfirm, 
  paymentError,
  isProcessing
}) => {
  const [form] = Form.useForm();

  const handleWalletProviderChange = (e) => {
    const provider = e.target.value;
    form.setFieldsValue({
      walletProvider: provider
    });
    console.log(`Đã chọn nhà cung cấp ví: ${provider}`);
  };

  return (
    <div className="payment-method-step">
      <Title level={4}>Chọn phương thức thanh toán</Title>

      {paymentError && (
        <Alert
          message="Lỗi thanh toán"
          description={paymentError}
          type="error"
          showIcon
          className="error-alert"
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onPaymentConfirm}
        initialValues={{ paymentMethod }}
      >
        <Form.Item name="paymentMethod">
          <Radio.Group onChange={onPaymentMethodChange} value={paymentMethod} className="payment-options">
            <Radio.Button value="credit_card" className="payment-option">
              <CreditCardOutlined /> Thẻ tín dụng / Ghi nợ
            </Radio.Button>
            <Radio.Button value="bank_transfer" className="payment-option">
              <BankOutlined /> Chuyển khoản ngân hàng
            </Radio.Button>
            <Radio.Button value="e_wallet" className="payment-option">
              <WalletOutlined /> Ví điện tử
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Card className="payment-details-card">
          {paymentMethod === "credit_card" && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Số thẻ"
                name="cardNumber"
                rules={[{ required: true, message: "Vui lòng nhập số thẻ" }]}
              >
                <Input placeholder="1234 5678 9012 3456" maxLength={19} />
              </Form.Item>

              <Form.Item
                label="Tên chủ thẻ"
                name="cardName"
                rules={[{ required: true, message: "Vui lòng nhập tên chủ thẻ" }]}
              >
                <Input placeholder="NGUYEN VAN A" />
              </Form.Item>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Form.Item
                  label="Ngày hết hạn"
                  name="expiryDate"
                  rules={[{ required: true, message: "Vui lòng nhập ngày hết hạn" }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="MM/YY" maxLength={5} />
                </Form.Item>
                <Form.Item
                  label="CVV/CVC"
                  name="cvv"
                  rules={[{ required: true, message: "Vui lòng nhập mã CVV" }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder="123" maxLength={3} />
                </Form.Item>
              </div>
            </Space>
          )}

          {paymentMethod === "bank_transfer" && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Tên ngân hàng"
                name="bankName"
                rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
              >
                <Input placeholder="VCB, ACB, ..." />
              </Form.Item>

              <Form.Item
                label="Số tài khoản"
                name="accountNumber"
                rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
              >
                <Input placeholder="0123456789" />
              </Form.Item>
            </Space>
          )}

          {paymentMethod === "e_wallet" && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input placeholder="0901234567" />
              </Form.Item>

              <Form.Item
                label="Chọn ví điện tử"
                name="walletProvider"
                rules={[{ required: true, message: "Vui lòng chọn nhà cung cấp ví" }]}
              >
                <Radio.Group onChange={handleWalletProviderChange}>
                  <Radio value="momo">MoMo</Radio>
                  <Radio value="zalopay">ZaloPay</Radio>
                  <Radio value="vnpay">VNPay</Radio>
                </Radio.Group>
              </Form.Item>
            </Space>
          )}

          <Form.Item className="submit-button-container">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isProcessing}
              disabled={isProcessing}
              block
            >
              Xác nhận thanh toán
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default PaymentMethodStep;