import { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Typography, 
  Divider, 
  Empty, 
  Modal, 
  Form,
  Input,
  Radio,
  Result
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingOutlined, 
  ExclamationCircleOutlined, 
  CreditCardOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { concessionOrderApi } from '../../api/concessionOrderApi';
import ItemQuantitySelector from './ItemQuantitySelector';

const { Title, Text } = Typography;
const { confirm } = Modal;

const OrderSummary = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const [totalPrice, setTotalPrice] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkoutForm] = Form.useForm();
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Tính tổng giá tiền khi items thay đổi
  useEffect(() => {
    const calculatedTotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    setTotalPrice(calculatedTotal);
  }, [items]);

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Xử lý xóa sản phẩm
  const handleRemoveItem = (item) => {
    confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${item.name} khỏi giỏ hàng?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onRemoveItem(item);
      }
    });
  };

  // Xử lý làm trống giỏ hàng
  const handleClearCart = () => {
    if (items.length === 0) return;
    
    confirm({
      title: 'Xác nhận xóa tất cả',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?',
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        onClearCart();
      }
    });
  };

  // Mở modal thanh toán
  const showCheckoutModal = () => {
    setIsModalVisible(true);
  };

  // Đóng modal thanh toán
  const handleCancel = () => {
    setIsModalVisible(false);
    if (isCheckoutComplete) {
      setIsCheckoutComplete(false);
      onClearCart();
    }
  };

  // Xử lý đặt hàng
  const handleSubmitOrder = async (values) => {
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          type: item.type // 'item' hoặc 'combo'
        })),
        note: values.note || '',
        paymentMethod: values.paymentMethod,
        pickupInfo: {
          name: values.name,
          phone: values.phone
        }
      };
      
      // Gọi API đặt hàng
      const result = await concessionOrderApi.createOrder(orderData);
      
      // Hiển thị thông báo thành công
      setOrderId(result.data.id || '123456789'); // Sử dụng ID từ API hoặc mặc định nếu không có
      setIsCheckoutComplete(true);
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      Modal.error({
        title: 'Đặt hàng thất bại',
        content: 'Đã có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại sau.',
      });
    }
  };

  return (
    <Card 
      className="content-card sticky top-24 hover:shadow-card-hover transition-shadow duration-300"
      title={
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ShoppingCartOutlined className="text-primary text-xl mr-2" />
            <Title level={4} className="m-0">Giỏ hàng của bạn</Title>
          </div>
          <Button 
            type="text" 
            danger 
            disabled={items.length === 0}
            onClick={handleClearCart}
            className="hover:bg-red-50"
          >
            Xóa tất cả
          </Button>
        </div>
      }
    >
      {items.length > 0 ? (
        <>
          <List
            className="max-h-96 overflow-y-auto pr-1 divide-y divide-gray-100"
            dataSource={items}
            renderItem={item => (
              <List.Item
                key={`${item.type}-${item.id}`}
                className="py-3 hover:bg-light-bg-secondary transition-colors duration-200"
              >
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-text-primary">{item.name}</div>
                      <div className="text-sm text-text-secondary">
                        {item.type === 'combo' ? (
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                            Combo
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                            Sản phẩm đơn lẻ
                          </span>
                        )}
                      </div>
                    </div>
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => handleRemoveItem(item)}
                      className="hover:bg-red-50"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <ItemQuantitySelector
                      value={item.quantity}
                      onChange={(value) => onUpdateQuantity(item, value)}
                      min={1}
                      max={10}
                      size="small"
                    />
                    <Text className="font-medium text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          
          <Divider className="my-4" />
          
          <div className="flex justify-between items-center mb-6 bg-light-bg-secondary p-3 rounded-lg">
            <Text className="text-lg">Tổng tiền:</Text>
            <Text className="text-xl font-bold bg-button-gradient text-white px-4 py-1 rounded-full shadow-button">
              {formatCurrency(totalPrice)}
            </Text>
          </div>
          
          <Button 
            type="primary" 
            block 
            size="large"
            icon={<ShoppingOutlined />}
            onClick={showCheckoutModal}
            className="btn-primary h-12 text-base font-medium"
          >
            Tiến hành thanh toán
          </Button>
        </>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-text-secondary">Giỏ hàng của bạn đang trống</span>
          }
          className="py-10"
        >
          <Text className="text-gray-500 block mb-4">
            Vui lòng thêm sản phẩm vào giỏ hàng
          </Text>
          <Button 
            type="primary" 
            className="btn-primary"
            icon={<ShoppingOutlined />}
          >
            Khám phá sản phẩm
          </Button>
        </Empty>
      )}

      {/* Modal thanh toán - Sửa bodyStyle thành styles.body */}
      <Modal
        title={isCheckoutComplete ? "Đặt hàng thành công" : "Thanh toán"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        className="popup-animation"
        styles={{
          body: { padding: '20px' }
        }}
      >
        {isCheckoutComplete ? (
          <Result
            status="success"
            title="Đặt hàng thành công!"
            subTitle={`Mã đơn hàng: ${orderId}. Vui lòng đến quầy và cung cấp mã này để nhận đồ.`}
            extra={[
              <Button key="close" onClick={handleCancel} type="primary" className="btn-primary">
                Đóng
              </Button>
            ]}
          />
        ) : (
          <Form
            form={checkoutForm}
            layout="vertical"
            onFinish={handleSubmitOrder}
            initialValues={{
              paymentMethod: 'CASH'
            }}
          >
            <div className="mb-6 bg-light-bg-secondary p-4 rounded-lg">
              <Title level={5} className="flex items-center mb-3">
                <ShoppingCartOutlined className="mr-2 text-primary" />
                Thông tin đơn hàng
              </Title>
              <List
                size="small"
                className="bg-white rounded-lg overflow-hidden shadow-sm"
                dataSource={items}
                renderItem={item => (
                  <List.Item className="flex justify-between hover:bg-light-bg-secondary">
                    <span className="font-medium">{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </List.Item>
                )}
                footer={
                  <div className="flex justify-between font-bold bg-gray-50 p-2">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                }
              />
            </div>
            
            <Title level={5} className="flex items-center mb-3">
              <CreditCardOutlined className="mr-2 text-primary" />
              Thông tin nhận hàng
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Form.Item
                name="name"
                label="Họ tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                className="mb-0"
              >
                <Input placeholder="Nhập họ tên người nhận" className="form-input" />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^(0|\+84)\d{9,10}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
                className="mb-0"
              >
                <Input placeholder="Nhập số điện thoại" className="form-input" />
              </Form.Item>
            </div>
            
            <Form.Item
              name="note"
              label="Ghi chú (tùy chọn)"
            >
              <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu cần" className="form-input" />
            </Form.Item>
            
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
            >
              <Radio.Group className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Radio.Button value="CASH" className="h-auto px-4 py-2 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Tiền mặt</span>
                      <span className="text-xs text-text-secondary">Thanh toán khi nhận hàng</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value="CARD" className="h-auto px-4 py-2 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Thẻ ngân hàng</span>
                      <span className="text-xs text-text-secondary">Thanh toán qua thẻ ATM/Visa/Master</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value="MOMO" className="h-auto px-4 py-2 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">Ví MoMo</span>
                      <span className="text-xs text-text-secondary">Thanh toán qua ví MoMo</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value="VNPAY" className="h-auto px-4 py-2 flex items-center">
                    <div className="flex flex-col">
                      <span className="font-medium">VNPay</span>
                      <span className="text-xs text-text-secondary">Thanh toán qua VNPay</span>
                    </div>
                  </Radio.Button>
                </div>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item className="mb-0 mt-6">
              <div className="flex justify-end gap-3">
                <Button onClick={handleCancel}>
                  Hủy
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<CreditCardOutlined />}
                  className="btn-primary"
                >
                  Hoàn tất đặt hàng
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default OrderSummary;