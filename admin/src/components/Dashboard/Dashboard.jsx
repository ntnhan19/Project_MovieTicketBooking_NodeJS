// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNotify } from 'react-admin';
import { 
  UsersIcon, 
  FilmIcon, 
  TicketIcon, 
  CurrencyDollarIcon,
  CalendarIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import authProvider from '../../services/authProvider';
import dashboardService from '../../services/dashboardService';

const StatCard = ({ title, value, icon, increase, percentage, color = "primary" }) => {
  const Icon = icon;
  return (
    <div className="stats-card bg-white dark:bg-background-paper-dark rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="stats-card-title text-text-secondary dark:text-text-secondary-dark font-medium text-sm">
          {title}
        </div>
        <div className={`p-2 rounded-full bg-${color}-light/10`}>
          <Icon className={`w-5 h-5 text-${color}-DEFAULT`} />
        </div>
      </div>
      <div className="stats-card-value text-text-primary dark:text-text-primary-dark text-2xl font-bold mb-2">
        {value}
      </div>
      {percentage !== undefined && (
        <div className="flex items-center text-sm">
          {increase ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={increase ? "text-emerald-500" : "text-red-500"}>
            {percentage}%
          </span>
          <span className="text-text-secondary dark:text-text-secondary-dark ml-1">
            so với tháng trước
          </span>
        </div>
      )}
    </div>
  );
};

const RecentItem = ({ title, subtitle, value, status, icon }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark last:border-0">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-secondary-light/10 mr-4`}>
          <Icon className="w-5 h-5 text-secondary-DEFAULT" />
        </div>
        <div>
          <h3 className="font-medium text-text-primary dark:text-text-primary-dark">{title}</h3>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-semibold text-text-primary dark:text-text-primary-dark">{value}</span>
        {status && (
          <span className={`text-xs ${
            status === 'active' ? 'status-active' : 
            status === 'coming-soon' ? 'status-coming-soon' : 
            'status-inactive'
          }`}>
            {status === 'active' ? 'Đang chiếu' : 
             status === 'coming-soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
          </span>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const notify = useNotify();
  const [stats, setStats] = useState({
    totalMovies: 0,
    activeMovies: 0,
    totalUsers: 0,
    totalSales: 0,
    totalBookings: 0,
    showTimesToday: 0
  });
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Kiểm tra xác thực người dùng
        await authProvider.checkAuth();
        
        // Lấy dữ liệu Dashboard từ service
        const dashboardData = await dashboardService.getDashboardData();
        
        if (dashboardData) {
          // Thiết lập dữ liệu thống kê nếu có
          setStats({
            totalMovies: dashboardData.totalMovies || 0,
            activeMovies: dashboardData.activeMovies || 0,
            totalUsers: dashboardData.totalUsers || 0,
            totalSales: dashboardData.totalSales || 0,
            totalBookings: dashboardData.totalBookings || 0,
            showTimesToday: dashboardData.showTimesToday || 0
          });
          
          // Thiết lập phim gần đây
          setRecentMovies(dashboardData.recentMovies || []);
          
          // Thiết lập đặt vé gần đây
          setRecentBookings(dashboardData.recentBookings || []);
          
          // Thiết lập phim nổi bật
          setTopMovies(dashboardData.topMovies || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu Dashboard:", error);
        notify("Không thể tải dữ liệu Dashboard. Vui lòng thử lại sau.", { type: 'error' });
        
        // Set dữ liệu mặc định trong trường hợp lỗi
        setStats({
          totalMovies: 0,
          activeMovies: 0,
          totalUsers: 0,
          totalSales: 0,
          totalBookings: 0,
          showTimesToday: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [notify]);

  // Kiểm tra nếu đang loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
      </div>
    );
  }

  // Format tiền VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="dashboard-container p-6 max-w-8xl mx-auto">
      {/* Tiêu đề trang */}
      <div className="page-header bg-secondary-DEFAULT dark:bg-secondary-dark text-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold">Dashboard Quản Trị Hệ Thống Rạp Phim</h1>
        <p className="text-gray-200 mt-1">Xem tổng quan và thống kê hoạt động của hệ thống</p>
      </div>

      {/* Thống kê chính */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Tổng số phim" 
          value={stats.totalMovies} 
          icon={FilmIcon} 
          increase={true} 
          percentage={12}
          color="primary"
        />
        <StatCard 
          title="Phim đang chiếu" 
          value={stats.activeMovies} 
          icon={FilmIcon} 
          increase={false} 
          percentage={5}
          color="primary" 
        />
        <StatCard 
          title="Người dùng" 
          value={stats.totalUsers} 
          icon={UsersIcon} 
          increase={true} 
          percentage={8}
          color="secondary" 
        />
        <StatCard 
          title="Tổng doanh thu" 
          value={formatCurrency(stats.totalSales)} 
          icon={CurrencyDollarIcon} 
          increase={true} 
          percentage={15}
          color="emerald" 
        />
        <StatCard 
          title="Vé đã bán" 
          value={stats.totalBookings} 
          icon={TicketIcon} 
          increase={true} 
          percentage={7}
          color="amber" 
        />
        <StatCard 
          title="Suất chiếu hôm nay" 
          value={stats.showTimesToday} 
          icon={CalendarIcon} 
          increase={true} 
          percentage={3}
          color="indigo" 
        />
      </div>

      {/* Nội dung Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phim mới đăng gần đây */}
        <div className="lg:col-span-6 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
          <div className="p-5 border-b border-border dark:border-border-dark flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Phim mới đăng</h2>
            <a href="#/movies" className="flex items-center text-primary-DEFAULT text-sm hover:text-primary-dark transition-colors">
              Xem tất cả
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="overflow-hidden">
            {recentMovies.length > 0 ? (
              recentMovies.map((movie, index) => (
                <RecentItem
                  key={index}
                  title={movie.title}
                  subtitle={`${movie.genre} - ${movie.duration} phút`}
                  value={movie.releaseDate}
                  status={movie.status}
                  icon={FilmIcon}
                />
              ))
            ) : (
              <div className="p-5 text-center text-text-secondary dark:text-text-secondary-dark">
                Không có dữ liệu phim mới
              </div>
            )}
          </div>
        </div>

        {/* Lịch chiếu phim hôm nay */}
        <div className="lg:col-span-6 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
          <div className="p-5 border-b border-border dark:border-border-dark flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Đặt vé gần đây</h2>
            <a href="#/showtimes" className="flex items-center text-primary-DEFAULT text-sm hover:text-primary-dark transition-colors">
              Xem tất cả
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="overflow-hidden">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <RecentItem
                  key={index}
                  title={booking.movieTitle}
                  subtitle={`${booking.cinemaName} - ${booking.time}`}
                  value={formatCurrency(booking.amount)}
                  icon={TicketIcon}
                />
              ))
            ) : (
              <div className="p-5 text-center text-text-secondary dark:text-text-secondary-dark">
                Không có dữ liệu đặt vé gần đây
              </div>
            )}
          </div>
        </div>
            
        {/* Phim nổi bật */}
        <div className="lg:col-span-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
          <div className="p-5 border-b border-border dark:border-border-dark flex justify-between items-center">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">Phim có doanh thu cao nhất</h2>
            <a href="#/movies" className="flex items-center text-primary-DEFAULT text-sm hover:text-primary-dark transition-colors">
              Xem thống kê chi tiết
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-secondary-dark">
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">Phim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">Thể loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">Vé đã bán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">
                {topMovies.length > 0 ? (
                  topMovies.map((movie, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-secondary-dark/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {movie.posterUrl ? (
                              <img className="h-10 w-10 rounded-md object-cover" src={movie.posterUrl} alt={movie.title} />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <FilmIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{movie.title}</div>
                            <div className="text-sm text-text-secondary dark:text-text-secondary-dark">{movie.director}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">{movie.genre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          movie.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          movie.status === 'coming-soon' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {movie.status === 'active' ? 'Đang chiếu' : 
                           movie.status === 'coming-soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">{movie.ticketsSold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark">{formatCurrency(movie.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-text-secondary dark:text-text-secondary-dark">
                      Không có dữ liệu thống kê phim
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;