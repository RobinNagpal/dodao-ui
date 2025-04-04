/*
  Warnings:

  - You are about to drop the `latest_10q_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tickers" DROP CONSTRAINT "tickers_id_fkey";

-- DropTable
DROP TABLE "latest_10q_info";

-- CreateTable
CREATE TABLE "latest_10q_infos" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',
    "ticker_key" TEXT NOT NULL,
    "reporting_period" TEXT NOT NULL,
    "sec_filling_url" TEXT NOT NULL,

    CONSTRAINT "latest_10q_infos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tickers" ADD CONSTRAINT "tickers_id_fkey" FOREIGN KEY ("id") REFERENCES "latest_10q_infos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
