-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN     "in_progress_step" TEXT,
ADD COLUMN     "last_invocation_time" TIMESTAMP(3);
