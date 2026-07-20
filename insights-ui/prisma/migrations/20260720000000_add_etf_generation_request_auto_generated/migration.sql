-- AlterTable
ALTER TABLE "etf_generation_requests" ADD COLUMN "auto_generated" BOOLEAN;

-- CreateIndex
CREATE INDEX "etf_generation_requests_auto_generated_status_idx" ON "etf_generation_requests"("auto_generated", "status");
