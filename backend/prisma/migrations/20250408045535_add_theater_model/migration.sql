/*
  Warnings:

  - You are about to drop the column `room` on the `Showtime` table. All the data in the column will be lost.
  - Added the required column `theaterId` to the `Showtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Showtime" DROP COLUMN "room",
ADD COLUMN     "theaterId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Theater" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL,
    "columns" INTEGER NOT NULL,

    CONSTRAINT "Theater_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Theater_name_key" ON "Theater"("name");

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "Theater"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
