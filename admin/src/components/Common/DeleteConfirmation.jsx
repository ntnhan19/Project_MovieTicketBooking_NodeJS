import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

const DeleteConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const modalRef = useRef(null);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Đợi hiệu ứng kết thúc
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300
          ${isVisible ? "opacity-50" : "opacity-0"}`}
      />
      <div 
        ref={modalRef}
        className={`relative bg-white dark:bg-background-paper-dark rounded-lg shadow-lg 
          max-w-md w-full mx-4 transition-all duration-300 transform
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="p-5 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
            {title || "Xác nhận xóa"}
          </h3>
        </div>
        <div className="p-5">
          <p className="text-text-secondary dark:text-text-secondary-dark">
            {message || "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác."}
          </p>
        </div>
        <div className="flex justify-end p-4 space-x-3 border-t border-border dark:border-border-dark">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-text-primary dark:text-text-primary-dark bg-gray-200 dark:bg-secondary-dark rounded-md hover:bg-gray-300 dark:hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteConfirmation.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default DeleteConfirmation;