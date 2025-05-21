import { Button, InputNumber } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const ItemQuantitySelector = ({ value = 1, onChange, min = 1, max = 10, size = 'middle', className }) => {
  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (newValue) => {
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={`flex items-center rounded-lg border border-border-light ${className} hover:shadow-md transition-all`}>
      <Button
        icon={<MinusOutlined />}
        onClick={handleDecrease}
        disabled={value <= min}
        size={size}
        className="min-w-10 h-10 border-none hover:bg-red-600 hover:text-white transition-colors"
      />
      <InputNumber
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-12 text-center border-none focus:ring-0"
        size={size}
        controls={false}
      />
      <Button
        icon={<PlusOutlined />}
        onClick={handleIncrease}
        disabled={value >= max}
        size={size}
        className="min-w-10 h-10 border-none hover:bg-red-600 hover:text-white transition-colors"
      />
    </div>
  );
};

export default ItemQuantitySelector;