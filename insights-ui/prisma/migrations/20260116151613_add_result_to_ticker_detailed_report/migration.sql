/*
  Warnings:

  - Added the required column `result` to the `ticker_v1_detailed_reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ticker_v1_detailed_reports" ADD COLUMN     "result" TEXT NOT NULL;
