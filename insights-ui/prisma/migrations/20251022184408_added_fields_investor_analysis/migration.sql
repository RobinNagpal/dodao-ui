/*
  Warnings:

  - You are about to drop the column `detailed_analysis` on the `ticker_v1_investor_analysis_results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ticker_v1_investor_analysis_results" DROP COLUMN "detailed_analysis",
ADD COLUMN     "top_companies_to_consider" JSONB[],
ADD COLUMN     "verdict" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "will_invest" BOOLEAN NOT NULL DEFAULT false;
