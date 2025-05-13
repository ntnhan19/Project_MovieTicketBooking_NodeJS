// admin/src/components/ConcessionCombos/ConcessionComboShow.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useParams, Link } from "react-router-dom";
import concessionComboService from "../../services/concessionComboService";
import concessionItemService from "../../services/concessionItemService";

const ConcessionComboShow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [combo, setCombo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCombo, setDeletingCombo] = useState(false);

  useEffect(() => {
    const fetchCombo = async () => {
      try {
        setLoading(true);
        const { data } = await concessionComboService.getOne(id);
        setCombo(data);

        // Tải danh sách các mặt hàng có trong combo
        if (data.items && data.items.length > 0) {
          const itemIds = data.items.map(item => item.itemId);
          const { data: itemsData } = await concessionItemService.getMany(itemIds);
          setItems(itemsData);
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin combo:", err);
        setError(err.message || "Không thể tải thông tin combo");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCombo();
    }
  }, [id]);

  // Tính tổng giá trị combo (không tính giảm giá)
  const calculateTotalPrice = () => {
    if (!combo || !combo.items || !items.length) return 0;
    
    let total = 0;
    combo.items.forEach(comboItem => {
      const item = items.find(i => i.id == comboItem.itemId);
      if (item) {
        total += item.price * comboItem.quantity;
      }
    });
    return total;
  };

  // Tính giá sau khi giảm giá
  const calculateDiscountedPrice = () => {
    if (!combo) return 0;
    const totalPrice = calculateTotalPrice();
    const discount = (totalPrice * combo.discountPercent) / 100;
    return totalPrice - discount;
  };

  const handleEdit = () => {
    navigate(`/concession-combos/edit/${id}`);
  };

  const handleToggleStatus = async () => {
    try {
      await concessionComboService.toggleAvailability(id);
      setCombo({
        ...combo,
        isAvailable: !combo.isAvailable
      });
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái:", err);
      setError(err.message || "Không thể thay đổi trạng thái combo");
    }
  };

  const handleDelete = async () => {
    setDeletingCombo(true);
    try {
      await concessionComboService.delete(id);
      navigate("/concession-combos", { 
        state: { 
          successMessage: "Đã xóa combo bắp nước thành công!" 
        } 
      });
    } catch (err) {
      console.error("Lỗi khi xóa combo:", err);
      setError("Không thể xóa combo. Vui lòng thử lại sau.");
      setDeletingCombo(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBack = () => {
    navigate("/concession-combos");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
        <p className="font-medium">{error}</p>
        <button
          onClick={handleBack}
          className="mt-2 text-sm underline hover:text-red-800 dark:hover:text-red-300"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-md mb-6">
        <p className="font-medium">Không tìm thấy thông tin combo</p>
        <button
          onClick={handleBack}
          className="mt-2 text-sm underline hover:text-yellow-800 dark:hover:text-yellow-300"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Chi tiết combo bắp nước | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết combo bắp nước
          </h1>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleToggleStatus}
              className="px-4 py-2 border border-primary rounded-md text-sm font-medium text-primary dark:text-primary-light hover:bg-primary-light/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
            >
              {combo.isAvailable ? "Hủy kích hoạt" : "Kích hoạt"}
            </button>
            
            <button
              onClick={handleEdit}
              className="px-4 py-2 border border-primary bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
            >
              Chỉnh sửa
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-500 text-red-500 dark:text-red-400 dark:border-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
            >
              Xóa
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border dark:border-border-dark pb-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
                {combo.name}
              </h2>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
                ID: {combo.id}
              </p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                combo.isAvailable 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}>
                {combo.isAvailable ? "Có sẵn" : "Không có sẵn"}
              </span>
            </div>
          </div>

          {/* Combo info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className="space-y-4">
                {/* Mô tả */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                    Mô tả
                  </h3>
                  <p className="text-text-primary dark:text-text-primary-dark">
                    {combo.description || "Không có mô tả"}
                  </p>
                </div>

                {/* Thông tin giá */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-md">
                  <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                    Thông tin giá
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tổng giá trị mặt hàng:</span>
                      <span className="font-medium">{calculateTotalPrice().toLocaleString()} VND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giảm giá ({combo.discountPercent}%):</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{((calculateTotalPrice() * combo.discountPercent) / 100).toLocaleString()} VND
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border dark:border-border-dark">
                      <div className="flex justify-between">
                        <span className="font-medium">Giá combo sau giảm giá:</span>
                        <span className="font-bold text-primary dark:text-primary-light">
                          {calculateDiscountedPrice().toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {combo.createdAt && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                        Ngày tạo
                      </h3>
                      <p className="text-text-primary dark:text-text-primary-dark">
                        {formatDate(combo.createdAt)}
                      </p>
                    </div>
                  )}
                  
                  {combo.updatedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                        Cập nhật lần cuối
                      </h3>
                      <p className="text-text-primary dark:text-text-primary-dark">
                        {formatDate(combo.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hình ảnh */}
            <div>
              <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                Hình ảnh
              </h3>
              {combo.imageUrl ? (
                <div className="rounded-md overflow-hidden border border-border dark:border-border-dark">
                  <img
                    src={combo.imageUrl}
                    alt={combo.name}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300?text=Không+có+hình";
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <span className="text-text-secondary dark:text-text-secondary-dark">
                    Không có hình ảnh
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm trong combo */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">
              Các mặt hàng trong combo
            </h3>
            
            {combo.items && combo.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-background-paper-dark border border-border dark:border-border-dark rounded-lg">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/40 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Mặt hàng</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Đơn giá</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Số lượng</th>
                      <th className="px-4 py-3 text-sm font-medium text-text-secondary dark:text-text-secondary-dark">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combo.items.map((comboItem, index) => {
                      const item = items.find(i => i.id == comboItem.itemId);
                      const price = item ? item.price : 0;
                      
                      return (
                        <tr key={index} className="border-t border-border dark:border-border-dark">
                          <td className="px-4 py-3">
                            {item ? (
                              <div>
                                <div className="font-medium text-text-primary dark:text-text-primary-dark">
                                  {item.name}
                                </div>
                                <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                  ID: {item.id}
                                </div>
                              </div>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">
                                Mặt hàng không tồn tại hoặc đã bị xóa
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-primary dark:text-text-primary-dark">
                            {price.toLocaleString()} VND
                          </td>
                          <td className="px-4 py-3 text-text-primary dark:text-text-primary-dark">
                            {comboItem.quantity}
                          </td>
                          <td className="px-4 py-3 font-medium text-text-primary dark:text-text-primary-dark">
                            {(price * comboItem.quantity).toLocaleString()} VND
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-border dark:border-border-dark bg-gray-50 dark:bg-gray-800/40">
                      <td colSpan="3" className="px-4 py-3 text-right font-medium">
                        Tổng cộng:
                      </td>
                      <td className="px-4 py-3 font-bold text-primary dark:text-primary-light">
                        {calculateTotalPrice().toLocaleString()} VND
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-border dark:border-border-dark rounded-md">
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  Không có mặt hàng nào trong combo này
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
              <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark mb-4">
                Xác nhận xóa
              </h3>
              <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
                Bạn có chắc chắn muốn xóa combo "{combo?.name}"? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingCombo}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingCombo ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    "Xác nhận xóa"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConcessionComboShow;