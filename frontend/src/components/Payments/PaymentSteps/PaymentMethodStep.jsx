import React from "react";
import {
  Radio,
  Form,
  Input,
  Button,
  Alert,
  Card,
  Typography,
  Space,
  Divider,
} from "antd";
import {
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const PaymentMethodStep = ({
  paymentMethod,
  onPaymentMethodChange,
  onPaymentConfirm,
  paymentError,
  isProcessing,
}) => {
  const [form] = Form.useForm();

  const handleWalletProviderChange = (e) => {
    const provider = e.target.value;
    form.setFieldsValue({
      walletProvider: provider,
    });
    console.log(`Đã chọn nhà cung cấp ví: ${provider}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <Title level={4} className="mb-6 text-text-primary">
        Chọn phương thức thanh toán
      </Title>

      {paymentError && (
        <Alert
          message="Lỗi thanh toán"
          description={paymentError}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onPaymentConfirm}
        initialValues={{ paymentMethod }}
      >
        <Form.Item name="paymentMethod" className="mb-6">
          <Radio.Group
            onChange={onPaymentMethodChange}
            value={paymentMethod}
            className="flex flex-wrap gap-3"
          >
            <Radio.Button
              value="credit_card"
              className="flex-1 text-center py-3 transition-all hover:shadow-button"
            >
              <div className="flex items-center justify-center gap-2">
                <CreditCardOutlined className="text-lg" />
                <span>Thẻ tín dụng / Ghi nợ</span>
              </div>
            </Radio.Button>
            <Radio.Button
              value="bank_transfer"
              className="flex-1 text-center py-3 transition-all hover:shadow-button"
            >
              <div className="flex items-center justify-center gap-2">
                <BankOutlined className="text-lg" />
                <span>Chuyển khoản ngân hàng</span>
              </div>
            </Radio.Button>
            <Radio.Button
              value="e_wallet"
              className="flex-1 text-center py-3 transition-all hover:shadow-button"
            >
              <div className="flex items-center justify-center gap-2">
                <WalletOutlined className="text-lg" />
                <span>Ví điện tử</span>
              </div>
            </Radio.Button>
            <Radio.Button
              value="vnpay"
              className="flex-1 text-center py-3 transition-all hover:shadow-button"
            >
              <div className="flex items-center justify-center gap-2">
                <GlobalOutlined className="text-lg" />
                <span>VNPay</span>
              </div>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Card className="content-card p-6 mb-6">
          {paymentMethod === "credit_card" && (
            <Space direction="vertical" className="w-full">
              <Form.Item
                label="Số thẻ"
                name="cardNumber"
                rules={[{ required: true, message: "Vui lòng nhập số thẻ" }]}
              >
                <Input
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="form-input"
                />
              </Form.Item>

              <Form.Item
                label="Tên chủ thẻ"
                name="cardName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chủ thẻ" },
                ]}
              >
                <Input placeholder="NGUYEN VAN A" className="form-input" />
              </Form.Item>

              <div className="flex flex-col sm:flex-row gap-4">
                <Form.Item
                  label="Ngày hết hạn"
                  name="expiryDate"
                  rules={[
                    { required: true, message: "Vui lòng nhập ngày hết hạn" },
                  ]}
                  className="flex-1"
                >
                  <Input
                    placeholder="MM/YY"
                    maxLength={5}
                    className="form-input"
                  />
                </Form.Item>
                <Form.Item
                  label="CVV/CVC"
                  name="cvv"
                  rules={[{ required: true, message: "Vui lòng nhập mã CVV" }]}
                  className="flex-1"
                >
                  <Input
                    placeholder="123"
                    maxLength={3}
                    className="form-input"
                  />
                </Form.Item>
              </div>
            </Space>
          )}

          {paymentMethod === "bank_transfer" && (
            <Space direction="vertical" className="w-full">
              <Form.Item
                label="Tên ngân hàng"
                name="bankName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên ngân hàng" },
                ]}
              >
                <Input placeholder="VCB, ACB, ..." className="form-input" />
              </Form.Item>

              <Form.Item
                label="Số tài khoản"
                name="accountNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số tài khoản" },
                ]}
              >
                <Input placeholder="0123456789" className="form-input" />
              </Form.Item>
            </Space>
          )}

          {paymentMethod === "e_wallet" && (
            <Space direction="vertical" className="w-full">
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input placeholder="0901234567" className="form-input" />
              </Form.Item>

              <Form.Item
                label="Chọn ví điện tử"
                name="walletProvider"
                rules={[
                  { required: true, message: "Vui lòng chọn nhà cung cấp ví" },
                ]}
              >
                <Radio.Group
                  onChange={handleWalletProviderChange}
                  className="flex flex-wrap gap-4"
                >
                  <Radio value="momo">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-6 h-6 bg-pink-600 rounded-full"></div>
                      <span>MoMo</span>
                    </div>
                  </Radio>
                  <Radio value="zalopay">
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                      <span>ZaloPay</span>
                    </div>
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </Space>
          )}

          {paymentMethod === "vnpay" && (
            <div className="w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                  VN
                </div>
              </div>

              <Text className="block text-center mb-6">
                Bạn sẽ được chuyển đến cổng thanh toán VNPay để hoàn tất giao
                dịch. Vui lòng không đóng trình duyệt trong quá trình thanh
                toán.
              </Text>

              <Divider />

              <div className="text-sm text-gray-600 mb-4">
                <Text className="block mb-2 font-medium">
                  Lưu ý khi thanh toán:
                </Text>
                <ul className="list-disc pl-5">
                  <li className="mb-1">
                    Hãy đảm bảo bạn đã đăng ký dịch vụ Internet Banking
                  </li>
                  <li className="mb-1">
                    Chuẩn bị thiết bị nhận SMS/OTP để xác nhận thanh toán
                  </li>
                  <li className="mb-1">
                    Không tắt trình duyệt cho đến khi hoàn tất thanh toán
                  </li>
                  <li>
                    Theo dõi trạng thái giao dịch để đảm bảo thanh toán thành
                    công
                  </li>
                </ul>
              </div>
            </div>
          )}

          <Form.Item className="mb-0 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isProcessing}
              disabled={isProcessing}
              block
              className="btn-primary h-12 text-base font-medium"
            >
              {paymentMethod === "vnpay"
                ? "Tiếp tục đến VNPay"
                : "Xác nhận thanh toán"}
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default PaymentMethodStep;
