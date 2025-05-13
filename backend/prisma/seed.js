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
    // 1. Seed Genres
    console.log('Seeding genres...');
    for (const genre of data.genres) {
      await prisma.genre.upsert({
        where: { id: genre.id },
        update: { name: genre.name },
        create: { 
          id: genre.id,
          name: genre.name 
        },
      });
    }

    // 2. Seed Movies
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
          id: movie.id,
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

    // 3. Seed Cinemas
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
          id: cinema.id,
          name: cinema.name,
          address: cinema.address,
          image: cinema.image,
          mapUrl: cinema.mapUrl,
        },
      });
    }

    // 4. Seed Halls
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
          id: hall.id,
          name: hall.name,
          totalSeats: hall.totalSeats,
          rows: hall.rows,
          columns: hall.columns,
          cinemaId: hall.cinemaId,
        },
      });
    }

    // 5. Seed Promotions
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
          id: promotion.id,
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

    // 6. Seed Showtimes
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
          id: showtime.id,
          movieId: showtime.movieId,
          startTime: new Date(showtime.startTime),
          endTime: new Date(showtime.endTime),
          hallId: showtime.hallId,
          price: showtime.price,
        },
      });
    }

    // 7. Seed Seats
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
          id: seat.id,
          showtimeId: seat.showtimeId,
          row: seat.row,
          column: seat.column,
          status: seat.status,
          type: seat.type,
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