// admin/src/components/Promotions/PromotionCreate.jsx
import React from 'react';
import { Create, SimpleForm } from 'react-admin';
import PromotionForm from './PromotionForm';

const PromotionCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <PromotionForm />
    </SimpleForm>
  </Create>
);

export default PromotionCreate;