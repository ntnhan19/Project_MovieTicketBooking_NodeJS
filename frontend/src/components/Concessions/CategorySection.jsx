import React, { useState, useEffect } from "react";
import ItemList from "./ItemList";
import { concessionItemApi } from "../../api/concessionItemApi";

const CategorySection = ({ categoryId, onAddItem }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        setLoading(true);
        const response = await concessionItemApi.getAvailableItemsByCategory(categoryId);
        setItems(response.data || []);
      } catch (error) {
        console.error(`Lỗi khi lấy sản phẩm cho danh mục ${categoryId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) {
      fetchCategoryItems();
    }
  }, [categoryId]);

  return (
    <ItemList
      items={items}
      loading={loading}
      onAddItem={onAddItem}
      emptyMessage="Không có sản phẩm nào trong danh mục này"
      cardClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-lg transition-all duration-300"
    />
  );
};

export default CategorySection;