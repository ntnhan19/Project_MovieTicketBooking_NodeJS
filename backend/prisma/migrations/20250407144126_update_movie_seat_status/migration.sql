/*
  Warnings:

  - Changed the type of `status` on the `Seat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SeatStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'LOCKED');

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "director" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "mainActors" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "status",
ADD COLUMN     "status" "SeatStatus" NOT NULL;
