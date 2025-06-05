import { useState, useEffect, useContext } from "react";
import {
  Tabs,
  Skeleton,
  Alert,
  Input,
  Modal,
  ConfigProvider,
  App,
} from "antd";
import {
  CoffeeOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  LoginOutlined,
} from "@ant-design/icons";

import { ThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ItemList from "../components/Concessions/ItemList";
import OrderSummary from "../components/Concessions/OrderSummary";
import RecommendedItems from "../components/Concessions/RecommendedItems";
import QuickBookingWidget from "../components/common/QuickBookingWidget";
import concessionCategoryApi from "../api/concessionCategoryApi";
import concessionComboApi from "../api/concessionComboApi";
import { motion } from "framer-motion";
import { 
  useAntdComponents, 
  useResponsive, 
  createAntdTheme, 
  containerClasses,
  responsiveSpacing 
} from "../utils/antdHelpers";

const ConcessionPage = () => {
  const { theme } = useContext(ThemeContext);
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { message } = useAntdComponents();
  const { isMobile, isTablet } = useResponsive();
  
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const antdTheme = createAntdTheme(theme);

  // Kiểm tra xác thực token
  const checkAuthentication = () => {
    if (!isAuthenticated || !currentUser) {
      message.warning({
        content: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!",
        icon: <LoginOutlined style={{ color: "#e71a0f" }} />,
        duration: 3,
      });
      openAuthModal("1");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const combosData = await concessionComboApi.getAvailableCombos();
        setCombos(Array.isArray(combosData) ? combosData : []);
        const categoriesData = await concessionCategoryApi.getActiveCategories();
        setCategories(categoriesData.data || []);
        if (categoriesData.data && categoriesData.data.length > 0) {
          setActiveTab(categoriesData.data[0].id);
        }
      } catch {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItemToCart = (item, quantity) => {
    if (!checkAuthentication()) return;

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
    if (!checkAuthentication()) return;
    const updatedItems = selectedItems.filter(
      (selectedItem) =>
        !(selectedItem.id === item.id && selectedItem.type === item.type)
    );
    setSelectedItems(updatedItems);
  };

  const updateItemQuantity = (item, quantity) => {
    if (!checkAuthentication()) return;
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
    if (!checkAuthentication()) return;
    setSelectedItems([]);
    message.info("Đã xóa toàn bộ giỏ hàng!");
  };

  const getSelectedItemIds = () => {
    return selectedItems
      .filter((item) => item.type === "item")
      .map((item) => item.id);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const getItemsForTab = () => {
    if (activeTab === "combos") {
      return combos.filter((combo) =>
        combo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const category = categories.find((cat) => cat.id === activeTab);
    if (category) {
      return category.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === "dark" ? "bg-dark-bg" : "bg-light-bg"}`}>
        <div className={containerClasses}>
          <div className={responsiveSpacing.padding}>
            <Skeleton active paragraph={{ rows: 4 }} className="mb-6" />
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <div className={responsiveSpacing.padding}>
          <Alert
            message={error}
            type="error"
            showIcon
            className="content-card shadow-lg rounded-xl"
          />
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <div className={`min-h-screen pb-16 ${
          theme === "dark" ? "bg-dark-bg" : "bg-gradient-to-b from-gray-50 to-gray-100"
        }`}>
          <div className={containerClasses}>
            <div className={responsiveSpacing.padding}>
              {/* Header - Responsive */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`page-header relative rounded-2xl shadow-xl ${responsiveSpacing.padding} mb-6 sm:mb-12 overflow-hidden backdrop-blur-sm`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-red-600/20 to-gray-200/20 rounded-2xl opacity-70 ${
                  theme === "dark" ? "dark:from-red-500/20 dark:to-gray-800/20" : ""
                }`}></div>
                
                <div className="flex flex-col gap-4 sm:gap-6 mb-4 text-center relative z-10">
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent drop-shadow-lg animate-slideUp ${
                    theme === "dark" ? "dark:text-white" : ""
                  }`}>
                    Bắp Nước
                  </h1>
                  <div className={`text-xs sm:text-sm italic animate-fadeIn ${
                    theme === "dark" ? "text-dark-text-secondary" : "text-gray-600"
                  }`}>
                    Khám phá thực đơn hấp dẫn tại rạp phim!
                  </div>
                </div>
                
                {/* Mobile-first responsive layout */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <CoffeeOutlined className={`text-2xl sm:text-3xl lg:text-4xl text-red-600 bg-red-600/10 p-2 rounded-full shadow-md animate-pulse ${
                      theme === "dark" ? "dark:text-red-500" : ""
                    }`} />
                    <div>
                      <p className={`text-sm sm:text-base lg:text-lg font-medium ${
                        theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
                      }`}>
                        Đồ ăn và thức uống ngon tuyệt!
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-auto sm:max-w-sm">
                    <Input
                      placeholder="Tìm kiếm món ăn, combo..."
                      prefix={<SearchOutlined className="text-red-600 dark:text-red-500" />}
                      className="form-input shadow-md hover:shadow-lg focus:shadow-lg transition-all duration-300"
                      value={searchQuery}
                      onChange={handleSearch}
                      size={isMobile ? "middle" : "large"}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Quick Booking Widget */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 sm:mb-12"
              >
                <QuickBookingWidget selectedItems={selectedItems} />
              </motion.div>

              {/* Main Content - Responsive Grid */}
              {categories.length === 0 && combos.length === 0 ? (
                <Alert
                  message="Không có dữ liệu"
                  description="Hiện tại không có danh mục hoặc combo nào. Vui lòng quay lại sau."
                  type="info"
                  showIcon
                  className="mb-6 content-card rounded-xl shadow-lg"
                />
              ) : (
                <div className={`grid grid-cols-1 ${isTablet || !isMobile ? 'lg:grid-cols-3' : ''} gap-6 lg:gap-12`}>
                  {/* Items Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={isTablet || !isMobile ? "lg:col-span-2" : ""}
                  >
                    <div className="content-card custom-movie-tabs rounded-xl bg-white dark:bg-gray-800 shadow-xl p-4 sm:p-6">
                      <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                          {
                            key: "combos",
                            label: (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center font-medium text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 ${
                                  activeTab === "combos"
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                                    : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500"
                                }`}
                              >
                                <CoffeeOutlined className="mr-1 sm:mr-2" />
                                {!isMobile && "Combo"}
                              </motion.div>
                            ),
                          },
                          ...categories.map((category) => ({
                            key: category.id,
                            label: (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className={`flex items-center font-medium text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-all duration-300 ${
                                  activeTab === category.id
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                                    : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500"
                                }`}
                              >
                                <ShopOutlined className="mr-1 sm:mr-2" />
                                {isMobile ? category.name.slice(0, 8) + (category.name.length > 8 ? '...' : '') : category.name}
                              </motion.div>
                            ),
                          })),
                        ]}
                        animated={{ tabPane: true }}
                        size={isMobile ? "small" : "middle"}
                        tabBarStyle={{
                          marginBottom: isMobile ? "16px" : "24px",
                          padding: isMobile ? "0 8px" : "0 16px",
                          borderBottom: "none",
                        }}
                        style={{ position: "relative", zIndex: 10 }}
                      />
                      <ItemList
                        items={getItemsForTab()}
                        loading={loading}
                        onAddItem={addItemToCart}
                        isCombo={activeTab === "combos"}
                        onItemClick={setSelectedItem}
                      />
                    </div>
                    
                    <div className="py-4 sm:py-6">
                      <RecommendedItems
                        onAddItem={addItemToCart}
                        onItemClick={setSelectedItem}
                        excludeIds={getSelectedItemIds()}
                      />
                    </div>
                  </motion.div>

                  {/* Order Summary - Responsive */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className={isTablet || !isMobile ? "lg:col-span-1" : ""}
                  >
                    <div className={`${isTablet || !isMobile ? 'sticky top-24' : ''} z-0`}>
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
          </div>

          {/* Product Detail Modal - Responsive */}
          <Modal
            title={selectedItem?.name}
            open={!!selectedItem}
            onCancel={() => setSelectedItem(null)}
            footer={null}
            className="auth-modal rounded-xl shadow-xl"
            centered
            width={isMobile ? '90%' : 500}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center p-3 sm:p-6"
            >
              {selectedItem?.image && (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4 sm:mb-6 shadow-lg"
                />
              )}
              <p className={`text-sm sm:text-base mb-4 text-center ${
                theme === "dark" ? "text-dark-text-secondary" : "text-text-secondary"
              }`}>
                {selectedItem?.description}
              </p>
              <div className="flex items-center justify-between w-full mb-4 sm:mb-6">
                <p className="text-red-600 font-bold text-xl sm:text-2xl dark:text-red-500">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(selectedItem?.price || 0)}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary w-full py-2 sm:py-3 text-base sm:text-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all duration-300 ripple-btn"
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
      </App>
    </ConfigProvider>
  );
};

export default ConcessionPage;