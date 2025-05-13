import { useState, useEffect } from 'react';
import { concessionCategoryApi } from '../api/concessionCategoryApi';
import { concessionComboApi } from '../api/concessionComboApi'; 
import { 
  message, 
  Tabs, 
  Spin, 
  Alert, 
  FloatButton, 
  Input, 
  Modal, 
  ConfigProvider 
} from 'antd';
import { 
  ArrowUpOutlined, 
  CoffeeOutlined, 
  SearchOutlined,
  ShoppingCartOutlined 
} from '@ant-design/icons';
import CategorySection from '../components/Concessions/CategorySection';
import ComboSection from '../components/Concessions/ComboSection';
import OrderSummary from '../components/Concessions/OrderSummary';
import RecommendedItems from '../components/Concessions/RecommendedItems';

const ConcessionPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Custom theme for a more modern look
  const theme = {
    token: {
      colorPrimary: '#e71a0f',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    components: {
      Tabs: {
        itemSelectedColor: '#e71a0f',
        itemHoverColor: '#e71a0f',
        inkBarColor: '#e71a0f',
      },
      Input: {
        borderRadius: 12,
        colorBorder: 'rgba(0, 0, 0, 0.1)',
      },
      Button: {
        borderRadius: 12,
      }
    }
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
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau!');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItemToCart = (item, quantity) => {
    const existingItemIndex = selectedItems.findIndex(
      selectedItem => selectedItem.id === item.id && selectedItem.type === item.type
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
      icon: <ShoppingCartOutlined style={{ color: '#e71a0f' }} />,
    });
  };

  const removeItemFromCart = (item) => {
    const updatedItems = selectedItems.filter(
      selectedItem => !(selectedItem.id === item.id && selectedItem.type === item.type)
    );
    setSelectedItems(updatedItems);
  };

  const updateItemQuantity = (item, quantity) => {
    if (quantity <= 0) {
      removeItemFromCart(item);
      return;
    }
    const updatedItems = selectedItems.map(selectedItem => {
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
      .filter(item => item.type === 'item')
      .map(item => item.id);
  };

  const buildTabs = () => {
    const tabItems = categories.map(category => ({
      key: category.id,
      label: (
        <span className="flex items-center font-medium text-lg">
          <span className="mr-2 text-primary">•</span>
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
      key: 'combos',
      label: (
        <span className="flex items-center font-medium text-lg">
          <span className="mr-2 text-yellow-500">•</span>
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-light-bg to-gray-bg">
        <div className="flex flex-col items-center">
          <Spin 
            size="large" 
            indicator={
              <CoffeeOutlined 
                style={{ 
                  fontSize: 48, 
                  color: '#e71a0f',
                  animation: 'bounce 1.5s infinite' 
                }} 
              />
            }
          />
          <span className="mt-4 text-text-secondary text-lg">Đang tải dữ liệu...</span>
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
          className="content-card shadow-lg" 
        />
      </div>
    );
  }

  return (
    <ConfigProvider theme={theme}>
      <div className="bg-gradient-to-b from-light-bg to-gray-bg min-h-screen pb-12">
        <FloatButton
          icon={<ArrowUpOutlined />}
          type="primary"
          style={{ 
            backgroundColor: '#e71a0f', 
            right: 24, 
            bottom: 24,
            boxShadow: '0 6px 16px rgba(231, 26, 15, 0.3)' 
          }}
          className="hover:-translate-y-1 transition-transform"
        />
        <div className="container mx-auto px-4">
          <div className="pt-8 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <CoffeeOutlined 
                  className="text-4xl text-primary bg-primary/10 p-2 rounded-full shadow-sm" 
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-text-primary m-0">
                    Đồ ăn & Thức uống
                  </h1>
                  <p className="text-text-secondary mt-1 text-lg">
                    Khám phá thực đơn hấp dẫn tại rạp phim
                  </p>
                </div>
              </div>
              <div className="w-full max-w-md">
                <Input
                  placeholder="Tìm kiếm món ăn, combo..."
                  prefix={<SearchOutlined className="text-text-secondary" />}
                  className="form-input shadow-sm"
                  value={searchQuery}
                  onChange={handleSearch}
                  size="large"
                />
              </div>
            </div>
          </div>
          {categories.length === 0 && combos.length === 0 ? (
            <Alert
              message="Không có dữ liệu"
              description="Hiện tại không có danh mục hoặc combo nào. Vui lòng quay lại sau."
              type="info"
              showIcon
              className="mb-6 content-card"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={buildTabs()}
                  className="content-card"
                  animated={{ tabPane: true }}
                  size="large"
                />
                <RecommendedItems
                  onAddItem={addItemToCart}
                  onItemClick={setSelectedItem}
                  excludeIds={getSelectedItemIds()}
                />
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-20">
                  <OrderSummary
                    items={selectedItems}
                    onUpdateQuantity={updateItemQuantity}
                    onRemoveItem={removeItemFromCart}
                    onClearCart={clearCart}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <Modal
          title={selectedItem?.name}
          open={!!selectedItem}
          onCancel={() => setSelectedItem(null)}
          footer={null}
          className="auth-modal"
          centered
          width={500}
        >
          <div className="flex flex-col items-center p-4">
            {selectedItem?.image && (
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg"
              />
            )}
            <p className="text-text-secondary text-center text-base mb-4">
              {selectedItem?.description}
            </p>
            <div className="flex items-center justify-between w-full mb-6">
              <p className="text-primary font-bold text-2xl">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(selectedItem?.price || 0)}
              </p>
            </div>
            <button
              className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
              onClick={() => {
                addItemToCart(selectedItem, 1);
                setSelectedItem(null);
              }}
            >
              <ShoppingCartOutlined />
              Thêm vào giỏ hàng
            </button>
          </div>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default ConcessionPage;