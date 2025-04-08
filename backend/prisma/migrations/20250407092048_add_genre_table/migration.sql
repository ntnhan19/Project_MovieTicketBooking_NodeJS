/*
  Warnings:

  - You are about to drop the column `genre` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "genre",
ADD COLUMN     "genreId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
