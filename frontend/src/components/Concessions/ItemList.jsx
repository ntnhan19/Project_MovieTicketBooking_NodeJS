import React, { useState } from "react";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  StarFilled,
  FireOutlined,
} from "@ant-design/icons";
import {
  Rate,
  Button,
  Modal,
  Carousel,
  List,
  Tag,
  Skeleton,
  Empty,
} from "antd";

const ItemList = ({
  items,
  loading,
  onAddItem,
  isCombo = false,
  emptyMessage = "Không có sản phẩm nào",
  emptyButtonText = "Khám Phá Combo",
  toggleFavorite,
  favorites = [],
  onItemClick,
}) => {
  const ItemCard = ({ item, onAddItem, isCombo = false, onItemClick }) => {
    const [quantity, setQuantity] = useState(1);
    const [showDetails, setShowDetails] = useState(false);
    const [adding, setAdding] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const minQuantity = 1;
    const maxQuantity = 10;

    const handleIncrease = (e) => {
      e?.stopPropagation();
      if (quantity < maxQuantity) setQuantity(quantity + 1);
    };

    const handleDecrease = (e) => {
      e?.stopPropagation();
      if (quantity > minQuantity) setQuantity(quantity - 1);
    };

    const handleAddClick = (e) => {
      e?.stopPropagation();
      setAdding(true);
      setTimeout(() => {
        onAddItem(item, quantity);
        setAdding(false);
        setQuantity(1);
      }, 500);
    };

    const toggleDetails = (e) => {
      e?.stopPropagation();
      setShowDetails(true);
      if (onItemClick) onItemClick(item);
    };

    // Tính giá đã giảm dựa trên discountPercent
    const discountPercent = item.discountPercent || 0;
    const discountedPrice =
      discountPercent > 0
        ? item.price * (1 - discountPercent / 100)
        : item.price;

    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(item.price || 50000);

    const formattedDiscountedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(discountedPrice);

    const getRibbonStyles = () => {
      if (isCombo) return "from-yellow-500 to-yellow-600";
      if (item.featured) return "from-red-500 to-red-600";
      if (item.isLimited) return "from-purple-500 to-purple-600";
      return "from-gray-500 to-gray-600";
    };

    const getRibbonText = () => {
      if (isCombo) return "COMBO";
      if (item.featured) return "NỔI BẬT";
      if (item.isLimited) return "GIỚI HẠN";
      return null;
    };

    return (
      <>
        <div
          className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100/50 dark:border-gray-600/50 w-full h-full animate-fadeIn"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={toggleDetails}
        >
          <div className="relative overflow-hidden pb-[100%]">
            <img
              alt={item.name || "Combo"}
              src={
                item.image ||
                "https://via.placeholder.com/300x300?text=No+Image"
              }
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x300?text=No+Image";
                e.target.alt = "Hình ảnh không tồn tại";
              }}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent ${
                isHovered ? "opacity-100" : "opacity-0"
              } transition-all duration-500 flex flex-col justify-between p-6 backdrop-blur-[2px]`}
            >
              {/* Ratings */}
              {item.rating && (
                <div className="flex justify-between items-start">
                  <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg gap-2">
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={item.rating / 2}
                      className="text-yellow-400 text-[12px]"
                    />
                    <span className="font-bold text-white text-sm border-l border-white/20 pl-2">
                      {item.rating}/10
                    </span>
                  </div>
                </div>
              )}
              {/* Spacer to push buttons to the bottom */}
              <div className="flex-1"></div>
              {/* Action Buttons */}
              <div className="flex justify-center items-end gap-3">
                <div className="flex items-center bg-white/25 backdrop-blur-md rounded-lg overflow-hidden border border-white/30 shadow-lg">
                  <Button
                    icon={<MinusOutlined className="text-xs" />}
                    onClick={handleDecrease}
                    disabled={quantity <= minQuantity}
                    className="w-8 h-8 border-none bg-transparent hover:bg-white/30 text-white transition-all disabled:opacity-30 flex items-center justify-center text-xs"
                  />
                  <div className="w-10 h-8 flex items-center justify-center bg-white/15 border-x border-white/30">
                    <span className="text-sm font-bold text-white">
                      {quantity}
                    </span>
                  </div>
                  <Button
                    icon={<PlusOutlined className="text-xs" />}
                    onClick={handleIncrease}
                    disabled={quantity >= maxQuantity}
                    className="w-8 h-8 border-none bg-transparent hover:bg-white/30 text-white transition-all disabled:opacity-30 flex items-center justify-center text-xs"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddClick(e);
                  }}
                  className="relative overflow-hidden bg-red-500 hover:bg-red-600 text-white rounded-md px-6 py-1.5 border-none font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm flex items-center justify-center gap-1"
                >
                  <ShoppingCartOutlined className="text-base" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
            {getRibbonText() && (
              <div
                className={`absolute top-3 left-3 py-1.5 px-3 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r ${getRibbonStyles()} backdrop-blur-md`}
              >
                <div className="flex items-center">
                  {isCombo && <StarFilled className="mr-1 text-[10px]" />}
                  {item.featured && (
                    <FireOutlined className="mr-1 text-[10px]" />
                  )}
                  {getRibbonText()}
                </div>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r from-red-500 to-red-600 backdrop-blur-md">
                -{discountPercent}%
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col h-full">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight h-12">
              {item.name || "Combo không có tên"}
            </h3>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {discountPercent > 0 ? (
                  <>
                    <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full shadow-button">
                      {formattedDiscountedPrice}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                      {formattedPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full shadow-button">
                    {formattedPrice}
                  </span>
                )}
              </div>
            </div>
            {item.rating && (
              <div className="flex items-center mb-2">
                <Rate
                  disabled
                  allowHalf
                  defaultValue={item.rating / 2}
                  className="text-yellow-400 text-xs"
                />
                <span className="ml-1 text-gray-600 dark:text-gray-300 text-xs font-medium">
                  {item.rating}/10
                </span>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="flex flex-col gap-0.5 mb-2">
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  Tiết kiệm{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(item.price - discountedPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
        <Modal
          title={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCombo && <StarFilled className="text-yellow-500" />}
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                  {item.name || "Combo không có tên"}
                </span>
                {discountPercent > 0 && (
                  <Tag color="red" className="text-sm font-semibold">
                    -{discountPercent}%
                  </Tag>
                )}
              </div>
            </div>
          }
          open={showDetails}
          onCancel={() => setShowDetails(false)}
          footer={[
            <Button
              key="close"
              size="large"
              className="rounded-md px-6 py-1.5 text-sm font-semibold"
              onClick={() => setShowDetails(false)}
            >
              Đóng
            </Button>,
            <Button
              key="add"
              type="primary"
              icon={<ShoppingCartOutlined />}
              size="large"
              className="rounded-md px-6 py-1.5 bg-red-500 hover:bg-red-600 border-none text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-sm"
              onClick={() => {
                handleAddClick();
                setShowDetails(false);
              }}
              loading={adding}
            >
              Thêm
            </Button>,
          ]}
          width={800}
          centered
          style={{ padding: "24px" }}
          styles={{
            header: { padding: "20px 24px", borderBottom: "1px solid #f0f0f0" },
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Carousel
                autoplay
                dots={{ className: "!bottom-3" }}
                className="rounded-lg overflow-hidden shadow-md"
              >
                <div>
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/500x300?text=No+Image"
                    }
                    alt={item.name || "Combo"}
                    className="w-full h-60 object-cover"
                    loading="lazy"
                  />
                </div>
                {item.additionalImages?.map((img, index) => (
                  <div key={index}>
                    <img
                      src={img}
                      alt={`${item.name} ${index + 1}`}
                      className="w-full h-60 object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </Carousel>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[item.image, ...(item.additionalImages || [])].map(
                  (img, index) => (
                    <img
                      key={index}
                      src={
                        img ||
                        "https://via.placeholder.com/100x100?text=Thumbnail"
                      }
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm"
                    />
                  )
                )}
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-2">
                  Thông tin sản phẩm
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.description || "Không có mô tả chi tiết."}
                </p>
              </div>
              {isCombo &&
                Array.isArray(item.items) &&
                item.items.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3">
                      Sản phẩm trong combo
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <List
                        size="small"
                        dataSource={item.items}
                        renderItem={(comboItem) => (
                          <List.Item className="border-none px-0 py-2 border-b border-gray-200 dark:border-gray-600 last:border-0">
                            <div className="flex justify-between items-center w-full">
                              <span className="text-gray-800 dark:text-gray-100 text-sm font-medium">
                                {comboItem?.item?.name ||
                                  "Sản phẩm không có tên"}
                              </span>
                              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                                x{comboItem?.quantity || 1}
                              </span>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                )}
              <div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
                  Số lượng
                </h4>
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <Button
                    icon={<MinusOutlined className="text-xs" />}
                    onClick={handleDecrease}
                    disabled={quantity <= minQuantity}
                    className="w-10 h-10 border-none bg-transparent hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  />
                  <div className="w-12 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-600">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                      {quantity}
                    </span>
                  </div>
                  <Button
                    icon={<PlusOutlined className="text-xs" />}
                    onClick={handleIncrease}
                    disabled={quantity >= maxQuantity}
                    className="w-10 h-10 border-none bg-transparent hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  {discountPercent > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full shadow-button">
                          {formattedDiscountedPrice}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">
                          {formattedPrice}
                        </span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                        Tiết kiệm{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.price - discountedPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1 rounded-full shadow-button">
                      {formattedPrice}
                    </span>
                  )}
                </div>
                {item.rating && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-2.5 py-1">
                    <Rate
                      disabled
                      allowHalf
                      defaultValue={item.rating / 2}
                      className="text-yellow-400 text-xs"
                    />
                    <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {item.rating}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fadeIn">
          {[1, 2, 3, 4].map((key) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-card p-0 animate-pulse w-full border border-gray-100/50 dark:border-gray-600/50"
            >
              <div className="relative overflow-hidden pb-[150%]">
                <Skeleton.Image
                  active
                  className="w-full h-full absolute top-0 left-0"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div className="p-4 space-y-3">
                <Skeleton.Input active className="w-3/4 h-5" />
                <Skeleton.Input active className="w-full h-3.5" />
                <div className="flex justify-between items-center mt-3">
                  <Skeleton.Input active className="w-1/3 h-5" />
                  <Skeleton.Input active className="w-1/4 h-3.5" />
                </div>
                <div className="flex gap-2 mt-3">
                  <Skeleton.Button active className="w-16 h-8" />
                  <Skeleton.Button active className="flex-1 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 px-4 text-center">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md mx-auto border border-gray-100 dark:border-gray-600">
          <Empty
            description={
              <div className="space-y-2">
                <span className="text-gray-800 dark:text-gray-200 text-base font-medium block">
                  {emptyMessage}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Hãy thử tìm kiếm hoặc khám phá các danh mục khác
                </span>
              </div>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="py-3"
          >
            {emptyButtonText && (
              <Button
                type="primary"
                size="large"
                className="bg-red-500 hover:bg-red-600 border-none rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                icon={<ShoppingCartOutlined />}
              >
                {emptyButtonText}
              </Button>
            )}
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="mb-4 text-gray-600 dark:text-gray-300 text-sm">
        Tìm thấy {items.length} {isCombo ? "combo" : "sản phẩm"}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fadeIn">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="h-full flex"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ItemCard
              item={{ ...item, type: isCombo ? "combo" : "item" }}
              onAddItem={onAddItem}
              isCombo={isCombo}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
              onItemClick={onItemClick}
            />
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-10 text-center">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
              💡 Mẹo nhỏ từ chúng tôi
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xl mx-auto">
              {isCombo
                ? "Combo giúp bạn tiết kiệm hơn khi mua nhiều sản phẩm cùng lúc. Hãy thử các combo đặc biệt của chúng tôi!"
                : "Thêm nhiều sản phẩm vào giỏ hàng để được khuyến mãi tốt hơn. Đừng quên kiểm tra các combo tiết kiệm!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;
