// admin/src/components/Common/Pagination.jsx
import React from "react";
import PropTypes from "prop-types";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  maxPageButtons = 5,
}) => {
  // Không hiển thị phân trang nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null;
  }

  // Tính toán số trang cần hiển thị
  const getPageNumbers = () => {
    const halfMaxButtons = Math.floor(maxPageButtons / 2);
    
    let startPage = currentPage - halfMaxButtons;
    let endPage = currentPage + halfMaxButtons;
    
    if (startPage <= 0) {
      endPage = Math.min(maxPageButtons, totalPages);
      startPage = 1;
    }
    
    if (endPage > totalPages) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
      endPage = totalPages;
    }
    
    // Đảm bảo số nút không vượt quá maxPageButtons
    if (endPage - startPage + 1 > maxPageButtons) {
      if (currentPage - startPage < endPage - currentPage) {
        startPage = endPage - maxPageButtons + 1;
      } else {
        endPage = startPage + maxPageButtons - 1;
      }
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Tạo mảng các trang cần hiển thị
  const pageNumbers = getPageNumbers();

  // Tính toán phạm vi hiển thị
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      
      // Scroll về đầu trang nếu cần
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
      {/* Thông tin về phân trang */}
      <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
        Hiển thị {startItem}-{endItem} trên tổng số {totalItems} mục
      </div>
      
      {/* Các nút điều hướng */}
      <div className="flex space-x-1">
        {/* Nút về trang đầu tiên */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === 1
              ? "border-border dark:border-border-dark text-text-disabled dark:text-text-disabled-dark cursor-not-allowed"
              : "border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          }`}
          aria-label="Trang đầu tiên"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        
        {/* Nút trang trước */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === 1
              ? "border-border dark:border-border-dark text-text-disabled dark:text-text-disabled-dark cursor-not-allowed"
              : "border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          }`}
          aria-label="Trang trước"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        {/* Các nút trang */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-md border ${
              page === currentPage
                ? "border-primary bg-primary text-white"
                : "border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            }`}
            aria-label={`Trang ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
        
        {/* Nút trang tiếp theo */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === totalPages
              ? "border-border dark:border-border-dark text-text-disabled dark:text-text-disabled-dark cursor-not-allowed"
              : "border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          }`}
          aria-label="Trang tiếp theo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        
        {/* Nút về trang cuối cùng */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === totalPages
              ? "border-border dark:border-border-dark text-text-disabled dark:text-text-disabled-dark cursor-not-allowed"
              : "border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          }`}
          aria-label="Trang cuối cùng"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  maxPageButtons: PropTypes.number,
};

export default Pagination;