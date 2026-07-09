-- Optional flag marking rows created by the nightly Claude auto-generation job,
-- so the processor can apply the off-hours pacing gate only to them (admin
-- requests are never gated). Nullable, no default: existing rows stay NULL,
-- which is treated the same as false (admin-created).

-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN "auto_generated" BOOLEAN;

-- CreateIndex
CREATE INDEX "ticker_v1_generation_requests_auto_generated_status_idx" ON "ticker_v1_generation_requests"("auto_generated", "status");
