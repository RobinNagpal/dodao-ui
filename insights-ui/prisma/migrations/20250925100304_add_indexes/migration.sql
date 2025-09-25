-- CreateIndex
CREATE INDEX "TickerV1Industry_industry_key_idx" ON "TickerV1Industry"("industry_key");

-- CreateIndex
CREATE INDEX "TickerV1SubIndustry_industry_key_sub_industry_key_idx" ON "TickerV1SubIndustry"("industry_key", "sub_industry_key");

-- CreateIndex
CREATE INDEX "TickerV1SubIndustry_industry_key_idx" ON "TickerV1SubIndustry"("industry_key");

-- CreateIndex
CREATE INDEX "factor_results_by_parent" ON "ticker_v1_analysis_category_factor_results"("space_id", "ticker_id", "category_key");

-- CreateIndex
CREATE INDEX "ticker_v1_future_risks_space_id_ticker_id_idx" ON "ticker_v1_future_risks"("space_id", "ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_investor_analysis_results_space_id_ticker_id_idx" ON "ticker_v1_investor_analysis_results"("space_id", "ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_vs_competition_space_id_ticker_id_idx" ON "ticker_v1_vs_competition"("space_id", "ticker_id");

-- CreateIndex
CREATE INDEX "tickers_v1_industry_key_idx" ON "tickers_v1"("industry_key");

-- CreateIndex
CREATE INDEX "tickers_v1_sub_industry_key_idx" ON "tickers_v1"("sub_industry_key");

-- AddForeignKey
ALTER TABLE "tickers_v1" ADD CONSTRAINT "tickers_v1_industry_key_fkey" FOREIGN KEY ("industry_key") REFERENCES "TickerV1Industry"("industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickers_v1" ADD CONSTRAINT "tickers_v1_sub_industry_key_fkey" FOREIGN KEY ("sub_industry_key") REFERENCES "TickerV1SubIndustry"("sub_industry_key") ON DELETE RESTRICT ON UPDATE CASCADE;
