const prisma = require("../../prisma/prisma");

const getDashboardData = async () => {
  try {
    const currentDate = new Date();

    // 1. Tổng số phim và số phim đang chiếu
    const totalMovies = await prisma.movie.count();
    const activeMoviesCount = await prisma.movie.count({
      where: {
        showtimes: {
          some: {
            startTime: { gte: currentDate },
          },
        },
      },
    });

    // 2. Tổng số người dùng
    const totalUsers = await prisma.user.count();

    // 3. Tổng doanh thu (từ vé đã thanh toán)
    const ticketsSales = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    });
    const totalSales = ticketsSales._sum.amount || 0;

    // 4. Tổng số vé đã bán
    const totalBookings = await prisma.ticket.count({
      where: { status: "CONFIRMED" },
    });

    // 5. Số lịch chiếu hôm nay
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const showTimesToday = await prisma.showtime.count({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    // 6. Phim mới nhất có suất chiếu (5 phim gần nhất)
    const recentMovies = await prisma.movie.findMany({
      take: 5,
      where: {
        showtimes: {
          some: {
            startTime: { gte: currentDate },
          },
        },
      },
      orderBy: { releaseDate: "desc" },
      include: {
        genres: true,
        showtimes: {
          where: {
            startTime: { gte: currentDate },
          },
          select: { id: true },
        },
      },
    });

    const formattedRecentMovies = recentMovies.map((movie) => {
      const releaseDate = new Date(movie.releaseDate);
      const status = releaseDate > currentDate ? "coming-soon" : "active";
      return {
        id: movie.id,
        title: movie.title,
        genre: movie.genres.map((g) => g.name).join(", "),
        duration: movie.duration,
        releaseDate: releaseDate.toLocaleDateString("vi-VN"),
        status,
        posterUrl: movie.poster || null,
        showtimeCount: movie.showtimes.length,
      };
    });

    // 7. Đặt vé gần đây (5 đơn vé gần nhất)
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: { id: "desc" },
      where: { status: "CONFIRMED" },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
      },
    });

    const formattedRecentBookings = recentTickets.map((ticket) => ({
      movieTitle: ticket.showtime.movie.title,
      cinemaName: ticket.showtime.hall.cinema.name,
      time: new Date(ticket.showtime.startTime).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      amount: ticket.price,
    }));

    // 8. Phim có doanh thu cao nhất
    const moviesWithRevenue = await prisma.movie.findMany({
      take: 10,
      include: {
        genres: true,
        showtimes: {
          include: {
            tickets: {
              where: { status: "CONFIRMED" },
              select: { price: true },
            },
          },
        },
      },
    });

    const topMovies = moviesWithRevenue
      .map((movie) => {
        const ticketsSold = movie.showtimes.reduce(
          (sum, showtime) => sum + showtime.tickets.length,
          0
        );
        const revenue = movie.showtimes.reduce(
          (sum, showtime) =>
            sum +
            showtime.tickets.reduce(
              (ticketSum, ticket) => ticketSum + ticket.price,
              0
            ),
          0
        );
        const releaseDate = new Date(movie.releaseDate);
        const status = releaseDate > currentDate ? "coming-soon" : "active";
        return {
          id: movie.id,
          title: movie.title,
          director: movie.director || "Không xác định",
          posterUrl: movie.poster || null,
          genre: movie.genres.map((g) => g.name).join(", "),
          status,
          ticketsSold,
          revenue,
        };
      })
      .filter((movie) => movie.ticketsSold > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalMovies,
      activeMovies: activeMoviesCount,
      totalUsers,
      totalSales,
      totalBookings,
      showTimesToday,
      recentMovies: formattedRecentMovies,
      recentBookings: formattedRecentBookings,
      topMovies,
    };
  } catch (error) {
    console.error("[DashboardService] Lỗi trong dashboardService:", error);
    throw error;
  }
};

module.exports = { getDashboardData };