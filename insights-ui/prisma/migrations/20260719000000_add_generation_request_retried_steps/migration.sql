-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN     "retried_steps" TEXT[] DEFAULT ARRAY[]::TEXT[];
