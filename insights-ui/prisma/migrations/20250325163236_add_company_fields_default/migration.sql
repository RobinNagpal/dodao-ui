/*
  Warnings:

  - Made the column `company_name` on table `tickers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `short_description` on table `tickers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tickers" ALTER COLUMN "company_name" SET NOT NULL,
ALTER COLUMN "company_name" SET DEFAULT 'Unknown Company',
ALTER COLUMN "short_description" SET NOT NULL,
ALTER COLUMN "short_description" SET DEFAULT 'No description provided';
