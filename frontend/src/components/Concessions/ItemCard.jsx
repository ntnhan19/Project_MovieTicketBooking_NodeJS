import { useState } from 'react';
import { Card, Button, Badge, Tooltip, Modal, List, Carousel, Rate } from 'antd';
import { InfoCircleOutlined, ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import ItemQuantitySelector from './ItemQuantitySelector';

const ItemCard = ({ item, onAddItem, isCombo = false, onItemClick, toggleFavorite, favorites = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddClick = () => {
    setAdding(true);
    setTimeout(() => {
      onAddItem(item, quantity);
      setAdding(false);
      setQuantity(1);
    }, 500);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
    if (onItemClick) onItemClick(item);
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(item.price || 0);

  const getRibbonColor = () => {
    if (isCombo) return 'gold';
    if (item.featured) return 'red';
    if (item.isLimited) return 'purple';
    return '';
  };

  const getRibbonText = () => {
    if (isCombo) return 'Combo';
    if (item.featured) return 'Nổi bật';
    if (item.isLimited) return 'Giới hạn';
    return null;
  };

  const comboTooltipContent = isCombo && Array.isArray(item.items) && item.items.length > 0 ? (
    <List
      size="small"
      dataSource={item.items}
      renderItem={(comboItem) => (
        <List.Item>
          {comboItem.item?.name || 'Sản phẩm không có tên'} x{comboItem.quantity || 1}
        </List.Item>
      )}
      className="bg-white p-2 rounded-lg shadow-sm"
    />
  ) : null;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isCombo && <Badge color="gold" className="mr-2" />}
              <span className="text-xl font-bold text-text-primary">{item.name || 'Combo không có tên'}</span>
            </div>
            <Button
              icon={favorites.some((fav) => fav.id === item.id) ? <HeartFilled /> : <HeartOutlined />}
              onClick={() => toggleFavorite(item)}
              className="btn-outline"
              aria-label={favorites.some((fav) => fav.id === item.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            />
          </div>
        }
        open={showDetails}
        onCancel={toggleDetails}
        footer={[
          <Button key="close" className="btn-outline" onClick={toggleDetails}>
            Đóng
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="btn-primary"
            onClick={() => {
              handleAddClick();
              toggleDetails();
            }}
            loading={adding}
          >
            Thêm vào giỏ
          </Button>,
        ]}
        width={800}
        className="popup-animation auth-modal"
        styles={{ body: { padding: '24px' } }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Carousel
              autoplay
              dots={{ className: 'carousel-dots' }}
              className="rounded-xl shadow-card"
              afterChange={() => {}}
            >
              <div>
                <img
                  src={item.image || '/api/placeholder/400/400'}
                  alt={item.name || 'Combo'}
                  className="w-full h-64 object-contain rounded-xl"
                  loading="lazy"
                />
              </div>
              {item.additionalImages?.map((img, index) => (
                <div key={index}>
                  <img
                    src={img}
                    alt={`${item.name} ${index + 1}`}
                    className="w-full h-64 object-contain rounded-xl"
                    loading="lazy"
                  />
                </div>
              ))}
            </Carousel>
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {[item.image, ...(item.additionalImages || [])].map((img, index) => (
                <img
                  key={index}
                  src={img || '/api/placeholder/100/100'}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                  onClick={() => {}}
                />
              ))}
            </div>
            <div className="mt-4 text-xl font-bold bg-button-gradient text-white inline-block px-6 py-2 rounded-full shadow-button">
              {formattedPrice}
            </div>
            {item.rating && (
              <div className="mt-2">
                <Rate disabled defaultValue={item.rating} allowHalf className="text-primary" />
              </div>
            )}
          </div>
          <div>
            <p className="text-text-secondary text-base mb-4">{item.description || 'Không có mô tả chi tiết.'}</p>
            {isCombo && Array.isArray(item.items) && item.items.length > 0 ? (
              <>
                <h4 className="font-bold text-lg text-primary mb-3">Sản phẩm trong combo:</h4>
                <List
                  size="small"
                  bordered
                  className="mb-4 shadow-sm rounded-lg overflow-hidden bg-white"
                  dataSource={item.items}
                  renderItem={(comboItem) => (
                    <List.Item className="flex justify-between hover:bg-light-bg-secondary px-4 py-2">
                      <span className="text-text-primary">{comboItem.item?.name || 'Sản phẩm không có tên'}</span>
                      <span className="font-medium text-text-secondary">x{comboItem.quantity || 1}</span>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <p className="text-text-secondary">Không có sản phẩm trong combo.</p>
            )}
            <div className="mt-6">
              <div className="flex items-center gap-4">
                <span className="font-medium text-text-primary">Số lượng:</span>
                <ItemQuantitySelector value={quantity} onChange={handleQuantityChange} className="w-36" />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Badge.Ribbon text={getRibbonText()} color={getRibbonColor()} style={{ display: getRibbonText() ? 'block' : 'none' }}>
        <Tooltip title={comboTooltipContent} placement="top" color="white">
          <Card
            hoverable
            className="content-card min-w-0 h-full transition-all transform hover:-translate-y-1 hover:shadow-card-hover overflow-hidden duration-300 rounded-xl border-border-light backdrop-blur-md"
            cover={
              <div className="relative aspect-[1/1] overflow-hidden bg-light-bg-secondary group">
                <img
                  alt={item.name || 'Combo'}
                  src={item.image || '/api/placeholder/400/400'}
                  className="absolute top-0 left-0 w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                  <Button
                    type="primary"
                    icon={<InfoCircleOutlined />}
                    className="btn-primary transform scale-0 group-hover:scale-100 transition-all duration-300"
                    onClick={toggleDetails}
                    aria-label="Xem chi tiết sản phẩm"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            }
          >
            <Card.Meta
              title={<div className="truncate text-xl font-semibold text-text-primary">{item.name || 'Combo không có tên'}</div>}
              description={
                <div className="flex justify-between items-center mt-2">
                  <span className="text-primary font-bold text-lg bg-button-gradient text-white px-3 py-1 rounded-full">
                    {formattedPrice}
                  </span>
                  <Button
                    icon={favorites.some((fav) => fav.id === item.id) ? <HeartFilled /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(item)}
                    className="btn-outline"
                    aria-label={favorites.some((fav) => fav.id === item.id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                  />
                </div>
              }
            />
            <div className="flex items-center justify-center gap-3 mt-4 px-6">
              <ItemQuantitySelector value={quantity} onChange={handleQuantityChange} className="w-36" />
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={handleAddClick}
                className="btn-primary w-24"
                loading={adding}
                aria-label={`Thêm ${item.name} vào giỏ hàng`}
              >
                Thêm
              </Button>
            </div>
            {item.rating && (
              <div className="mt-2 text-center">
                <Rate disabled defaultValue={item.rating} allowHalf className="text-primary text-sm" />
              </div>
            )}
          </Card>
        </Tooltip>
      </Badge.Ribbon>
    </>
  );
};

export default ItemCard;