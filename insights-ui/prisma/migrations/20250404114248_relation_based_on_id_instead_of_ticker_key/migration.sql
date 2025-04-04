/*
  Warnings:

  - A unique constraint covering the columns `[ticker_id]` on the table `latest_10q_infos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ticker_id` to the `latest_10q_infos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "latest_10q_infos" DROP CONSTRAINT "latest_10q_infos_ticker_key_fkey";

-- DropIndex
DROP INDEX "latest_10q_infos_ticker_key_key";

-- AlterTable
ALTER TABLE "latest_10q_infos" ADD COLUMN     "ticker_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "latest_10q_infos_ticker_id_key" ON "latest_10q_infos"("ticker_id");

-- AddForeignKey
ALTER TABLE "latest_10q_infos" ADD CONSTRAINT "latest_10q_infos_ticker_id_fkey" FOREIGN KEY ("ticker_id") REFERENCES "tickers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
