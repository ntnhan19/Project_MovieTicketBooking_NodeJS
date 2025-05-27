-- AlterTable
ALTER TABLE "Seat" ADD COLUMN     "lockedAt" TIMESTAMP(3),
ADD COLUMN     "lockedBy" INTEGER;
