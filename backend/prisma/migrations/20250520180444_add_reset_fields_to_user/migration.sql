-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3);
