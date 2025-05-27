import { useState, useEffect } from "react";
import { useNotify } from "react-admin";
import {
  UsersIcon,
  FilmIcon,
  TicketIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import authProvider from "../../services/authProvider";
import dashboardService from "../../services/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({
  title,
  value,
  icon,
  increase,
  percentage,
  color = "primary",
  onClick,
  subtitle,
}) => {
  const Icon = icon;
  const colorClasses = {
    primary: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm uppercase tracking-wide">
            {title}
          </p>
          <h3 className="text-gray-900 dark:text-white text-2xl font-bold mt-2">
            {value}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {percentage !== undefined && (
        <div className="flex items-center text-sm">
          {increase ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={increase ? "text-green-600" : "text-red-600"}>
            {increase ? "+" : ""}
            {percentage}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">
            so với tháng trước
          </span>
        </div>
      )}
    </div>
  );
};

const RecentMovieItem = ({
  id,
  title,
  subtitle,
  releaseDate,
  status,
  posterUrl,
  showtimeCount,
  onClick,
}) => {
  const statusConfig = {
    active: {
      label: "Đang chiếu",
      class:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    "coming-soon": {
      label: "Sắp chiếu",
      class:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    inactive: {
      label: "Ngừng chiếu",
      class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.inactive;

  return (
    <div
      className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center flex-1">
        <div className="h-16 w-12 flex-shrink-0 mr-4">
          {posterUrl ? (
            <img
              className="h-16 w-12 rounded-lg object-cover shadow-sm"
              src={posterUrl}
              alt={title}
            />
          ) : (
            <div className="h-16 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <FilmIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            <span>Ngày phát hành: {releaseDate}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end ml-4">
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${currentStatus.class}`}
        >
          {currentStatus.label}
        </span>
        <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>{showtimeCount} suất chiếu</span>
        </div>
      </div>
    </div>
  );
};

const RecentTicketItem = ({ title, subtitle, value, status, bookingTime }) => {
  const statusConfig = {
    PENDING: {
      label: "Chờ thanh toán",
      class:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    COMPLETED: {
      label: "Hoàn thành",
      class:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    PAID: {
      label: "Đã thanh toán",
      class:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    CANCELLED: {
      label: "Đã hủy",
      class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.PENDING;

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center flex-1">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-4 flex-shrink-0">
          <TicketIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
          {bookingTime && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Đặt lúc: {new Date(bookingTime).toLocaleString("vi-VN")}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end ml-4">
        <span className="font-semibold text-gray-900 dark:text-white text-lg">
          {value}
        </span>
        <span
          className={`text-xs mt-2 px-3 py-1 rounded-full font-medium ${currentStatus.class}`}
        >
          {currentStatus.label}
        </span>
      </div>
    </div>
  );
};

const PopularConcessionItem = ({ name, category, price, quantitySold }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center flex-1">
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 mr-4 flex-shrink-0">
          <ShoppingCartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {category}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end ml-4">
        <span className="font-semibold text-gray-900 dark:text-white text-lg">
          {formatCurrency(price)}
        </span>
        <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
          <span>Đã bán: </span>
          <span className="font-medium text-green-600 dark:text-green-400 ml-1">
            {quantitySold}
          </span>
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const RevenueChart = ({ data }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: "Doanh thu vé",
        data: data.ticketSales || [],
        borderColor: "#e71a0f",
        backgroundColor: "rgba(231, 26, 15, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Doanh thu bắp nước",
        data: data.concessionSales || [],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "Xu hướng doanh thu theo thời gian",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: 20,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <Line data={chartData} options={options} />
    </div>
  );
};

const MovieStatusChart = ({ topMovies }) => {
  const statusCounts = topMovies.reduce((acc, movie) => {
    acc[movie.status] = (acc[movie.status] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ["Đang chiếu", "Sắp chiếu", "Ngừng chiếu"],
    datasets: [
      {
        data: [
          statusCounts.active || 0,
          statusCounts["coming-soon"] || 0,
          statusCounts.inactive || 0,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Phân bố trạng thái phim",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: 20,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <Doughnut data={data} options={options} />
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
    showTimesToday: 0,
    totalTickets: 0,
    totalConcessionSales: 0,
    topMovies: [],
  });
  const [recentMovies, setRecentMovies] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [popularConcessionItems, setPopularConcessionItems] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    concessionSales: [],
    ticketSales: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("month");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await authProvider.checkAuth();

        let startDate,
          endDate = new Date();
        switch (timeFilter) {
          case "day":
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "year":
            startDate = new Date();
            startDate.setMonth(0, 1);
            startDate.setHours(0, 0, 0, 0);
            break;
          default:
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        const dashboardData = await dashboardService.getDashboardData({
          startDate,
          endDate,
        });

        // Generate chart data
        const labels = [];
        const concessionSales = [];
        const ticketSales = [];
        const daysInPeriod =
          timeFilter === "day"
            ? 24
            : timeFilter === "week"
            ? 7
            : timeFilter === "month"
            ? 30
            : 12;

        for (let i = 0; i < daysInPeriod; i++) {
          if (timeFilter === "day") {
            labels.push(`${i}:00`);
          } else if (timeFilter === "year") {
            const date = new Date(startDate);
            date.setMonth(i);
            labels.push(date.toLocaleDateString("vi-VN", { month: "short" }));
          } else {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            labels.push(
              date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })
            );
          }

          concessionSales.push(
            Math.floor(
              ((dashboardData.concessionStats?.totalSales || 0) /
                daysInPeriod) *
                (0.7 + Math.random() * 0.6)
            )
          );
          ticketSales.push(
            Math.floor(
              ((dashboardData.totalSales || 0) / daysInPeriod) *
                (0.7 + Math.random() * 0.6)
            )
          );
        }

        setChartData({ labels, concessionSales, ticketSales });

        setStats({
          totalMovies: dashboardData.totalMovies || 0,
          activeMovies: dashboardData.activeMovies || 0,
          totalUsers: dashboardData.totalUsers || 0,
          totalSales: dashboardData.totalSales || 0,
          totalBookings: dashboardData.totalBookings || 0,
          showTimesToday: dashboardData.showTimesToday || 0,
          totalTickets: dashboardData.ticketStats?.total || 0,
          totalConcessionSales: dashboardData.concessionStats?.totalSales || 0,
          topMovies: dashboardData.topMovies || [],
        });
        setRecentMovies(dashboardData.recentMovies || []);
        setRecentTickets(dashboardData.recentTickets || []);
        setPopularConcessionItems(dashboardData.popularConcessionItems || []);
      } catch (error) {
        console.error("[Dashboard] Lỗi khi tải dữ liệu Dashboard:", error);
        notify(`Không thể tải dữ liệu Dashboard: ${error.message}`, {
          type: "error",
        });
        // Set default empty state
        setStats({
          totalMovies: 0,
          activeMovies: 0,
          totalUsers: 0,
          totalSales: 0,
          totalBookings: 0,
          showTimesToday: 0,
          totalTickets: 0,
          totalConcessionSales: 0,
          topMovies: [],
        });
        setRecentMovies([]);
        setRecentTickets([]);
        setPopularConcessionItems([]);
        setChartData({ labels: [], concessionSales: [], ticketSales: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [notify, timeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải dữ liệu dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleStatCardClick = (type) => {
    notify(`Xem chi tiết ${type}`, { type: "info" });
  };

  const handleMovieClick = (id) => {
    window.location.href = `#/movies/${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white p-8 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                Dashboard Quản Lý Rạp Phim
              </h1>
              <p className="text-red-100 text-lg">
                Tổng quan hiệu suất và thống kê hoạt động hệ thống
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full sm:w-64 pl-10 pr-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="day" className="text-gray-900">
                  Hôm nay
                </option>
                <option value="week" className="text-gray-900">
                  Tuần này
                </option>
                <option value="month" className="text-gray-900">
                  Tháng này
                </option>
                <option value="year" className="text-gray-900">
                  Năm nay
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(stats.totalSales)}
            subtitle="Từ bán vé xem phim"
            icon={CurrencyDollarIcon}
            increase={true}
            percentage={15}
            color="primary"
            onClick={() => handleStatCardClick("doanh thu")}
          />
          <StatCard
            title="Doanh thu bắp nước"
            value={formatCurrency(stats.totalConcessionSales)}
            subtitle="Từ sản phẩm F&B"
            icon={ShoppingCartIcon}
            increase={true}
            percentage={8}
            color="purple"
            onClick={() => handleStatCardClick("bắp nước")}
          />
          <StatCard
            title="Tổng phim"
            value={stats.totalMovies}
            subtitle={`${stats.activeMovies} phim đang chiếu`}
            icon={FilmIcon}
            increase={false}
            percentage={2}
            color="blue"
            onClick={() => handleStatCardClick("phim")}
          />
          <StatCard
            title="Người dùng"
            value={stats.totalUsers}
            subtitle="Thành viên đã đăng ký"
            icon={UsersIcon}
            increase={true}
            percentage={12}
            color="green"
            onClick={() => handleStatCardClick("người dùng")}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <div>
            <MovieStatusChart topMovies={stats.topMovies} />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Movies */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <FilmIcon className="w-6 h-6 mr-2 text-red-600" />
                Phim Có Suất Chiếu Gần Đây
              </h2>
              <a
                href="#/movies"
                className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium"
              >
                Xem tất cả
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentMovies.length > 0 ? (
                recentMovies
                  .filter((movie) =>
                    movie.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((movie) => (
                    <RecentMovieItem
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      subtitle={`${movie.genre} - ${movie.duration} phút`}
                      releaseDate={movie.releaseDate}
                      status={movie.status}
                      posterUrl={movie.posterUrl}
                      showtimeCount={movie.showtimeCount || 0}
                      onClick={() => handleMovieClick(movie.id)}
                    />
                  ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <FilmIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Không có phim nào có suất chiếu gần đây</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <TicketIcon className="w-6 h-6 mr-2 text-blue-600" />
                Vé Đặt Gần Đây
              </h2>
              <a
                href="#/tickets"
                className="flex items-center text-red-600 hover:text-red-800 transition-colors font-medium"
              >
                Xem tất cả
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {recentTickets.length > 0 ? (
                recentTickets
                  .filter((ticket) =>
                    ticket.showtime?.movie?.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((ticket, index) => (
                    <RecentTicketItem
                      key={index}
                      title={ticket.showtime?.movie?.title || "Không xác định"}
                      subtitle={`${
                        ticket.showtime?.hall?.cinema?.name ||
                        "Rạp không xác định"
                      } - Phòng ${ticket.showtime?.hall?.name || "N/A"}`}
                      value={formatCurrency(ticket.price || 0)}
                      status={ticket.status || "PENDING"}
                      bookingTime={ticket.createdAt}
                    />
                  ))
              ) : (
                <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                  Không có vé gần đây
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sản Phẩm Bắp Nước Bán Chạy (Đã Thanh Toán)
              </h2>
              <a
                href="#/concession/items"
                className="flex items-center text-red-600 text-sm hover:text-red-800 transition-colors"
              >
                Xem tất cả
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="overflow-hidden">
              {popularConcessionItems.length > 0 ? (
                popularConcessionItems
                  .filter((item) =>
                    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <PopularConcessionItem
                      key={item.id}
                      name={item.name || "Không xác định"}
                      category={item.category?.name || "Không xác định"}
                      price={item.price || 0}
                      quantitySold={item.quantitySold || 0}
                    />
                  ))
              ) : (
                <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                  Không có sản phẩm bắp nước bán chạy
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Phim Có Doanh Thu Cao Nhất
              </h2>
              <a
                href="#/movies"
                className="flex items-center text-red-600 text-sm hover:text-red-800 transition-colors"
              >
                Xem thống kê chi tiết
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Phim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Thể loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vé đã bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.topMovies.length > 0 ? (
                    stats.topMovies.map((movie) => (
                      <tr
                        key={movie.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {movie.posterUrl ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <FilmIcon className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {movie.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {movie.director}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {movie.genre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              movie.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : movie.status === "coming-soon"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {movie.status === "active"
                              ? "Đang chiếu"
                              : movie.status === "coming-soon"
                              ? "Sắp chiếu"
                              : "Ngừng chiếu"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {movie.ticketsSold ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(movie.revenue ?? 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                      >
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
    </div>
  );
};

export default Dashboard;