/*
  Warnings:

  - You are about to drop the column `status` on the `byte_collections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "byte_collections" DROP COLUMN "status",
ADD COLUMN     "archive" BOOLEAN DEFAULT false;
