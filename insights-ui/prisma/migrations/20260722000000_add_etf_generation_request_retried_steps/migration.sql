-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN     "retried_steps" TEXT[] DEFAULT ARRAY[]::TEXT[];
