import { useState, useEffect } from 'react';
import { concessionItemApi } from '../../api/concessionItemApi';
import { Empty, Row, Col, Skeleton, Button } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import ItemCard from './ItemCard';

const CategorySection = ({ categoryId, onAddItem }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);
        const response = await concessionItemApi.getAvailableItemsByCategory(categoryId);
        setItems(response.data || []);
      } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm cho danh mục ${categoryId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryItems();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="py-6">
        <Row gutter={[16, 24]}>
          {[1, 2, 3, 4, 5, 6].map(key => (
            <Col key={key} xs={24} sm={12} md={8} lg={8}>
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

  if (items.length === 0) {
    return (
      <Empty 
        description={
          <span className="text-text-secondary text-lg">Không có sản phẩm nào trong danh mục này</span>
        } 
        image={Empty.PRESENTED_IMAGE_SIMPLE} 
        className="py-16"
      >
        <Button
          type="primary"
          className="btn-primary h-12"
          icon={<ShoppingOutlined />}
        >
          Khám Phá Combo
        </Button>
      </Empty>
    );
  }

  return (
    <div className="py-6">
      <Row gutter={[24, 32]} className="animate-fadeIn">
        {items.map(item => (
          <Col key={item.id} xs={24} sm={12} md={8} lg={8}>
            <ItemCard 
              item={{...item, type: 'item'}} 
              onAddItem={onAddItem} 
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategorySection;