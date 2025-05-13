/*
  Warnings:

  - You are about to drop the column `ticketId` on the `ConcessionOrder` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('STANDALONE', 'WITH_TICKET');

-- DropForeignKey
ALTER TABLE "ConcessionOrder" DROP CONSTRAINT "ConcessionOrder_ticketId_fkey";

-- AlterTable
ALTER TABLE "ConcessionOrder" DROP COLUMN "ticketId",
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'STANDALONE';

-- CreateTable
CREATE TABLE "_ConcessionOrderToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ConcessionOrderToTicket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ConcessionOrderToTicket_B_index" ON "_ConcessionOrderToTicket"("B");

-- AddForeignKey
ALTER TABLE "_ConcessionOrderToTicket" ADD CONSTRAINT "_ConcessionOrderToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "ConcessionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConcessionOrderToTicket" ADD CONSTRAINT "_ConcessionOrderToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
