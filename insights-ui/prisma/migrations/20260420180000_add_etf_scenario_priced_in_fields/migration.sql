-- AlterTable
ALTER TABLE "etf_scenarios" ADD COLUMN "priced_in_bucket" TEXT NOT NULL DEFAULT 'PARTIALLY_PRICED_IN';
ALTER TABLE "etf_scenarios" ADD COLUMN "expected_price_change" INTEGER;
ALTER TABLE "etf_scenarios" ADD COLUMN "expected_price_change_explanation" TEXT;
ALTER TABLE "etf_scenarios" ADD COLUMN "price_change_timeframe_explanation" TEXT;

-- CreateIndex
CREATE INDEX "etf_scenarios_space_id_priced_in_bucket_idx" ON "etf_scenarios"("space_id", "priced_in_bucket");
