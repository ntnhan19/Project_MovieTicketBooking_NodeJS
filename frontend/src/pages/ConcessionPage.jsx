import { useState, useEffect, useContext } from "react";
import { message, Tabs, Skeleton, Alert, Input, Modal, ConfigProvider } from "antd";
import {
  CoffeeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { ThemeContext } from "../context/ThemeContext";
import CategorySection from "../components/Concessions/CategorySection";
import ComboSection from "../components/Concessions/ComboSection";
import OrderSummary from "../components/Concessions/OrderSummary";
import RecommendedItems from "../components/Concessions/RecommendedItems";
import QuickBookingWidget from "../components/common/QuickBookingWidget";
import concessionCategoryApi from "../api/concessionCategoryApi";
import concessionComboApi from "../api/concessionComboApi";
import { motion } from "framer-motion";

const ConcessionPage = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const antdTheme = {
    token: {
      colorPrimary: "#e71a0f",
      fontFamily:
        "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", // Giảm shadow toàn cục
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      colorText: theme === "dark" ? "#d1d5db" : "#333333",
      colorTextSecondary: theme === "dark" ? "#d1d5db" : "#666666",
      colorBorder:
        theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", // Giảm độ đậm của border
    },
    components: {
      Tabs: {
        itemSelectedColor: "#e71a0f",
        itemHoverColor: "#e71a0f",
        inkBarColor: "#e71a0f",
        colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      },
      Input: {
        borderRadius: 12,
        colorBorder:
          theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        colorBgContainer: theme === "dark" ? "#374151" : "#ffffff",
      },
      Button: {
        borderRadius: 12,
        colorPrimary: "#e71a0f",
        colorPrimaryHover: "#c41208",
      },
      Modal: {
        colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
        colorText: theme === "dark" ? "#d1d5db" : "#333333",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData = await concessionCategoryApi.getActiveCategories();
        setCategories(categoriesData.data || []);
        if (categoriesData.data && categoriesData.data.length > 0) {
          setActiveTab(categoriesData.data[0].id);
        }
        const combosData = await concessionComboApi.getAvailableCombos();
        setCombos(Array.isArray(combosData) ? combosData : []);
      } catch {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItemToCart = (item, quantity) => {
    const existingItemIndex = selectedItems.findIndex(
      (selectedItem) =>
        selectedItem.id === item.id && selectedItem.type === item.type
    );
    let updatedItems = [...selectedItems];
    if (existingItemIndex >= 0) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      updatedItems.push({ ...item, quantity });
    }
    setSelectedItems(updatedItems);
    message.success({
      content: `Đã thêm ${item.name} vào giỏ hàng!`,
      icon: <ShoppingCartOutlined style={{ color: "#e71a0f" }} />,
    });
  };

  const removeItemFromCart = (item) => {
    const updatedItems = selectedItems.filter(
      (selectedItem) =>
        !(selectedItem.id === item.id && selectedItem.type === item.type)
    );
    setSelectedItems(updatedItems);
  };

  const updateItemQuantity = (item, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(item);
      return;
    }
    const updatedItems = selectedItems.map((selectedItem) => {
      if (selectedItem.id === item.id && selectedItem.type === item.type) {
        return { ...selectedItem, quantity };
      }
      return selectedItem;
    });
    setSelectedItems(updatedItems);
  };

  const clearCart = () => {
    setSelectedItems([]);
  };

  const getSelectedItemIds = () => {
    return selectedItems
      .filter((item) => item.type === "item")
      .map((item) => item.id);
  };

  const buildTabs = () => {
    const tabItems = categories.map((category) => ({
      key: category.id,
      label: (
        <span className="flex items-center font-medium text-base">
          <span className="mr-2 text-red-600 dark:text-red-500">•</span>
          {category.name}
        </span>
      ),
      children: (
        <CategorySection
          categoryId={category.id}
          onAddItem={addItemToCart}
          onItemClick={setSelectedItem}
          searchQuery={searchQuery}
        />
      ),
    }));
    tabItems.push({
      key: "combos",
      label: (
        <span className="flex items-center font-medium text-base">
          <span className="mr-2 text-yellow-500 dark:text-yellow-400">•</span>
          Combo
        </span>
      ),
      children: (
        <ComboSection
          combos={combos}
          onAddItem={addItemToCart}
          onItemClick={setSelectedItem}
          searchQuery={searchQuery}
        />
      ),
    });
    return tabItems;
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-dark-bg" : "bg-light-bg"
        }`}
      >
        <div className="container mx-auto px-6 py-10">
          <Skeleton active paragraph={{ rows: 4 }} className="mb-6" />
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert
          message={error}
          type="error"
          showIcon
          className="content-card shadow-lg rounded-xl"
        />
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <div
        className={`min-h-screen pb-16 ${
          theme === "dark"
            ? "bg-dark-bg"
            : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}
      >
        <div className="container mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="page-header relative rounded-2xl shadow-xl p-8 mb-12 overflow-hidden backdrop-blur-sm"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r from-red-600/20 to-gray-200/20 rounded-2xl opacity-70 ${
                theme === "dark"
                  ? "dark:from-red-500/20 dark:to-gray-800/20"
                  : ""
              }`}
            ></div>
            <div className="flex flex-col gap-6 mb-4 text-center relative z-10">
              <h1
                className={`text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent drop-shadow-lg animate-slideUp ${
                  theme === "dark" ? "dark:text-white" : ""
                }`}
              >
                Bắp Nước
              </h1>
              <div
                className={`text-sm italic animate-fadeIn ${
                  theme === "dark"
                    ? "text-dark-text-secondary"
                    : "text-gray-600"
                }`}
              >
                Khám phá thực đơn hấp dẫn tại rạp phim!
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
              <div className="flex items-center space-x-4">
                <CoffeeOutlined
                  className={`text-4xl text-red-600 bg-red-600/10 p-2 rounded-full shadow-md animate-pulse ${
                    theme === "dark" ? "dark:text-red-500" : ""
                  }`}
                />
                <div>
                  <p
                    className={`mt-1 text-lg font-medium ${
                      theme === "dark"
                        ? "text-dark-text-secondary"
                        : "text-text-secondary"
                    }`}
                  >
                    Đồ ăn và thức uống ngon tuyệt!
                  </p>
                </div>
              </div>
              <div className="w-full max-w-sm">
                <Input
                  placeholder="Tìm kiếm món ăn, combo..."
                  prefix={
                    <SearchOutlined className="text-red-600 dark:text-red-500" />
                  }
                  className="form-input shadow-md hover:shadow-lg focus:shadow-lg transition-all duration-300"
                  value={searchQuery}
                  onChange={handleSearch}
                  size="large"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <QuickBookingWidget selectedItems={selectedItems} />
          </motion.div>

          {categories.length === 0 && combos.length === 0 ? (
            <Alert
              message="Không có dữ liệu"
              description="Hiện tại không có danh mục hoặc combo nào. Vui lòng quay lại sau."
              type="info"
              showIcon
              className="mb-6 content-card rounded-xl shadow-lg"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-2 space-y-12"
              >
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={buildTabs()}
                  className="content-card custom-movie-tabs rounded-xl bg-white dark:bg-gray-800"
                  animated={{ tabPane: true }}
                  size="middle"
                />
                <div className="py-6">
                  <RecommendedItems
                    onAddItem={addItemToCart}
                    onItemClick={setSelectedItem}
                    excludeIds={getSelectedItemIds()}
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-24">
                  <div className="bg-transparent dark:bg-transparent rounded-xl">
                    <OrderSummary
                      items={selectedItems}
                      onUpdateQuantity={updateItemQuantity}
                      onRemoveItem={removeItemFromCart}
                      onClearCart={clearCart}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <Modal
          title={selectedItem?.name}
          open={!!selectedItem}
          onCancel={() => setSelectedItem(null)}
          footer={null}
          className="auth-modal rounded-xl shadow-xl"
          centered
          width={500}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center p-6"
          >
            {selectedItem?.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg"
              />
            )}
            <p
              className={`text-base mb-4 text-center ${
                theme === "dark"
                  ? "text-dark-text-secondary"
                  : "text-text-secondary"
              }`}
            >
              {selectedItem?.description}
            </p>
            <div className="flex items-center justify-between w-full mb-6">
              <p className="text-red-600 font-bold text-2xl dark:text-red-500">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(selectedItem?.price || 0)}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all duration-300 ripple-btn"
              onClick={() => {
                addItemToCart(selectedItem, 1);
                setSelectedItem(null);
              }}
            >
              <ShoppingCartOutlined />
              Thêm vào giỏ hàng
            </motion.button>
          </motion.div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default ConcessionPage;