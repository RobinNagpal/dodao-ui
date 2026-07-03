-- Yahoo Finance OHLC price history for commodities. Mirrors the
-- "etf_price_history" / stock price-history tables: one row per commodity with
-- daily (1M/6M) and weekly (1Y/3Y/5Y) OHLC arrays stored as JSONB, refreshed
-- on-demand when stale.

-- CreateTable
CREATE TABLE "commodity_price_history" (
    "id" TEXT NOT NULL,
    "commodity_id" TEXT NOT NULL,
    "daily_data" JSONB NOT NULL,
    "last_updated_at_daily" TIMESTAMP(3) NOT NULL,
    "weekly_data" JSONB NOT NULL,
    "last_updated_at_weekly" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodity_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commodity_price_history_commodity_id_key" ON "commodity_price_history"("commodity_id");

-- CreateIndex
CREATE INDEX "commodity_price_history_commodity_id_idx" ON "commodity_price_history"("commodity_id");

-- AddForeignKey
ALTER TABLE "commodity_price_history" ADD CONSTRAINT "commodity_price_history_commodity_id_fkey" FOREIGN KEY ("commodity_id") REFERENCES "commodities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
