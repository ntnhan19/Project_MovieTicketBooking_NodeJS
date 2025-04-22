// frontend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Đọc dữ liệu từ file database-dump.json
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'database-dump.json'), 'utf8'));

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  try {
    // 1. Seed Users
    console.log('Seeding users...');
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          phone: user.phone,
          password: user.password,
          role: user.role,
          avatar: user.avatar,
        },
        create: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,
          role: user.role,
          avatar: user.avatar,
        },
      });
    }

    // 2. Seed Genres
    console.log('Seeding genres...');
    for (const genre of data.genres) {
      await prisma.genre.upsert({
        where: { name: genre.name },
        update: {},
        create: { name: genre.name },
      });
    }

    // 3. Seed Movies
    console.log('Seeding movies...');
    for (const movie of data.movies) {
      // Lấy ID của các thể loại
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
          genres: {
            connect: genreIds
          }
        },
        create: {
          title: movie.title,
          description: movie.description,
          releaseDate: new Date(movie.releaseDate),
          poster: movie.poster,
          duration: movie.duration,
          director: movie.director,
          mainActors: movie.mainActors,
          trailerUrl: movie.trailerUrl,
          genres: {
            connect: genreIds
          }
        },
      });
    }

    // 4. Seed Cinemas
    console.log('Seeding cinemas...');
    for (const cinema of data.cinemas) {
      await prisma.cinema.upsert({
        where: { id: cinema.id },
        update: {
          name: cinema.name,
          address: cinema.address,
          image: cinema.image,
          mapUrl: cinema.mapUrl,
        },
        create: {
          name: cinema.name,
          address: cinema.address,
          image: cinema.image,
          mapUrl: cinema.mapUrl,
        },
      });
    }

    // 5. Seed Halls
    console.log('Seeding halls...');
    for (const hall of data.halls) {
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
          name: hall.name,
          totalSeats: hall.totalSeats,
          rows: hall.rows,
          columns: hall.columns,
          cinemaId: hall.cinemaId,
        },
      });
    }

    // 6. Seed Promotions
    console.log('Seeding promotions...');
    for (const promotion of data.promotions) {
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
          type: promotion.type,
        },
        create: {
          code: promotion.code,
          discount: promotion.discount,
          validFrom: new Date(promotion.validFrom),
          validUntil: new Date(promotion.validUntil),
          description: promotion.description,
          image: promotion.image,
          isActive: promotion.isActive,
          title: promotion.title,
          type: promotion.type,
        },
      });
    }

    // 7. Seed Showtimes
    console.log('Seeding showtimes...');
    for (const showtime of data.showtimes) {
      await prisma.showtime.upsert({
        where: { id: showtime.id },
        update: {
          movieId: showtime.movieId,
          startTime: new Date(showtime.startTime),
          endTime: new Date(showtime.endTime),
          hallId: showtime.hallId,
          price: showtime.price,
        },
        create: {
          movieId: showtime.movieId,
          startTime: new Date(showtime.startTime),
          endTime: new Date(showtime.endTime),
          hallId: showtime.hallId,
          price: showtime.price,
        },
      });
    }

    // 8. Seed Seats
    console.log('Seeding seats...');
    for (const seat of data.seats) {
      await prisma.seat.upsert({
        where: { id: seat.id },
        update: {
          showtimeId: seat.showtimeId,
          row: seat.row,
          column: seat.column,
          status: seat.status,
          type: seat.type,
        },
        create: {
          showtimeId: seat.showtimeId,
          row: seat.row,
          column: seat.column,
          status: seat.status,
          type: seat.type,
        },
      });
    }

    // 9. Seed Payments
    console.log('Seeding payments...');
    for (const payment of data.payments) {
      await prisma.payment.upsert({
        where: { id: payment.id },
        update: {
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
          transactionId: payment.transactionId,
          appTransId: payment.appTransId,
          orderToken: payment.orderToken,
          paymentUrl: payment.paymentUrl,
          zaloPayOrderData: payment.zaloPayOrderData,
        },
        create: {
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
          transactionId: payment.transactionId,
          appTransId: payment.appTransId,
          orderToken: payment.orderToken,
          paymentUrl: payment.paymentUrl,
          zaloPayOrderData: payment.zaloPayOrderData,
        },
      });
    }

    // 10. Seed Tickets
    console.log('Seeding tickets...');
    for (const ticket of data.tickets) {
      await prisma.ticket.upsert({
        where: { id: ticket.id },
        update: {
          userId: ticket.userId,
          showtimeId: ticket.showtimeId,
          seatId: ticket.seatId,
          price: ticket.price,
          status: ticket.status,
          promotionId: ticket.promotionId,
          paymentId: ticket.paymentId,
        },
        create: {
          userId: ticket.userId,
          showtimeId: ticket.showtimeId,
          seatId: ticket.seatId,
          price: ticket.price,
          status: ticket.status,
          promotionId: ticket.promotionId,
          paymentId: ticket.paymentId,
        },
      });
    }

    // 11. Seed Reviews
    console.log('Seeding reviews...');
    for (const review of data.reviews) {
      await prisma.review.upsert({
        where: { id: review.id },
        update: {
          userId: review.userId,
          movieId: review.movieId,
          rating: review.rating,
          comment: review.comment,
          isAnonymous: review.isAnonymous,
        },
        create: {
          userId: review.userId,
          movieId: review.movieId,
          rating: review.rating,
          comment: review.comment,
          isAnonymous: review.isAnonymous,
        },
      });
    }

    console.log('Seed dữ liệu hoàn tất!');
  } catch (error) {
    console.error('Lỗi trong quá trình seed dữ liệu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });