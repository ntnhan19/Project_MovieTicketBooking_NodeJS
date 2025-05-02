import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Result, Spin, Typography, Alert, Steps } from "antd";
import { paymentApi } from "../../api/paymentApi";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const VNPayPayment = ({ payment, onPaymentComplete, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  // Tham chiếu để kiểm soát quá trình xử lý
  const processingRequest = useRef(false);
  const lastRequestTime = useRef(0);
  const retryTimeoutRef = useRef(null);
  const pendingTimeoutRef = useRef(null);
  const paymentChecked = useRef(false);
  const currentPaymentId = useRef(null);

  useEffect(() => {
    // Hàm dọn dẹp khi component unmount
    const cleanup = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
      processingRequest.current = false;
    };

    // Kiểm tra các tham số từ URL
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const status = searchParams.get("status");
    const paymentId = 
      searchParams.get("paymentId") || 
      localStorage.getItem("lastPaymentId");
    
    currentPaymentId.current = paymentId || (payment && payment.id);

    // Xử lý các trường hợp khác nhau
    if (vnp_ResponseCode || status) {
      // Nếu có tham số từ VNPay callback, xử lý kết quả
      setCurrentStep(2);
      handleVNPayCallback();
    } else if (paymentId) {
      // Nếu có paymentId, kiểm tra trạng thái
      setCurrentStep(1);
      pendingTimeoutRef.current = setTimeout(() => {
        checkPaymentStatus(paymentId, true);
      }, 1500);
    } else if (payment && payment.id) {
      // Nếu có thông tin payment từ props
      setCurrentStep(0);
      setLoading(false);
    } else {
      setLoading(false);
      setError("Không tìm thấy thông tin thanh toán");
      setStatus("error");
    }

    return cleanup;
  }, [payment, searchParams]);

  // Tạo delay giữa các request để tránh lỗi trùng lặp
  const delayBetweenRequests = async (minDelay = 8000) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;
    
    if (timeSinceLastRequest < minDelay) {
      const delay = minDelay - timeSinceLastRequest;
      console.log(`Chờ ${Math.ceil(delay/1000)}s trước khi gửi yêu cầu tiếp theo...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    lastRequestTime.current = Date.now();
  };

  // Kiểm tra trạng thái thanh toán với các cải tiến từ API mới
  const checkPaymentStatus = async (paymentId, firstCheck = false) => {
    // Tránh xử lý nhiều request cùng lúc
    if (processingRequest.current || paymentChecked.current) {
      console.log("Đang có một yêu cầu xử lý, bỏ qua yêu cầu mới.");
      return;
    }

    try {
      setLoading(true);
      processingRequest.current = true;
      
      // Đảm bảo khoảng cách thời gian giữa các request
      await delayBetweenRequests(firstCheck ? 3000 : 8000);

      // Gọi API kiểm tra trạng thái thanh toán
      console.log(`Kiểm tra trạng thái VNPay cho payment ${paymentId}, lần thử: ${retryCount + 1}`);
      const result = await paymentApi.checkVNPayStatus(paymentId);

      // Xử lý trường hợp cần đợi thêm theo cơ chế mới từ API
      if (result.nextQueryAllowed) {
        console.warn("Phát hiện yêu cầu cần thời gian chờ theo hướng dẫn từ backend");
        
        // Tính toán thời gian chờ dựa trên nextQueryAllowed từ API
        const nextQueryTime = new Date(result.nextQueryAllowed);
        const currentTime = new Date();
        let waitTime = Math.max(15000, nextQueryTime - currentTime);
        
        console.log(`Sẽ đợi đến ${nextQueryTime.toLocaleTimeString()} trước khi thử lại`);
        
        setRetryCount(prev => prev + 1);
        processingRequest.current = false;
        setLoading(false);
        
        if (retryCount < MAX_RETRIES) {
          retryTimeoutRef.current = setTimeout(() => {
            if (retryCount >= 1) {
              // Sau 1 lần đợi theo nextQueryAllowed, thử kiểm tra trực tiếp
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

      // Kiểm tra trạng thái thanh toán theo các tiêu chí mới
      if (result.status === "COMPLETED" || result.success === true) {
        // Thanh toán thành công
        setStatus("success");
        setPaymentResult(result);
        paymentChecked.current = true;
        onPaymentComplete(true, result);
      } else if (
        result.status === "FAILED" || 
        result.status === "CANCELLED"
      ) {
        // Thất bại hoặc bị hủy
        setStatus("error");
        setError(result.message || "Thanh toán thất bại");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else if (result.responseCode && result.responseCode !== "00") {
        // Xử lý mã lỗi từ VNPay
        const vnpayErrorCodes = {
          "01": "Giao dịch đã tồn tại",
          "02": "Merchant không tồn tại hoặc không hoạt động",
          "03": "Dữ liệu gửi sang không đúng định dạng",
          "04": "Khởi tạo giao dịch không thành công",
          "24": "Khách hàng đã hủy giao dịch",
          "51": "Tài khoản không đủ số dư để thực hiện giao dịch",
          "97": "Chữ ký không hợp lệ",
          "99": "Lỗi không xác định",
        };
        
        const errorMessage = vnpayErrorCodes[result.responseCode] || `Lỗi VNPay mã ${result.responseCode}`;
        setStatus("error");
        setError(`Thanh toán thất bại: ${errorMessage}`);
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else {
        // Vẫn đang xử lý (pending)
        setRetryCount(prev => prev + 1);
        processingRequest.current = false;
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Thanh toán vẫn đang chờ xử lý, sẽ kiểm tra lại sau 8 giây...`);
          pendingTimeoutRef.current = setTimeout(() => {
            if (retryCount >= 2) {
              // Sau 2 lần thử, chuyển sang phương thức dự phòng
              fallbackPaymentCheck(paymentId);
            } else {
              checkPaymentStatus(paymentId);
            }
          }, 8000);
        } else {
          fallbackPaymentCheck(paymentId);
        }
      }
    } catch (error) {
      console.error("Lỗi kiểm tra trạng thái VNPay:", error);

      setRetryCount(prev => prev + 1);
      
      if (retryCount < MAX_RETRIES) {
        const waitTime = 8000 + retryCount * 4000;
        console.log(`Lỗi khi kiểm tra, thử lại sau ${Math.ceil(waitTime/1000)} giây...`);
        
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

  // Cải tiến phương thức fallback để sử dụng trackVNPayPayment
  const fallbackPaymentCheck = async (paymentId) => {
    if (processingRequest.current || paymentChecked.current) {
      console.log("Đang có một yêu cầu xử lý, bỏ qua fallback check.");
      return;
    }

    try {
      console.log("Sử dụng phương thức trackVNPayPayment để theo dõi thanh toán");
      setLoading(true);
      processingRequest.current = true;
      
      // Thử sử dụng trackVNPayPayment để theo dõi cập nhật từ VNPay
      try {
        // Chỉ theo dõi trong 30 giây với khoảng thời gian 3 giây
        const trackResult = await paymentApi.trackVNPayPayment(paymentId, 3000, 30000);
        
        if (trackResult.success || trackResult.status === "COMPLETED") {
          setStatus("success");
          setPaymentResult(trackResult);
          paymentChecked.current = true;
          onPaymentComplete(true, trackResult);
          return;
        } else if (trackResult.status === "FAILED" || trackResult.status === "CANCELLED") {
          setStatus("error");
          setError(trackResult.message || "Thanh toán thất bại");
          paymentChecked.current = true;
          onPaymentComplete(false, trackResult);
          return;
        }
      } catch (trackError) {
        console.error("Lỗi khi theo dõi payment:", trackError);
        // Nếu trackVNPayPayment thất bại, thử lấy thông tin trực tiếp
      }
      
      // Nếu không theo dõi được hoặc không nhận được kết quả rõ ràng, kiểm tra trực tiếp
      console.log("Lấy thông tin thanh toán trực tiếp");
      const paymentInfo = await paymentApi.getPaymentById(paymentId);
      console.log("Kết quả kiểm tra thanh toán (fallback):", paymentInfo);

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
        console.log("Thanh toán vẫn đang xử lý, đợi thêm thời gian...");
        setRetryCount(prev => prev + 1);
        processingRequest.current = false;
        
        // Kiểm tra lại sau thời gian dài hơn
        pendingTimeoutRef.current = setTimeout(() => {
          fallbackPaymentCheck(paymentId);
        }, 10000);
      } else {
        // Không xác định được trạng thái sau nhiều lần thử
        setStatus("error");
        setError(
          paymentInfo.status === "PENDING" 
            ? "Hệ thống đang xử lý thanh toán của bạn. Vui lòng kiểm tra lại sau." 
            : "Không thể xác định trạng thái thanh toán. Vui lòng liên hệ hỗ trợ."
        );
        setLoading(false);
        processingRequest.current = false;
      }
    } catch (fallbackError) {
      console.error("Lỗi khi thử phương thức thay thế:", fallbackError);
      
      setRetryCount(prev => prev + 1);
      
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

  // Cải tiến xử lý callback từ VNPay sử dụng API mới
  const handleVNPayCallback = async () => {
    if (processingRequest.current) {
      console.log("Đang xử lý callback VNPay, bỏ qua yêu cầu mới.");
      return;
    }

    try {
      setLoading(true);
      processingRequest.current = true;

      // Sử dụng hàm handleVNPayResult mới từ API
      const callbackUrl = window.location.search;
      console.log("Xử lý callback từ VNPay với URL:", callbackUrl);

      // Gọi API xử lý kết quả
      const result = await paymentApi.handleVNPayResult(callbackUrl);
      console.log("Kết quả xử lý callback:", result);

      // Lưu kết quả để hiển thị
      setPaymentResult(result);
      
      // Xử lý các trường hợp từ API mới
      if (result.success) {
        setStatus("success");
        paymentChecked.current = true;
        onPaymentComplete(true, result);
      } else if (result.statusData && result.statusData.responseCode === "24") {
        // Mã 24 là người dùng hủy giao dịch
        setStatus("error");
        setError("Bạn đã hủy giao dịch thanh toán");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      } else if (result.pendingSync) {
        // Nếu API trả về trạng thái đang đồng bộ, thử theo dõi tiếp
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
        // Xử lý các trường hợp lỗi khác
        setStatus("error");
        setError(result.message || "Thanh toán thất bại");
        paymentChecked.current = true;
        onPaymentComplete(false, result);
      }
    } catch (error) {
      console.error("Lỗi xử lý callback VNPay:", error);
      
      // Thử kiểm tra với phương thức trackVNPayPayment từ API mới
      const paymentId = 
        searchParams.get("paymentId") || 
        localStorage.getItem("lastPaymentId") ||
        currentPaymentId.current;
        
      if (paymentId) {
        try {
          console.log("Thử theo dõi trạng thái thanh toán với API trackVNPayPayment");
          // Chỉ theo dõi trong 30 giây
          const trackResult = await paymentApi.trackVNPayPayment(paymentId, 5000, 30000);
          
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
        
        // Thử kiểm tra trực tiếp một lần nữa
        processingRequest.current = false;
        pendingTimeoutRef.current = setTimeout(() => {
          fallbackPaymentCheck(paymentId);
        }, 3000);
        return;
      }
      
      setStatus("error");
      setError(error.message || "Có lỗi xảy ra khi xử lý kết quả thanh toán");
      onPaymentComplete(false);
    } finally {
      if (!pendingTimeoutRef.current) {
        processingRequest.current = false;
        setLoading(false);
      }
    }
  };

  // Hủy thanh toán sử dụng API mới
  const handleCancel = async () => {
    try {
      setLoading(true);
      let paymentId =
        payment?.id ||
        searchParams.get("paymentId") ||
        localStorage.getItem("lastPaymentId") ||
        currentPaymentId.current;

      if (paymentId) {
        await paymentApi.cancelPayment(paymentId);
        // Sử dụng hàm mới để xóa cache
        paymentApi.clearPaymentCache();
      }
      onBack();
    } catch (error) {
      console.error("Lỗi khi hủy thanh toán:", error);
      setError("Không thể hủy thanh toán");
      setLoading(false);
    }
  };

  // Cải tiến quá trình bắt đầu thanh toán VNPay
  const startVNPayPayment = async () => {
    try {
      setLoading(true);

      if (!payment || !payment.id) {
        setError("Không có thông tin thanh toán");
        setLoading(false);
        return;
      }

      if (payment && payment.paymentUrl) {
        // Sử dụng URL thanh toán có sẵn
        console.log("Sử dụng URL thanh toán có sẵn:", payment.paymentUrl);
        
        // Thông tin thanh toán sẽ được lưu vào localStorage ở phía API
        currentPaymentId.current = payment.id;
        
        // Chuyển đến trang thanh toán
        window.location.href = payment.paymentUrl;
        return;
      }

      // Chuẩn bị dữ liệu thanh toán đơn giản hóa theo API mới
      const paymentData = {
        ticketIds:
          payment.ticketIds ||
          (Array.isArray(payment.ticketId)
            ? payment.ticketId
            : [payment.ticketId]),
        method: "VNPAY",
      };

      console.log("Bắt đầu quá trình thanh toán với dữ liệu:", paymentData);
      const result = await paymentApi.processPayment(paymentData);

      if (result && result.paymentUrl) {
        console.log("Đã nhận URL thanh toán từ VNPay:", result.paymentUrl);
        currentPaymentId.current = result.id;
        
        // Chuyển đến trang thanh toán
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPay");
      }
    } catch (error) {
      console.error("Lỗi khi bắt đầu thanh toán VNPay:", error);
      setStatus("error");
      setError(error.message || "Không thể bắt đầu quá trình thanh toán VNPay");
      setLoading(false);
    }
  };

  // Hiển thị trạng thái đang xử lý
  if (loading) {
    return (
      <Card className="content-card p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 36 }} />} />
          <Text className="mt-4 text-center text-gray-600">
            Đang xử lý thanh toán VNPay...
          </Text>
          {retryCount > 0 && (
            <Text className="mt-2 text-center text-gray-500">
              Đang thử lại ({retryCount}/{MAX_RETRIES})
            </Text>
          )}
        </div>
      </Card>
    );
  }

  // Hiển thị kết quả thành công
  if (status === "success") {
    return (
      <Card className="content-card p-8">
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-green-500" />}
          title="Thanh toán thành công"
          subTitle={`Mã giao dịch: ${
            paymentResult?.payment?.transactionId ||
            paymentResult?.transactionId ||
            "N/A"
          }`}
          extra={[
            <Button
              type="primary"
              key="done"
              onClick={() => onPaymentComplete(true, paymentResult)}
            >
              Hoàn tất
            </Button>,
          ]}
        />
        {paymentResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <Title level={5} className="mb-3">
              Chi tiết giao dịch
            </Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Text type="secondary">Phương thức:</Text>{" "}
                <Text strong>VNPay</Text>
              </div>
              <div>
                <Text type="secondary">Số tiền:</Text>{" "}
                <Text strong>
                  {(
                    paymentResult.payment?.amount || paymentResult.amount
                  )?.toLocaleString("vi-VN")}{" "}
                  VNĐ
                </Text>
              </div>
              <div>
                <Text type="secondary">Thời gian:</Text>{" "}
                <Text strong>
                  {new Date(
                    paymentResult.payment?.updatedAt ||
                      paymentResult.updatedAt ||
                      Date.now()
                  ).toLocaleString("vi-VN")}
                </Text>
              </div>
              <div>
                <Text type="secondary">Trạng thái:</Text>{" "}
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

  // Hiển thị lỗi
  if (status === "error") {
    return (
      <Card className="content-card p-8">
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-500" />}
          title="Thanh toán thất bại"
          subTitle={error || "Đã xảy ra lỗi trong quá trình thanh toán."}
          extra={[
            <Button type="primary" key="back" onClick={onBack}>
              Thử lại
            </Button>,
          ]}
        />
      </Card>
    );
  }

  // Các bước trong quá trình thanh toán
  const steps = [
    {
      title: "Chuẩn bị",
      description: "Chuẩn bị thanh toán",
    },
    {
      title: "Thanh toán",
      description: "Đang xử lý",
    },
    {
      title: "Hoàn tất",
      description: "Kết quả thanh toán",
    },
  ];

  // Hiển thị giao diện thanh toán
  return (
    <Card className="content-card p-8">
      <Steps
        current={currentStep}
        className="mb-8"
        items={steps.map((step, index) => ({
          key: index,
          title: step.title,
          description: step.description,
          icon: currentStep === index && loading ? <LoadingOutlined /> : null,
        }))}
      />

      <div className="text-center mb-6">
        <Title level={4}>Thanh toán qua VNPay</Title>
        <Paragraph>
          Bạn sẽ được chuyển hướng đến cổng thanh toán VNPay để hoàn tất quá
          trình thanh toán.
        </Paragraph>
      </div>

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-8">
        <div className="flex items-start mb-4">
          <div className="w-8 h-8 bg-blue-800 rounded flex items-center justify-center text-white font-bold mr-3">
            VN
          </div>
          <div>
            <Text strong className="block mb-1">
              Thanh toán an toàn qua cổng VNPay
            </Text>
            <Text className="text-gray-600">
              Hỗ trợ thanh toán qua nhiều ngân hàng và thẻ nội địa
            </Text>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <Text className="block mb-2 font-medium">Lưu ý:</Text>
          <ul className="list-disc pl-5">
            <li className="mb-1">
              Hãy đảm bảo bạn đã đăng ký dịch vụ Internet Banking
            </li>
            <li className="mb-1">
              Chuẩn bị thiết bị nhận SMS/OTP để xác nhận thanh toán
            </li>
            <li className="mb-1">Không tắt trình duyệt cho đến khi hoàn tất thanh toán</li>
            <li>Sau khi thanh toán, vui lòng đợi hệ thống xử lý</li>
          </ul>
        </div>
      </div>

      {payment && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <Title level={5} className="mb-3">
            Thông tin thanh toán
          </Title>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <Text type="secondary">Mã thanh toán:</Text>{" "}
              <Text strong>{payment.id}</Text>
            </div>
            <div>
              <Text type="secondary">Số tiền:</Text>{" "}
              <Text strong>{payment.amount?.toLocaleString("vi-VN")} VNĐ</Text>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Button onClick={handleCancel}>Hủy thanh toán</Button>
        <Button
          type="primary"
          onClick={startVNPayPayment}
          loading={loading}
          disabled={loading}
        >
          Tiếp tục đến VNPay
        </Button>
      </div>
    </Card>
  );
};

export default VNPayPayment;