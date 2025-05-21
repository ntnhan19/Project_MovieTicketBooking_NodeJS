import React, { useEffect, useState, useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import {
  Card,
  Button,
  Result,
  Spin,
  Typography,
  Alert,
  Form,
  Space,
  Divider,
  Image,
} from "antd";
import { paymentApi } from "../../api/paymentApi";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const VNPayPayment = ({
  payment,
  onPaymentComplete,
  onBack,
  isCallback = false,
  callbackUrl = null,
  isProcessing = false,
}) => {
  const { theme } = useContext(ThemeContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(isCallback);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const processingRequest = useRef(false);
  const lastRequestTime = useRef(0);
  const retryTimeoutRef = useRef(null);
  const pendingTimeoutRef = useRef(null);
  const paymentChecked = useRef(false);
  const currentPaymentId = useRef(null);

  useEffect(() => {
    const cleanup = () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
      processingRequest.current = false;
    };
    if (payment && payment.id) currentPaymentId.current = payment.id;
    if (isCallback && callbackUrl) {
      handleVNPayCallback(callbackUrl);
    } else if (payment && payment.id) {
      setLoading(false);
    } else {
      setLoading(false);
      setError("Không tìm thấy thông tin thanh toán");
      setStatus("error");
    }
    return cleanup;
  }, [payment, isCallback, callbackUrl]);

  const delayBetweenRequests = async (minDelay = 8000) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < minDelay) {
      const delay = minDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    lastRequestTime.current = Date.now();
  };

  const checkPaymentStatus = async (paymentId, firstCheck = false) => {
    if (processingRequest.current || paymentChecked.current) return;
    try {
      setLoading(true);
      processingRequest.current = true;
      await delayBetweenRequests(firstCheck ? 3000 : 8000);
      const result = await paymentApi.checkVNPayStatus(paymentId);
      if (result.nextQueryAllowed) {
        const nextQueryTime = new Date(result.nextQueryAllowed);
        const currentTime = new Date();
        let waitTime = Math.max(15000, nextQueryTime - currentTime);
        setRetryCount((prev) => prev + 1);
        processingRequest.current = false;
        setLoading(false);
        if (retryCount < MAX_RETRIES) {
          retryTimeoutRef.current = setTimeout(() => {
            if (retryCount >= 1) {
              fallbackPaymentCheck(paymentId);
            } else {
              checkPaymentStatus(paymentId);
            }
          }, waitTime);
        } else {
          fallbackPaymentCheck(paymentId);
        }
        return;
      }
      if (result.status === "COMPLETED" || result.success === true) {
        setStatus("success");
        setPaymentResult(result);
        paymentChecked.current = true;
        onPaymentComplete(true, result);
      } else if (result.status === "FAILED" || result.status === "CANCELLED") {
        setStatus("error");
        setError(result.message || "Thanh toán thất bại");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else if (result.responseCode && result.responseCode !== "00") {
        const vnpayErrorCodes = {
          "01": "Giao dịch đã tồn tại",
          "02": "Merchant không tồn tại hoặc không hoạt động",
          "03": "Dữ liệu gửi sang không đúng định dạng",
          "04": "Khởi tạo giao dịch không thành công",
          "07": "Giao dịch bị nghi ngờ gian lận",
          "09": "Thẻ/Tài khoản hết hạn thanh toán",
          10: "Đã hết hạn chờ thanh toán",
          11: "Giao dịch thất bại",
          24: "Khách hàng đã hủy giao dịch",
          51: "Tài khoản không đủ số dư để thực hiện giao dịch",
          65: "Tài khoản của quý khách đã vượt quá hạn mức thanh toán trong ngày",
          75: "Ngân hàng thanh toán đang bảo trì",
          79: "Đã vượt quá số lần thanh toán cho phép",
          91: "Không tìm thấy giao dịch yêu cầu",
          94: "Yêu cầu bị trùng lặp trong thời gian giới hạn",
          97: "Chữ ký không hợp lệ",
          99: "Lỗi không xác định",
        };
        const errorMessage =
          vnpayErrorCodes[result.responseCode] ||
          `Lỗi VNPay mã ${result.responseCode}`;
        setStatus("error");
        setError(`Thanh toán thất bại: ${errorMessage}`);
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else {
        setRetryCount((prev) => prev + 1);
        processingRequest.current = false;
        if (retryCount < MAX_RETRIES) {
          pendingTimeoutRef.current = setTimeout(() => {
            if (retryCount >= 2) {
              fallbackPaymentCheck(paymentId);
            } else {
              checkPaymentStatus(paymentId);
            }
          }, 8000);
        } else {
          fallbackPaymentCheck(paymentId);
        }
      }
    } catch {
      setRetryCount((prev) => prev + 1);
      if (retryCount < MAX_RETRIES) {
        const waitTime = 8000 + retryCount * 4000;
        processingRequest.current = false;
        retryTimeoutRef.current = setTimeout(() => {
          if (retryCount >= 2) {
            fallbackPaymentCheck(paymentId);
          } else {
            checkPaymentStatus(paymentId);
          }
        }, waitTime);
      } else {
        fallbackPaymentCheck(paymentId);
      }
    } finally {
      if (!pendingTimeoutRef.current && !retryTimeoutRef.current) {
        setLoading(false);
        processingRequest.current = false;
      }
    }
  };

  const fallbackPaymentCheck = async (paymentId) => {
    if (processingRequest.current || paymentChecked.current) return;
    try {
      setLoading(true);
      processingRequest.current = true;
      try {
        const trackResult = await paymentApi.trackVNPayPayment(
          paymentId,
          3000,
          30000
        );
        if (trackResult.success || trackResult.status === "COMPLETED") {
          setStatus("success");
          setPaymentResult(trackResult);
          paymentChecked.current = true;
          onPaymentComplete(true, trackResult);
          return;
        } else if (
          trackResult.status === "FAILED" ||
          trackResult.status === "CANCELLED"
        ) {
          setStatus("error");
          setError(trackResult.message || "Thanh toán thất bại");
          paymentChecked.current = true;
          onPaymentComplete(false, trackResult);
          return;
        }
      } catch (trackError) {
        console.error("Lỗi khi theo dõi payment:", trackError);
      }
      const paymentInfo = await paymentApi.getPaymentById(paymentId);
      if (paymentInfo.status === "COMPLETED") {
        setStatus("success");
        setPaymentResult(paymentInfo);
        paymentChecked.current = true;
        onPaymentComplete(true, paymentInfo);
      } else if (
        paymentInfo.status === "FAILED" ||
        paymentInfo.status === "CANCELLED"
      ) {
        setStatus("error");
        setError(paymentInfo.message || "Thanh toán thất bại");
        paymentChecked.current = true;
        onPaymentComplete(false, paymentInfo);
      } else if (paymentInfo.status === "PENDING" && retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        processingRequest.current = false;
        pendingTimeoutRef.current = setTimeout(() => {
          fallbackPaymentCheck(paymentId);
        }, 10000);
      } else {
        setStatus("error");
        setError(
          paymentInfo.status === "PENDING"
            ? "Hệ thống đang xử lý thanh toán của bạn. Vui lòng kiểm tra lại sau."
            : "Không thể xác định trạng thái thanh toán. Vui lòng liên hệ hỗ trợ."
        );
        setLoading(false);
        processingRequest.current = false;
      }
    } catch {
      setRetryCount((prev) => prev + 1);
      if (retryCount < MAX_RETRIES) {
        const waitTime = 10000 + retryCount * 5000;
        processingRequest.current = false;
        retryTimeoutRef.current = setTimeout(() => {
          fallbackPaymentCheck(paymentId);
        }, waitTime);
      } else {
        setStatus("error");
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại thanh toán của bạn sau."
        );
        setLoading(false);
        processingRequest.current = false;
      }
    }
  };

  const handleVNPayCallback = async (callbackSearchParams) => {
    if (processingRequest.current) return;
    try {
      setLoading(true);
      processingRequest.current = true;
      const result = await paymentApi.handleVNPayResult(callbackSearchParams);
      setPaymentResult(result);
      if (result.success) {
        setStatus("success");
        paymentChecked.current = true;
        onPaymentComplete(true, result);
      } else if (result.statusData && result.statusData.responseCode === "24") {
        setStatus("error");
        setError("Bạn đã hủy giao dịch thanh toán");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else if (result.pendingSync) {
        const paymentId = result.paymentId || currentPaymentId.current;
        if (paymentId) {
          setRetryCount(0);
          processingRequest.current = false;
          pendingTimeoutRef.current = setTimeout(() => {
            fallbackPaymentCheck(paymentId);
          }, 3000);
        } else {
          setStatus("error");
          setError("Không thể xác định trạng thái thanh toán");
          onPaymentComplete(false, result);
        }
      } else {
        setStatus("error");
        setError(result.message || "Thanh toán thất bại");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      }
    } catch (error) {
      const paymentId = currentPaymentId.current;
      if (paymentId) {
        try {
          const trackResult = await paymentApi.trackVNPayPayment(
            paymentId,
            3000,
            30000
          );
          if (trackResult.success || trackResult.status === "COMPLETED") {
            setStatus("success");
            setPaymentResult(trackResult);
            paymentChecked.current = true;
            onPaymentComplete(true, trackResult);
            return;
          }
        } catch (trackError) {
          console.error("Lỗi khi theo dõi payment:", trackError);
        }
        processingRequest.current = false;
        pendingTimeoutRef.current = setTimeout(() => {
          fallbackPaymentCheck(paymentId);
        }, 3000);
        return;
      }
      setStatus("error");
      setError(error.message || "Có lỗi xảy ra khi xử lý kết quả thanh toán");
      onPaymentComplete(false, { error: error.message });
    } finally {
      if (!pendingTimeoutRef.current) {
        processingRequest.current = false;
        setLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      let paymentId = payment?.id || currentPaymentId.current;
      if (paymentId) {
        await paymentApi.cancelPayment(paymentId);
        paymentApi.clearPaymentCache();
      }
      onBack();
    } catch {
      setError("Không thể hủy thanh toán");
      setLoading(false);
    }
  };

  const startVNPayPayment = async () => {
    try {
      setLoading(true);
      if (!payment || !payment.id) {
        setError("Không có thông tin thanh toán");
        setLoading(false);
        return;
      }
      if (payment && payment.paymentUrl) {
        currentPaymentId.current = payment.id;
        window.location.href = payment.paymentUrl;
        return;
      }
      const paymentData = {
        ticketIds:
          payment.ticketIds ||
          (Array.isArray(payment.ticketId)
            ? payment.ticketId
            : [payment.ticketId]),
        method: "VNPAY",
      };
      const result = await paymentApi.processPayment(paymentData);
      if (result && result.paymentUrl) {
        currentPaymentId.current = result.id;
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPay");
      }
    } catch (error) {
      setStatus("error");
      setError(error.message || "Không thể bắt đầu quá trình thanh toán VNPay");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card
        className={`p-8 content-card shadow-md border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
        }`}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 36 }} />}
          />
          <Text
            className={`mt-4 text-center ${
              theme === "dark" ? "text-dark-text-secondary" : "text-gray-600"
            }`}
          >
            Đang xử lý thanh toán VNPay...
          </Text>
          {retryCount > 0 && (
            <Text
              className={`mt-2 text-center ${
                theme === "dark" ? "text-dark-text-secondary" : "text-gray-500"
              }`}
            >
              Đang thử lại ({retryCount}/{MAX_RETRIES})
            </Text>
          )}
        </div>
      </Card>
    );
  }

  if (status === "success") {
    const transactionId =
      paymentResult?.payment?.transactionId ||
      paymentResult?.transactionId ||
      paymentResult?.appTransId ||
      paymentResult?.vnp_TransactionNo ||
      "N/A";
    window.paymentTransactionId = transactionId;
    localStorage.setItem("lastPaymentTransactionId", transactionId);
    return (
      <Card
        className={`p-8 content-card shadow-md border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
        }`}
      >
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Thanh toán thành công"
          subTitle={`Mã giao dịch: ${transactionId}`}
          extra={[
            <Button
              type="primary"
              key="done"
              onClick={() =>
                onPaymentComplete(true, { ...paymentResult, transactionId })
              }
              className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Hoàn tất
            </Button>,
          ]}
        />
        {paymentResult && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              theme === "dark" ? "bg-dark-bg-secondary" : "bg-gray-50"
            }`}
          >
            <Title
              level={5}
              className={`mb-3 ${
                theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
              }`}
            >
              Chi tiết giao dịch
            </Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Text
                  type="secondary"
                  className={theme === "dark" ? "text-dark-text-secondary" : ""}
                >
                  Phương thức:
                </Text>{" "}
                <Text
                  strong
                  className={theme === "dark" ? "text-dark-text-primary" : ""}
                >
                  VNPay
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className={theme === "dark" ? "text-dark-text-secondary" : ""}
                >
                  Số tiền:
                </Text>{" "}
                <Text
                  strong
                  className={theme === "dark" ? "text-dark-text-primary" : ""}
                >
                  {(
                    paymentResult.payment?.amount ||
                    paymentResult.amount ||
                    paymentResult.statusData?.amount
                  )?.toLocaleString("vi-VN")}{" "}
                  VNĐ
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className={theme === "dark" ? "text-dark-text-secondary" : ""}
                >
                  Thời gian:
                </Text>{" "}
                <Text
                  strong
                  className={theme === "dark" ? "text-dark-text-primary" : ""}
                >
                  {new Date(
                    paymentResult.payment?.updatedAt ||
                      paymentResult.updatedAt ||
                      paymentResult.statusData?.updatedAt ||
                      Date.now()
                  ).toLocaleString("vi-VN")}
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  className={theme === "dark" ? "text-dark-text-secondary" : ""}
                >
                  Trạng thái:
                </Text>{" "}
                <Text strong className="text-green-500">
                  Thành công
                </Text>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card
        className={`p-8 content-card shadow-md border ${
          theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
        }`}
      >
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-500" />}
          title="Thanh toán thất bại"
          subTitle={error || "Đã xảy ra lỗi trong quá trình thanh toán."}
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={onBack}
              className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Thử lại
            </Button>,
          ]}
        />
      </Card>
    );
  }

  return (
    <div
      className={`w-full max-w-3xl mx-auto animate-fadeIn min-h-screen ${
        theme === "dark" ? "bg-dark-bg" : "bg-light-bg"
      } py-6 pt-24 px-4`}
    >
      <Title
        level={4}
        className={`mb-6 ${
          theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
        }`}
      >
        Phương thức thanh toán
      </Title>
      {error && (
        <Alert
          message="Lỗi thanh toán"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}
      <Form
        form={form}
        layout="vertical"
        onFinish={startVNPayPayment}
        initialValues={{ paymentMethod: "vnpay" }}
      >
        <Card
          className={`content-card p-6 mb-6 shadow-md border ${
            theme === "dark" ? "border-gray-600 bg-gray-800" : "border-border-light bg-white"
          }`}
        >
          <div className="w-full">
            <div
              className={`border rounded-lg p-4 mb-4 cursor-pointer ${
                theme === "dark" ? "bg-blue-900/50" : "bg-blue-50"
              }`}
            >
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
                  <Text
                    className={`font-medium text-base mb-1 ${
                      theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                    }`}
                  >
                    VNPay
                  </Text>
                  <Text
                    className={`text-sm ${
                      theme === "dark" ? "text-dark-text-secondary" : "text-gray-500"
                    }`}
                  >
                    Thanh toán an toàn qua cổng VNPay
                  </Text>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    theme === "dark" ? "border-blue-400" : "border-blue-600"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      theme === "dark" ? "bg-blue-400" : "bg-blue-600"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            <Divider className="my-4" />
            {payment && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  theme === "dark" ? "bg-dark-bg-secondary" : "bg-gray-50"
                }`}
              >
                <Title
                  level={5}
                  className={`mb-2 ${
                    theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                  }`}
                >
                  Thông tin thanh toán
                </Title>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Text
                      type="secondary"
                      className={theme === "dark" ? "text-dark-text-secondary" : ""}
                    >
                      Mã thanh toán:
                    </Text>{" "}
                    <Text
                      strong
                      className={theme === "dark" ? "text-dark-text-primary" : ""}
                    >
                      {payment.id}
                    </Text>
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      className={theme === "dark" ? "text-dark-text-secondary" : ""}
                    >
                      Số tiền:
                    </Text>{" "}
                    <Text
                      strong
                      className={theme === "dark" ? "text-dark-text-primary" : ""}
                    >
                      {payment.amount?.toLocaleString("vi-VN")} VNĐ
                    </Text>
                  </div>
                  {payment.description && (
                    <div className="col-span-2">
                      <Text
                        type="secondary"
                        className={theme === "dark" ? "text-dark-text-secondary" : ""}
                      >
                        Nội dung:
                      </Text>{" "}
                      <Text
                        strong
                        className={theme === "dark" ? "text-dark-text-primary" : ""}
                      >
                        {payment.description}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            )}
            <Divider className="my-4" />
            <div className="mb-4">
              <Title
                level={5}
                className={`mb-2 ${
                  theme === "dark" ? "text-dark-text-primary" : "text-text-primary"
                }`}
              >
                Các bước thanh toán:
              </Title>
              <div className="mb-2 flex items-start">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                    theme === "dark" ? "bg-blue-400 text-dark-bg" : "bg-blue-600 text-white"
                  }`}
                >
                  <Text className={theme === "dark" ? "text-dark-bg" : "text-white"}>1</Text>
                </div>
                <Text
                  className={theme === "dark" ? "text-dark-text-primary" : "text-text-primary"}
                >
                  Nhấn "Tiếp tục thanh toán" để chuyển đến cổng VNPay
                </Text>
              </div>
              <div className="mb-2 flex items-start">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                    theme === "dark" ? "bg-blue-400 text-dark-bg" : "bg-blue-600 text-white"
                  }`}
                >
                  <Text className={theme === "dark" ? "text-dark-bg" : "text-white"}>2</Text>
                </div>
                <Text
                  className={theme === "dark" ? "text-dark-text-primary" : "text-text-primary"}
                >
                  Chọn phương thức thanh toán trên cổng VNPay
                </Text>
              </div>
              <div className="mb-2 flex items-start">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                    theme === "dark" ? "bg-blue-400 text-dark-bg" : "bg-blue-600 text-white"
                  }`}
                >
                  <Text className={theme === "dark" ? "text-dark-bg" : "text-white"}>3</Text>
                </div>
                <Text
                  className={theme === "dark" ? "text-dark-text-primary" : "text-text-primary"}
                >
                  Hoàn tất giao dịch và quay lại trang web
                </Text>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleCancel}
            className={`border rounded-lg h-12 font-medium ${
              theme === "dark"
                ? "border-gray-600 text-dark-text-primary hover:bg-gray-700"
                : "border-gray-300 text-text-primary hover:bg-gray-100"
            }`}
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isProcessing || loading}
            className="bg-red-500 border-none rounded-lg font-bold h-12 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Tiếp tục thanh toán
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VNPayPayment;