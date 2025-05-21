// admin/src/components/Halls/HallEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNotify, useRedirect } from "react-admin";
import HallForm from "./HallForm";
import hallService from "../../services/hallService";
import cinemaService from "../../services/cinemaService";
import BackButton from "../Common/BackButton";

const HallEdit = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hall, setHall] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotify();
  const redirect = useRedirect();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải thông tin phòng chiếu
        const hallResponse = await hallService.getOne(id);
        setHall(hallResponse.data);

        // Tải danh sách rạp chiếu
        const cinemasResponse = await cinemaService.getList({
          pagination: { page: 1, perPage: 100 },
          sort: { field: "name", order: "ASC" }
        });
        setCinemas(cinemasResponse.data.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        notify("Không thể tải dữ liệu phòng chiếu", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, notify]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await hallService.update(id, formData);
      notify("Đã cập nhật phòng chiếu thành công", { type: "success" });
      redirect("list", "halls");
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng chiếu:", error);
      notify(
        error.message || "Có lỗi xảy ra khi cập nhật phòng chiếu",
        { type: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chỉnh sửa phòng chiếu
          </h1>
          <p className="text-text-secondary dark:text-text-secondary-dark mt-1">
            Cập nhật thông tin cho phòng chiếu: {hall?.name}
          </p>
        </div>
        <BackButton />
      </div>

      <HallForm 
        initialData={hall} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        cinemas={cinemas}
      />
    </div>
  );
};

export default HallEdit;