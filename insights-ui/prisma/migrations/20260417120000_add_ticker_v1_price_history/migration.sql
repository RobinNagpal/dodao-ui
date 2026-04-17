-- CreateTable
CREATE TABLE "ticker_v1_price_history" (
    "id" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "daily_data" JSONB NOT NULL,
    "last_updated_at_daily" TIMESTAMP(3) NOT NULL,
    "weekly_data" JSONB NOT NULL,
    "last_updated_at_weekly" TIMESTAMP(3) NOT NULL,
    "currency" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticker_v1_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_price_history_ticker_id_key" ON "ticker_v1_price_history"("ticker_id");

-- CreateIndex
CREATE INDEX "ticker_v1_price_history_ticker_id_idx" ON "ticker_v1_price_history"("ticker_id");

-- AddForeignKey
ALTER TABLE "ticker_v1_price_history" ADD CONSTRAINT "ticker_v1_price_history_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
