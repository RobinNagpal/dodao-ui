/*
  Warnings:

  - You are about to drop the column `ticker_report_id` on the `criterion_evaluations` table. All the data in the column will be lost.
  - You are about to drop the column `ticker_report_id` on the `criterion_matches_latest_10q` table. All the data in the column will be lost.
  - You are about to drop the column `report_url` on the `tickers` table. All the data in the column will be lost.
  - You are about to drop the `ticker_reports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "criterion_evaluations" DROP CONSTRAINT "criterion_evaluations_ticker_report_id_fkey";

-- DropForeignKey
ALTER TABLE "criterion_matches_latest_10q" DROP CONSTRAINT "criterion_matches_latest_10q_ticker_report_id_fkey";

-- DropForeignKey
ALTER TABLE "ticker_reports" DROP CONSTRAINT "ticker_reports_ticker_key_fkey";

-- DropIndex
DROP INDEX "criterion_matches_latest_10q_ticker_report_id_key";

-- AlterTable
ALTER TABLE "criterion_evaluations" DROP COLUMN "ticker_report_id";

-- AlterTable
ALTER TABLE "criterion_matches_latest_10q" DROP COLUMN "ticker_report_id";

-- AlterTable
ALTER TABLE "tickers" DROP COLUMN "report_url";

-- DropTable
DROP TABLE "ticker_reports";
