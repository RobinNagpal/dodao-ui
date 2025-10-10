-- CreateEnum
CREATE TYPE "GenerationRequestStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "ticker_v1_generation_requests" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "regenerate_competition" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_financial_analysis" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_business_and_moat" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_past_performance" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_future_growth" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_fair_value" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_future_risk" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_warren_buffett" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_charlie_munger" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_bill_ackman" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_final_summary" BOOLEAN NOT NULL DEFAULT false,
    "regenerate_cached_score" BOOLEAN NOT NULL DEFAULT false,
    "status" "GenerationRequestStatus" NOT NULL DEFAULT 'NotStarted',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ticker_v1_generation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_generation_requests_ticker_id_idx" ON "ticker_v1_generation_requests"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_generation_requests_status_idx" ON "ticker_v1_generation_requests"("status");

-- AddForeignKey
ALTER TABLE "ticker_v1_generation_requests" ADD CONSTRAINT "ticker_v1_generation_requests_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
