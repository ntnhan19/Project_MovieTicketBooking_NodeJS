const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function extractData() {
  console.log('Bắt đầu trích xuất dữ liệu...');

  try {
    const data = {};
    
    // Hàm helper để trích xuất dữ liệu với xử lý lỗi
    async function extractEntity(name, promise) {
      try {
        console.log(`Đang trích xuất ${name}...`);
        data[name] = await promise;
        console.log(`✓ Đã trích xuất ${data[name].length} ${name}`);
      } catch (error) {
        console.error(`Lỗi khi trích xuất ${name}:`, error);
        throw error;
      }
    }

    // Trích xuất dữ liệu từ tất cả các bảng cần thiết
    await extractEntity('users', prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    }));

    await extractEntity('genres', prisma.genre.findMany());
    
    await extractEntity('movies', prisma.movie.findMany({
      include: { genres: true }
    }));
    
    await extractEntity('cinemas', prisma.cinema.findMany());
    
    await extractEntity('halls', prisma.hall.findMany());
    
    await extractEntity('showtimes', prisma.showtime.findMany({
      include: {
        movie: true,
        hall: true
      }
    }));
    
    await extractEntity('seats', prisma.seat.findMany({
      include: {
        showtime: true
      }
    }));
    
    await extractEntity('tickets', prisma.ticket.findMany({
      include: {
        user: true,
        showtime: true,
        seat: true,
        promotion: true,
        payment: true
      }
    }));
    
    await extractEntity('payments', prisma.payment.findMany());
    
    await extractEntity('reviews', prisma.review.findMany({
      include: {
        user: true,
        movie: true
      }
    }));
    
    await extractEntity('promotions', prisma.promotion.findMany());
    
    await extractEntity('concessionCategories', prisma.concessionCategory.findMany());
    
    await extractEntity('concessionItems', prisma.concessionItem.findMany({
      include: { 
        category: true 
      }
    }));
    
    await extractEntity('concessionCombos', prisma.concessionCombo.findMany({
      include: { 
        items: { 
          include: { 
            item: true 
          } 
        } 
      }
    }));
    
    await extractEntity('concessionOrders', prisma.concessionOrder.findMany({
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            item: true,
            combo: true
          }
        },
        tickets: true
      }
    }));

    // Thêm metadata
    data.metadata = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalRecords: Object.entries(data).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = value.length;
        }
        return acc;
      }, {})
    };

    // Đường dẫn tới file đầu ra
    const outputPath = path.join(__dirname, 'database-dump.json');
    
    // Ghi dữ liệu vào file JSON với định dạng đẹp
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✓ Đã trích xuất dữ liệu thành công vào file ${outputPath}`);
    console.log('Tổng số bản ghi đã trích xuất:', data.metadata.totalRecords);
  } catch (error) {
    console.error('❌ Lỗi khi trích xuất dữ liệu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy hàm trích xuất dữ liệu
extractData()
  .catch((e) => {
    console.error('❌ Lỗi không xử lý được:', e);
    process.exit(1);
  });