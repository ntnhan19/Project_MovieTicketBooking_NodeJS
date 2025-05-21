import { Row, Col, Skeleton, Empty, Button } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import ItemCard from "./ItemCard";

const ItemList = ({
  items,
  loading,
  onAddItem,
  isCombo = false,
  emptyMessage = "Không có sản phẩm nào",
  emptyButtonText = "Khám Phá Combo",
  colSizes = { xs: 24, sm: 12, md: 8, lg: 8 },
}) => {
  if (loading) {
    return (
      <div className="py-6 px-8">
        <Row gutter={[32, 32]} className="animate-fadeIn">
          {[1, 2, 3, 4].map((key) => (
            <Col key={key} {...colSizes}>
              <div className="content-card p-6 h-80 animate-pulse">
                <Skeleton.Image active className="w-full h-40" />
                <Skeleton active paragraph={{ rows: 2 }} className="mt-4" />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 px-8 text-center bg-white rounded-xl shadow-card">
        <Empty
          description={
            <span className="text-text-secondary text-lg">{emptyMessage}</span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          className="py-8"
        >
          {emptyButtonText && (
            <Button
              type="primary"
              className="btn-primary h-12 hover:shadow-lg transition-all"
              icon={<ShoppingOutlined />}
            >
              {emptyButtonText}
            </Button>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="py-6 px-8">
      <Row gutter={[32, 32]} className="animate-fadeIn">
        {items.map((item) => (
          <Col key={item.id} {...colSizes}>
            <ItemCard
              item={{ ...item, type: isCombo ? "combo" : "item" }}
              onAddItem={onAddItem}
              isCombo={isCombo}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ItemList;