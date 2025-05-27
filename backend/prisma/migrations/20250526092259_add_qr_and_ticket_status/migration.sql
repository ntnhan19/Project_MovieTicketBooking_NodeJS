/*
  Warnings:

  - The `status` column on the `Ticket` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'CONFIRMED', 'USED', 'CANCELLED');

-- AlterTable
ALTER TABLE "ConcessionOrder" ADD COLUMN     "qrCode" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "qrCode" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "TicketStatus" NOT NULL DEFAULT 'PENDING';
