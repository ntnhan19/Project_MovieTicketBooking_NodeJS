// admin/src/components/ConcessionItems/ConcessionItemEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ConcessionItemForm from "./ConcessionItemForm";
import concessionItemService from "../../services/concessionItemService";

const ConcessionItemEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [item, setItem] = useState(null);

  // Tải thông tin sản phẩm
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const response = await concessionItemService.getOne(id); // Sửa getById thành getOne
        // Kiểm tra dữ liệu trả về
        if (!response.data) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ");
        }
        // Đảm bảo dữ liệu khớp với định dạng của form
        const formattedItem = {
          name: response.data.name || "",
          description: response.data.description || "",
          price: response.data.price || 0,
          categoryId: response.data.categoryId || "",
          image: response.data.image || "",
          isAvailable: response.data.isAvailable !== undefined ? response.data.isAvailable : true,
          size: response.data.size || "",
        };
        setItem(formattedItem);
      } catch (err) {
        console.error("Lỗi khi tải thông tin sản phẩm:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await concessionItemService.update(id, data);
      navigate("/concession-items", {
        state: {
          notification: {
            type: "success",
            message: "Sản phẩm đã được cập nhật thành công!",
          },
        },
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật sản phẩm:", err);
      throw new Error(err.message || "Không thể cập nhật sản phẩm. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/concession-items")}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">Không tìm thấy sản phẩm với ID: {id}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/concession-items")}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Chỉnh sửa sản phẩm: {item.name}
        </h1>
        <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
          Cập nhật thông tin cho sản phẩm bắp nước này.
        </p>
      </div>

      <ConcessionItemForm
        initialData={item}
        onSubmit={handleSubmit}
        submitButtonText="Cập nhật sản phẩm"
        isCreate={false}
      />
    </div>
  );
};

export default ConcessionItemEdit;