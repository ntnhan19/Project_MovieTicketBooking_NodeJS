import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Tabs,
  Alert,
  ConfigProvider,
} from "antd";
import { CoffeeOutlined, ShopOutlined } from "@ant-design/icons";
import { ThemeContext } from "../../../context/ThemeContext";
import ItemList from "../../Concessions/ItemList";
import concessionCategoryApi from "../../../api/concessionCategoryApi";
import concessionComboApi from "../../../api/concessionComboApi";
import { motion } from "framer-motion";
import debounce from "lodash/debounce";

const { Text } = Typography;

const ConcessionStep = React.memo(({ onConcessionChange, selectedConcessions, isWithTicket = true }) => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [activeTab, setActiveTab] = useState("combos");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  console.log("ConcessionStep rendered", {
    activeTab,
    searchQuery,
    categoriesLength: categories.length,
    combosLength: combos.length,
    isWithTicket,
  });

  const antdTheme = useMemo(() => ({
    token: {
      colorPrimary: "#e71a0f",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      colorText: theme === "dark" ? "#d1d5db" : "#333333",
      colorTextSecondary: theme === "dark" ? "#d1d5db" : "#666666",
      colorBorder: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
    },
    components: {
      Tabs: {
        itemSelectedColor: "#e71a0f",
        itemHoverColor: "#e71a0f",
        inkBarColor: "#e71a0f",
        colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
        itemActiveColor: "#e71a0f",
        itemColor: theme === "dark" ? "#d1d5db" : "#333333",
        horizontalItemPadding: "12px 16px",
      },
      Input: {
        borderRadius: 8,
        colorBorder: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        colorBgContainer: theme === "dark" ? "#374151" : "#ffffff",
      },
      Button: {
        borderRadius: 8,
        colorPrimary: "#e71a0f",
        colorPrimaryHover: "#c41208",
      },
    },
  }), [theme]);

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      console.log("Search query updated:", value);
      setSearchQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await concessionCategoryApi.getActiveCategories();
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];
        setCategories(categoriesData);

        const combosData = await concessionComboApi.getAvailableCombos();
        setCombos(Array.isArray(combosData) ? combosData : []);

        if (categoriesData.length === 0 && combosData.length === 0) {
          setError("Không có danh mục hoặc combo nào hiện có.");
        } else if (categoriesData.length > 0) {
          setActiveTab(categoriesData[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải dữ liệu bắp nước. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addItem = useCallback((item, quantity) => {
    const updatedItems = [...selectedConcessions];
    const existingItemIndex = updatedItems.findIndex(
      (selectedItem) => selectedItem.id === item.id && selectedItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      updatedItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        type: item.type || (activeTab === "combos" ? "combo" : "item"),
        orderType: isWithTicket ? "WITH_TICKET" : "STANDALONE",
      });
    }

    console.log("Updated concessions:", updatedItems);
    console.log("Order type will be:", isWithTicket ? "WITH_TICKET" : "STANDALONE");
    onConcessionChange(updatedItems);
  }, [selectedConcessions, onConcessionChange, activeTab, isWithTicket]);

  const getItemsForTab = useCallback(() => {
    if (activeTab === "combos") {
      return combos
        .filter((combo) => combo.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((combo) => ({ ...combo, type: "combo" }));
    }

    const category = categories.find((cat) => cat.id === activeTab);
    if (category) {
      return (
        category.items?.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((item) => ({ ...item, type: "item" })) || []
      );
    }

    return [];
  }, [activeTab, categories, combos, searchQuery]);

  const tabItems = useMemo(() => {
    const items = [
      {
        key: "combos",
        label: (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center font-medium text-base px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === "combos"
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500"
            }`}
          >
            <CoffeeOutlined className="mr-2" />
            Combo
          </motion.div>
        ),
      },
      ...categories.map((category) => ({
        key: category.id,
        label: (
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center font-medium text-base px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === category.id
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500"
            }`}
          >
            <ShopOutlined className="mr-2" />
            {category.name}
          </motion.div>
        ),
      })),
    ];

    return items;
  }, [activeTab, categories]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spin size="large" />
        <Text className={`mt-4 ${theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"}`}>
          Đang tải danh sách bắp nước...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={error}
        type="error"
        showIcon
        className="content-card shadow-lg rounded-xl max-w-3xl mx-auto"
      />
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div className={`w-full max-w-7xl mx-auto py-6 px-4 ${theme === "dark" ? "bg-dark-bg" : "bg-white"}`}>
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                className={`content-card custom-movie-tabs rounded-xl shadow-md p-6 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                  animated={{ tabPane: true }}
                  size="middle"
                  tabBarStyle={{
                    marginBottom: "24px",
                    padding: "0 16px",
                    borderBottom: "none",
                  }}
                />
                <ItemList
                  items={getItemsForTab()}
                  loading={loading}
                  onAddItem={addItem}
                  isCombo={activeTab === "combos"}
                  emptyMessage={
                    activeTab === "combos"
                      ? "Không có combo nào hiện có"
                      : "Không có sản phẩm nào trong danh mục này"
                  }
                  selectedItems={selectedConcessions}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
});

ConcessionStep.displayName = "ConcessionStep";

export default ConcessionStep;