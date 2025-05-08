/*
  Warnings:

  - A unique constraint covering the columns `[space_id,ticker_key]` on the table `latest_10q_infos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "latest_10q_infos_space_id_ticker_key_key" ON "latest_10q_infos"("space_id", "ticker_key");
