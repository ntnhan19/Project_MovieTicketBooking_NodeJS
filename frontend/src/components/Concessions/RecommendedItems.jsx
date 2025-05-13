// frontend/src/components/Concessions/RecommendedItems.jsx
import { useState, useEffect, createRef } from 'react';
import { concessionItemApi } from '../../api/concessionItemApi';
import { Card, Carousel, Spin, Button, Empty } from 'antd';
import { RightOutlined, LeftOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import ItemQuantitySelector from './ItemQuantitySelector';

const RecommendedItems = ({ onAddItem, excludeIds = [] }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const carouselRef = createRef();

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        setLoading(true);
        const response = await concessionItemApi.getPopularItems(8);
        
        // Lọc những sản phẩm đã có trong giỏ hàng
        const filteredItems = response.data.filter(item => !excludeIds.includes(item.id));
        
        setItems(filteredItems);
        
        // Khởi tạo quantities với giá trị mặc định là 1
        const initialQuantities = {};
        filteredItems.forEach(item => {
          initialQuantities[item.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm phổ biến:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularItems();
  }, [excludeIds]);

  const updateQuantity = (itemId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const handlePrev = () => {
    carouselRef.current.prev();
  };

  const handleNext = () => {
    carouselRef.current.next();
  };

  const handleAddToCart = (item) => {
    onAddItem({...item, type: 'item'}, quantities[item.id]);
  };

  // Đã điều chỉnh: bọc Spin trong div với nested pattern
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin>
          <div className="p-12 bg-transparent" />
        </Spin>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Không hiển thị nếu không có sản phẩm
  }

  return (
    <Card 
      title={
        <div className="flex items-center">
          <span className="text-lg font-bold">Sản phẩm đề xuất</span>
          <div className="ml-2 bg-primary-light text-white text-xs px-2 py-0.5 rounded-full">Hot</div>
        </div>
      }
      className="content-card mt-6 overflow-hidden"
      extra={
        <div className="flex space-x-2">
          <Button 
            icon={<LeftOutlined />} 
            onClick={handlePrev}
            shape="circle"
            className="hover:text-primary hover:border-primary transition-colors"
          />
          <Button 
            icon={<RightOutlined />} 
            onClick={handleNext}
            shape="circle"
            className="hover:text-primary hover:border-primary transition-colors"
          />
        </div>
      }
    >
      {items.length > 0 ? (
        <Carousel 
          ref={carouselRef}
          slidesToShow={4}
          slidesToScroll={2}
          dots={false}
          autoplay
          arrows
          className="py-4"
          responsive={[
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 480,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
          ]}
        >
          {items.map(item => (
            <div key={item.id} className="px-2">
              <Card
                hoverable
                className="content-card h-full transition-all transform hover:-translate-y-1 hover:shadow-card-hover"
                cover={
                  <div className="h-32 overflow-hidden relative group">
                    <img
                      alt={item.name}
                      src={item.imageUrl || '/api/placeholder/200/150'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <div className="text-white text-sm font-medium">Sản phẩm phổ biến</div>
                    </div>
                  </div>
                }
              >
                <div className="text-center">
                  <div className="font-medium mb-2 truncate text-text-primary">{item.name}</div>
                  <div className="text-primary font-bold mb-3">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(item.price)}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <ItemQuantitySelector 
                      value={quantities[item.id]} 
                      onChange={(value) => updateQuantity(item.id, value)}
                      size="small"
                    />
                    
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      size="small"
                      onClick={() => handleAddToCart(item)}
                      className="w-full btn-primary"
                    >
                      Thêm
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </Carousel>
      ) : (
        <Empty 
          description="Không có sản phẩm đề xuất" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default RecommendedItems;