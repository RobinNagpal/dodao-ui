-- CreateEnum
CREATE TYPE "StabilityResilienceVerdict" AS ENUM ('HighlyResilient', 'Resilient', 'MarketLike', 'Vulnerable', 'HighlyVulnerable');

-- CreateTable
CREATE TABLE "ticker_v1_stability_reports" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "detailed_analysis" TEXT NOT NULL,
    "resilience_verdict" "StabilityResilienceVerdict" NOT NULL,
    "reference_price" DOUBLE PRECISION,
    "reference_price_as_of" TIMESTAMP(3),
    "currency" TEXT,
    "drop_scenarios" JSONB[],
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_stability_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_stability_reports_ticker_id_idx" ON "ticker_v1_stability_reports"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_stability_reports_space_id_ticker_id_idx" ON "ticker_v1_stability_reports"("space_id", "ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_stability_reports_space_id_ticker_id_key" ON "ticker_v1_stability_reports"("space_id", "ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_stability_reports" ADD CONSTRAINT "ticker_v1_stability_reports_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ticker_v1_generation_requests" ADD COLUMN "regenerate_stability" BOOLEAN NOT NULL DEFAULT false;
