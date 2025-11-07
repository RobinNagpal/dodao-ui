/*
  Warnings:

  - You are about to drop the column `cached_score` on the `tickers_v1` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tickers_v1" DROP COLUMN "cached_score";
