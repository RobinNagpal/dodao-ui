/*
  Warnings:

  - You are about to drop the column `stock_analyze_url` on the `daily_top_gainers` table. All the data in the column will be lost.
  - You are about to drop the column `stock_analyze_url` on the `daily_top_losers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "daily_top_gainers" DROP COLUMN "stock_analyze_url",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NotStarted';

-- AlterTable
ALTER TABLE "daily_top_losers" DROP COLUMN "stock_analyze_url",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NotStarted';
