/*
  Warnings:

  - You are about to drop the column `theaterId` on the `Showtime` table. All the data in the column will be lost.
  - You are about to drop the `Theater` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `hallId` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Showtime" DROP CONSTRAINT "Showtime_theaterId_fkey";

-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "theaterId",
ADD COLUMN     "hallId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Theater";

-- CreateTable
CREATE TABLE "Cinema" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL,
    "columns" INTEGER NOT NULL,
    "cinemaId" INTEGER NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Hall" ADD CONSTRAINT "Hall_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
