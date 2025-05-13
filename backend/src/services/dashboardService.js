//backend/src/services/dashboardService.js
const prisma = require("../../prisma/prisma");

/**
 * Lấy dữ liệu tổng quan cho dashboard
 */
const getDashboardData = async () => {
  try {
    // 1. Tổng số phim và số phim đang chiếu
    const totalMovies = await prisma.movie.count();
    
    // Tính phim đang chiếu (có lịch chiếu từ hiện tại trở đi)
    const currentDate = new Date();
    const activeMoviesCount = await prisma.movie.count({
      where: {
        showtimes: {
          some: {
            startTime: {
              gte: currentDate
            }
          }
        }
      }
    });

    // 2. Tổng số người dùng
    const totalUsers = await prisma.user.count();

    // 3. Tổng doanh thu (từ vé và đồ ăn)
    const ticketsSales = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        status: 'COMPLETED'
      }
    });
    
    const totalSales = ticketsSales._sum.amount || 0;

    // 4. Tổng số vé đã bán
    const totalBookings = await prisma.ticket.count({
      where: {
        status: 'PAID'
      }
    });

    // 5. Số lịch chiếu hôm nay
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const showTimesToday = await prisma.showtime.count({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // 6. Phim mới đăng gần đây (5 phim gần nhất)
    const recentMovies = await prisma.movie.findMany({
      take: 5,
      orderBy: {
        releaseDate: 'desc'
      },
      include: {
        genres: true
      }
    });

    // Định dạng lại dữ liệu phim
    const formattedRecentMovies = recentMovies.map(movie => {
      // Xác định status (đang chiếu/sắp chiếu/ngừng chiếu)
      let status = 'inactive';
      const currentDate = new Date();
      const releaseDate = new Date(movie.releaseDate);
      
      if (releaseDate > currentDate) {
        status = 'coming-soon';
      } else {
        status = 'active'; // Giả định phim đã ra mắt đều đang chiếu
      }

      return {
        title: movie.title,
        genre: movie.genres.map(g => g.name).join(', '),
        duration: movie.duration,
        releaseDate: releaseDate.toLocaleDateString('vi-VN'),
        status: status,
      };
    });

    // 7. Đặt vé gần đây (5 đơn vé gần nhất)
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: {
        paymentId: 'desc'
      },
      where: {
        status: 'PAID'
      },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: {
              include: {
                cinema: true
              }
            }
          }
        }
      }
    });

    // Định dạng lại dữ liệu đặt vé
    const formattedRecentBookings = recentTickets.map(ticket => {
      return {
        movieTitle: ticket.showtime.movie.title,
        cinemaName: ticket.showtime.hall.cinema.name,
        time: new Date(ticket.showtime.startTime).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        amount: ticket.price
      };
    });

    // 8. Phim có doanh thu cao nhất
    const moviesWithRevenue = await prisma.movie.findMany({
      take: 5,
      include: {
        reviews: true,
        genres: true,
        showtimes: {
          include: {
            tickets: {
              where: {
                status: 'PAID'
              }
            }
          }
        }
      }
    });

    const topMovies = moviesWithRevenue.map(movie => {
      // Tính tổng doanh thu từ các vé của phim
      let revenue = 0;
      let ticketsSold = 0;

      // Đếm từ các lịch chiếu
      movie.showtimes.forEach(showtime => {
        ticketsSold += showtime.tickets.length;
        showtime.tickets.forEach(ticket => {
          revenue += ticket.price;
        });
      });

      // Xác định status (đang chiếu/sắp chiếu/ngừng chiếu)
      let status = 'inactive';
      const currentDate = new Date();
      const releaseDate = new Date(movie.releaseDate);
      
      if (releaseDate > currentDate) {
        status = 'coming-soon';
      } else {
        status = 'active'; // Giả định phim đã ra mắt đều đang chiếu
      }

      return {
        title: movie.title,
        director: movie.director,
        posterUrl: movie.poster,
        genre: movie.genres.map(g => g.name).join(', '),
        status: status,
        ticketsSold: ticketsSold,
        revenue: revenue
      };
    });

    // Sắp xếp phim theo doanh thu
    topMovies.sort((a, b) => b.revenue - a.revenue);

    return {
      totalMovies,
      activeMovies: activeMoviesCount,
      totalUsers,
      totalSales,
      totalBookings,
      showTimesToday,
      recentMovies: formattedRecentMovies,
      recentBookings: formattedRecentBookings,
      topMovies
    };

  } catch (error) {
    console.error('Lỗi trong dashboardService:', error);
    throw error;
  }
};

module.exports = {
  getDashboardData
};