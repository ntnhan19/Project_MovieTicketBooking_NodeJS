// admin/src/components/Promotions/PromotionShow.jsx
import React from 'react';
import { Show, SimpleShowLayout, TextField, NumberField, DateField } from 'react-admin';

const PromotionShow = (props) => (
  <Show {...props}>
    <SimpleShowLayout>
    <TextField source="code" label="Mã khuyến mãi" />
      <NumberField source="discount" label="Giảm giá (%)" />
      <DateField source="validFrom" label="Ngày bắt đầu" />
      <DateField source="validUntil" label="Ngày kết thúc" />
    </SimpleShowLayout>
  </Show>
);

export default PromotionShow;