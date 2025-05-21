import React from "react";
import {
  Form,
  Button,
  Alert,
  Card,
  Typography,
  Image
} from "antd";

const { Title, Text } = Typography;

const PaymentMethodStep = ({
  onPaymentConfirm,
  paymentError,
  isProcessing,
}) => {
  const [form] = Form.useForm();

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <Title level={4} className="mb-6 text-text-primary dark:text-text-primary">
        Phương thức thanh toán
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
        initialValues={{ paymentMethod: "vnpay" }}
      >
        <Card className="content-card p-6 mb-6">
          <div className="w-full">
            <div className="border rounded-lg p-4 mb-4 cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                  <Image
                    preview={false}
                    src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" 
                    alt="VNPay"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-grow">
                  <Text className="font-medium text-base mb-1">VNPay</Text>
                  <Text className="text-sm text-gray-500 block">Thanh toán an toàn qua cổng VNPay</Text>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <Form.Item className="mb-0 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              loading={isProcessing}
              disabled={isProcessing}
              block
              className="btn-primary h-12 text-base font-medium dark:text-text-primary"
              style={{ backgroundColor: "#005BAA" }}
            >
              Tiếp tục thanh toán
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  );
};

export default PaymentMethodStep;