/*
  Warnings:

  - Added the required column `future_performance_outlook_score` to the `etf_cached_scores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EtfAnalysisCategory" ADD VALUE 'FuturePerformanceOutlook';

-- AlterTable
ALTER TABLE "etf_cached_scores" ADD COLUMN     "future_performance_outlook_score" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN     "regenerate_future_performance_outlook" BOOLEAN NOT NULL DEFAULT false;
