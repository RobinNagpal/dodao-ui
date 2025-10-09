-- CreateTable
CREATE TABLE "ticker_v1_financial_info" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "currency" TEXT,
    "price" DOUBLE PRECISION,
    "day_high" DOUBLE PRECISION,
    "day_low" DOUBLE PRECISION,
    "year_high" DOUBLE PRECISION,
    "year_low" DOUBLE PRECISION,
    "market_cap" DOUBLE PRECISION,
    "eps_diluted_ttm" DOUBLE PRECISION,
    "pe_ratio" DOUBLE PRECISION,
    "avg_volume_3m" DOUBLE PRECISION,
    "day_volume" DOUBLE PRECISION,
    "annual_dividend" DOUBLE PRECISION,
    "dividend_yield" DOUBLE PRECISION,
    "total_revenue" DOUBLE PRECISION,
    "net_income" DOUBLE PRECISION,
    "net_profit_margin" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "ticker_v1_financial_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticker_v1_financial_info_ticker_id_idx" ON "ticker_v1_financial_info"("ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_financial_info" ADD CONSTRAINT "ticker_v1_financial_info_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
