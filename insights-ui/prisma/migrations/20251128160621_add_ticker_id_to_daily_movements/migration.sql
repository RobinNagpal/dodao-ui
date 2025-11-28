-- CreateTable
CREATE TABLE "daily_top_gainers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "percentage_change" DOUBLE PRECISION NOT NULL,
    "stock_analyze_url" TEXT NOT NULL,
    "title" TEXT,
    "meta_description" TEXT,
    "one_line_explanation" TEXT,
    "detailed_explanation" TEXT,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "daily_top_gainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_top_losers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "percentage_change" DOUBLE PRECISION NOT NULL,
    "stock_analyze_url" TEXT NOT NULL,
    "title" TEXT,
    "meta_description" TEXT,
    "one_line_explanation" TEXT,
    "detailed_explanation" TEXT,
    "ticker_id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,

    CONSTRAINT "daily_top_losers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_top_gainers_space_id_created_at_idx" ON "daily_top_gainers"("space_id", "created_at");

-- CreateIndex
CREATE INDEX "daily_top_gainers_symbol_idx" ON "daily_top_gainers"("symbol");

-- CreateIndex
CREATE INDEX "daily_top_gainers_ticker_id_idx" ON "daily_top_gainers"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_top_gainers_space_id_symbol_created_at_key" ON "daily_top_gainers"("space_id", "symbol", "created_at");

-- CreateIndex
CREATE INDEX "daily_top_losers_space_id_created_at_idx" ON "daily_top_losers"("space_id", "created_at");

-- CreateIndex
CREATE INDEX "daily_top_losers_symbol_idx" ON "daily_top_losers"("symbol");

-- CreateIndex
CREATE INDEX "daily_top_losers_ticker_id_idx" ON "daily_top_losers"("ticker_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_top_losers_space_id_symbol_created_at_key" ON "daily_top_losers"("space_id", "symbol", "created_at");

-- AddForeignKey
ALTER TABLE "daily_top_gainers" ADD CONSTRAINT "daily_top_gainers_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_top_losers" ADD CONSTRAINT "daily_top_losers_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers_v1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
