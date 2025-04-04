-- DropForeignKey
ALTER TABLE "tickers" DROP CONSTRAINT "tickers_id_fkey";

-- AlterTable
ALTER TABLE "tickers" ADD COLUMN     "latest_10q_info_id" TEXT;

-- AddForeignKey
ALTER TABLE "tickers" ADD CONSTRAINT "tickers_latest_10q_info_id_fkey" FOREIGN KEY ("latest_10q_info_id") REFERENCES "latest_10q_infos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
