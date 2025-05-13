// frontend/src/components/Payments/PaymentSteps/PromotionStep.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Alert,
  Typography,
  Spin,
  Divider,
  List,
  Tag,
  Empty,
} from "antd";
import { TagOutlined, CloseOutlined } from "@ant-design/icons";
import { promotionApi } from "../../../api/promotionApi";

const { Title, Text } = Typography;

const PromotionStep = ({ onApplyPromotion, onRemovePromotion, appliedPromotion, totalPrice }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  // Lấy danh sách khuyến mãi có sẵn khi component mount
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoadingPromotions(true);
      try {
        const promotions = await promotionApi.getActivePromotions();
        setAvailablePromotions(promotions.filter(promo => promo.isActive));
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
      } finally {
        setLoadingPromotions(false);
      }
    };

    fetchPromotions();
  }, []);

  // Xử lý áp dụng mã khuyến mãi
  const handleApplyPromotion = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const result = await promotionApi.validatePromotion(values.promoCode);
      
      if (result && result.isValid) {
        onApplyPromotion(result.promotion);
        form.resetFields();
      } else {
        setError(result?.message || "Mã khuyến mãi không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng mã khuyến mãi:", error);
      setError(error.response?.data?.message || "Không thể áp dụng mã khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn khuyến mãi từ danh sách
  const handleSelectPromotion = (promotion) => {
    onApplyPromotion(promotion);
  };

  // Hiển thị giá trị khuyến mãi
  const renderDiscountValue = (promotion) => {
    if (promotion.type === "PERCENTAGE") {
      return `${promotion.discount}%`;
    } else {
      return `${promotion.discount.toLocaleString("vi-VN")}đ`;
    }
  };

  // Tính toán giá trị khuyến mãi
  const calculateDiscountAmount = (promotion) => {
    if (promotion.type === "PERCENTAGE") {
      const amount = (totalPrice * promotion.discount) / 100;
      return Math.min(amount, totalPrice); // Không giảm quá giá trị đơn hàng
    } else {
      return Math.min(promotion.discount, totalPrice); // Không giảm quá giá trị đơn hàng
    }
  };

  // Hiển thị khuyến mãi đã áp dụng
  const renderAppliedPromotion = () => {
    if (!appliedPromotion) return null;

    const discountAmount = calculateDiscountAmount(appliedPromotion);
    const finalPrice = totalPrice - discountAmount;

    return (
      <div className="mb-4">
        <Alert
          message={
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{appliedPromotion.title}</span>
                <Tag color="green" className="ml-2">
                  {renderDiscountValue(appliedPromotion)}
                </Tag>
              </div>
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => onRemovePromotion()}
              />
            </div>
          }
          description={
            <div className="mt-2">
              <div className="flex justify-between">
                <Text>Giảm giá:</Text>
                <Text className="font-bold text-green-500">
                  -{discountAmount.toLocaleString("vi-VN")}đ
                </Text>
              </div>
              <div className="flex justify-between mt-1">
                <Text>Số tiền sau khuyến mãi:</Text>
                <Text className="font-bold">
                  {finalPrice.toLocaleString("vi-VN")}đ
                </Text>
              </div>
            </div>
          }
          type="success"
          showIcon
        />
      </div>
    );
  };

  return (
    <div className="promotion-step">
      <Title level={4} className="mb-4">
        <TagOutlined className="mr-2" /> Mã khuyến mãi
      </Title>

      {renderAppliedPromotion()}

      {!appliedPromotion && (
        <Card className="mb-4">
          <Form
            form={form}
            onFinish={handleApplyPromotion}
            layout="vertical"
          >
            <Form.Item
              name="promoCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã khuyến mãi" },
              ]}
            >
              <Input.Search
                placeholder="Nhập mã khuyến mãi..."
                enterButton="Áp dụng"
                size="large"
                loading={loading}
                onSearch={() => form.submit()}
              />
            </Form.Item>
          </Form>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mt-2"
            />
          )}
        </Card>
      )}

      <Divider orientation="left">Khuyến mãi có sẵn</Divider>

      {loadingPromotions ? (
        <div className="text-center py-4">
          <Spin />
          <div className="mt-2">Đang tải khuyến mãi...</div>
        </div>
      ) : availablePromotions.length > 0 ? (
        <List
          dataSource={availablePromotions}
          renderItem={(promotion) => (
            <List.Item
              key={promotion.id}
              className="border rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer"
              onClick={() => !appliedPromotion && handleSelectPromotion(promotion)}
            >
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>{promotion.title}</Text>
                    <Tag color="blue" className="ml-2">
                      {renderDiscountValue(promotion)}
                    </Tag>
                  </div>
                  {!appliedPromotion && (
                    <Button type="primary" size="small">
                      Áp dụng
                    </Button>
                  )}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  {promotion.description}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Hạn sử dụng: {new Date(promotion.validUntil).toLocaleDateString("vi-VN")}
                </div>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="Không có khuyến mãi nào" />
      )}
    </div>
  );
};

export default PromotionStep;