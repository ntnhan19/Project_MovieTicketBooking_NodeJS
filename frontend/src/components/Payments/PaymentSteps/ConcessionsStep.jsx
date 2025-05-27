import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Typography,
  Input,
  Tabs,
  Alert,
  Modal,
} from "antd";
import { CoffeeOutlined, SearchOutlined } from "@ant-design/icons";
import { ThemeContext } from "../../../context/ThemeContext";
import CategorySection from "../../Concessions/CategorySection";
import ComboSection from "../../Concessions/ComboSection";
import concessionCategoryApi from "../../../api/concessionCategoryApi";
import concessionComboApi from "../../../api/concessionComboApi";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const ConcessionStep = ({ onConcessionChange, selectedConcessions }) => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesData =
          await concessionCategoryApi.getActiveCategories();
        setCategories(categoriesData.data || []);
        const combosData = await concessionComboApi.getAvailableCombos();
        setCombos(Array.isArray(combosData) ? combosData : []);
        setActiveTab("combos");
      } catch {
        setError("Không thể tải dữ liệu bắp nước. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = (item, quantity) => {
    let updatedItems = [...selectedConcessions];
    const existingItemIndex = updatedItems.findIndex(
      (selectedItem) =>
        selectedItem.id === item.id && selectedItem.type === item.type
    );

    if (existingItemIndex >= 0) {
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
      };
    } else {
      updatedItems.push({ ...item, quantity });
    }

    console.log("Updated selectedConcessions:", updatedItems);
    onConcessionChange(updatedItems);
  };

  const buildTabs = () => {
    const tabItems = [];

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
          onAddItem={addItem}
          onItemClick={setSelectedItem}
          searchQuery={searchQuery}
        />
      ),
    });

    const categoryTabs = categories.map((category) => ({
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
          onAddItem={addItem}
          onItemClick={setSelectedItem}
          searchQuery={searchQuery}
        />
      ),
    }));

    return [...tabItems, ...categoryTabs];
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spin size="large" />
        <Text
          className={`mt-4 ${
            theme === "dark"
              ? "text-dark-text-secondary"
              : "text-text-secondary"
          }`}
        >
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
    <div className="w-full max-w-7xl mx-auto animate-fadeIn">
      <Title
        level={4}
        className="mb-6 text-text-primary dark:text-dark-text-primary"
      >
        Chọn bắp nước
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            className={`content-card shadow-md border ${
              theme === "dark"
                ? "border-gray-600 bg-gray-800"
                : "border-border-light bg-white"
            }`}
          >
            <div className="mb-6">
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
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={buildTabs()}
              className="custom-movie-tabs"
              animated={{ tabPane: true }}
              size="large"
              tabBarStyle={{ marginBottom: 0 }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={
          <span className="text-gray-800 dark:text-white">
            {selectedItem?.name}
          </span>
        }
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
              addItem(selectedItem, 1);
              setSelectedItem(null);
            }}
          >
            <CoffeeOutlined />
            Thêm bắp nước
          </motion.button>
        </motion.div>
      </Modal>
    </div>
  );
};

export default ConcessionStep;
