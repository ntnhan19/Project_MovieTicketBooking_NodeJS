// admin/src/components/Promotions/PromotionEdit.jsx
import React from 'react';
import { Edit, SimpleForm } from 'react-admin';
import PromotionForm from './PromotionForm';

const PromotionEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <PromotionForm />
    </SimpleForm>
  </Edit>
);

export default PromotionEdit;
