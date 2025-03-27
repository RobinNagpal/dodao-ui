/*
  Warnings:

  - Made the column `company_name` on table `tickers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `short_description` on table `tickers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
update tickers set company_name='Unknown Company', short_description = 'No description provided';

ALTER TABLE "tickers"
    ALTER COLUMN "company_name" SET NOT NULL,
    ALTER COLUMN "short_description" SET NOT NULL;
