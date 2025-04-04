-- CreateTable
CREATE TABLE "latest_10q_infos" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "ticker_key" TEXT NOT NULL,
    "ticker_id" TEXT NOT NULL,
    "reporting_period" TEXT NOT NULL,
    "sec_filing_url" TEXT NOT NULL,

    CONSTRAINT "latest_10q_infos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "latest_10q_infos_ticker_id_key" ON "latest_10q_infos"("ticker_id");

-- AddForeignKey
ALTER TABLE "latest_10q_infos" ADD CONSTRAINT "latest_10q_infos_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
