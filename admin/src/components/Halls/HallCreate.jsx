// src/components/Halls/HallCreate.jsx
import React, { useState, useEffect } from "react";
import HallForm from "./HallForm";
import { useNotify, useRedirect } from "react-admin";
import hallService from "../../services/hallService";
import cinemaService from "../../services/cinemaService";

const HallCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cinemas, setCinemas] = useState([]);
  const notify = useNotify();
  const redirect = useRedirect();

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await cinemaService.getList({
          pagination: { page: 1, perPage: 100 },
          sort: { field: "name", order: "ASC" }
        });
        setCinemas(response.data.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách rạp chiếu:", error);
        notify("Không thể tải danh sách rạp chiếu", { type: "error" });
      }
    };

    fetchCinemas();
  }, [notify]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await hallService.create(formData);
      notify("Đã tạo phòng chiếu thành công", { type: "success" });
      redirect("list", "halls");
    } catch (error) {
      console.error("Lỗi khi tạo phòng chiếu:", error);
      notify(
        error.message || "Có lỗi xảy ra khi tạo phòng chiếu",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Tạo phòng chiếu mới
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Thêm một phòng chiếu mới vào hệ thống
          </p>
        </div>
      </div>

      <HallForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        cinemas={cinemas}
      />
    </div>
  );
};

export default HallCreate;