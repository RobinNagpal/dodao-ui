/*
  Warnings:

  - A unique constraint covering the columns `[ticker_key]` on the table `latest_10q_infos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[latest_10q_info_id]` on the table `tickers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[space_id,ticker_key,latest_10q_info_id]` on the table `tickers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tickers" DROP CONSTRAINT "tickers_latest_10q_info_id_fkey";

-- DropIndex
DROP INDEX "tickers_space_id_ticker_key_key";

-- CreateIndex
CREATE UNIQUE INDEX "latest_10q_infos_ticker_key_key" ON "latest_10q_infos"("ticker_key");

-- CreateIndex
CREATE UNIQUE INDEX "tickers_latest_10q_info_id_key" ON "tickers"("latest_10q_info_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickers_space_id_ticker_key_latest_10q_info_id_key" ON "tickers"("space_id", "ticker_key", "latest_10q_info_id");

-- AddForeignKey
ALTER TABLE "latest_10q_infos" ADD CONSTRAINT "latest_10q_infos_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;
