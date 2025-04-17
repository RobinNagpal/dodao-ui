-- CreateTable
CREATE TABLE "latest_10q_infos" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "ticker_key" TEXT NOT NULL,
    "filing_url" TEXT NOT NULL,
    "period_of_report" TEXT NOT NULL,
    "filing_date" TEXT NOT NULL,
    "share_price" INTEGER,

    CONSTRAINT "latest_10q_infos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "latest_10q_infos_ticker_key_key" ON "latest_10q_infos"("ticker_key");

-- AddForeignKey
ALTER TABLE "latest_10q_infos" ADD CONSTRAINT "latest_10q_infos_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;
