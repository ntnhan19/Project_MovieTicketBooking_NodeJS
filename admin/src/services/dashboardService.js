import { apiUrl, httpClient } from "./httpClient";
import concessionItemService from "./concessionItemService";
import concessionOrderService from "./concessionOrderService";

const cache = new Map();

const getDashboardData = async ({ startDate, endDate }) => {
  const cacheKey = `dashboardData_${startDate.toISOString()}_${endDate.toISOString()}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    // Validate dates
    if (!(startDate instanceof Date) || isNaN(startDate)) {
      console.warn("[getDashboardData] Invalid startDate, using default:", startDate);
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }
    if (!(endDate instanceof Date) || isNaN(endDate)) {
      console.warn("[getDashboardData] Invalid endDate, using default:", endDate);
      endDate = new Date();
    }

    const query = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }).toString();

    // Fetch main dashboard data
    const { json } = await httpClient(`${apiUrl}/dashboard?${query}`);

    // Fetch ticket stats
    const ticketStats = await httpClient(`${apiUrl}/tickets/stats?${query}`);
    const recentTickets = await httpClient(
      `${apiUrl}/tickets?limit=5&_sort=createdAt&_order=desc&${query}`
    );

    // Fetch concession stats with fallback
    let concessionStats = { totalSales: 0, totalOrders: 0 };
    try {
      concessionStats = await concessionOrderService.getStatistics(startDate, endDate);
    } catch (error) {
      console.error("[getDashboardData] Failed to fetch concession stats:", error);
    }

    // Fetch popular concession items
    const popularConcessionItems = await concessionItemService.getPopularItems(5);

    // Format topMovies
    const formattedTopMovies = (json.topMovies || []).map((movie) => ({
      id: movie.id || null,
      title: movie.title || "Không xác định",
      director: movie.director || "Không xác định",
      genre: movie.genre || "",
      status: movie.status || "inactive",
      posterUrl: movie.posterUrl || null,
      ticketsSold: Number(movie.ticketsSold) || 0,
      revenue: Number(movie.revenue) || 0,
    }));

    console.log("[DashboardService] formattedTopMovies:", formattedTopMovies);

    const result = {
      ...json,
      topMovies: formattedTopMovies,
      ticketStats: ticketStats.json,
      recentTickets: recentTickets.json.data || [],
      concessionStats,
      popularConcessionItems: popularConcessionItems.data || [],
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[DashboardService] Lỗi khi lấy dữ liệu dashboard:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const dashboardService = { getDashboardData };

export default dashboardService;