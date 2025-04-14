// admin/src/components/Promotions/PromotionList.jsx
import React from 'react';
import { List, Datagrid, TextField, NumberField, DateField, EditButton, DeleteButton } from 'react-admin';

const PromotionList = (props) => (
    <List {...props}>
      <Datagrid>
      <TextField source="code" label="Mã khuyến mãi" />
      <NumberField source="discount" label="Giảm giá (%)" />
      <DateField source="validFrom" label="Ngày bắt đầu" />
      <DateField source="validUntil" label="Ngày kết thúc" />
      <EditButton label="Sửa" />
      <DeleteButton label="Xoá" />
      </Datagrid>
    </List>
  );
  
  export default PromotionList;
