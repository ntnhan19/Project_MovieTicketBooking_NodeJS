// extract-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function extractData() {
  console.log('Bắt đầu trích xuất dữ liệu...');

  try {
    // Trích xuất dữ liệu từ các bảng theo yêu cầu
    console.log('Đang trích xuất thể loại phim...');
    const genres = await prisma.genre.findMany();
    
    console.log('Đang trích xuất danh sách phim...');
    const movies = await prisma.movie.findMany({
      include: { genres: true }
    });
    
    console.log('Đang trích xuất rạp chiếu...');
    const cinemas = await prisma.cinema.findMany();
    
    console.log('Đang trích xuất phòng chiếu...');
    const halls = await prisma.hall.findMany();
    
    console.log('Đang trích xuất lịch chiếu...');
    const showtimes = await prisma.showtime.findMany();
    
    console.log('Đang trích xuất ghế ngồi...');
    const seats = await prisma.seat.findMany();
    
    console.log('Đang trích xuất khuyến mãi...');
    const promotions = await prisma.promotion.findMany();

    // Tạo đối tượng chứa tất cả dữ liệu đã lấy
    const data = {
      genres,
      movies,
      cinemas,
      halls,
      showtimes,
      seats,
      promotions
    };

    // Đường dẫn tới file đầu ra
    const outputPath = path.join(__dirname, 'database-dump.json');
    
    // Ghi dữ liệu vào file JSON
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Đã trích xuất dữ liệu thành công vào file ${outputPath}`);
  } catch (error) {
    console.error('Lỗi khi trích xuất dữ liệu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm trích xuất dữ liệu
extractData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });