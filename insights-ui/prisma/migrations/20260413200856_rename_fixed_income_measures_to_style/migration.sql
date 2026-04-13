/*
  Warnings:

  - You are about to drop the column `fixed_income_measures` on the `etf_mor_portfolio_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "etf_mor_portfolio_info" DROP COLUMN "fixed_income_measures",
ADD COLUMN     "fixed_income_style" JSONB;
