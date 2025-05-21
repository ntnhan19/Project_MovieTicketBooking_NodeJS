// admin/src/components/Tickets/TicketList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ticketService from "../../services/ticketService";
import Pagination from "../Common/Pagination";

// Định nghĩa trạng thái vé
const statusChoices = [
  { id: 'PENDING', name: 'Đang xử lý', color: 'bg-yellow-500 text-yellow-900 bg-opacity-20' },
  { id: 'CONFIRMED', name: 'Đã xác nhận', color: 'bg-green-500 text-green-900 bg-opacity-20' },
  { id: 'CANCELED', name: 'Đã hủy', color: 'bg-red-500 text-red-900 bg-opacity-20' },
  { id: 'USED', name: 'Đã sử dụng', color: 'bg-gray-500 text-gray-900 bg-opacity-20' },
];

// Hàm lấy class CSS cho trạng thái
const getStatusClass = (status) => {
  const statusInfo = statusChoices.find(choice => choice.id === status);
  return statusInfo ? statusInfo.color : 'bg-gray-500 text-gray-900 bg-opacity-20';
};

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    PENDING: 0,
    CONFIRMED: 0,
    CANCELED: 0,
    USED: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0]
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ticketService.getList({
        pagination: {
          page: currentPage,
          perPage: itemsPerPage
        },
        sort: { field: 'createdAt', order: 'desc' },
        filter: {
          status: statusFilter,
          fromDate: dateFilter.fromDate ? new Date(dateFilter.fromDate).toISOString() : '',
          toDate: dateFilter.toDate ? new Date(dateFilter.toDate).toISOString() : '',
          search: searchTerm
        }
      });

      if (response && response.data) {
        const { data, total } = response.data;
        setTickets(data || []);
        setTotalItems(total || 0);
        setTotalPages(Math.ceil((total || 0) / itemsPerPage));

        // Cập nhật thống kê
        const newStats = {
          PENDING: 0,
          CONFIRMED: 0,
          CANCELED: 0,
          USED: 0
        };
        
        (data || []).forEach(ticket => {
          if (newStats.hasOwnProperty(ticket.status)) {
            newStats[ticket.status]++;
          }
        });
        
        setStats(newStats);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      setTickets([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, statusFilter, dateFilter.fromDate, dateFilter.toDate]);

  const handleExport = async () => {
    try {
      // Nếu chưa có hàm exportTickets trong service, thông báo cho người dùng
      alert('Chức năng xuất dữ liệu đang được phát triển!');
    } catch (err) {
      console.error("Lỗi khi xuất dữ liệu:", err);
      setError(err.message || "Có lỗi xảy ra khi xuất dữ liệu");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    if (window.confirm(`Bạn có chắc chắn muốn chuyển trạng thái vé thành "${statusChoices.find(choice => choice.id === newStatus)?.name}"?`)) {
      try {
        await ticketService.updateStatus(ticketId, newStatus);
        // Cập nhật lại danh sách vé sau khi thay đổi trạng thái
        fetchData();
      } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái vé:", err);
        setError(err.message || "Có lỗi xảy ra khi cập nhật trạng thái vé");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lọc vé theo từ khóa tìm kiếm
  const filteredTickets = tickets.filter(ticket => {
    // Lọc theo từ khóa tìm kiếm (ID vé hoặc tên khách hàng)
    const matchSearch = searchTerm === "" || 
                        (ticket.id && ticket.id.toString().includes(searchTerm)) || 
                        (ticket.user && ticket.user.name && ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Danh sách vé
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Tổng số: {totalItems} vé
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Xuất dữ liệu
          </button>
        </div>
      </div>

      {/* Hiển thị thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-white dark:bg-background-paper-dark p-4 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {statusChoices.find(choice => choice.id === status)?.name || status}
                </p>
                <p className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark">
                  {count}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${getStatusClass(status).split(' ')[0]}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 pb-6">
        <div className="md:col-span-2">
          <label htmlFor="search" className="sr-only">Tìm kiếm</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Tìm theo ID vé hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="sr-only">Trạng thái</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          >
            <option value="">Tất cả trạng thái</option>
            {statusChoices.map(choice => (
              <option key={choice.id} value={choice.id}>{choice.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="fromDate" className="sr-only">Từ ngày</label>
          <input
            type="date"
            id="fromDate"
            value={dateFilter.fromDate}
            onChange={(e) => setDateFilter({...dateFilter, fromDate: e.target.value})}
            className="block w-full pl-3 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          />
        </div>
        <div>
          <label htmlFor="toDate" className="sr-only">Đến ngày</label>
          <input
            type="date"
            id="toDate"
            value={dateFilter.toDate}
            onChange={(e) => setDateFilter({...dateFilter, toDate: e.target.value})}
            className="block w-full pl-3 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          />
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Danh sách vé */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
          <svg className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">Không tìm thấy vé</h3>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Không có vé nào phù hợp với tiêu chí tìm kiếm của bạn.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border dark:divide-border-dark bg-white dark:bg-background-paper-dark shadow-card rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  ID vé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Phim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Suất chiếu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Ghế
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Giá vé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/tickets/${ticket.id}`}
                      className="text-primary hover:text-primary-dark hover:underline font-medium"
                    >
                      {ticket.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.user?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.showtime?.movie?.title || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.showtime?.startTime ? new Date(ticket.showtime.startTime).toLocaleString('vi-VN') : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.seat ? `${ticket.seat.row}${ticket.seat.column}` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                      {statusChoices.find(choice => choice.id === ticket.status)?.name || ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                        title="Xem chi tiết"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <div className="relative group">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                          title="Thay đổi trạng thái"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-background-paper-dark rounded-md overflow-hidden shadow-dropdown z-10 hidden group-hover:block">
                          <div className="py-1">
                            {statusChoices.map(choice => (
                              <button
                                key={choice.id}
                                onClick={() => handleStatusChange(ticket.id, choice.id)}
                                disabled={ticket.status === choice.id}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  ticket.status === choice.id 
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {choice.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/tickets/edit/${ticket.id}`}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200"
                        title="Chỉnh sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            maxPageButtons={5}
          />
        </div>
      )}
    </div>
  );
};

export default TicketList;