import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Card,
  Typography,
  Image,
  Input,
  message,
  Divider,
  Tag,
} from "antd";
import { promotionApi } from "../../../api/promotionApi";
import { concessionOrderApi } from "../../../api/concessionOrderApi";
import { ticketApi } from "../../../api/ticketApi";
import { seatApi } from "../../../api/seatApi";

const { Title, Text } = Typography;

const PaymentMethodStep = ({
  onPaymentConfirm,
  paymentError,
  isProcessing,
  selectedConcessions,
  totalPrice,
  concessionOrderId,
  showtimeId,
}) => {
  const [form] = Form.useForm();
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionError, setPromotionError] = useState(null);
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const userId = parseInt(sessionStorage.getItem("userId")) || null;

  const handleApplyPromotion = async () => {
    if (!promotionCode) {
      setPromotionError("Vui lòng nhập mã khuyến mãi");
      return;
    }
    try {
      const response = await promotionApi.validatePromotion(promotionCode);
      if (response.valid) {
        setPromotionDiscount(response.discount || 0);
        setPromotionError(null);
        localStorage.setItem("promotionCode", promotionCode);
        localStorage.setItem("promotionDiscount", response.discount || 0);
        message.success("Áp dụng mã khuyến mãi thành công!");
      } else {
        setPromotionError(response.message || "Mã khuyến mãi không hợp lệ");
        setPromotionDiscount(0);
      }
    } catch {
      setPromotionError("Không thể xác thực mã khuyến mãi");
      setPromotionDiscount(0);
    }
  };

  const handleSubmit = async (values) => {
    if (!userId) {
      message.error(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      );
      return;
    }

    // Kiểm tra trạng thái đơn bắp nước nếu có
    if (selectedConcessions && selectedConcessions.length > 0) {
      if (!concessionOrderId) {
        message.error("Đơn bắp nước chưa được tạo. Vui lòng thử lại.");
        return;
      }
      try {
        const order = await concessionOrderApi.getUserOrderById(
          concessionOrderId
        );
        if (!["PENDING", "CONFIRMED"].includes(order.status)) {
          message.error("Đơn bắp nước không hợp lệ để thanh toán.");
          return;
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái đơn bắp nước:", error);
        message.error("Không thể kiểm tra trạng thái đơn bắp nước.");
        return;
      }
    }

    const seatIds = JSON.parse(
      sessionStorage.getItem(`selectedSeats_${userId}`) || "[]"
    ).map((seat) => seat.id);

    if (!seatIds.length) {
      message.error("Không tìm thấy ghế đã chọn. Vui lòng chọn lại.");
      return;
    }

    let ticketIds = [];
    const existingTicketIds = sessionStorage.getItem(`ticketIds_${userId}`);
    try {
      // Kiểm tra trạng thái ghế
      const seats = await Promise.all(
        seatIds.map((seatId) => seatApi.getSeatById(seatId))
      );
      const unavailableSeats = seats.filter(
        (seat) =>
          seat.status === "BOOKED" ||
          (seat.status === "LOCKED" && seat.lockedBy !== userId)
      );

      if (unavailableSeats.length > 0) {
        const ticketIdsToCancel = [];
        for (const seat of unavailableSeats) {
          try {
            const ticket = await ticketApi.getTicketBySeatId(seat.id, userId);
            if (
              ticket &&
              ticket.status === "PENDING" &&
              ticket.userId === userId
            ) {
              ticketIdsToCancel.push(ticket.id);
            }
          } catch (error) {
            console.warn(`Không tìm thấy vé cho ghế ${seat.id}:`, error);
          }
        }

        if (ticketIdsToCancel.length > 0) {
          await ticketApi.updateTicketsStatus(ticketIdsToCancel, "CANCELLED");
          await seatApi.unlockSeats(seatIds);
        }

        sessionStorage.removeItem(`selectedSeats_${userId}`);
        sessionStorage.removeItem(`seatLockTime_${userId}`);
        sessionStorage.removeItem(`ticketIds_${userId}`);
        message.error("Một số ghế không còn khả dụng. Vui lòng chọn lại ghế.");
        return;
      }

      // Gia hạn khóa ghế
      await Promise.all(seatIds.map((seatId) => seatApi.renewSeatLock(seatId)));
      sessionStorage.setItem(`seatLockTime_${userId}`, Date.now().toString());

      // Kiểm tra vé PENDING hiện có
      if (existingTicketIds) {
        ticketIds = JSON.parse(existingTicketIds);
        // Xác minh vé
        const tickets = await Promise.all(
          ticketIds.map((ticketId) => ticketApi.getTicketById(ticketId))
        );
        const validTickets = tickets.filter(
          (ticket) =>
            ticket &&
            ticket.status === "PENDING" &&
            ticket.userId === userId &&
            ticket.showtimeId === parseInt(showtimeId) &&
            seatIds.includes(ticket.seatId)
        );

        if (validTickets.length === seatIds.length) {
          // Tất cả vé hợp lệ, sử dụng lại
          ticketIds = validTickets.map((ticket) => ticket.id);
        } else {
          // Một số vé không hợp lệ, hủy và tạo mới
          await ticketApi.updateTicketsStatus(ticketIds, "CANCELLED");
          await seatApi.unlockSeats(seatIds);
          ticketIds = [];
        }
      }

      // Tạo vé mới nếu không có vé hợp lệ
      if (!ticketIds.length) {
        const ticketData = {
          userId,
          showtimeId: parseInt(showtimeId),
          seats: seatIds,
          promotionId:
            promotionDiscount > 0
              ? parseInt(localStorage.getItem("promotionId"))
              : null,
        };

        const ticketResponse = await ticketApi.createTicket(ticketData);
        ticketIds = ticketResponse.ticketIds;
        sessionStorage.setItem(
          `ticketIds_${userId}`,
          JSON.stringify(ticketIds)
        );
      }

      const paymentData = {
        ticketIds,
        concessionOrderIds: concessionOrderId ? [concessionOrderId] : [],
        method: "VNPay",
      };

      onPaymentConfirm({
        ...values,
        ...paymentData,
        promotionCode,
        promotionDiscount,
        concessionOrderId,
      });
    } catch (error) {
      console.error("Lỗi khi xử lý thanh toán:", error);
      message.error(
        error.response?.data?.message || "Không thể tạo vé. Vui lòng thử lại."
      );
    }
  };

  const renderConcessionInfo = () => {
    if (!selectedConcessions || selectedConcessions.length === 0) {
      return <Text type="secondary">Không có bắp nước</Text>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {selectedConcessions.map((item, index) => (
          <Tag
            key={index}
            color="cyan"
            className="px-3 py-1.5 rounded-lg font-medium bg-cyan-100 border border-cyan-500 text-cyan-700"
          >
            {item.name} x{item.quantity} -{" "}
            {(item.price * item.quantity).toLocaleString("vi-VN")}đ
          </Tag>
        ))}
        {concessionOrderId && (
          <Text className="block mt-2">
            Mã đơn hàng bắp nước: {concessionOrderId}
          </Text>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <Title
        level={4}
        className="mb-6 text-text-primary dark:text-text-primary"
      >
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
        onFinish={handleSubmit}
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
                  <Text className="text-sm text-gray-500 block">
                    Thanh toán an toàn qua cổng VNPay
                  </Text>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <Divider className="my-4" />
            <div className="mb-6">
              <Text className="font-medium text-base mb-2 block">
                Bắp nước đã chọn:
              </Text>
              {renderConcessionInfo()}
            </div>
            <div className="mb-6">
              <Text className="font-medium text-base mb-2 block">
                Tổng tiền:
              </Text>
              <Text className="text-red-600 font-bold text-lg">
                {(totalPrice - promotionDiscount).toLocaleString("vi-VN")}đ
              </Text>
            </div>
            <Divider className="my-4" />

            <div className="mb-6">
              <Text className="font-medium text-base mb-2 block">
                Mã khuyến mãi
              </Text>
              <div className="flex gap-4">
                <Input
                  placeholder="Nhập mã khuyến mãi"
                  value={promotionCode}
                  onChange={(e) => setPromotionCode(e.target.value)}
                  className="h-12"
                />
                <Button
                  type="primary"
                  onClick={handleApplyPromotion}
                  className="h-12 font-medium"
                  style={{ backgroundColor: "#005BAA" }}
                >
                  Áp dụng
                </Button>
              </div>
              {promotionError && (
                <Alert
                  message={promotionError}
                  type="error"
                  showIcon
                  className="mt-4"
                />
              )}
              {promotionDiscount > 0 && (
                <Text className="text-green-500 mt-2 block">
                  Đã áp dụng giảm giá:{" "}
                  {promotionDiscount.toLocaleString("vi-VN")}đ
                </Text>
              )}
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
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default PaymentMethodStep;
