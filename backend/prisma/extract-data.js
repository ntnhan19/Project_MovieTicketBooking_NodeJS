const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function extractData() {
  try {
    // Trích xuất dữ liệu từ tất cả các bảng
    const users = await prisma.user.findMany();
    const genres = await prisma.genre.findMany();
    const movies = await prisma.movie.findMany({
      include: { genres: true }
    });
    const cinemas = await prisma.cinema.findMany();
    const halls = await prisma.hall.findMany();
    const showtimes = await prisma.showtime.findMany();
    const seats = await prisma.seat.findMany();
    const tickets = await prisma.ticket.findMany();
    const payments = await prisma.payment.findMany();
    const reviews = await prisma.review.findMany();
    const promotions = await prisma.promotion.findMany();

    // Tạo đối tượng chứa tất cả dữ liệu
    const data = {
      users,
      genres,
      movies,
      cinemas,
      halls,
      showtimes,
      seats,
      tickets,
      payments,
      reviews,
      promotions
    };

    // Ghi dữ liệu vào file JSON để dễ dàng sử dụng sau này
    fs.writeFileSync('database-dump.json', JSON.stringify(data, null, 2));
    console.log('Đã trích xuất dữ liệu thành công vào file database-dump.json');
  } catch (error) {
    console.error('Lỗi khi trích xuất dữ liệu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractData();