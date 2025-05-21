// admin/src/components/Halls/HallShow.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNotify } from "react-admin";
import hallService from "../../services/hallService";
import BackButton from "../Common/BackButton";

const HallShow = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hall, setHall] = useState(null);
  const [error, setError] = useState(null);
  const notify = useNotify();

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const response = await hallService.getOne(id);
        setHall(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin phòng chiếu:", error);
        setError(error.message || "Không thể tải thông tin phòng chiếu");
        notify("Không thể tải thông tin phòng chiếu", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id, notify]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">
          Không tìm thấy phòng chiếu
        </h3>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết phòng chiếu
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Thông tin chi tiết về phòng chiếu {hall.name}
          </p>
        </div>
        <BackButton />
      </div>

      <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
                Thông tin cơ bản
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Mã phòng chiếu
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Tên phòng chiếu
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Rạp chiếu
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.cinema?.name || "Chưa được gán rạp"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chỗ ngồi */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
                Thông tin chỗ ngồi
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Số hàng ghế
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.rows}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Số ghế mỗi hàng
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.columns}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Tổng số ghế
                  </label>
                  <p className="mt-1 text-text-primary dark:text-text-primary-dark">
                    {hall.totalSeats}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallShow;