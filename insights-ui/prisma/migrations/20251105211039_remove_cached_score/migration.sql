/*
  Warnings:

  - You are about to drop the column `regenerate_cached_score` on the `ticker_v1_generation_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" DROP COLUMN "regenerate_cached_score";
