/*
  Warnings:

  - The `competition_analysis` column on the `ticker_v1_vs_competition` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ticker_v1_vs_competition" DROP COLUMN "competition_analysis",
ADD COLUMN     "competition_analysis" JSONB[];
