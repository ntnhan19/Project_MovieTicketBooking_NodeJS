import React, { useState, useEffect, useCallback } from "react";
import ItemList from "./ItemList";
import { concessionItemApi } from "../../api/concessionItemApi";

const CategorySection = React.memo(({ categoryId, onAddItem, onItemClick, searchQuery }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  console.log("CategorySection rendered", { categoryId, searchQuery, itemsLength: items.length });

  const fetchCategoryItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching items for category:", categoryId);
      const response = await concessionItemApi.getAvailableItemsByCategory(categoryId);
      const itemsData = Array.isArray(response.data) ? response.data : [];
      console.log("Items response for category", categoryId, ":", itemsData);
      setItems(itemsData);
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm cho danh mục ${categoryId}:`, error);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryItems();
    }
  }, [categoryId, fetchCategoryItems]);

  const filteredItems = searchQuery
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <ItemList
      items={filteredItems}
      loading={loading}
      onAddItem={onAddItem}
      onItemClick={onItemClick}
      emptyMessage="Không có sản phẩm nào trong danh mục này"
      cardClassName="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-lg transition-all duration-300"
    />
  );
});

export default CategorySection;