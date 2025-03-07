-- CreateTable
CREATE TABLE "tickers" (
    "ticker_key" TEXT NOT NULL,
    "report_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sector" TEXT NOT NULL,
    "industry_group" TEXT NOT NULL,

    CONSTRAINT "tickers_pkey" PRIMARY KEY ("ticker_key")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickers_ticker_key_key" ON "tickers"("ticker_key");
