-- CreateTable
CREATE TABLE "ticker_v1_cached_scores" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "business_and_moat_score" INTEGER NOT NULL,
    "financial_statement_analysis_score" INTEGER NOT NULL,
    "past_performance_score" INTEGER NOT NULL,
    "future_growth_score" INTEGER NOT NULL,
    "fair_value_score" INTEGER NOT NULL,
    "final_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_cached_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_cached_scores_ticker_id_idx" ON "ticker_v1_cached_scores"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_cached_scores_ticker_id_key" ON "ticker_v1_cached_scores"("ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_cached_scores" ADD CONSTRAINT "ticker_v1_cached_scores_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
