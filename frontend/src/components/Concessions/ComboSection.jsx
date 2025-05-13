import { Empty, Row, Col } from 'antd';
import ItemCard from './ItemCard';

const ComboSection = ({ combos, onAddItem }) => {
  if (!combos || combos.length === 0) {
    return <Empty description="Không có combo nào hiện có" />;
  }

  return (
    <div className="py-4">
      <Row gutter={[16, 24]}>
        {combos.map(combo => (
          <Col key={combo.id} xs={24} sm={12} md={8} lg={8}>
            <ItemCard 
              item={{...combo, type: 'combo'}} 
              onAddItem={onAddItem} 
              isCombo={true}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ComboSection;