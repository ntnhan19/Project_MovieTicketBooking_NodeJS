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
      console.warn(
        "[getDashboardData] Invalid startDate, using default:",
        startDate
      );
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }
    if (!(endDate instanceof Date) || isNaN(endDate)) {
      console.warn(
        "[getDashboardData] Invalid endDate, using default:",
        endDate
      );
      endDate = new Date();
    }

    // Tạo query parameters cho date range
    const dateQuery = new URLSearchParams({
      fromDate: startDate.toISOString().split("T")[0], // Chỉ lấy ngày (YYYY-MM-DD)
      toDate: endDate.toISOString().split("T")[0],
    }).toString();

    // Query cho main dashboard (có thể khác format)
    const dashboardQuery = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }).toString();

    console.log("[getDashboardData] Fetching data with dateQuery:", dateQuery);

    // Fetch main dashboard data
    const { json } = await httpClient(`${apiUrl}/dashboard?${dashboardQuery}`);

    // Fetch ticket stats với format ngày phù hợp
    const ticketStatsResponse = await httpClient(
      `${apiUrl}/tickets/stats?${dateQuery}`
    );
    console.log(
      "[getDashboardData] Ticket stats response:",
      ticketStatsResponse
    );

    // Fetch recent tickets - sửa lại query
    const recentTicketsQuery = new URLSearchParams({
      page: 1,
      limit: 5,
      _sort: "createdAt",
      _order: "desc",
      fromDate: startDate.toISOString().split("T")[0],
      toDate: endDate.toISOString().split("T")[0],
    }).toString();

    console.log(
      "[getDashboardData] Fetching recent tickets with query:",
      recentTicketsQuery
    );

    const recentTicketsResponse = await httpClient(
      `${apiUrl}/tickets?${recentTicketsQuery}`
    );

    console.log(
      "[getDashboardData] Recent tickets response:",
      recentTicketsResponse
    );

    // Fetch concession stats với fallback
    let concessionStats = { totalSales: 0, totalOrders: 0 };
    try {
      concessionStats = await concessionOrderService.getStatistics(
        startDate,
        endDate
      );
    } catch (error) {
      console.error(
        "[getDashboardData] Failed to fetch concession stats:",
        error
      );
    }

    // Fetch popular concession items
    let popularConcessionItems = [];
    try {
      const popularItemsResponse = await concessionItemService.getPopularItems(
        5
      );
      popularConcessionItems = popularItemsResponse.data || [];
    } catch (error) {
      console.error(
        "[getDashboardData] Failed to fetch popular concession items:",
        error
      );
    }

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

    // Xử lý recent tickets data
    let recentTicketsData = [];
    if (recentTicketsResponse && recentTicketsResponse.json) {
      // Kiểm tra cấu trúc response và lấy dữ liệu từ json.data
      if (
        recentTicketsResponse.json.data &&
        Array.isArray(recentTicketsResponse.json.data)
      ) {
        recentTicketsData = recentTicketsResponse.json.data;
      } else {
        console.warn(
          "[getDashboardData] Unexpected recent tickets structure:",
          recentTicketsResponse.json
        );
      }
    }

    console.log(
      "[getDashboardData] Processed recent tickets:",
      recentTicketsData
    );

    const result = {
      ...json,
      topMovies: formattedTopMovies,
      ticketStats: ticketStatsResponse.json || {},
      recentTickets: recentTicketsData,
      concessionStats,
      popularConcessionItems,
    };

    console.log("[getDashboardData] Final result:", result);

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

// Thêm function để test API ticket riêng
const testTicketAPI = async () => {
  try {
    console.log("[testTicketAPI] Testing ticket API...");

    // Test basic tickets endpoint
    const basicResponse = await httpClient(`${apiUrl}/tickets?page=1&limit=5`);
    console.log("[testTicketAPI] Basic response:", basicResponse);

    // Test with sort
    const sortedResponse = await httpClient(
      `${apiUrl}/tickets?page=1&limit=5&_sort=createdAt&_order=desc`
    );
    console.log("[testTicketAPI] Sorted response:", sortedResponse);

    return {
      basic: basicResponse,
      sorted: sortedResponse,
    };
  } catch (error) {
    console.error("[testTicketAPI] Error:", error);
    throw error;
  }
};

// Clear cache function
const clearCache = () => {
  cache.clear();
  console.log("[DashboardService] Cache cleared");
};

const dashboardService = {
  getDashboardData,
  testTicketAPI,
  clearCache,
};

export default dashboardService;
