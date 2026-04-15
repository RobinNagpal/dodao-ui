-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN     "regenerate_final_summary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "etfs" ADD COLUMN     "summary" TEXT;
