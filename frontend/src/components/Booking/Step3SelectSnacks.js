// components/Booking/Step3SelectSnacks.js
import React, { useState } from "react";
import { Checkbox, Button } from "antd";

const snacksList = [
  { name: "Popcorn", price: 30000 },
  { name: "Coke", price: 20000 },
  { name: "Peanuts", price: 15000 },
  { name: "Nachos", price: 25000 },
];

const Step3SelectSnacks = ({ onSnackSelect }) => {
  const [selectedSnacks, setSelectedSnacks] = useState([]);

  const handleSnackChange = (e) => {
    const { value, checked } = e.target;
    setSelectedSnacks((prev) =>
      checked ? [...prev, value] : prev.filter((snack) => snack !== value)
    );
  };

  const handleNextStep = () => {
    onSnackSelect(selectedSnacks);
  };

  return (
    <div>
      <h3>Chọn Bắp nước</h3>
      <div>
        {snacksList.map((snack) => (
          <Checkbox
            key={snack.name}
            value={snack.name}
            onChange={handleSnackChange}
          >
            {snack.name} - {snack.price} VND
          </Checkbox>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <Button type="primary" onClick={handleNextStep}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
};

export default Step3SelectSnacks;
