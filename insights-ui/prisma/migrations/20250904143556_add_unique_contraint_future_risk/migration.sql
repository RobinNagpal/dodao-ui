/*
  Warnings:

  - A unique constraint covering the columns `[space_id,ticker_id]` on the table `ticker_v1_future_risks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ticker_v1_future_risks_space_id_ticker_id_key" ON "ticker_v1_future_risks"("space_id", "ticker_id");
