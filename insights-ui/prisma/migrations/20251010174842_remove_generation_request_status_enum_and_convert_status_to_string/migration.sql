/*
  Warnings:

  - The `status` column on the `ticker_v1_generation_requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NotStarted';

-- DropEnum
DROP TYPE "GenerationRequestStatus";

-- CreateIndex
CREATE INDEX "ticker_v1_generation_requests_status_idx" ON "ticker_v1_generation_requests"("status");
