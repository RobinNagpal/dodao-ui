/*
  Warnings:

  - A unique constraint covering the columns `[ticker_id]` on the table `ticker_v1_financial_info` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_financial_info_ticker_id_key" ON "ticker_v1_financial_info"("ticker_id");
