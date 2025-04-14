// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Xoá sạch dữ liệu cũ nếu cần
  await prisma.hall.deleteMany();
  await prisma.cinema.deleteMany();

  // Tạo rạp DHL
  const cinema = await prisma.cinema.create({
    data: {
      name: 'Rạp chiếu phim DHL',
    },
  });

  // Tạo danh sách phòng chiếu mô phỏng từ CGV
  const halls = [
    {
      name: 'Phòng 1 - 2D Digital',
      rows: 10,
      columns: 12,
    },
    {
      name: 'Phòng 2 - 3D MAX',
      rows: 12,
      columns: 14,
    },
    {
      name: 'Phòng 3 - IMAX',
      rows: 14,
      columns: 16,
    },
  ];

  for (const hall of halls) {
    await prisma.hall.create({
      data: {
        name: hall.name,
        rows: hall.rows,
        columns: hall.columns,
        totalSeats: hall.rows * hall.columns,
        cinemaId: cinema.id,
      },
    });
  }

  console.log('🌱 Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });