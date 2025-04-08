// src/pages/Promotions.jsx
import React from 'react';
import { List, Create, Edit } from 'react-admin';
import PromotionList from '@/components/Promotions/PromotionList';
import PromotionForm from '@/components/Promotions/PromotionForm';
import "@/assets/styles.css";

export const PromotionListView = (props) => (
  <List {...props} title="Danh sách khuyến mãi">
    <PromotionList {...props} />
  </List>
);

export const PromotionCreateView = (props) => (
  <Create {...props} title="Thêm khuyến mãi mới">
    <PromotionForm {...props} />
  </Create>
);

export const PromotionEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin khuyến mãi">
    <PromotionForm {...props} />
  </Edit>
);
