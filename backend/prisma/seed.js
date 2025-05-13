const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Hàm kiểm tra file dữ liệu tồn tại
function checkDataFile() {
  const dataPath = path.join(__dirname, 'database-dump.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Không tìm thấy file database-dump.json');
    console.log('Vui lòng chạy lệnh "node extract-data.js" trước khi seed dữ liệu');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// Hàm helper để seed một entity
async function seedEntity(name, data, seedFn) {
  console.log(`Đang seed ${name}...`);
  try {
    await seedFn(data);
    console.log(`✓ Đã seed ${data.length} ${name} thành công`);
  } catch (error) {
    console.error(`❌ Lỗi khi seed ${name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('Bắt đầu seed dữ liệu...');
  
  try {
    // Kiểm tra và đọc dữ liệu
    const data = checkDataFile();
    
    // Kiểm tra metadata
    if (data.metadata) {
      console.log('Thông tin dữ liệu:');
      console.log('- Ngày xuất:', new Date(data.metadata.exportDate).toLocaleString());
      console.log('- Phiên bản:', data.metadata.version);
      console.log('- Số lượng bản ghi:', data.metadata.totalRecords);
    }

    // 1. Seed Users
    await seedEntity('users', data.users, async (users) => {
      for (const user of users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: user.password,
            role: user.role,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: user.password,
            role: user.role,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          },
        });
      }
    });

    // 2. Seed Genres
    await seedEntity('genres', data.genres, async (genres) => {
      for (const genre of genres) {
        await prisma.genre.upsert({
          where: { id: genre.id },
          update: { name: genre.name },
          create: { id: genre.id, name: genre.name },
        });
      }
    });

    // 3. Seed Movies
    await seedEntity('movies', data.movies, async (movies) => {
      for (const movie of movies) {
        const genreIds = movie.genres.map(genre => ({ id: genre.id }));
        await prisma.movie.upsert({
          where: { id: movie.id },
          update: {
            title: movie.title,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            poster: movie.poster,
            duration: movie.duration,
            director: movie.director,
            mainActors: movie.mainActors,
            trailerUrl: movie.trailerUrl,
            genres: { connect: genreIds }
          },
          create: {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            releaseDate: new Date(movie.releaseDate),
            poster: movie.poster,
            duration: movie.duration,
            director: movie.director,
            mainActors: movie.mainActors,
            trailerUrl: movie.trailerUrl,
            genres: { connect: genreIds }
          },
        });
      }
    });

    // 4. Seed Cinemas
    await seedEntity('cinemas', data.cinemas, async (cinemas) => {
      for (const cinema of cinemas) {
        await prisma.cinema.upsert({
          where: { id: cinema.id },
          update: {
            name: cinema.name,
            address: cinema.address,
            image: cinema.image,
            mapUrl: cinema.mapUrl,
          },
          create: {
            id: cinema.id,
            name: cinema.name,
            address: cinema.address,
            image: cinema.image,
            mapUrl: cinema.mapUrl,
          },
        });
      }
    });

    // 5. Seed Halls
    await seedEntity('halls', data.halls, async (halls) => {
      for (const hall of halls) {
        await prisma.hall.upsert({
          where: { id: hall.id },
          update: {
            name: hall.name,
            totalSeats: hall.totalSeats,
            rows: hall.rows,
            columns: hall.columns,
            cinemaId: hall.cinemaId,
          },
          create: {
            id: hall.id,
            name: hall.name,
            totalSeats: hall.totalSeats,
            rows: hall.rows,
            columns: hall.columns,
            cinemaId: hall.cinemaId,
          },
        });
      }
    });

    // 6. Seed Showtimes
    await seedEntity('showtimes', data.showtimes, async (showtimes) => {
      for (const showtime of showtimes) {
        await prisma.showtime.upsert({
          where: { id: showtime.id },
          update: {
            movieId: showtime.movieId,
            startTime: new Date(showtime.startTime),
            endTime: new Date(showtime.endTime),
            hallId: showtime.hallId,
            price: showtime.price
          },
          create: {
            id: showtime.id,
            movieId: showtime.movieId,
            startTime: new Date(showtime.startTime),
            endTime: new Date(showtime.endTime),
            hallId: showtime.hallId,
            price: showtime.price
          },
        });
      }
    });

    // 7. Seed Seats
    await seedEntity('seats', data.seats, async (seats) => {
      for (const seat of seats) {
        await prisma.seat.upsert({
          where: { id: seat.id },
          update: {
            showtimeId: seat.showtimeId,
            row: seat.row,
            column: seat.column,
            status: seat.status,
            type: seat.type
          },
          create: {
            id: seat.id,
            showtimeId: seat.showtimeId,
            row: seat.row,
            column: seat.column,
            status: seat.status,
            type: seat.type
          },
        });
      }
    });

    // 8. Seed Payments
    await seedEntity('payments', data.payments, async (payments) => {
      for (const payment of payments) {
        await prisma.payment.upsert({
          where: { id: payment.id },
          update: {
            amount: payment.amount,
            method: payment.method,
            status: payment.status,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
            transactionId: payment.transactionId,
            appTransId: payment.appTransId,
            additionalData: payment.additionalData
          },
          create: {
            id: payment.id,
            amount: payment.amount,
            method: payment.method,
            status: payment.status,
            createdAt: new Date(payment.createdAt),
            updatedAt: new Date(payment.updatedAt),
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
            transactionId: payment.transactionId,
            appTransId: payment.appTransId,
            additionalData: payment.additionalData
          },
        });
      }
    });

    // 9. Seed Tickets
    await seedEntity('tickets', data.tickets, async (tickets) => {
      for (const ticket of tickets) {
        await prisma.ticket.upsert({
          where: { id: ticket.id },
          update: {
            userId: ticket.userId,
            showtimeId: ticket.showtimeId,
            seatId: ticket.seatId,
            price: ticket.price,
            status: ticket.status,
            promotionId: ticket.promotionId,
            paymentId: ticket.paymentId
          },
          create: {
            id: ticket.id,
            userId: ticket.userId,
            showtimeId: ticket.showtimeId,
            seatId: ticket.seatId,
            price: ticket.price,
            status: ticket.status,
            promotionId: ticket.promotionId,
            paymentId: ticket.paymentId
          },
        });
      }
    });

    // 10. Seed Reviews
    await seedEntity('reviews', data.reviews, async (reviews) => {
      for (const review of reviews) {
        await prisma.review.upsert({
          where: { id: review.id },
          update: {
            userId: review.userId,
            movieId: review.movieId,
            rating: review.rating,
            comment: review.comment,
            createdAt: new Date(review.createdAt),
            isAnonymous: review.isAnonymous
          },
          create: {
            id: review.id,
            userId: review.userId,
            movieId: review.movieId,
            rating: review.rating,
            comment: review.comment,
            createdAt: new Date(review.createdAt),
            isAnonymous: review.isAnonymous
          },
        });
      }
    });

    // 11. Seed Promotions
    await seedEntity('promotions', data.promotions, async (promotions) => {
      for (const promotion of promotions) {
        await prisma.promotion.upsert({
          where: { id: promotion.id },
          update: {
            code: promotion.code,
            discount: promotion.discount,
            validFrom: new Date(promotion.validFrom),
            validUntil: new Date(promotion.validUntil),
            description: promotion.description,
            image: promotion.image,
            isActive: promotion.isActive,
            title: promotion.title,
            type: promotion.type
          },
          create: {
            id: promotion.id,
            code: promotion.code,
            discount: promotion.discount,
            validFrom: new Date(promotion.validFrom),
            validUntil: new Date(promotion.validUntil),
            description: promotion.description,
            image: promotion.image,
            isActive: promotion.isActive,
            title: promotion.title,
            type: promotion.type
          },
        });
      }
    });

    // 12. Seed Concession Categories
    await seedEntity('concessionCategories', data.concessionCategories, async (categories) => {
      for (const category of categories) {
        await prisma.concessionCategory.upsert({
          where: { id: category.id },
          update: {
            name: category.name,
            description: category.description,
            image: category.image,
            isActive: category.isActive,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt)
          },
          create: {
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.image,
            isActive: category.isActive,
            createdAt: new Date(category.createdAt),
            updatedAt: new Date(category.updatedAt)
          },
        });
      }
    });

    // 13. Seed Concession Items
    await seedEntity('concessionItems', data.concessionItems, async (items) => {
      for (const item of items) {
        await prisma.concessionItem.upsert({
          where: { id: item.id },
          update: {
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
            size: item.size,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          },
          create: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
            size: item.size,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          },
        });
      }
    });

    // 14. Seed Concession Combos and their items
    await seedEntity('concessionCombos', data.concessionCombos, async (combos) => {
      for (const combo of combos) {
        await prisma.concessionCombo.upsert({
          where: { id: combo.id },
          update: {
            name: combo.name,
            description: combo.description,
            price: combo.price,
            image: combo.image,
            isAvailable: combo.isAvailable,
            discountPercent: combo.discountPercent,
            createdAt: new Date(combo.createdAt),
            updatedAt: new Date(combo.updatedAt),
            items: {
              deleteMany: {},
              create: combo.items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
              }))
            }
          },
          create: {
            id: combo.id,
            name: combo.name,
            description: combo.description,
            price: combo.price,
            image: combo.image,
            isAvailable: combo.isAvailable,
            discountPercent: combo.discountPercent,
            createdAt: new Date(combo.createdAt),
            updatedAt: new Date(combo.updatedAt),
            items: {
              create: combo.items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity
              }))
            }
          },
        });
      }
    });

    // 15. Seed Concession Orders
    await seedEntity('concessionOrders', data.concessionOrders, async (orders) => {
      for (const order of orders) {
        await prisma.concessionOrder.upsert({
          where: { id: order.id },
          update: {
            userId: order.userId,
            status: order.status,
            orderType: order.orderType,
            totalAmount: order.totalAmount,
            paymentId: order.paymentId,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            items: {
              deleteMany: {},
              create: order.items.map(item => ({
                itemId: item.itemId,
                comboId: item.comboId,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
              }))
            },
            tickets: {
              connect: order.tickets?.map(ticket => ({ id: ticket.id })) || []
            }
          },
          create: {
            id: order.id,
            userId: order.userId,
            status: order.status,
            orderType: order.orderType,
            totalAmount: order.totalAmount,
            paymentId: order.paymentId,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            items: {
              create: order.items.map(item => ({
                itemId: item.itemId,
                comboId: item.comboId,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
              }))
            },
            tickets: {
              connect: order.tickets?.map(ticket => ({ id: ticket.id })) || []
            }
          },
        });
      }
    });

    console.log('✓ Seed dữ liệu hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình seed dữ liệu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Lỗi không xử lý được:', e);
    process.exit(1);
  });