/*
  Warnings:

  - You are about to drop the column `borrowApr` on the `LendingAndBorrowingRate` table. All the data in the column will be lost.
  - You are about to drop the column `supplyApr` on the `LendingAndBorrowingRate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LendingAndBorrowingRate" DROP COLUMN "borrowApr",
DROP COLUMN "supplyApr";
