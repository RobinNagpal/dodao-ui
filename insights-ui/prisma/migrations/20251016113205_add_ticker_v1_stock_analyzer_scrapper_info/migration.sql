-- CreateTable
CREATE TABLE "ticker_v1_stock_analyzer_scrapper_info" (
    "id" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "last_updated_at_summary" TIMESTAMP(3) NOT NULL,
    "dividends" JSONB NOT NULL,
    "last_updated_at_dividends" TIMESTAMP(3) NOT NULL,
    "income_statement_annual" JSONB NOT NULL,
    "last_updated_at_income_statement_annual" TIMESTAMP(3) NOT NULL,
    "income_statement_quarter" JSONB NOT NULL,
    "last_updated_at_income_statement_quarter" TIMESTAMP(3) NOT NULL,
    "balance_sheet_annual" JSONB NOT NULL,
    "last_updated_at_balance_sheet_annual" TIMESTAMP(3) NOT NULL,
    "balance_sheet_quarter" JSONB NOT NULL,
    "last_updated_at_balance_sheet_quarter" TIMESTAMP(3) NOT NULL,
    "cash_flow_annual" JSONB NOT NULL,
    "last_updated_at_cash_flow_annual" TIMESTAMP(3) NOT NULL,
    "cash_flow_quarter" JSONB NOT NULL,
    "last_updated_at_cash_flow_quarter" TIMESTAMP(3) NOT NULL,
    "ratios_annual" JSONB NOT NULL,
    "last_updated_at_ratios_annual" TIMESTAMP(3) NOT NULL,
    "ratios_quarter" JSONB NOT NULL,
    "last_updated_at_ratios_quarter" TIMESTAMP(3) NOT NULL,
    "errors" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "ticker_id" TEXT NOT NULL,

    CONSTRAINT "ticker_v1_stock_analyzer_scrapper_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_stock_analyzer_scrapper_info_ticker_id_key" ON "ticker_v1_stock_analyzer_scrapper_info"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_stock_analyzer_scrapper_info_ticker_id_idx" ON "ticker_v1_stock_analyzer_scrapper_info"("ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_stock_analyzer_scrapper_info" ADD CONSTRAINT "ticker_v1_stock_analyzer_scrapper_info_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
