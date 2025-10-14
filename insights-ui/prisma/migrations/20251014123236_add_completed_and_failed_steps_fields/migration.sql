-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN     "completed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "failed_steps" TEXT[] DEFAULT ARRAY[]::TEXT[];
