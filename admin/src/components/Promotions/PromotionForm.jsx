// src/components/Promotions/PromotionForm.jsx
import React from 'react';
import { SimpleForm, TextInput, required } from 'react-admin';

const PromotionForm = (props) => (
  <SimpleForm {...props}>
    <TextInput source="name" label="Tên khuyến mãi" validate={required()} />
    <TextInput source="description" label="Mô tả" validate={required()} />
  </SimpleForm>
);

export default PromotionForm;