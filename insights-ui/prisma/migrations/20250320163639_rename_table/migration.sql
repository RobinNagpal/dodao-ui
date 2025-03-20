/*
  Warnings:

  - You are about to drop the `criter_matches_latest_10q` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "criter_matches_latest_10q" DROP CONSTRAINT "criter_matches_latest_10q_ticker_key_fkey";

-- DropForeignKey
ALTER TABLE "criterion_matches" DROP CONSTRAINT "criterion_matches_criterion_matches_latest_10q_id_fkey";

-- DropTable
DROP TABLE "criter_matches_latest_10q";

-- CreateTable
CREATE TABLE "criteria_matches_latest_10q" (
    "id" TEXT NOT NULL,
    "status" "ProcessingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "failure_reason" TEXT,
    "ticker_key" TEXT NOT NULL,
    "space_id" TEXT NOT NULL DEFAULT 'koala_gains',

    CONSTRAINT "criteria_matches_latest_10q_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "criteria_matches_latest_10q_space_id_ticker_key_key" ON "criteria_matches_latest_10q"("space_id", "ticker_key");

-- AddForeignKey
ALTER TABLE "criteria_matches_latest_10q" ADD CONSTRAINT "criteria_matches_latest_10q_ticker_key_fkey" FOREIGN KEY ("ticker_key") REFERENCES "tickers"("ticker_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_matches" ADD CONSTRAINT "criterion_matches_criterion_matches_latest_10q_id_fkey" FOREIGN KEY ("criterion_matches_latest_10q_id") REFERENCES "criteria_matches_latest_10q"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
