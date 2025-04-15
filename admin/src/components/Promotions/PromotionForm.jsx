// admin/src/components/Promotions/PromotionForm.jsx
import React from 'react';
import { TextInput, NumberInput, DateInput } from 'react-admin';

const PromotionForm = () => (
  <>
    <TextInput source="code" label="Mã khuyến mãi" fullWidth />
    <NumberInput source="discount" label="Giảm giá (%)" fullWidth />
    <DateInput source="validFrom" label="Ngày bắt đầu" fullWidth />
    <DateInput source="validUntil" label="Ngày kết thúc" fullWidth />
  </>
);

export default PromotionForm;