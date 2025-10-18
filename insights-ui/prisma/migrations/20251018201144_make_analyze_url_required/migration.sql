/*
  Warnings:

  - Made the column `stock_analyze_url` on table `tickers_v1` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tickers_v1" ALTER COLUMN "stock_analyze_url" SET NOT NULL;
