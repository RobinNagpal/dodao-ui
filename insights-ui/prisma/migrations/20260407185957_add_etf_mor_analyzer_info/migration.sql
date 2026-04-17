-- CreateTable
CREATE TABLE "etf_mor_analyzer_info" (
    "id" TEXT NOT NULL,
    "etf_id" TEXT NOT NULL,
    "overview_nav" TEXT,
    "overview_one_day_return" TEXT,
    "overview_total_assets" TEXT,
    "overview_adj_expense_ratio" TEXT,
    "overview_prospectus_net_expense_ratio" TEXT,
    "overview_category" TEXT,
    "overview_style_box" TEXT,
    "overview_sec_yield" TEXT,
    "overview_ttm_yield" TEXT,
    "overview_turnover" TEXT,
    "overview_status" TEXT,
    "market_nav" TEXT,
    "market_open_price" TEXT,
    "market_bid_ask_spread" TEXT,
    "market_volume_avg" TEXT,
    "market_day_range" TEXT,
    "market_year_range" TEXT,
    "analysis" JSONB,
    "returns_annual" JSONB,
    "returns_trailing" JSONB,
    "holdings" JSONB,
    "strategy_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etf_mor_analyzer_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etf_mor_analyzer_info_etf_id_key" ON "etf_mor_analyzer_info"("etf_id");

-- CreateIndex
CREATE INDEX "etf_mor_analyzer_info_etf_id_idx" ON "etf_mor_analyzer_info"("etf_id");

-- AddForeignKey
ALTER TABLE "etf_mor_analyzer_info" ADD CONSTRAINT "etf_mor_analyzer_info_etf_id_fkey" FOREIGN KEY ("etf_id") REFERENCES "etfs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
