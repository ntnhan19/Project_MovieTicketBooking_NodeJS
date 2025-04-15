// src/pages/Promotions.jsx
import PromotionList from '../components/Promotions/PromotionList';
import PromotionCreate from '../components/Promotions/PromotionCreate';
import PromotionEdit from '../components/Promotions/PromotionEdit';
import PromotionShow from '../components/Promotions/PromotionShow';
import "@/assets/styles.css";

const Promotions = {
  list: PromotionList,
  create: PromotionCreate,
  edit: PromotionEdit,
  show: PromotionShow,
};

export default Promotions;
