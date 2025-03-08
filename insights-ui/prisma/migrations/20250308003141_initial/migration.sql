-- CreateTable
CREATE TABLE "tickers" (
    "ticker_key" TEXT NOT NULL,
    "report_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "sector_id" INTEGER NOT NULL,
    "industry_group_id" INTEGER NOT NULL,

    CONSTRAINT "tickers_pkey" PRIMARY KEY ("ticker_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickers_ticker_key_key" ON "tickers"("ticker_key");
