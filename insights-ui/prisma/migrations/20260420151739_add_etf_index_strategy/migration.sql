-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN     "regenerate_index_strategy" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "etfs" ADD COLUMN     "index_strategy" TEXT;
